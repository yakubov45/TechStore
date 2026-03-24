import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

const router = express.Router();

// @desc    Backfill translations for all database entities
// @route   POST /api/admin/translations/translate-all
// @access  Private/Admin
router.post('/translate-all', protect, admin, async (req, res) => {
    try {
        console.log('[AutoTranslate] Starting full database translation backfill...');
        // We find all primary documents
        const products = await Product.find({});
        const categories = await Category.find({});
        const brands = await Brand.find({});

        let count = 0;

        // Loop and force resave which triggers our pre-save translation hooks
        for (const p of products) {
            p.markModified('name');
            p.markModified('description');
            await p.save();
            count++;
        }
        for (const c of categories) {
            c.markModified('name');
            c.markModified('description');
            await c.save();
            count++;
        }
        for (const b of brands) {
            b.markModified('name');
            b.markModified('description');
            await b.save();
            count++;
        }

        console.log(`[AutoTranslate] Completed backfilling ${count} items.`);
        res.json({ success: true, message: `Successfully auto-translated ${count} items in the database.` });
    } catch (error) {
        console.error('[AutoTranslate] Backfill failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
