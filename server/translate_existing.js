import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import Product from './models/Product.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import { generateTranslations } from './utils/translate.js';

const translateExisting = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/techstore');
        console.log('Connected to MongoDB');

        console.log('Translating products...');
        const products = await Product.find({ 'translations.uz.name': { $exists: false } });
        console.log(`Found ${products.length} products needing translation.`);

        for (const product of products) {
            console.log(`Translating: ${product.name}`);
            const translations = await generateTranslations(product.name, product.description);
            product.translations = translations;
            await product.save();
            console.log(`✓ Translated: ${product.name}`);
        }

        console.log('Translating categories...');
        const categories = await Category.find({ 'translations.uz.name': { $exists: false } });
        console.log(`Found ${categories.length} categories needing translation.`);
        for (const category of categories) {
            console.log(`Translating: ${category.name}`);
            const translations = await generateTranslations(category.name, category.description);
            category.translations = translations;
            await category.save();
        }

        console.log('Translating brands...');
        const brands = await Brand.find({ 'translations.uz.name': { $exists: false } });
        console.log(`Found ${brands.length} brands needing translation.`);
        for (const brand of brands) {
            console.log(`Translating: ${brand.name}`);
            const translations = await generateTranslations(brand.name, brand.description);
            brand.translations = translations;
            await brand.save();
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

translateExisting();
