import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps routes that require BOTH authentication AND an active subscription.
 * Redirects to /login if unauthenticated, or to /subscribe if not subscribed.
 */
export default function SubscriberRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.subscriptionStatus !== 'active' && user?.subscriptionStatus !== 'trialing') {
    return <Navigate to="/subscribe" state={{ from: location }} replace />;
  }

  return children;
}
