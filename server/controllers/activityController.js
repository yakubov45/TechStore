import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all activity logs
// @route   GET /api/activities
// @access  Private/Admin
export const getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;

        const query = {};

        // Filter by user if provided
        if (req.query.user) {
            query.user = req.query.user;
        }

        // Filter by action if provided
        if (req.query.action) {
            query.action = req.query.action;
        }

        const total = await ActivityLog.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const logs = await ActivityLog.find(query)
            .populate('user', 'name email role avatar')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: logs.length,
            pagination: {
                page,
                limit,
                total,
                totalPages
            },
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error fetching activity logs',
            error: error.message
        });
    }
};
