import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for score CRUD operations.
 * Handles loading, error state, and all API calls.
 */
export default function useScores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch scores
  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/scores');
      setScores(data.scores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load scores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  // Add score
  const addScore = useCallback(async (value, date) => {
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/api/scores', { value, date });
      // Re-fetch to get correct sorted list (oldest may have been evicted)
      await fetchScores();
      return data.score;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add score.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [fetchScores]);

  // Edit score
  const editScore = useCallback(async (scoreId, value, date) => {
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.put(`/api/scores/${scoreId}`, { value, date });
      setScores((prev) =>
        prev.map((s) => (s._id === scoreId ? data.score : s)).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )
      );
      return data.score;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update score.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Delete score
  const deleteScore = useCallback(async (scoreId) => {
    setSubmitting(true);
    setError('');
    try {
      await api.delete(`/api/scores/${scoreId}`);
      setScores((prev) => prev.filter((s) => s._id !== scoreId));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete score.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return {
    scores,
    loading,
    error,
    submitting,
    addScore,
    editScore,
    deleteScore,
    clearError,
    refetch: fetchScores,
  };
}
