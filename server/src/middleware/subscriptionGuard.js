import supabase from '../supabaseClient.js';

/**
 * SubscriptionGuard middleware.
 * Checks that the authenticated user has an active (or still-valid cancelled) subscription.
 * Returns 403 if subscription is lapsed, expired, or non-existent.
 *
 * Must be used AFTER verifyToken middleware.
 */
const subscriptionGuard = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const status = user.subscriptionStatus;
    const expiry = user.subscriptionExpiry;
    const now = new Date();

    // Active or trialing — full access
    if (status === 'active' || status === 'trialing') {
      return next();
    }

    // Cancelled but still within paid period
    if (status === 'cancelled' && expiry && new Date(expiry) > now) {
      return next();
    }

    // Everything else — no access
    return res.status(403).json({
      success: false,
      message: 'Active subscription required. Please subscribe or renew.',
      subscriptionStatus: status,
    });
  } catch (error) {
    next(error);
  }
};

export default subscriptionGuard;
