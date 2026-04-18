import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_BADGE = {
  pending: { label: 'Proof Needed', cls: 'bg-warning/10 text-warning border-warning/20' },
  uploaded: { label: 'Under Review', cls: 'bg-brand-500/10 text-brand-400 border-brand-500/20' },
  approved: { label: 'Approved', cls: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', cls: 'bg-danger/10 text-danger border-danger/20' },
};

const PAYOUT_BADGE = {
  pending: { label: 'Pending', cls: 'bg-warning/10 text-warning border-warning/20' },
  paid: { label: 'Paid', cls: 'bg-success/10 text-success border-success/20' },
};

export default function AdminWinners() {
  const { user } = useAuth();

  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [proofLoading, setProofLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const { data } = await api.get('/api/winners');
      setWinners(data.winners);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (winner) => {
    if (selectedId === winner.id) {
      setSelectedId(null);
      setProofUrl('');
      return;
    }
    setSelectedId(winner.id);
    setProofUrl('');
    setAdminNotes(winner.admin_notes || '');
    setError('');
    setSuccessMsg('');

    // Fetch signed proof URL
    if (winner.proof_public_id || winner.verification_status !== 'pending') {
      setProofLoading(true);
      try {
        const { data } = await api.get(`/api/winners/${winner.id}/proof-url`);
        setProofUrl(data.url);
      } catch {
        setProofUrl('');
      } finally {
        setProofLoading(false);
      }
    }
  };

  const handleVerify = async (winnerId, action) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/api/winners/${winnerId}/verify`, {
        action,
        adminNotes,
      });
      setSuccessMsg(`Winner ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      await fetchWinners();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayout = async (winnerId) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/api/winners/${winnerId}/payout`);
      setSuccessMsg('Marked as paid successfully.');
      await fetchWinners();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as paid.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatMoney = (p) => `£${Number(p || 0).toFixed(2)}`;

  return (
    <div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Winner Verification</h1>
        <p className="text-slate-400 mb-8">Review proof uploads, approve or reject, and manage payouts.</p>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : winners.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <span className="text-4xl mb-4 block">🏆</span>
            <h3 className="text-lg font-semibold text-white mb-1">No winners yet</h3>
            <p className="text-sm text-slate-500">Winners will appear here after draws are published.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/6 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[720px]">
              <span>Winner</span>
              <span>Draw</span>
              <span>Tier</span>
              <span>Amount</span>
              <span>Verification</span>
              <span>Payout</span>
            </div>

            <div className="divide-y divide-white/5 min-w-[720px]">
              {winners.map((w) => {
                const draw = w.drawResultId?.drawId;
                const tier = w.drawResultId?.matchTier;
                const amount = w.drawResultId?.prizeAmount || 0;
                const vBadge = STATUS_BADGE[w.verification_status] || STATUS_BADGE.pending;
                const pBadge = PAYOUT_BADGE[w.payout_status] || PAYOUT_BADGE.pending;
                const isSelected = selectedId === w.id;

                return (
                  <div key={w.id}>
                    {/* Row */}
                    <button
                      onClick={() => openDetail(w)}
                      className={`w-full grid grid-cols-1 md:grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_1fr] gap-2 md:gap-4 px-6 py-4 text-left transition-colors ${
                        isSelected ? 'bg-brand-950/20' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-400">
                          {w.userId?.name?.[0] || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{w.userId?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500 truncate">{w.userId?.email}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 self-center">
                        {draw ? `${MONTHS[draw.month - 1]} ${draw.year}` : '—'}
                      </p>
                      <div className="self-center">
                        <span className={`inline-block w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          tier === 5 ? 'bg-warning/15 text-warning' :
                          tier === 4 ? 'bg-brand-500/15 text-brand-400' :
                          'bg-white/8 text-slate-300'
                        }`}>
                          {tier}
                        </span>
                      </div>
                      <p className="self-center text-sm font-bold text-success tabular-nums">
                        {formatMoney(amount)}
                      </p>
                      <div className="self-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${vBadge.cls}`}>
                          {vBadge.label}
                        </span>
                      </div>
                      <div className="self-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${pBadge.cls}`}>
                          {pBadge.label}
                        </span>
                      </div>
                    </button>

                    {/* Detail panel */}
                    {isSelected && (
                      <div className="px-6 py-5 bg-surface-100/20 border-t border-white/5">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
                          {/* Proof image */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Proof Image</h4>
                            {proofLoading ? (
                              <div className="aspect-video rounded-xl bg-surface-200/30 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : proofUrl ? (
                              <div className="aspect-video rounded-xl overflow-hidden bg-surface-200/30">
                                <img src={proofUrl} alt="Winner proof" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="aspect-video rounded-xl bg-surface-200/30 flex items-center justify-center">
                                <p className="text-xs text-slate-500">No proof uploaded yet</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions</h4>

                            {error && (
                              <div className="mb-3 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
                                {error}
                              </div>
                            )}
                            {successMsg && (
                              <div className="mb-3 px-3 py-2 rounded-lg bg-success/10 border border-success/20 text-success text-xs">
                                {successMsg}
                              </div>
                            )}

                            {/* Admin notes */}
                            <div className="mb-4">
                              <label className="block text-xs text-slate-500 mb-1">Admin notes</label>
                              <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes (visible on rejection)…"
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg bg-surface-100/60 border border-white/8 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                              />
                            </div>

                            {/* Verify buttons */}
                            {w.verification_status === 'uploaded' && (
                              <div className="flex gap-2 mb-4">
                                <button
                                  onClick={() => handleVerify(w.id, 'approve')}
                                  disabled={actionLoading}
                                  className="flex-1 py-2.5 rounded-lg bg-success/15 text-success text-xs font-semibold hover:bg-success/25 disabled:opacity-50 transition-colors"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleVerify(w.id, 'reject')}
                                  disabled={actionLoading}
                                  className="flex-1 py-2.5 rounded-lg bg-danger/15 text-danger text-xs font-semibold hover:bg-danger/25 disabled:opacity-50 transition-colors"
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            )}

                            {/* Mark as paid */}
                            {w.verification_status === 'approved' && w.payout_status === 'pending' && (
                              <button
                                onClick={() => handlePayout(w.id)}
                                disabled={actionLoading}
                                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 hover:brightness-110 disabled:opacity-50 transition-all"
                              >
                                💰 Mark as Paid
                              </button>
                            )}

                            {w.payout_status === 'paid' && (
                              <div className="text-center py-3 text-success text-xs font-semibold">
                                ✓ Payout completed
                              </div>
                            )}

                            {/* Status info */}
                            <div className="mt-4 text-[10px] text-slate-600 space-y-1">
                              <p>Created: {new Date(w.created_at || w.createdAt).toLocaleString('en-GB')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
