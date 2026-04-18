import { Router } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
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
router.get('/', asyncHandler(getMyScores));

// Mutations require an active subscription
router.post('/', subscriptionGuard, asyncHandler(createScore));
router.put('/:id', subscriptionGuard, asyncHandler(updateScore));
router.delete('/:id', subscriptionGuard, asyncHandler(deleteScore));

export default router;
