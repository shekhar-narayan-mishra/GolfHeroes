import { Router } from 'express';
import {
  getDraws,
  getDrawById,
  createDraw,
  simulateDraw,
  publishDraw,
} from '../controllers/drawController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = Router();

// Public routes (optionally pass user context for admin detection)
router.get('/', optionalAuth, getDraws);
router.get('/:id', optionalAuth, getDrawById);

// Admin-only routes
router.post('/', verifyToken, isAdmin, createDraw);
router.post('/:id/simulate', verifyToken, isAdmin, simulateDraw);
router.post('/:id/publish', verifyToken, isAdmin, publishDraw);

/**
 * Optional auth — attaches req.user if a valid token is present,
 * but doesn't block the request if no token.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  // Reuse verifyToken logic but don't block
  verifyToken(req, res, (err) => {
    // If verification fails, just proceed without user
    if (err) {
      req.user = null;
    }
    next();
  });
}

export default router;
