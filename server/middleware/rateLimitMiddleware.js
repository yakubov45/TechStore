import rateLimit from 'express-rate-limit';

// Global generic limiter is already in server.js, but we export specific ones here

// Strict limiter for authentication (Login/Register/OTP)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 10, // Max 10 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        const lang = req.headers['accept-language']?.split(',')[0].substring(0, 2) || 'uz';
        const msgUz = 'O`ta ko`p urinishlar qilindi. Iltimos 15 daqiqadan so`ng qayta urinib ko`ring.';
        const msgRu = 'Слишком много попыток. Пожалуйста, повторите через 15 минут.';
        const msgEn = 'Too many attempts. Please try again after 15 minutes.';
        const message = lang === 'uz' ? msgUz : (lang === 'ru' ? msgRu : msgEn);
        res.status(options.statusCode).json({ success: false, message });
    }
});

// Medium limiter for mutating API calls (POST/PUT/DELETE) to prevent spam
export const apiMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        const lang = req.headers['accept-language']?.split(',')[0].substring(0, 2) || 'uz';
        const msgUz = 'Juda ko`p operatsiyalar so`raldi. Iltimos keyinroq qayta urinib ko`ring.';
        const msgRu = 'Слишком много запросов. Пожалуйста, повторите попытку позже.';
        const msgEn = 'Too many operations requested. Please try again later.';
        const message = lang === 'uz' ? msgUz : (lang === 'ru' ? msgRu : msgEn);
        res.status(options.statusCode).json({ success: false, message });
    }
});
