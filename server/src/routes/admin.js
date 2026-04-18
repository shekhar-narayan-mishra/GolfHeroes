import { Router } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAnalytics, getUsers } from '../controllers/adminController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

router.use(verifyToken, isAdmin);

router.get('/analytics', asyncHandler(getAnalytics));
router.get('/users', asyncHandler(getUsers));

export default router;
