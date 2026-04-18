import { Router } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getDraws,
  getDrawById,
  createDraw,
  simulateDraw,
  publishDraw,
  optionalAuth,
} from '../controllers/drawController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

router.get('/', optionalAuth, asyncHandler(getDraws));
router.get('/:id', optionalAuth, asyncHandler(getDrawById));

router.post('/', verifyToken, isAdmin, asyncHandler(createDraw));
router.post('/:id/simulate', verifyToken, isAdmin, asyncHandler(simulateDraw));
router.post('/:id/publish', verifyToken, isAdmin, asyncHandler(publishDraw));

export default router;
