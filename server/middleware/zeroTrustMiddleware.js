import ActivityLog from '../models/ActivityLog.js';

/**
 * Contextual zero-trust validation.
 * Checks if the request context (IP, user-agent) radically changes post-authentication.
 */
export const verifyContext = async (req, res, next) => {
    if (!req.user) return next(); // Skip if not authenticated

    try {
        const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];

        // Pull the last login for this user
        const lastLogin = await ActivityLog.findOne({
            user: req.user._id,
            action: 'LOGIN'
        }).sort({ createdAt: -1 }).select('ipAddress');

        // Context divergence check
        if (lastLogin && lastLogin.ipAddress && lastLogin.ipAddress !== clientIp) {
            // Zero Trust: The user authenticated successfully with a token, 
            // but the IP has changed mid-session. We record the anomaly.
            req.sessionAnomaly = true;
            console.warn(`[Zero Trust Alert] User ${req.user.email} session IP changed from ${lastLogin.ipAddress} to ${clientIp}.`);

            // Note: In an ultra-strict environment, we would return 403 and force re-auth:
            // return res.status(403).json({ success: false, message: 'Unusual contextual change detected. Please re-authenticate.' });
        }

        next();
    } catch (error) {
        console.error('Zero trust context verification failed', error);
        next();
    }
};
