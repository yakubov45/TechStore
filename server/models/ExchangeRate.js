import mongoose from 'mongoose';

const exchangeRateSchema = new mongoose.Schema({
    currency: {
        type: String,
        required: true,
        unique: true,
        default: 'USD'
    },
    rate: {
        type: Number,
        required: true,
        default: 12500 // Default UZS rate for 1 USD
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ExchangeRate', exchangeRateSchema);
