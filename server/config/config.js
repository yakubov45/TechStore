import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/techstore',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret',
    jwtAccessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.EMAIL_FROM || 'TechStore <support@techstore.uz>'
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    }
};
