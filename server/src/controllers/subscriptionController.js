import stripe from '../config/stripe.js';
import { PLANS, getPlanByPriceId } from '../config/plans.js';
import supabase from '../supabaseClient.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * POST /api/subscriptions/create-checkout
 * Create a Stripe Checkout Session for the requested plan.
 * Body: { plan: "monthly" | "annual" }
 */
export const createCheckout = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Choose "monthly" or "annual".',
      });
    }

    const selectedPlan = PLANS[plan];
    
    const { data: user, error: uErr } = await supabase
      .from('User')
      .select('*')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (uErr) throw uErr;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      
      const { error: updErr } = await supabase
        .from('User')
        .update({ stripeCustomerId: customerId })
        .eq('id', user.id);

      if (updErr) throw updErr;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${CLIENT_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/subscribe/cancel`,
      metadata: {
        userId: user.id,
        plan: selectedPlan.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: selectedPlan.id,
        },
      },
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/subscriptions/portal
 * Create a Stripe Customer Portal session for the logged-in user.
 */
export const createPortal = async (req, res, next) => {
  try {
    const { data: user, error: uErr } = await supabase
      .from('User')
      .select('*')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (uErr) throw uErr;

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No billing account found. Please subscribe first.',
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${CLIENT_URL}/dashboard`,
    });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/subscriptions/status
 * Return current subscription status for the logged-in user.
 */
export const getStatus = async (req, res, next) => {
  try {
    const { data: user, error: uErr } = await supabase
      .from('User')
      .select('*')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (uErr) throw uErr;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      subscription: {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        expiry: user.subscriptionExpiry,
        hasAccess:
          user.subscriptionStatus === 'active' ||
          user.subscriptionStatus === 'trialing' ||
          (user.subscriptionStatus === 'cancelled' &&
            user.subscriptionExpiry &&
            new Date(user.subscriptionExpiry) > new Date()),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/webhooks/stripe
 * Stripe webhook handler. Expects raw body (not JSON parsed).
 */
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      // ── Checkout completed ──────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const plan = session.metadata?.plan || 'monthly';

          await supabase
            .from('User')
            .update({
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: 'active',
              subscriptionPlan: plan,
              subscriptionExpiry: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId);

          console.log(`✅ Subscription activated for user ${userId} — plan: ${plan}`);
        }
        break;
      }

      // ── Subscription updated ────────────────────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const plan = getPlanByPriceId(priceId);

          const updateData = {
            subscriptionExpiry: new Date(subscription.current_period_end * 1000).toISOString(),
          };

          // Map Stripe status to our status
          if (subscription.status === 'active') {
            updateData.subscriptionStatus = 'active';
          } else if (subscription.status === 'past_due') {
            updateData.subscriptionStatus = 'past_due';
          } else if (subscription.status === 'canceled') {
            updateData.subscriptionStatus = 'cancelled';
          } else if (subscription.status === 'trialing') {
            updateData.subscriptionStatus = 'trialing';
          }

          if (plan) {
            updateData.subscriptionPlan = plan.id;
          }

          await supabase
            .from('User')
            .update(updateData)
            .eq('id', userId);
            
          console.log(`🔄 Subscription updated for user ${userId} — status: ${subscription.status}`);
        }
        break;
      }

      // ── Subscription deleted ────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await supabase
            .from('User')
            .update({
              subscriptionStatus: 'cancelled',
              stripeSubscriptionId: null,
            })
            .eq('id', userId);
            
          console.log(`❌ Subscription cancelled for user ${userId}`);
        }
        break;
      }

      // ── Payment failed ──────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { data: user } = await supabase
          .from('User')
          .select('id')
          .eq('stripeCustomerId', customerId)
          .maybeSingle();
        
        if (user) {
          await supabase
            .from('User')
            .update({ subscriptionStatus: 'lapsed' })
            .eq('id', user.id);
            
          console.log(`⚠️  Payment failed for user ${user.id} — status set to lapsed`);
        }
        break;
      }

      default:
        // Unhandled event type — log and ignore
        console.log(`ℹ️  Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error(`❌ Webhook processing error for ${event.type}:`, err);
    // Still return 200 so Stripe doesn't retry
  }

  // Always acknowledge receipt
  res.json({ received: true });
};
