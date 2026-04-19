import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const msg = location.state?.message;
    if (!msg) return;
    setNotice(msg);
    const { message: _m, from, ...rest } = location.state || {};
    const nextState = from ? { from } : Object.keys(rest).length ? rest : {};
    navigate(location.pathname + location.search, { replace: true, state: nextState });
  }, [location, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-xl shadow-brand-500/20" style={{ backgroundColor: '#0f2409' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.5l1.9 3.86 4.26.62-3.08 2.99.72 4.23L11 13.3l-3.8 1.9.73-4.23-3.09-2.99 4.27-.62L11 3.5z" />
                <path strokeLinecap="round" d="M11 13.3V21" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0f2409]">Golf Heroes</span>
          </Link>
        </div>

        {/* Quick Access for Evaluators */}
        <div className="mb-6 p-4 rounded-2xl bg-[#0f2409]/5 border border-[#0f2409]/10">
          <div className="flex items-center gap-2 mb-3 text-[#0f2409] font-bold text-xs uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Evaluator Quick Access
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setForm({ email: 'user@test.com', password: 'Test@1234' })}
              className="p-3 rounded-xl bg-white/60 hover:bg-white border border-white/80 text-left transition-all group"
            >
              <p className="text-[10px] font-bold text-brand-700 uppercase tracking-tight">Standard User</p>
              <p className="text-xs text-slate-600 mt-0.5">user@test.com</p>
            </button>
            <button 
              onClick={() => setForm({ email: 'admin@test.com', password: 'Admin@1234' })}
              className="p-3 rounded-xl bg-white/60 hover:bg-white border border-white/80 text-left transition-all group"
            >
              <p className="text-[10px] font-bold text-warning-700 uppercase tracking-tight">Admin Access</p>
              <p className="text-xs text-slate-600 mt-0.5">admin@test.com</p>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#0b1a08' }}>Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: '#5f7253' }}>Sign in to your account to continue</p>
          </div>


          {notice && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-brand-600/10 border border-brand-500/25 text-brand-200 text-sm" role="status">
              {notice}
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2" role="alert">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-1.5" style={{ color: '#334b2a' }}>
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.72)', borderColor: 'rgba(255,255,255,0.86)', color: '#0f2409' }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-1.5" style={{ color: '#334b2a' }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.72)', borderColor: 'rgba(255,255,255,0.86)', color: '#0f2409' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#0f2409' }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#4d6641' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium transition-colors" style={{ color: '#2d7020' }}>
              Create one
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: '#5f7253' }}>
          By signing in you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
