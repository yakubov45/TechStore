import express from 'express';
import { subscribe, sendBulkNewsletter } from '../controllers/newsletterController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/send', protect, admin, sendBulkNewsletter);

export default router;
