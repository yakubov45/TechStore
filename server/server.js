import express from 'express';
import cors from 'cors';
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

const app = express();

// ================= PROXY =================
app.set('trust proxy', 1);

// ================= HTTPS REDIRECT =================
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (req.method === 'OPTIONS') return next();

        const proto = req.headers['x-forwarded-proto'];
        const host = req.headers.host || '';

        const isLocal =
            host.includes('localhost') ||
            host.startsWith('127.') ||
            host.startsWith('::1');

        if (proto && proto !== 'https' && !isLocal) {
            return res.redirect(301, `https://${host}${req.url}`);
        }
    }
    next();
});

// ================= DB =================
connectDB();

// ================= SECURITY =================
securityHeaders(app);

// ================= CORS =================

let allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

// ENV qo‘shimcha originlar
if (process.env.ADDITIONAL_CLIENT_ORIGINS) {
    process.env.ADDITIONAL_CLIENT_ORIGINS.split(',').forEach(o => {
        const origin = o.trim();
        if (origin && !allowedOrigins.includes(origin)) {
            allowedOrigins.push(origin);
        }
    });
}

// Render subdomainlar
allowedOrigins.push(/^https:\/\/.*\.onrender\.com$/);

if (process.env.ALLOW_ALL_ORIGINS === 'true') {
    console.warn('⚠️ CORS: allow all origins enabled');
    app.use(cors({ origin: true, credentials: true }));
} else {
    app.use(cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            const ok = allowedOrigins.some(allowed => {
                if (allowed instanceof RegExp) {
                    return allowed.test(origin);
                }
                return allowed === origin;
            });

            if (ok) return callback(null, true);

            console.warn('❌ CORS blocked:', origin);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin'
        ]
    }));
}

// Preflight fix
app.options('*', cors());

console.log('🔒 Allowed CORS origins:', allowedOrigins);

// ================= RATE LIMIT =================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: 'Too many requests, try again later.'
});
app.use('/api', limiter);

// ================= ADMIN PATH PROTECT =================
if (process.env.ADMIN_PATH) {
    app.use((req, res, next) => {
        if (req.path.startsWith('/admin') && req.path !== process.env.ADMIN_PATH) {
            return res.status(404).send('Not found');
        }
        next();
    });
}

// ================= BODY PARSER =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= COMPRESSION =================
app.use(compression());

// ================= LOGGING =================
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ================= STATIC =================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= ROUTES =================
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

// ================= HEALTH =================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API running',
        time: new Date().toISOString()
    });
});

// ================= ERRORS =================
app.use(notFound);
app.use(errorHandler);

// ================= START =================
const PORT = config.port || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Client URL: ${config.clientUrl}`);
    console.log(`📦 ENV: ${process.env.NODE_ENV}`);
});

export default app;
