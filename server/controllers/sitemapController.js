import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import config from '../config/config.js';

// Cache sitemap for 24 hours to reduce DB load
let sitemapCache;
let sitemapCacheTime;

export const generateSitemap = asyncHandler(async (req, res) => {
    // Return cached sitemap if within 24 hours
    if (sitemapCache && sitemapCacheTime && (Date.now() - sitemapCacheTime < 24 * 60 * 60 * 1000)) {
        res.header('Content-Type', 'application/xml');
        return res.send(sitemapCache);
    }

    try {
        const baseUrl = config.clientUrl || process.env.CLIENT_URL || 'http://localhost:5173';
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        const addUrl = (path, priority = 0.5, changefreq = 'monthly', lastmod = new Date()) => {
            const dateStr = new Date(lastmod).toISOString();
            xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>\n`;
        };

        // Static Pages
        addUrl('/', 1.0, 'daily');
        addUrl('/products', 0.9, 'daily');
        addUrl('/about', 0.5, 'monthly');
        addUrl('/contact', 0.5, 'monthly');
        addUrl('/faq', 0.5, 'monthly');

        // Dynamic Product routes
        const products = await Product.find({ isActive: true }).select('slug updatedAt');
        products.forEach(product => {
            addUrl(`/product/${product.slug}`, 0.8, 'weekly', product.updatedAt);
        });

        // Dynamic Category routes
        const categories = await Category.find({ isActive: true }).select('slug updatedAt');
        categories.forEach(category => {
            addUrl(`/category/${category.slug}`, 0.7, 'weekly', category.updatedAt);
        });

        // Dynamic Brand routes
        const brands = await Brand.find({ isActive: true }).select('slug updatedAt');
        brands.forEach(brand => {
            addUrl(`/brand/${brand.slug}`, 0.7, 'weekly', brand.updatedAt);
        });

        xml += `</urlset>`;

        // Cache the result
        sitemapCache = xml;
        sitemapCacheTime = Date.now();

        // Send response
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).json({ error: 'Sitemap generation failed' });
    }
});
