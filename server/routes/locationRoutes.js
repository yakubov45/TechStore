import express from 'express';
import {
    getLocations,
    getAdminLocations,
    createLocation,
    updateLocation,
    deleteLocation
} from '../controllers/locationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getLocations);
router.get('/admin', protect, admin, getAdminLocations);
router.post('/', protect, admin, createLocation);
router.put('/:id', protect, admin, updateLocation);
router.delete('/:id', protect, admin, deleteLocation);

export default router;
