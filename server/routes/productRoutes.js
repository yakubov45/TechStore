import express from 'express';
import {
    getProducts,
    getFeaturedProducts,
    getProduct,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    applyBulkDiscount
} from '../controllers/productController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

import reviewRouter from './reviewRoutes.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:productId/reviews', reviewRouter);

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProduct);
router.get('/:slug/related', getRelatedProducts);

// Admin routes
router.post('/', protect, admin, upload.array('images'), createProduct);
router.put('/:id', protect, admin, upload.array('images'), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.route('/bulk-discount').post(protect, admin, applyBulkDiscount);
router.route('/:id/images').post(protect, admin, upload.array('images'), uploadProductImages);

export default router;
