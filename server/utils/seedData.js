import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';
import { getProductImages } from './productImages.js';
import { generateTranslations } from './translate.js';

dotenv.config();

// Sample data
const categoriesData = [
    { name: 'Gaming PCs', description: 'High-performance gaming computers', icon: '🎮' },
    { name: 'Laptops', description: 'Portable computers for work and entertainment', icon: '💻' },
    { name: 'Graphics Cards', description: 'GPUs for gaming and professional work', icon: '🎴' },
    { name: 'Processors', description: 'CPUs from Intel and AMD', icon: '🔲' },
    { name: 'RAM', description: 'Memory modules for your PC', icon: '📊' },
    { name: 'Storage', description: 'SSDs and HDDs', icon: '💾' },
    { name: 'Motherboards', description: 'Mainboards for PC builds', icon: '🔧' },
    { name: 'Power Supplies', description: 'PSUs for reliable power', icon: '⚡' },
    { name: 'Cooling', description: 'CPU and case cooling solutions', icon: '❄️' },
    { name: 'Monitors', description: 'Displays for gaming and work', icon: '🖥️' },
    { name: 'Keyboards', description: 'Mechanical and gaming keyboards', icon: '⌨️' },
    { name: 'Mice', description: 'Gaming and office mice', icon: '🖱️' },
    { name: 'Headsets', description: 'Gaming headsets and headphones', icon: '🎧' },
    { name: 'Accessories', description: 'PC accessories and peripherals', icon: '🎯' }
];

