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
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: '#0f2409' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.5l1.9 3.86 4.26.62-3.08 2.99.72 4.23L11 13.3l-3.8 1.9.73-4.23-3.09-2.99 4.27-.62L11 3.5z" />
                <path strokeLinecap="round" d="M11 13.3V21" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: '#0f2409' }}>Golf Heroes</span>
          </Link>
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
