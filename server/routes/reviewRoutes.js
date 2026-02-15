import express from 'express';
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getAllReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router({ mergeParams: true });

// Public/User routes
// Public/User routes
router.route('/')
    .get(getProductReviews)
    .post(protect, createReview);

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin routes
router.get('/', protect, admin, getAllReviews);

export default router;
