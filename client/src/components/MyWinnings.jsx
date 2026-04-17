import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const STATUS_CONFIG = {
  proof_pending: { label: 'Proof Needed', color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  proof_uploaded: { label: 'Under Review', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
  approved: { label: 'Approved', color: 'text-success', bg: 'bg-success/10 border-success/20' },
  rejected: { label: 'Rejected', color: 'text-danger', bg: 'bg-danger/10 border-danger/20' },
};

const PAYOUT_CONFIG = {
  pending: { label: 'Payout Pending', color: 'text-warning' },
  paid: { label: 'Paid', color: 'text-success' },
};

const TIMELINE_STEPS = ['proof_pending', 'proof_uploaded', 'approved', 'paid'];

/**
 * User-facing winnings section for the Dashboard.
 * Shows list of wins, status badges, upload area, and status timeline.
 */
export default function MyWinnings() {
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // winnerId being uploaded
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchWinnings();
  }, []);

  const fetchWinnings = async () => {
    try {
      const { data } = await api.get('/api/winners/my');
      setWinnings(data.winners);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (winnerId, file) => {
    if (!file) return;
    setUploading(winnerId);
    setError('');

    const formData = new FormData();
    formData.append('proof', file);

    try {
      await api.post(`/api/winners/${winnerId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchWinnings();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const handleDrop = (e, winnerId) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    handleUpload(winnerId, file);
  };

  const getTimelineIdx = (w) => {
    if (w.payoutStatus === 'paid') return 3;
    if (w.verificationStatus === 'approved') return 2;
    if (w.verificationStatus === 'proof_uploaded') return 1;
    return 0;
  };

  const formatPence = (p) => `£${(p / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (winnings.length === 0) return null;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🏆</span> Your Winnings
        </h3>
        <span className="text-xs text-slate-500">{winnings.length} win{winnings.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="px-6 py-2 bg-danger/5 border-b border-danger/10 text-danger text-xs">
          {error}
        </div>
      )}

      <div className="divide-y divide-white/5">
        {winnings.map((w) => {
          const draw = w.drawResultId?.drawId;
          const tier = w.drawResultId?.matchTier;
          const amount = w.drawResultId?.prizeAmount || 0;
          const status = STATUS_CONFIG[w.verificationStatus] || STATUS_CONFIG.proof_pending;
          const payout = PAYOUT_CONFIG[w.payoutStatus] || PAYOUT_CONFIG.pending;
          const timelineIdx = getTimelineIdx(w);
          const canUpload = ['proof_pending', 'rejected'].includes(w.verificationStatus);

          return (
            <div key={w._id} className="px-6 py-5">
              {/* Win info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                    tier === 5 ? 'bg-warning/15 text-warning' :
                    tier === 4 ? 'bg-brand-500/15 text-brand-400' :
                    'bg-white/8 text-slate-300'
                  }`}>
                    {tier}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {tier}-Number Match
                    </p>
                    <p className="text-xs text-slate-500">
                      {draw ? `${MONTHS[draw.month - 1]} ${draw.year}` : 'Draw'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success tabular-nums">{formatPence(amount)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Status timeline */}
              <div className="flex items-center gap-1 mb-4">
                {TIMELINE_STEPS.map((step, i) => {
                  const labels = ['Proof', 'Review', 'Approved', 'Paid'];
                  const isActive = i <= timelineIdx;
                  const isCurrent = i === timelineIdx;
                  const isRejected = w.verificationStatus === 'rejected' && i === 0;

                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isRejected ? 'bg-danger/20 text-danger border border-danger/30' :
                          isCurrent ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' :
                          isActive ? 'bg-success/20 text-success' :
                          'bg-surface-200/50 text-slate-600'
                        }`}>
                          {isRejected ? '!' : isActive && !isCurrent ? '✓' : i + 1}
                        </div>
                        <span className={`text-[9px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                          {labels[i]}
                        </span>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`h-px flex-1 mx-0.5 ${
                          i < timelineIdx ? 'bg-success/30' : 'bg-surface-200/50'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rejection note */}
              {w.verificationStatus === 'rejected' && w.adminNotes && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-danger/5 border border-danger/10 text-xs text-danger">
                  <strong>Feedback:</strong> {w.adminNotes}
                </div>
              )}

              {/* Upload area */}
              {canUpload && (
                <div
                  className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                    dragOver === w._id ? 'border-brand-500/50 bg-brand-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(w._id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => handleDrop(e, w._id)}
                  onClick={() => {
                    fileInputRef.current?.setAttribute('data-winner-id', w._id);
                    fileInputRef.current?.click();
                  }}
                >
                  <div className="py-5 text-center">
                    {uploading === w._id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-slate-400">Uploading…</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-6 h-6 text-slate-500 mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <p className="text-xs text-slate-400">
                          {w.verificationStatus === 'rejected' ? 'Re-upload your scorecard proof' : 'Upload scorecard proof'}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          Drag & drop or click • JPEG, PNG, WebP, PDF (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Payout status for approved winners */}
              {w.verificationStatus === 'approved' && (
                <div className={`mt-2 text-xs font-semibold ${payout.color}`}>
                  {w.payoutStatus === 'paid' ? '✓ Payout sent' : '⏳ Awaiting payout'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          const winnerId = e.target.getAttribute('data-winner-id');
          if (file && winnerId) handleUpload(winnerId, file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
