import express from 'express';
import { getLogs } from '../controllers/activityController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, getLogs);

export default router;
