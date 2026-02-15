import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

// @desc    Global search
// @route   GET /api/search
// @access  Public
export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchQuery = q.trim();
        const searchRegex = new RegExp(searchQuery, 'i');

        // Search products
        const products = await Product.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { sku: searchRegex },
                { tags: searchRegex }
            ]
        })
            .populate('category', 'name slug icon')
            .populate('brand', 'name slug')
            .limit(10)
            .select('name slug price images brand category stock rating');

        // Search categories
        const categories = await Category.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        })
            .limit(5)
            .select('name slug icon description productCount');

        // Search brands
        const brands = await Brand.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        })
            .limit(5)
            .select('name slug description productCount');

        res.json({
            success: true,
            data: {
                products,
                categories,
                brands
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during search'
        });
    }
};
