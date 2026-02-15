import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration - allow configured client URL and localhost for local dev
const allowedOrigins = [config.clientUrl, 'http://localhost:5173'];
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
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            return callback(new Error('CORS policy: This origin is not allowed - ' + origin));
        }
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

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
