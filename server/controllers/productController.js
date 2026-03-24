import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Review from '../models/Review.js';
import { generateTranslations } from '../utils/translate.js';
import { logActivity } from '../utils/logger.js';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const {
            category,
            brand,
            search,
            minPrice,
            maxPrice,
            minRating,
            discountOnly,
            inFlashDeal,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        // Build base query (excludes minPrice/maxPrice to find absolute bounds)
        let baseQuery = {};

        if (category) baseQuery.category = category;
        if (brand) baseQuery.brand = brand;
        if (minRating) baseQuery.averageRating = { $gte: Number(minRating) };
        if (discountOnly === 'true') {
            baseQuery.comparePrice = { $exists: true, $gt: 0 };
        }
        if (inFlashDeal === 'true') {
            baseQuery.inFlashDeal = true;
        }
        if (search) {
            baseQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build the final query
        let query = { ...baseQuery };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Build sort
        let sortOption = {};
        switch (sort) {
            case 'price-asc':
                sortOption = { price: 1 };
                break;
            case 'price-desc':
                sortOption = { price: -1 };
                break;
            case 'rating':
                sortOption = { averageRating: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        // Execute query with pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo')
            .sort(sortOption)
            .limit(limitNum)
            .skip(skip);

        // Auto-restore expired daily discounts if any
        for (const p of products) {
            if (p.dailyDiscountExpire && p.dailyDiscountExpire < Date.now()) {
                if (p.comparePrice) {
                    p.price = p.comparePrice;
                    p.comparePrice = null;
                }
                p.dailyDiscountExpire = null;
                try { await p.save(); } catch (e) { console.error('Failed to restore expired discount for', p._id, e); }
            }
        }

        const total = await Product.countDocuments(query);

        // Find min / max bounds for the current filter
        const [minProduct, maxProduct] = await Promise.all([
            Product.findOne(baseQuery).sort({ price: 1 }).select('price'),
            Product.findOne(baseQuery).sort({ price: -1 }).select('price')
        ]);

        const absoluteMinPrice = minProduct ? minProduct.price : 0;
        const absoluteMaxPrice = maxProduct ? maxProduct.price : 1000;

        res.json({
            success: true,
            count: products.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            minPriceBoundary: absoluteMinPrice,
            maxPriceBoundary: absoluteMaxPrice,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ featured: true })
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo')
            .limit(15);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            $or: [
                { slug: req.params.slug },
                { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }
            ]
        })
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Restore expired daily discount for this product if necessary
        if (product.dailyDiscountExpire && product.dailyDiscountExpire < Date.now()) {
            if (product.comparePrice) {
                product.price = product.comparePrice;
                product.comparePrice = null;
            }
            product.dailyDiscountExpire = null;
            try { await product.save(); } catch (e) { console.error('Failed to restore expired discount for', product._id, e); }
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get related products
// @route   GET /api/products/:slug/related
// @access  Public
export const getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Find products with same category or brand
        const relatedProducts = await Product.find({
            _id: { $ne: product._id },
            $or: [
                { category: product.category },
                { brand: product.brand }
            ]
        })
            .populate('category', 'name slug')
            .populate('brand', 'name slug')
            .limit(8);

        res.json({
            success: true,
            data: relatedProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        let productData = { ...req.body };

        if (typeof productData.specifications === 'string') {
            try {
                productData.specifications = JSON.parse(productData.specifications);
            } catch (e) {
                productData.specifications = {};
            }
        }

        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file => `/uploads/${file.filename}`);
        }

        // NaN protection
        if (productData.price) productData.price = Number(productData.price) || 0;
        if (productData.comparePrice) productData.comparePrice = Number(productData.comparePrice) || null;
        if (productData.stock) productData.stock = Number(productData.stock) || 0;
        // monthly discount percent
        if (productData.monthlyDiscountPercent !== undefined && productData.monthlyDiscountPercent !== null) {
            const m = Number(productData.monthlyDiscountPercent);
            productData.monthlyDiscountPercent = isNaN(m) ? 0 : Math.max(0, Math.min(100, m));
        }

        // Generate translations
        const translations = await generateTranslations(productData.name, productData.description);
        productData.translations = translations;

        const product = await Product.create(productData);

        if (product.category) {
            await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });
        }
        if (product.brand) {
            await Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: 1 } });
        }

        await logActivity(req, 'CREATE', 'Product', product._id, { name: product.name });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let updates = { ...req.body };

        // Parse specifications
        if (typeof updates.specifications === 'string') {
            try {
                updates.specifications = JSON.parse(updates.specifications);
            } catch (e) {
                updates.specifications = {};
            }
        }

        // Handle tags
        if (updates.tags && typeof updates.tags === 'string') {
            updates.tags = updates.tags.split(',').map(t => t.trim()).filter(t => t);
        }

        // Handle images
        let keepImages = [];
        if (updates.existingImages) {
            keepImages = Array.isArray(updates.existingImages)
                ? updates.existingImages
                : [updates.existingImages];
        }

        let newImages = [];
        if (req.files && req.files.length > 0) {
            newImages = req.files.map(file => `/uploads/${file.filename}`);
        }

        if (updates.existingImages !== undefined || (req.files && req.files.length > 0)) {
            updates.images = [...keepImages, ...newImages];
        }

        // Track changes for counts
        const oldCategory = product.category ? product.category.toString() : null;
        const oldBrand = product.brand ? product.brand.toString() : null;

        // Apply updates with NaN protection
        Object.keys(updates).forEach(key => {
            if (key !== 'existingImages' && key !== '_id') {
                if (key === 'price' || key === 'comparePrice' || key === 'stock' || key === 'monthlyDiscountPercent') {
                    const val = Number(updates[key]);
                    if (!isNaN(val)) {
                        if (key === 'monthlyDiscountPercent') {
                            product[key] = Math.max(0, Math.min(100, val));
                        } else {
                            product[key] = val;
                        }
                    }
                } else {
                    product[key] = updates[key];
                }
            }
        });

        // Generate translations if name or description changed
        if (updates.name || updates.description) {
            const newName = updates.name || product.name;
            const newDesc = updates.description || product.description;
            const translations = await generateTranslations(newName, newDesc);
            product.translations = translations;
        }

        await product.save();

        // Update counts
        if (oldCategory && product.category && oldCategory !== product.category.toString()) {
            await Category.findByIdAndUpdate(oldCategory, { $inc: { productCount: -1 } });
            await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });
        } else if (!oldCategory && product.category) {
            await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });
        }

        if (oldBrand && product.brand && oldBrand !== product.brand.toString()) {
            await Brand.findByIdAndUpdate(oldBrand, { $inc: { productCount: -1 } });
            await Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: 1 } });
        } else if (!oldBrand && product.brand) {
            await Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: 1 } });
        }

        await logActivity(req, 'UPDATE', 'Product', product._id, { name: product.name });

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.category) {
            await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
        }
        if (product.brand) {
            await Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: -1 } });
        }

        await Review.deleteMany({ product: product._id });
        const productName = product.name;
        const productId = product._id;
        await product.deleteOne();

        await logActivity(req, 'DELETE', 'Product', productId, { name: productName });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Upload product images (Admin)
