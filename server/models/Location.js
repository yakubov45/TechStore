import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Location name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Location address is required'],
        trim: true
    },
    mapUrl: {
        type: String,
        trim: true,
        default: ''
    },
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    workingHours: {
        type: String,
        trim: true,
        default: '09:00 - 20:00'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
