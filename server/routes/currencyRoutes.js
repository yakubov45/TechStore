import express from 'express';
import { getExchangeRate, updateExchangeRate } from '../controllers/currencyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getExchangeRate);
router.put('/', protect, admin, updateExchangeRate);

export default router;
