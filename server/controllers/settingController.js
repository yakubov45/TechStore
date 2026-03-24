import SiteSetting from '../models/SiteSetting.js';

export const getSettings = async (req, res) => {
    try {
        let setting = await SiteSetting.findOne();
        if (!setting) {
            setting = await SiteSetting.create({});
        }
        res.json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateFlashDeals = async (req, res) => {
    try {
        const { flashDealsActive, flashDealsEndTime } = req.body;
        let setting = await SiteSetting.findOne();
        if (!setting) {
            setting = await SiteSetting.create({});
        }
        
        setting.flashDealsActive = flashDealsActive;
        if (flashDealsEndTime) {
            setting.flashDealsEndTime = new Date(flashDealsEndTime);
        }
        await setting.save();
        
        res.json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
