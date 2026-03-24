import mongoose from 'mongoose';

const ipBlockSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
        unique: true
    },
    failures: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    }
}, { timestamps: true });

// Auto expire documents after 24 hours of inactivity to prevent database bloat
ipBlockSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('IPBlock', ipBlockSchema);
