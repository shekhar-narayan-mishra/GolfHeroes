import { Router } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import { register, login, getMe, logout } from '../controllers/authController.js';
import verifyToken from '../middleware/verifyToken.js';
import {
  registerRules,
  loginRules,
  handleValidationErrors,
} from '../middleware/validate.js';

const router = Router();

router.post('/register', registerRules, handleValidationErrors, asyncHandler(register));
router.post('/login', loginRules, handleValidationErrors, asyncHandler(login));
router.get('/me', verifyToken, asyncHandler(getMe));
router.post('/logout', verifyToken, asyncHandler(logout));

export default router;
