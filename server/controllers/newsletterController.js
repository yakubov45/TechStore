import Newsletter from '../models/Newsletter.js';
import { sendNewsletterEmail } from '../utils/emailService.js';
import User from '../models/User.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You are already subscribed to our newsletter'
            });
        }

        await Newsletter.create({ email });

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Send newsletter to all subscribers (Admin)
// @route   POST /api/newsletter/send
// @access  Private/Admin
export const sendBulkNewsletter = async (req, res) => {
    try {
        const { subject, content } = req.body;

        if (!subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Subject and content are required'
            });
        }

        const subscribers = await Newsletter.find({ isActive: true });
        const emails = subscribers.map(s => s.email);

        // Also include registered users who might not be in the newsletter table yet
        // (Optional design choice, but let's stick to subscribers for now)

        for (const email of emails) {
            try {
                await sendNewsletterEmail(email, subject, content);
            } catch (err) {
                console.error(`Failed to send newsletter to ${email}:`, err);
            }
        }

        res.json({
            success: true,
            message: `Newsletter sent to ${emails.length} subscribers`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
