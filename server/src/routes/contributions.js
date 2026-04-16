import { Router } from 'express';
import {
  createIndependentDonation,
  getMyContributions,
  getContributionTotals,
} from '../controllers/contributionController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

router.use(verifyToken);

router.post('/independent', createIndependentDonation);
router.get('/my', getMyContributions);
router.get('/totals', isAdmin, getContributionTotals);

export default router;
