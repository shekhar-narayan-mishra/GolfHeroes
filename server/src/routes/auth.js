import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import verifyToken from '../middleware/verifyToken.js';
import {
  registerRules,
  loginRules,
  handleValidationErrors,
} from '../middleware/validate.js';

const router = Router();

router.post('/register', registerRules, handleValidationErrors, register);
router.post('/login', loginRules, handleValidationErrors, login);
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

export default router;
