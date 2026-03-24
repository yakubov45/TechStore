import Location from '../models/Location.js';

// @desc    Get all active locations for public
// @route   GET /api/locations
// @access  Public
export const getLocations = async (req, res) => {
    try {
        const locations = await Location.find({ isActive: true }).sort('-createdAt');
        res.json({ success: true, count: locations.length, data: locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all locations (Admin)
// @route   GET /api/locations/admin
// @access  Private/Admin
export const getAdminLocations = async (req, res) => {
    try {
        const locations = await Location.find().sort('-createdAt');
        res.json({ success: true, count: locations.length, data: locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create location
// @route   POST /api/locations
// @access  Private/Admin
export const createLocation = async (req, res) => {
    try {
        const location = await Location.create(req.body);
        res.status(201).json({ success: true, data: location });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private/Admin
export const updateLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!location) {
            return res.status(404).json({ success: false, message: 'Location not found' });
        }

        res.json({ success: true, data: location });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
export const deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id);

        if (!location) {
            return res.status(404).json({ success: false, message: 'Location not found' });
        }

        res.json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
