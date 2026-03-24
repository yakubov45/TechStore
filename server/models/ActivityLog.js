import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'REGISTER', 'OTHER']
    },
    targetModel: {
        type: String,
        required: false
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    }
}, { timestamps: true });

// Prevent modification of logs
activityLogSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next(new Error('Activity logs cannot be modified'));
    }
    next();
});

// Create indexes for faster queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
