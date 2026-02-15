import Brand from '../models/Brand.js';
import Product from '../models/Product.js';

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
    try {
        const { featured } = req.query;
        const query = featured === 'true' ? { featured: true } : {};

        const brands = await Brand.find(query).sort('name');

        res.json({
            success: true,
            count: brands.length,
            data: brands
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get brand by slug with products
// @route   GET /api/brands/:slug
// @access  Public
export const getBrandBySlug = async (req, res) => {
    try {
        const brand = await Brand.findOne({ slug: req.params.slug });

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        // Get products for this brand
        const { page = 1, limit = 12, sort = '-createdAt' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const products = await Product.find({ brand: brand._id })
            .populate('category', 'name slug')
            .sort(sort)
            .limit(limitNum)
            .skip(skip);

        const total = await Product.countDocuments({ brand: brand._id });

        res.json({
            success: true,
            data: {
                brand,
                products,
                pagination: {
                    total,
                    page: pageNum,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create brand (Admin)
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = async (req, res) => {
    try {
        const brand = await Brand.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Brand created successfully',
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update brand (Admin)
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        res.json({
            success: true,
            message: 'Brand updated successfully',
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete brand (Admin)
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        // Check if brand has products
        const productCount = await Product.countDocuments({ brand: brand._id });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete brand with existing products'
            });
        }

        await brand.deleteOne();

        res.json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
