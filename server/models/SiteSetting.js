import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema({
    flashDealsActive: {
        type: Boolean,
        default: false
    },
    flashDealsEndTime: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);
export default SiteSetting;
