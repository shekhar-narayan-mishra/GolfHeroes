import { stripe } from '../config/stripe.js';
import { PLANS, getPlanByPriceId } from '../config/plans.js';
import { supabase } from '../config/supabaseClient.js';

const frontendUrl = () => process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

const resolvePlanKey = (priceId) => {
  const monthlyId = process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_MONTHLY;
  const yearlyId = process.env.STRIPE_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ANNUAL;
  if (priceId && monthlyId && priceId === monthlyId) return 'monthly';
  if (priceId && yearlyId && priceId === yearlyId) return 'yearly';
  const fromMap = getPlanByPriceId(priceId);
  if (fromMap?.interval === 'month') return 'monthly';
  if (fromMap?.interval === 'year') return 'yearly';
  return 'monthly';
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const priceId = PLANS[plan].priceId;
    if (!priceId) {
      return res.status(500).json({
        success: false,
        message: 'Stripe price ID is not configured for this plan.',
      });
    }

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (pErr) throw pErr;

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${frontendUrl()}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl()}/subscribe/cancel`,
      metadata: { userId },
      subscription_data: {
        metadata: { userId, plan },
      },
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

/** @deprecated use createCheckoutSession */
export const createCheckout = createCheckoutSession;

export const createPortalSession = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ success: false, message: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${frontendUrl()}/dashboard`,
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    next(err);
  }
};

export const createPortal = createPortalSession;

export const getStatus = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan, subscription_expiry')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const status = profile.subscription_status;
    const expiry = profile.subscription_expiry;
    const now = new Date();

    res.json({
      success: true,
      subscription: {
        status,
        plan: profile.subscription_plan,
        expiry,
        hasAccess:
          status === 'active' ||
          status === 'trialing' ||
          (status === 'cancelled' && expiry && new Date(expiry) > now),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const plan = resolvePlanKey(priceId);
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: 'active',
            subscription_plan: plan,
            subscription_expiry: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', userId);
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', sub.customer)
        .maybeSingle();

      if (profile) {
        const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : 'lapsed';
        await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            subscription_expiry: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('id', profile.id);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', sub.customer)
        .maybeSingle();

      if (profile) {
        await supabase.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', profile.id);
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .maybeSingle();

      if (profile) {
        await supabase.from('profiles').update({ subscription_status: 'lapsed' }).eq('id', profile.id);
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};
