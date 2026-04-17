import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CharityProfile() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donateAmount, setDonateAmount] = useState('5');
  const [donating, setDonating] = useState(false);
  const [donateError, setDonateError] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const { data } = await api.get(`/api/charities/${slug}`);
        setCharity(data.charity);
      } catch {
        setCharity(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCharity();
  }, [slug]);

  const handleDonate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setDonateError('');
    const amountPence = Math.round(Number(donateAmount) * 100);
    if (isNaN(amountPence) || amountPence < 100) {
      setDonateError('Minimum donation is £1.00.');
      return;
    }

    setDonating(true);
    try {
      await api.post('/api/contributions/independent', {
        charityId: charity._id,
        amount: amountPence,
      });
      setDonateSuccess(true);
    } catch (err) {
      setDonateError(err.response?.data?.message || 'Donation failed.');
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Charity not found</h1>
          <Link to="/charities" className="text-brand-400 hover:text-brand-300 text-sm">← Back to charities</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-success/6 blur-[150px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Digital Heroes</span>
        </Link>
        <Link to="/charities" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">
          ← All Charities
        </Link>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-4 pb-24">
        {/* Hero image */}
        {charity.images && charity.images.length > 0 && (
          <div className="rounded-2xl overflow-hidden mb-8 aspect-[21/9]">
            <img
              src={charity.images[0]}
              alt={charity.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {charity.featured && (
                <span className="px-3 py-1 rounded-lg bg-success/10 text-success text-xs font-semibold">
                  ⭐ Featured Charity
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{charity.name}</h1>
            <p className="text-slate-400 leading-relaxed mb-8 whitespace-pre-line">
              {charity.description || 'No description available.'}
            </p>

            {/* Image gallery */}
            {charity.images && charity.images.length > 1 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {charity.images.slice(1).map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-surface-200/30">
                      <img src={img} alt={`${charity.name} ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {charity.events && charity.events.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {charity.events.map((event, i) => (
                    <div key={i} className="glass rounded-xl p-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-brand-300">
                          {event.date ? new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric' }) : '—'}
                        </span>
                        <span className="text-[10px] text-brand-500 uppercase">
                          {event.date ? new Date(event.date).toLocaleDateString('en-GB', { month: 'short' }) : ''}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Donation card */}
          <div>
            <div className="glass rounded-2xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-1">Make a donation</h3>
              <p className="text-xs text-slate-500 mb-5">One-off contribution to {charity.name}</p>

              {donateSuccess ? (
                <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
                  <p className="text-success font-semibold text-sm">Thank you for your donation! 💚</p>
                  <button
                    onClick={() => setDonateSuccess(false)}
                    className="text-xs text-slate-500 mt-2 hover:text-white transition-colors"
                  >
                    Donate again
                  </button>
                </div>
              ) : (
                <>
                  {donateError && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
                      {donateError}
                    </div>
                  )}

                  {/* Quick amounts */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['5', '10', '25'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setDonateAmount(amt); setDonateError(''); }}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          donateAmount === amt
                            ? 'bg-success/15 text-success border border-success/20'
                            : 'bg-surface-100/60 border border-white/8 text-slate-400 hover:text-white'
                        }`}
                      >
                        £{amt}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="relative mb-5">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">£</span>
                    <input
                      type="number"
                      min={1}
                      value={donateAmount}
                      onChange={(e) => { setDonateAmount(e.target.value); setDonateError(''); }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-surface-100/60 border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-success/50 tabular-nums text-sm"
                    />
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={donating}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {donating ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      '💚'
                    )}
                    {donating ? 'Processing…' : `Donate £${donateAmount || '0'}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
