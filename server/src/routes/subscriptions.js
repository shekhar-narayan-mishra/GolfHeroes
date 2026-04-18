import { Router } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createCheckout,
  createPortal,
  getStatus,
} from '../controllers/subscriptionController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

// All subscription routes require authentication
router.use(verifyToken);

router.post('/create-checkout', asyncHandler(createCheckout));
router.post('/portal', asyncHandler(createPortal));
router.get('/status', asyncHandler(getStatus));

export default router;
