import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// Generate access token
export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, config.jwtSecret, {
        expiresIn: config.jwtAccessExpire
    });
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, config.jwtRefreshSecret, {
        expiresIn: config.jwtRefreshExpire
    });
};

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.jwtRefreshSecret);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

// Generate email verification token
export const generateEmailToken = () => {
    return jwt.sign({ purpose: 'email-verification' }, config.jwtSecret, {
        expiresIn: '24h'
    });
};

// Generate password reset token
export const generateResetToken = () => {
    return jwt.sign({ purpose: 'password-reset' }, config.jwtSecret, {
        expiresIn: '1h'
    });
};
