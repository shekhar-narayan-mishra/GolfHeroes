import { Router } from 'express';
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
router.get('/', getCharities);
router.get('/:slug', getCharityBySlug);

// Authenticated: charity selection
router.post('/select', verifyToken, selectCharity);

// Admin-only routes
router.post('/', verifyToken, isAdmin, createCharity);
router.put('/:id', verifyToken, isAdmin, updateCharity);
router.delete('/:id', verifyToken, isAdmin, deleteCharity);
router.post('/:id/image', verifyToken, isAdmin, addImage);

export default router;
