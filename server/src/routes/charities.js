import { Router } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getCharities,
  getCharityBySlug,
  createCharity,
  updateCharity,
  deleteCharity,
  addImage,
  selectCharity,
} from '../controllers/charityController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(getCharities));
router.get('/:slug', asyncHandler(getCharityBySlug));

// Authenticated: charity selection
router.post('/select', verifyToken, asyncHandler(selectCharity));

// Admin-only routes
router.post('/', verifyToken, isAdmin, asyncHandler(createCharity));
router.put('/:id', verifyToken, isAdmin, asyncHandler(updateCharity));
router.delete('/:id', verifyToken, isAdmin, asyncHandler(deleteCharity));
router.post('/:id/image', verifyToken, isAdmin, asyncHandler(addImage));

export default router;
