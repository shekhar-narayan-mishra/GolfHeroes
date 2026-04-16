import { Router } from 'express';
import { getAnalytics } from '../controllers/adminController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

router.use(verifyToken, isAdmin);

router.get('/analytics', getAnalytics);

export default router;
