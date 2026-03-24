import rateLimit from 'express-rate-limit';

// Global generic limiter is already in server.js, but we export specific ones here

// Strict limiter for authentication (Login/Register/OTP)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 10, // Max 10 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'O`ta ko`p urinishlar qilindi. Iltimos 15 daqiqadan so`ng qayta urinib ko`ring.' }
});

// Medium limiter for mutating API calls (POST/PUT/DELETE) to prevent spam
export const apiMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many operations requested. Please try again later.' }
});
