import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import securityHeaders from './middleware/securityMiddleware.js';
import { cookieMiddleware, extractTokensFromCookies } from './middleware/cookieMiddleware.js';
import { localizeResponse } from './middleware/localize.js';

// Config and DB
import config from './config/config.js';
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import currencyRoutes from './routes/currencyRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';
import { smtpAvailable } from './utils/emailService.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();

// If behind a proxy (Render, Heroku, Cloudflare), trust proxy headers
app.set('trust proxy', 1);

// Enforce HTTPS in production (when behind a proxy like Cloudflare/Render)
app.use((req, res, next) => {
    // Only enforce in production, but allow local development and OPTIONS preflight
    if (process.env.NODE_ENV === 'production') {
        // Do not redirect preflight requests
        if (req.method === 'OPTIONS') return next();

        const proto = (req.headers['x-forwarded-proto'] || req.protocol || '').toString();
        const host = (req.headers.host || '').toString();

        // Skip redirect for local hosts to avoid breaking local dev CORS when NODE_ENV=production
        const isLocalHost = host.includes('localhost') || host.startsWith('127.') || host.startsWith('::1');

        if (proto && proto.toLowerCase() !== 'https' && !isLocalHost) {
            // Redirect to HTTPS preserving host and url
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
    }
    next();
});

// Connect to database
connectDB();

// Security middleware
// apply centralized security headers (uses helmet internally)
securityHeaders(app);

// CORS configuration - allow configured client URL and common local dev ports
// If ALLOW_ALL_ORIGINS=true is set in the environment, enable permissive CORS
let allowedOrigins = [];
if (process.env.ALLOW_ALL_ORIGINS === 'true') {
    console.warn('⚠️ ALLOW_ALL_ORIGINS is enabled — CORS will accept any origin (temporary)');
    app.use(cors({ origin: true, credentials: true }));
} else {
    // Start with base allowed origins from config
    allowedOrigins = [
        config.clientUrl,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5174',
        'http://127.0.0.1:5173'
    ];

    // Allow additional origins via env (comma separated)
    if (process.env.ADDITIONAL_CLIENT_ORIGINS) {
        process.env.ADDITIONAL_CLIENT_ORIGINS.split(',').forEach(o => {
            const origin = o.trim();
            if (origin && !allowedOrigins.includes(origin)) allowedOrigins.push(origin);
        });
    }

    // Also allow specific known Render domains for TechStore
    // Frontend: techstore-kphy.onrender.com
    // Backend: techstore-u0w8.onrender.com
    const renderDomains = [
        'https://techstore-kphy.onrender.com',
        'https://techstore-u0w8.onrender.com',
        'https://techstore-o6y7.onrender.com'
    ];
    renderDomains.forEach(domain => {
        if (domain && !allowedOrigins.includes(domain)) {
            allowedOrigins.push(domain);
        }
    });

    // Always allow onrender.com domains for flexibility (Render subdomains) - use a more permissive regex
    const onrenderRegex = /^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/;

    // Filter out invalid entries and create final list
    allowedOrigins = allowedOrigins.filter(o => o && typeof o === 'string');

    console.log('🔧 CORS - Allowed origins:', allowedOrigins);

    app.use(cors({
        origin: function (origin, callback) {
            // Log the origin for debugging
            console.log('🔍 CORS check - Request origin:', origin);

            // allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin) {
                console.log('🔍 CORS - No origin, allowing (mobile/curl/Postman)');
                return callback(null, true);
            }

            // Check against allowed origins
            const isAllowed = allowedOrigins.some(allowed => {
                if (allowed === origin) return true;
                // Handle regex patterns for dynamic domains like *.onrender.com
                if (allowed instanceof RegExp) {
                    const result = allowed.test(origin);
                    console.log(`🔍 CORS - Regex ${allowed} test ${origin}: ${result}`);
                    return result;
                }
                // Check onrender regex
                if (typeof allowed === 'string' && onrenderRegex.test(origin)) {
                    console.log(`🔍 CORS - onrenderRegex matched for ${origin}`);
                    return true;
                }
                try {
                    // Handle cases where allowed origin might not have a protocol but request does, or trailing slashes
                    const allowedUrl = new URL(allowed);
                    const originUrl = new URL(origin);
                    return allowedUrl.origin === originUrl.origin;
                } catch (e) {
                    return false;
                }
            });

            if (isAllowed) {
                console.log('✅ CORS - Origin allowed:', origin);
                return callback(null, true);
            } else {
                console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
                console.warn('⚠️ Allowed origins were:', allowedOrigins);
                return callback(new Error('CORS policy: This origin is not allowed - ' + origin));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    }));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Admin UI protection: if ADMIN_PATH env var set, only allow access to that secret path
if (process.env.ADMIN_PATH) {
    app.use((req, res, next) => {
        if (req.path.startsWith('/admin') && req.path !== process.env.ADMIN_PATH) {
            // Hide default /admin routes from bots
            return res.status(404).send('Not found');
        }
        return next();
    });
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser - enable signed cookies with secret
app.use(cookieParser(process.env.COOKIE_SECRET || 'techstore-secret-key'));

// Initialize cookie middleware
cookieMiddleware(app);

// Extract tokens from cookies and add to headers
app.use(extractTokensFromCookies);

// Compression
app.use(compression());

// Logging
if (config.port !== 'production') {
    app.use(morgan('dev'));
}

// Static files - serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Localization middleware (intercepts res.json to translate data automatically)
app.use(localizeResponse);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Root Sitemap route
app.use('/sitemap.xml', sitemapRoutes);

// Health check
app.get('/api/health', (req, res) => {
    const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
    const hasBrevo = Boolean(process.env.BREVO_API_KEY);

    res.json({
        success: true,
        message: 'TechStore API is running',
        timestamp: new Date().toISOString(),
        emailProviders: {
            brevo: hasBrevo ? '✅ Available' : '❌ Not configured',
            sendgrid: hasSendGrid ? '✅ Available' : '❌ Not configured',
            smtp: smtpAvailable ? '✅ Available' : '❌ Not available'
        }
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Client URL: ${config.clientUrl}`);
    // Print allowed origins for CORS to help debugging
    try {
        console.log('🔒 Allowed CORS origins:', allowedOrigins);
        if (process.env.ADDITIONAL_CLIENT_ORIGINS) console.log('🔁 ADDITIONAL_CLIENT_ORIGINS:', process.env.ADDITIONAL_CLIENT_ORIGINS);
    } catch (e) {
        // ignore
    }
});

export default app;
