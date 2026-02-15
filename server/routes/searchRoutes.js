import express from 'express';
import { globalSearch } from '../controllers/searchController.js';

const router = express.Router();

// @route   GET /api/search
router.get('/', globalSearch);

export default router;
