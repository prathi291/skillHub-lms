import express from 'express';
import AuthController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// ==================== PROTECTED ROUTES ====================
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
