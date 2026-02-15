import express from 'express';
import {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    addAddress,
    getUserOrders,
    getAllUsers,
    updateUserRole
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// User routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);
router.post('/addresses', protect, addAddress);
router.get('/orders', protect, getUserOrders);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.put('/:id/role', protect, admin, updateUserRole);

export default router;
