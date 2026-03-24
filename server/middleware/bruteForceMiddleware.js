import IPBlock from '../models/IPBlock.js';

export const checkIPBlock = async (req, res, next) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];

        const blockRecord = await IPBlock.findOne({ ipAddress: clientIp });

        if (blockRecord) {
            // Check if currently locked
            if (blockRecord.lockUntil && blockRecord.lockUntil > new Date()) {
                const remainingMinutes = Math.ceil((blockRecord.lockUntil - new Date()) / 60000);
                const lang = req.headers['accept-language']?.split(',')[0].substring(0, 2) || 'uz';
                const msgUz = `Juda ko'p xato urinishlar! Ipingiz vaqtincha bloklandi. Iltimos ${remainingMinutes} daqiqadan so'ng qayta urinib ko'ring.`;
                const msgRu = `Слишком много попыток! Ваш IP временно заблокирован. Пожалуйста, повторите через ${remainingMinutes} минут.`;
                const msgEn = `Too many failed attempts! Your IP is temporarily blocked. Please try again in ${remainingMinutes} minutes.`;
                const message = lang === 'uz' ? msgUz : (lang === 'ru' ? msgRu : msgEn);

                return res.status(429).json({
                    success: false,
                    message
                });
            }

            // If lock expired, we should technically reset or let the controller handle it.
            // We'll let the controller handle the reset on successful login.
        }

        next();
    } catch (error) {
        console.error('Brute force IP check failed', error);
        next(); // allow request to proceed if db fails to prevent total lockdown
    }
};
