import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';
import { profileToClient } from '../utils/profileMapper.js';

/**
 * Verifies JWT then loads the latest profile from Supabase (role, subscription, etc.).
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'id, name, email, role, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_plan, subscription_expiry, charity_id, contribution_percent, country, currency, account_type, created_at'
      )
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!profile) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = profileToClient(profile);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    next(err);
  }
};

export default verifyToken;
