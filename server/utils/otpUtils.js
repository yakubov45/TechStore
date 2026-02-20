import { sendMailGeneric, smtpAvailable } from './emailService.js';
import config from '../config/config.js';
import Twilio from 'twilio';

/**
 * Generate a random 6-digit OTP code
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Mock function to send SMS (Placeholder)
 * @param {string} phone - Recipient phone number
 * @param {string} code - OTP code
 */
export const sendSMSOTP = async (phone, code) => {
    // If Twilio is configured, use it to send SMS. Otherwise fall back to mock logging.
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM;

    if (sid && token && from) {
        try {
            const client = Twilio(sid, token);
            const message = await client.messages.create({
                body: `TechStore tasdiqlash kodi: ${code}`,
                from,
                to: phone
            });
            console.log(`[SMS] Sent OTP ${code} to ${phone} via Twilio (sid: ${message.sid})`);
            return true;
        } catch (err) {
            console.error('[SMS] Twilio send error:', err && err.message ? err.message : err);
            return false;
        }
    }

    console.log(`[SMS MOCK] Twilio not configured. OTP ${code} not sent to ${phone}`);
    return false;
};

/**
 * Send OTP via Email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} code - OTP code
 */
export const sendEmailOTP = async (email, name, code) => {
    const mailOptions = {
        from: config.smtp.from,
        to: email,
        subject: 'TechStore: Tasdiqlash kodi',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #00b8d9;">TechStore</h2>
                <p>Salom, ${name},</p>
                <p>Ro'yxatdan o'tishni yakunlash uchun tasdiqlash kodi:</p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #00b8d9;">
                    ${code}
                </div>
                <p>Ushbu kod 10 daqiqa davomida amal qiladi. Agar buni siz so'ramagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">TechStore - Tashkent, Uzbekistan</p>
            </div>
        `
    };

    // Provide a plain-text fallback to avoid clients showing wrong template
    const textBody = `TechStore\nHello ${name},\nYour verification code: ${code}\nThis code is valid for 10 minutes.`;

    // Use generic sender (SendGrid preferred, SMTP fallback)
    await sendMailGeneric({ from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject, html: mailOptions.html, text: textBody });
};
