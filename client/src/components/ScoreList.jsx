import { useState } from 'react';

/**
 * Displays the user's scores (up to 5) with inline edit and delete.
 * Props:
 *  - scores — array of score objects
 *  - onEdit(scoreId, value, date) — async callback
 *  - onDelete(scoreId) — async callback
 *  - submitting — disables actions while a mutation is in progress
 */
export default function ScoreList({ scores, onEdit, onDelete, submitting }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const startEdit = (score) => {
    setEditingId(score._id);
    setEditValue(String(score.value));
    setEditDate(new Date(score.date).toISOString().split('T')[0]);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const handleSave = async (scoreId) => {
    setEditError('');
    const num = Number(editValue);
    if (!Number.isInteger(num) || num < 1 || num > 45) {
      setEditError('Score must be 1–45.');
      return;
    }
    if (!editDate) {
      setEditError('Date is required.');
      return;
    }

    try {
      await onEdit(scoreId, num, editDate);
      setEditingId(null);
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleDelete = async (scoreId) => {
    setDeletingId(scoreId);
    try {
      await onDelete(scoreId);
    } catch {
      // error handled by hook
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  // Empty state
  if (scores.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <div className="mb-4 inline-flex">
          <div className="w-16 h-16 rounded-2xl bg-surface-200/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">No scores yet</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Log your first Stableford score above. You can track up to 5 recent rounds.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Scores</h3>
        <span className="text-xs text-slate-500">{scores.length} of 5 slots used</span>
      </div>

      <div className="divide-y divide-white/5">
        {scores.map((score) => {
          const isEditing = editingId === score._id;
          const isDeleting = deletingId === score._id;

          return (
            <div
              key={score._id}
              className={`px-6 py-4 transition-colors ${
                isEditing ? 'bg-brand-950/20' : 'hover:bg-white/[0.02]'
              }`}
            >
              {isEditing ? (
                /* ── Inline Edit Mode ──────────────────────── */
                <div>
                  {editError && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
                      {editError}
                    </div>
                  )}
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Score</label>
                      <input
                        type="number"
                        min={1}
                        max={45}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-surface-100/60 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={editDate}
                        max={today}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-surface-100/60 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(score._id)}
                        disabled={submitting}
                        className="px-3.5 py-2 rounded-lg bg-success/20 text-success text-xs font-semibold hover:bg-success/30 disabled:opacity-50 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3.5 py-2 rounded-lg bg-surface-200/50 text-slate-400 text-xs font-medium hover:text-white hover:bg-surface-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Display Mode ──────────────────────────── */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Score value badge */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/20 to-brand-500/10 border border-brand-500/15 flex items-center justify-center">
                      <span className="text-lg font-bold text-brand-300 tabular-nums">{score.value}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{formatDate(score.date)}</p>
                      <p className="text-xs text-slate-500">Stableford points</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEdit(score)}
                      disabled={submitting}
                      className="p-2 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 disabled:opacity-50 transition-all"
                      title="Edit score"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(score._id)}
                      disabled={submitting || isDeleting}
                      className="p-2 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 disabled:opacity-50 transition-all"
                      title="Delete score"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-danger/30 border-t-danger rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
