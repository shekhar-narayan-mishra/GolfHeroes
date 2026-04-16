import { Router } from 'express';
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
router.get('/my', getMyWinnings);
router.post('/:id/proof', uploadProofMiddleware.single('proof'), uploadProof);
router.get('/:id/proof-url', getProofUrl);

// Admin routes
router.get('/', isAdmin, getWinners);
router.post('/:id/verify', isAdmin, verifyWinner);
router.post('/:id/payout', isAdmin, markPaid);

export default router;
