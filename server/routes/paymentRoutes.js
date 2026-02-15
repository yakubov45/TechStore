import express from 'express';
import { createStripeSession, createPaymePayment, createClickPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createStripeSession);
router.post('/payme/create', protect, createPaymePayment);
router.post('/click/create', protect, createClickPayment);

export default router;
