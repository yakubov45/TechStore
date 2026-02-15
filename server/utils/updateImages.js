import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import connectDB from '../config/db.js';
import { getProductImages } from './productImages.js';

dotenv.config();

const updateProductImages = async () => {
    try {
        await connectDB();

        console.log('📸 Updating product images...');

        // Get all products with their category and brand populated
        const products = await Product.find({}).populate('category').populate('brand');

        let updatedCount = 0;

        for (const product of products) {
            // Get appropriate images based on category, brand, and SKU
            const images = getProductImages(
                product.category?.name,
                product.brand?.name,
                product.sku
            );

            // Update product with images
            if (images && images.length > 0) {
                product.images = images;
                await product.save();
                updatedCount++;
                console.log(`✅ Updated: ${product.name}`);
            }
        }

        console.log(`\n🎉 Successfully updated ${updatedCount} products with images!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating images:', error);
        process.exit(1);
    }
};

updateProductImages();
