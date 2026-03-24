import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    sendOTP,
    verifyOTP
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkIPBlock } from '../middleware/bruteForceMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 auth requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.use(authLimiter);
router.use(checkIPBlock);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// Allow send-otp and verify-otp to be called without auth (used during registration / resend flows)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

export default router;
