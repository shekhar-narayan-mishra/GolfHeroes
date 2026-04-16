import { Router } from 'express';
import {
  getMyScores,
  createScore,
  updateScore,
  deleteScore,
} from '../controllers/scoreController.js';
import verifyToken from '../middleware/verifyToken.js';
import subscriptionGuard from '../middleware/subscriptionGuard.js';

const router = Router();

// All score routes require authentication
router.use(verifyToken);

// GET is available to all authenticated users (lets them see their scores even if lapsed)
router.get('/', getMyScores);

// Mutations require an active subscription
router.post('/', subscriptionGuard, createScore);
router.put('/:id', subscriptionGuard, updateScore);
router.delete('/:id', subscriptionGuard, deleteScore);

export default router;
