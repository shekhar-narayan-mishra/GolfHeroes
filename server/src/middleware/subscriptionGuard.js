import { supabase } from '../config/supabaseClient.js';

/**
 * Requires an active subscription that has not passed subscription_expiry.
 */
const subscriptionGuard = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_expiry')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const status = profile.subscription_status;
    const activeLike = status === 'active' || status === 'trialing';
    if (!activeLike) {
      return res.status(403).json({ success: false, message: 'Active subscription required' });
    }

    if (profile.subscription_expiry && new Date() > new Date(profile.subscription_expiry)) {
      await supabase.from('profiles').update({ subscription_status: 'lapsed' }).eq('id', req.user.id);
      return res.status(403).json({ success: false, message: 'Subscription expired' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default subscriptionGuard;
