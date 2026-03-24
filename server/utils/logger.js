import ActivityLog from '../models/ActivityLog.js';

/**
 * Logs an activity to the database.
 * 
 * @param {Object} req - The Express request object (to extract user and IP)
 * @param {String} action - The action performed (e.g., 'CREATE', 'UPDATE')
 * @param {String} targetModel - The name of the model affected (optional)
 * @param {mongoose.Types.ObjectId|String} targetId - The ID of the document affected (optional)
 * @param {Object} details - Additional information to store (optional)
 */
export const logActivity = async (req, action, targetModel = null, targetId = null, details = null) => {
    try {
        if (!req || !req.user || !req.user._id) {
            console.warn('Cannot log activity: user not found in request');
            return;
        }

        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];

        await ActivityLog.create({
            user: req.user._id,
            action,
            targetModel,
            targetId,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};