// @route   POST /api/products/:id/images
// @access  Private/Admin
export const uploadProductImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        product.images.push(...imagePaths);
        await product.save();

        res.json({
            success: true,
            message: 'Images uploaded successfully',
            data: { images: product.images }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Apply bulk discount
// @route   POST /api/products/bulk-discount
// @access  Private/Admin
export const applyBulkDiscount = async (req, res) => {
    try {
        // Accepts: { action: 'apply'|'remove', targetType, targetId, discountType, discountValue, daily, durationHours, discountReason, isDiscountActive, inFlashDeal }
        const { action = 'apply', targetType, targetId, discountType, discountValue, daily = false, durationHours = 24, discountReason = null, isDiscountActive = true, inFlashDeal = false } = req.body;

        let query = {};
        if (targetType === 'category') query.category = targetId;
        else if (targetType === 'brand') query.brand = targetId;
        else if (targetType === 'product') query._id = targetId;

        const products = await Product.find(query);

        for (const product of products) {
            if (action === 'remove' || discountType === 'remove') {
                if (product.comparePrice) {
                    product.price = product.comparePrice;
                    product.comparePrice = null;
                }
                product.dailyDiscountExpire = null;
                product.discountReason = null;
                product.isDiscountActive = true;
                product.inFlashDeal = false;
            } else if (action === 'apply') {
                // Determine base price (prevent compounding discounts)
                const basePrice = (product.comparePrice && product.comparePrice > 0) ? product.comparePrice : product.price;

                if (discountType === 'percentage') {
                    // Preserve original price if not already stored
                    if (!product.comparePrice) product.comparePrice = product.price;
                    const newPrice = basePrice * (1 - discountValue / 100);
                    product.price = isNaN(newPrice) ? product.price : newPrice;
                } else if (discountType === 'fixed') {
                    if (!product.comparePrice) product.comparePrice = product.price;
                    const newPrice = Math.max(0, basePrice - discountValue);
                    product.price = isNaN(newPrice) ? product.price : newPrice;
                }

                // If daily flag provided, set expiry so backend can auto-restore later
                if (daily) {
                    const hrs = Number(durationHours) || 24;
                    product.dailyDiscountExpire = new Date(Date.now() + hrs * 3600 * 1000);
                } else {
                    product.dailyDiscountExpire = null;
                }
                product.discountReason = discountReason;
                product.isDiscountActive = isDiscountActive === undefined ? true : isDiscountActive;
                product.inFlashDeal = inFlashDeal;
            }

            await product.save();
        }

        res.json({
            success: true,
            count: products.length,
            message: `Applied discount to ${products.length} products`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
