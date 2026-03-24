import SiteSetting from '../models/SiteSetting.js';

export const getSettings = async (req, res) => {
    try {
        let setting = await SiteSetting.findOne();
        if (!setting) {
            setting = await SiteSetting.create({});
        }

        // Auto-expire flash deals if end time has passed
        if (setting.flashDealsActive && setting.flashDealsEndTime) {
            if (new Date() >= new Date(setting.flashDealsEndTime)) {
                setting.flashDealsActive = false;
                setting.flashDealsEndTime = null;
                await setting.save();
            }
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

        setting.flashDealsActive = flashDealsActive === true || flashDealsActive === 'true';

        if (flashDealsEndTime) {
            setting.flashDealsEndTime = new Date(flashDealsEndTime);
        } else if (!setting.flashDealsActive) {
            // Clear end time when disabling
            setting.flashDealsEndTime = null;
        }

        await setting.save();
        res.json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
