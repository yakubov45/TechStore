import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSettings, updateFlashDeals } from '../controllers/settingController.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/flash-deals', protect, admin, updateFlashDeals);

export default router;
