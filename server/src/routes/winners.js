import { Router } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getWinners,
  getMyWinnings,
  uploadProof,
  getProofUrl,
  verifyWinner,
  markPaid,
} from '../controllers/winnerController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';
import uploadProofMiddleware from '../middleware/uploadProof.js';

const router = Router();

// All winner routes require authentication
router.use(verifyToken);

// User routes
router.get('/my', asyncHandler(getMyWinnings));
router.post('/:id/proof', uploadProofMiddleware.single('proof'), uploadProof);
router.get('/:id/proof-url', asyncHandler(getProofUrl));

// Admin routes
router.get('/', isAdmin, asyncHandler(getWinners));
router.post('/:id/verify', isAdmin, asyncHandler(verifyWinner));
router.post('/:id/payout', isAdmin, asyncHandler(markPaid));

export default router;
