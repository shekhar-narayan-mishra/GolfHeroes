import * as scoreService from '../services/scoreService.js';
import { scoreToClient } from '../utils/scoreMapper.js';

/**
 * GET /api/scores — get current user's scores (newest first)
 */
export const getMyScores = async (req, res, next) => {
  try {
    const scores = await scoreService.getUserScores(req.user.id);
    res.json({ success: true, scores: scores.map(scoreToClient) });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/scores — add a new score
 * Body: { value: number, date: string }
 */
export const createScore = async (req, res, next) => {
  try {
    const { value, date } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ success: false, message: 'Score value is required.' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required.' });
    }
    if (value < 1 || value > 45 || !Number.isInteger(Number(value))) {
      return res.status(400).json({ success: false, message: 'Score must be a whole number between 1 and 45.' });
    }

    const score = await scoreService.addScore(req.user.id, Number(value), date);
    res.status(201).json({ success: true, score: scoreToClient(score) });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/scores/:id — edit an existing score
 * Body: { value?: number, date?: string }
 */
export const updateScore = async (req, res, next) => {
  try {
    const { value, date } = req.body;

    if (value !== undefined && (value < 1 || value > 45 || !Number.isInteger(Number(value)))) {
      return res.status(400).json({ success: false, message: 'Score must be a whole number between 1 and 45.' });
    }

    const score = await scoreService.editScore(
      req.params.id,
      req.user.id,
      value !== undefined ? Number(value) : undefined,
      date
    );
    res.json({ success: true, score: scoreToClient(score) });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/scores/:id — delete a score
 */
export const deleteScore = async (req, res, next) => {
  try {
    await scoreService.deleteScore(req.params.id, req.user.id);
    res.json({ success: true, message: 'Score deleted.' });
  } catch (error) {
    next(error);
  }
};
