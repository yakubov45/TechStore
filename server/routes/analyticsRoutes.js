import express from 'express';
import { getDashboardStats, getSalesData } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/sales', protect, admin, getSalesData);

export default router;
