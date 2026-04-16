/**
 * isAdmin middleware.
 * Checks that the authenticated user has the admin role.
 * Must be used AFTER verifyToken middleware.
 */
import supabase from '../supabaseClient.js';

const isAdmin = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default isAdmin;