const brandsData = [
    { name: 'ASUS', description: 'Leading manufacturer of motherboards and graphics cards', featured: true },
    { name: 'MSI', description: 'Gaming hardware and components specialist', featured: true },
    { name: 'Gigabyte', description: 'High-quality PC components and peripherals', featured: true },
    { name: 'Intel', description: 'World\'s leading processor manufacturer', featured: true },
    { name: 'AMD', description: 'High-performance CPUs and GPUs', featured: true },
    { name: 'NVIDIA', description: 'Graphics processing pioneer', featured: true },
    { name: 'Corsair', description: 'Premium gaming peripherals and components', featured: true },
    { name: 'Kingston', description: 'Memory and storage solutions', featured: false },
    { name: 'Samsung', description: 'Electronics and storage devices', featured: false },
    { name: 'Logitech', description: 'Keyboards, mice, and accessories', featured: true },
    { name: 'Razer', description: 'Gaming peripherals and laptops', featured: true }
    , { name: 'Seagate', description: 'Hard drives and storage solutions', featured: false },
    { name: 'NZXT', description: 'PC cases and cooling solutions', featured: false }
    , { name: 'SteelSeries', description: 'High-performance gaming peripherals', featured: false },
    { name: 'G.Skill', description: 'High-performance memory modules', featured: false },
    { name: 'Western Digital', description: 'Storage and SSD solutions', featured: false }
    , { name: 'Seasonic', description: 'Power supplies and PSUs', featured: false },
    { name: 'Lian Li', description: 'Premium PC cases and accessories', featured: false },
    { name: 'Cooler Master', description: 'Cooling and PC components', featured: false },
    { name: 'Noctua', description: 'High-performance cooling fans', featured: false },
    { name: 'Dell', description: 'Monitors and computing solutions', featured: false },
    { name: 'LG', description: 'Displays and electronics', featured: false }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Category.deleteMany({});
        await Brand.deleteMany({});
        await Product.deleteMany({});

        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@techstore.uz',
            password: 'admin123',
            phone: '+998901234567',
            role: 'admin',
            isEmailVerified: true
        });

        console.log('📦 Creating categories...');
        // Ensure `slug` and translations exist for each category
        const categoriesWithSlugs = [];
        for (const cat of categoriesData) {
            const translations = await generateTranslations(cat.name, cat.description);
            categoriesWithSlugs.push({
                ...cat,
                slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                translations
            });
        }
        const categories = await Category.insertMany(categoriesWithSlugs);

        console.log('🏷️  Creating brands...');
        // Ensure `slug` and translations exist for each brand
        const brandsWithSlugs = [];
        for (const b of brandsData) {
            const translations = await generateTranslations(b.name, b.description);
            brandsWithSlugs.push({
                ...b,
                slug: b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                translations
            });
        }
        const brands = await Brand.insertMany(brandsWithSlugs);

        console.log('💻 Creating sample products...');

        // Helper to get random category/brand
        const getCategory = (name) => categories.find(c => c.name === name);
        const getBrand = (name) => brands.find(b => b.name === name);

        const productsData = [
            {
                name: 'Logitech G Pro Keyboard',
                description: 'Compact mechanical gaming keyboard',
                price: 129,
                sku: 'KB-LOGI-GPRO',
                category: getCategory('Keyboards')._id,
                brand: getBrand('Logitech')._id,
                images: [],
                specifications: new Map([['Type', 'Mechanical'], ['Size', 'TKL']]),
                stock: 44,
                featured: true,
                tags: ['keyboard', 'gaming']
            },
            {
                name: 'Razer BlackWidow V4',
                description: 'RGB mechanical keyboard',
                price: 169,
                sku: 'KB-RAZER-BW4',
                category: getCategory('Keyboards')._id,
                brand: getBrand('Razer')._id,
                images: [],
                specifications: new Map([['Switch', 'Green'], ['RGB', 'Yes']]),
                stock: 38,
                featured: false,
                tags: ['keyboard']
            },
            {
                name: 'Corsair K70 RGB',
                description: 'Aluminum mechanical keyboard',
                price: 159,
                sku: 'KB-COR-K70',
                category: getCategory('Keyboards')._id,
                brand: getBrand('Corsair')._id,
                images: [],
                specifications: new Map([['Switch', 'Red'], ['RGB', 'Yes']]),
                stock: 52,
                featured: true,
                tags: ['keyboard']
            },
            {
                name: 'Logitech G502 X',
                description: 'High precision gaming mouse',
                price: 79,
                sku: 'MOU-LOGI-502X',
                category: getCategory('Mice')._id,
                brand: getBrand('Logitech')._id,
                images: [],
                specifications: new Map([['DPI', '25600'], ['Weight', '89g']]),
                stock: 77,
                featured: true,
                tags: ['mouse']
            },
            {
                name: 'Razer Viper V2',
                description: 'Lightweight esports mouse',
                price: 149,
                sku: 'MOU-RAZER-V2',
                category: getCategory('Mice')._id,
                brand: getBrand('Razer')._id,
                images: [],
                specifications: new Map([['DPI', '30000'], ['Weight', '58g']]),
                stock: 61,
                featured: false,
                tags: ['mouse']
            },
            {
                name: 'SteelSeries Prime',
                description: 'Esports gaming mouse',
                price: 59,
                sku: 'MOU-SS-PRIME',
                category: getCategory('Mice')._id,
                brand: getBrand('SteelSeries')._id,
                images: [],
                specifications: new Map([['DPI', '18000'], ['Type', 'Wired']]),
                stock: 49,
                featured: false,
                tags: ['mouse']
            },
            {
                name: 'Corsair HS80',
                description: 'Wireless gaming headset',
                price: 149,
                sku: 'HEAD-COR-HS80',
                category: getCategory('Headsets')._id,
                brand: getBrand('Corsair')._id,
                images: [],
                specifications: new Map([['Connection', 'Wireless'], ['Audio', '7.1']]),
                stock: 33,
                featured: true,
                tags: ['headset']
            },
            {
                name: 'HyperX Cloud III',
                description: 'Comfort gaming headset',
                price: 99,
                sku: 'HEAD-HX-C3',
                category: getCategory('Headsets')._id,
                brand: getBrand('Kingston')._id,
                images: [],
                specifications: new Map([['Type', 'Over-Ear'], ['Mic', 'Yes']]),
                stock: 58,
                featured: false,
                tags: ['headset']
            },
            {
                name: 'ASUS RTX 4070 Super',
                description: 'High-end graphics card',
                price: 599,
                sku: 'GPU-ASUS-4070S',
                category: getCategory('Graphics Cards')._id,
                brand: getBrand('ASUS')._id,
                images: [],
                specifications: new Map([['VRAM', '12GB'], ['RayTracing', 'Yes']]),
                stock: 14,
                featured: true,
                tags: ['gpu']
            },
            {
                name: 'MSI RTX 4060 Ti',
                description: 'Mid-range gaming GPU',
                price: 399,
                sku: 'GPU-MSI-4060TI',
                category: getCategory('Graphics Cards')._id,
                brand: getBrand('MSI')._id,
                images: [],
                specifications: new Map([['VRAM', '8GB'], ['DLSS', 'Yes']]),
                stock: 19,
                featured: false,
                tags: ['gpu']
            },
            {
                name: 'Gigabyte RX 7800 XT',
                description: 'AMD performance GPU',
                price: 499,
                sku: 'GPU-GIGA-7800',
                category: getCategory('Graphics Cards')._id,
                brand: getBrand('Gigabyte')._id,
                images: [],
                specifications: new Map([['VRAM', '16GB'], ['Type', 'GDDR6']]),
                stock: 17,
                featured: true,
                tags: ['gpu']
            },
            {
                name: 'Intel i5-14600K',
                description: '14th gen processor',
                price: 319,
                sku: 'CPU-INT-14600K',
                category: getCategory('Processors')._id,
                brand: getBrand('Intel')._id,
                images: [],
                specifications: new Map([['Cores', '14'], ['Socket', 'LGA1700']]),
                stock: 42,
                featured: true,
                tags: ['cpu']
            },
            {
                name: 'Intel i7-14700K',
                description: 'High performance CPU',
                price: 409,
                sku: 'CPU-INT-14700K',
                category: getCategory('Processors')._id,
                brand: getBrand('Intel')._id,
                images: [],
                specifications: new Map([['Cores', '20'], ['Boost', '5.6GHz']]),
                stock: 29,
                featured: false,
                tags: ['cpu']
            },
            {
                name: 'AMD Ryzen 7 7800X3D',
                description: 'Gaming focused CPU',
                price: 399,
                sku: 'CPU-AMD-7800X3D',
                category: getCategory('Processors')._id,
                brand: getBrand('AMD')._id,
                images: [],
                specifications: new Map([['Cores', '8'], ['Cache', '3D']]),
                stock: 23,
                featured: true,
                tags: ['cpu']
            },
            {
                name: 'AMD Ryzen 5 7600',
                description: 'Efficient 6-core CPU',
                price: 229,
                sku: 'CPU-AMD-7600',
                category: getCategory('Processors')._id,
                brand: getBrand('AMD')._id,
                images: [],
                specifications: new Map([['Cores', '6'], ['Socket', 'AM5']]),
                stock: 37,
                featured: false,
                tags: ['cpu']
            },
            {
                name: 'Corsair 16GB DDR5',
                description: 'DDR5 memory kit',
                price: 69,
                sku: 'RAM-COR-16D5',
                category: getCategory('RAM')._id,
                brand: getBrand('Corsair')._id,
                images: [],
                specifications: new Map([['Size', '16GB'], ['Speed', '5600']]),
                stock: 80,
                featured: false,
                tags: ['ram']
            },
            {
                name: 'G.Skill 32GB DDR5',
                description: 'High speed RAM',
                price: 129,
                sku: 'RAM-GSK-32',
                category: getCategory('RAM')._id,
                brand: getBrand('G.Skill')._id,
                images: [],
                specifications: new Map([['Size', '32GB'], ['Speed', '6400']]),
                stock: 46,
                featured: true,
                tags: ['ram']
            },
            {
                name: 'Samsung 980 500GB',
                description: 'NVMe SSD',
                price: 59,
                sku: 'SSD-SAM-980-500',
                category: getCategory('Storage')._id,
                brand: getBrand('Samsung')._id,
                images: [],
                specifications: new Map([['Type', 'NVMe'], ['Size', '500GB']]),
                stock: 73,
                featured: false,
                tags: ['ssd']
            },
            {
                name: 'WD Black SN850X',
                description: 'Fast NVMe SSD',
                price: 99,
                sku: 'SSD-WD-850X',
                category: getCategory('Storage')._id,
                brand: getBrand('Western Digital')._id,
                images: [],
                specifications: new Map([['Type', 'NVMe'], ['Size', '1TB']]),
                stock: 41,
                featured: true,
                tags: ['ssd']
            },
            {
                name: 'Seagate 2TB HDD',
                description: 'Desktop hard drive',
                price: 54,
                sku: 'HDD-SEAG-2T',
                category: getCategory('Storage')._id,
                brand: getBrand('Seagate')._id,
                images: [],
                specifications: new Map([['Type', 'HDD'], ['RPM', '7200']]),
                stock: 66,
                featured: false,
                tags: ['hdd']
            },
            {
                name: 'ASUS B760 Prime',
                description: 'Intel motherboard',
                price: 169,
                sku: 'MB-ASUS-B760',
                category: getCategory('Motherboards')._id,
                brand: getBrand('ASUS')._id,
                images: [],
                specifications: new Map([['Socket', 'LGA1700'], ['DDR5', 'Yes']]),
                stock: 28,
                featured: false,
                tags: ['motherboard']
            },
            {
                name: 'MSI X670E Carbon',
                description: 'AMD high-end motherboard',
                price: 479,
                sku: 'MB-MSI-X670E',
                category: getCategory('Motherboards')._id,
                brand: getBrand('MSI')._id,
                images: [],
                specifications: new Map([['Socket', 'AM5'], ['PCIe', '5.0']]),
                stock: 16,
                featured: true,
                tags: ['motherboard']
            },
            {
                name: 'Corsair 750W Gold',
                description: 'Modular PSU',
                price: 119,
                sku: 'PSU-COR-750G',
                category: getCategory('Power Supplies')._id,
                brand: getBrand('Corsair')._id,
                images: [],
                specifications: new Map([['Power', '750W'], ['Gold', 'Yes']]),
                stock: 47,
                featured: false,
                tags: ['psu']
            },
            {
                name: 'Seasonic 850W Gold',
                description: 'Premium PSU',
                price: 159,
                sku: 'PSU-SEA-850',
                category: getCategory('Power Supplies')._id,
                brand: getBrand('Seasonic')._id,
                images: [],
                specifications: new Map([['Power', '850W'], ['Modular', 'Yes']]),
                stock: 32,
                featured: true,
                tags: ['psu']
            },
            {
                name: 'NZXT H7 Flow',
                description: 'Airflow PC case',
                price: 129,
                sku: 'CASE-NZXT-H7',
                category: getCategory('Accessories')._id,
                brand: getBrand('NZXT')._id,
                images: [],
                specifications: new Map([['Type', 'ATX'], ['Fans', 'Included']]),
                stock: 35,
                featured: false,
                tags: ['case']
            }
        ];

        // Ensure every category has at least 2 products by adding simple sample products
        for (const categoryItem of categories) {
            const existingCount = productsData.filter(p => p.category.toString() === categoryItem._id.toString()).length;
            const need = Math.max(0, 2 - existingCount);
            for (let i = 0; i < need; i++) {
                // Pick a brand fallback (try to match a brand by category-like name, otherwise first brand)
                const fallbackBrand = brands.find(b => b.name && categoryItem.name && b.name.toLowerCase().includes(categoryItem.name.split(' ')[0].toLowerCase())) || brands[0];
                const sampleName = `${categoryItem.name} Sample ${i + 1}`;
                const sampleSku = `${categoryItem.name.replace(/\s+/g, '-').toUpperCase().slice(0, 8)}-SMP-${i + 1}`;

                productsData.push({
                    name: sampleName,
                    description: `Sample product for ${categoryItem.name}`,
                    price: Math.round((30 + Math.random() * 200) * 100) / 100,
                    sku: sampleSku,
                    category: categoryItem._id,
                    brand: fallbackBrand._id,
                    images: [],
                    specifications: new Map([['Sample', 'Yes']]),
                    stock: 25,
                    featured: false,
                    tags: [categoryItem.name.toLowerCase().replace(/\s+/g, '-')]
                });
            }
        }

        console.log('Generating translations for products (this might take a bit)...');
        // Ensure `slug` and translations exist for each product (unique suffix added)
        const productsWithSlugs = [];
        for (let idx = 0; idx < productsData.length; idx++) {
            const p = productsData[idx];
            // Get category and brand names for getProductImages
            const category = categories.find(c => c._id.toString() === p.category.toString());
            const brand = brands.find(b => b._id.toString() === p.brand.toString());
            const translations = await generateTranslations(p.name, p.description);

            productsWithSlugs.push({
                ...p,
                slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + (Date.now() + idx),
                images: getProductImages(category?.name, brand?.name, p.sku),
                translations
            });
        }

        const products = await Product.insertMany(productsWithSlugs);

        // Update category and brand product counts
        for (const category of categories) {
            const count = products.filter(p => p.category.toString() === category._id.toString()).length;
            category.productCount = count;
            await category.save();
        }

        for (const brand of brands) {
            const count = products.filter(p => p.brand.toString() === brand._id.toString()).length;
            brand.productCount = count;
            await brand.save();
        }

        console.log('\n✅ Database seeded successfully!');
        console.log(`📊 Created:`);
        console.log(`   - 1 admin user (email: admin@techstore.uz, password: admin123)`);
        console.log(`   - ${categories.length} categories`);
        console.log(`   - ${brands.length} brands`);
        console.log(`   - ${products.length} products`);
        console.log('\n🎉 You can now start the server with: npm run dev\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
