import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Subscribe from './pages/Subscribe';
import SubscribeSuccess from './pages/SubscribeSuccess';
import SubscribeCancel from './pages/SubscribeCancel';
import Charities from './pages/Charities';
import CharityProfile from './pages/CharityProfile';
import ChooseCharity from './pages/ChooseCharity';

import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import UserScores from './pages/dashboard/UserScores';
import UserDraws from './pages/dashboard/UserDraws';
import UserCharity from './pages/dashboard/UserCharity';
import UserWinnings from './pages/dashboard/UserWinnings';

import AdminLayout from './layouts/AdminLayout';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCharities from './pages/admin/AdminCharities';
import AdminDraws from './pages/AdminDraws';
import AdminWinners from './pages/AdminWinners';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/subscribe/cancel" element={<SubscribeCancel />} />
          <Route path="/charities" element={<Charities />} />
          <Route path="/charities/:slug" element={<CharityProfile />} />

          {/* Protected - Dashboard */}
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

          {/* Protected - Misc */}
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

          {/* Protected - Admin */}
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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
