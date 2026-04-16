import { Router } from 'express';
import {
  createCheckout,
  createPortal,
  getStatus,
} from '../controllers/subscriptionController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

// All subscription routes require authentication
router.use(verifyToken);

router.post('/create-checkout', createCheckout);
router.post('/portal', createPortal);
router.get('/status', getStatus);

export default router;
