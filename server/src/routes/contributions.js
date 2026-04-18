import { Router } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createIndependentDonation,
  getMyContributions,
  getContributionTotals,
} from '../controllers/contributionController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

router.use(verifyToken);

router.post('/independent', asyncHandler(createIndependentDonation));
router.get('/my', asyncHandler(getMyContributions));
router.get('/totals', isAdmin, asyncHandler(getContributionTotals));

export default router;
