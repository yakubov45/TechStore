import User from '../models/User.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { verifyContext } from './zeroTrustMiddleware.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Zero Trust: Strict Token Validation
        // If user document was updated (e.g., password changed, role changed) AFTER token is issued, revoke it!
        if (req.user.updatedAt) {
            const tokenIssuedAt = decoded.iat * 1000;
            // Add a 1s buffer for processing times
            if (req.user.updatedAt.getTime() > tokenIssuedAt + 1000) {
                return res.status(401).json({
                    success: false,
                    message: 'Session revoked due to security changes. Please log in again.'
                });
            }
        }

        // Zero Trust: IP and Device contextual verification
        await new Promise(resolve => verifyContext(req, res, resolve));

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed',
            error: error.message
        });
    }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = verifyAccessToken(token);
            req.user = await User.findById(decoded.id).select('-password');
        }

        next();
    } catch (error) {
        // Continue without user
        next();
    }
};
// Admin middleware
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as an admin'
        });
    }
};
