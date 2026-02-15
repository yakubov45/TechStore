import ExchangeRate from '../models/ExchangeRate.js';

// Get current exchange rate
export const getExchangeRate = async (req, res) => {
    try {
        let rate = await ExchangeRate.findOne({ currency: 'USD' });

        if (!rate) {
            // Create default if not exists
            rate = await ExchangeRate.create({
                currency: 'USD',
                rate: 12500
            });
        }

        res.json({
            success: true,
            data: rate
        });
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update exchange rate (Admin only)
export const updateExchangeRate = async (req, res) => {
    try {
        const { rate } = req.body;

        if (!rate || isNaN(rate)) {
            return res.status(400).json({ success: false, message: 'Invalid rate provided' });
        }

        const updated = await ExchangeRate.findOneAndUpdate(
            { currency: 'USD' },
            {
                rate,
                lastUpdated: Date.now()
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Exchange rate updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error updating exchange rate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
