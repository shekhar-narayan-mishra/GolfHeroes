import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const SubscribeSuccess = lazy(() => import('./pages/SubscribeSuccess'));
const SubscribeCancel = lazy(() => import('./pages/SubscribeCancel'));
const Charities = lazy(() => import('./pages/Charities'));
const CharityProfile = lazy(() => import('./pages/CharityProfile'));
const ChooseCharity = lazy(() => import('./pages/ChooseCharity'));

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const UserScores = lazy(() => import('./pages/dashboard/UserScores'));
const UserDraws = lazy(() => import('./pages/dashboard/UserDraws'));
const UserCharity = lazy(() => import('./pages/dashboard/UserCharity'));
const UserWinnings = lazy(() => import('./pages/dashboard/UserWinnings'));

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCharities = lazy(() => import('./pages/admin/AdminCharities'));
const AdminDraws = lazy(() => import('./pages/AdminDraws'));
const AdminWinners = lazy(() => import('./pages/AdminWinners'));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 text-sm">
    Loading…
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/subscribe/cancel" element={<SubscribeCancel />} />
              <Route path="/charities" element={<Charities />} />
              <Route path="/charities/:slug" element={<CharityProfile />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Overview />} />
                <Route path="scores" element={<UserScores />} />
                <Route path="draws" element={<UserDraws />} />
                <Route path="charity" element={<UserCharity />} />
                <Route path="winnings" element={<UserWinnings />} />
              </Route>

              <Route
                path="/onboarding/charity"
                element={
                  <ProtectedRoute>
                    <ChooseCharity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscribe/success"
                element={
                  <ProtectedRoute>
                    <SubscribeSuccess />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="charities" element={<AdminCharities />} />
                <Route path="draws" element={<AdminDraws />} />
                <Route path="winners" element={<AdminWinners />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
