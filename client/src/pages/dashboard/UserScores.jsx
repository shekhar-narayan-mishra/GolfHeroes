import useScores from '../../hooks/useScores';
import ScoreEntryForm from '../../components/ScoreEntryForm';
import ScoreList from '../../components/ScoreList';

export default function UserScores() {
  const {
    scores,
    loading,
    error,
    submitting,
    addScore,
    editScore,
    deleteScore,
    clearError,
  } = useScores();

  const average =
    scores.length > 0
      ? (scores.reduce((sum, s) => sum + s.value, 0) / scores.length).toFixed(1)
      : '—';

  const best = scores.length > 0 ? Math.max(...scores.map((s) => s.value)) : '—';

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Stableford Scores</h1>
      <p className="text-slate-400 mb-8">
        Track your recent rounds. You can keep up to 5 scores at a time.
      </p>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rounds</p>
          <p className="text-2xl font-bold text-white tabular-nums">{scores.length}</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Average</p>
          <p className="text-2xl font-bold text-brand-400 tabular-nums">{average}</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Best</p>
          <p className="text-2xl font-bold text-success tabular-nums">{best}</p>
        </div>
      </div>

      {/* Global error from hook */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
          <button onClick={clearError} className="text-danger/60 hover:text-danger">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="mb-8">
        <ScoreEntryForm
          onSubmit={addScore}
          submitting={submitting}
          scoreCount={scores.length}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ScoreList
          scores={scores}
          onEdit={editScore}
          onDelete={deleteScore}
          submitting={submitting}
        />
      )}
    </div>
  );
}
