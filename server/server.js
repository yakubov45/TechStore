import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import securityHeaders from './middleware/securityMiddleware.js';

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
    if (process.env.NODE_ENV === 'production') {
        const proto = req.headers['x-forwarded-proto'] || req.protocol;
        if (proto && proto.toLowerCase() !== 'https') {
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
const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

// Allow additional origins via env (comma separated)
if (process.env.ADDITIONAL_CLIENT_ORIGINS) {
    process.env.ADDITIONAL_CLIENT_ORIGINS.split(',').forEach(o => {
        const origin = o.trim();
        if (origin && !allowedOrigins.includes(origin)) allowedOrigins.push(origin);
    });
}

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed === origin) return true;
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
            return callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
            return callback(new Error('CORS policy: This origin is not allowed - ' + origin));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

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

// Compression
app.use(compression());

// Logging
if (config.port !== 'production') {
    app.use(morgan('dev'));
}

// Static files - serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'TechStore API is running',
        timestamp: new Date().toISOString()
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
