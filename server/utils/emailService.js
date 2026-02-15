import nodemailer from 'nodemailer';
import config from '../config/config.js';

// Create transporter singleton with pooling
let transporter;
let smtpAvailable = Boolean(config.smtp && config.smtp.host && config.smtp.port && config.smtp.user && config.smtp.pass);

if (smtpAvailable) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: Number(config.smtp.port),
    secure: Number(config.smtp.port) === 465,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP Connection Error:', error);
      smtpAvailable = false;
    } else {
      console.log('✅ SMTP Server is ready to take our messages');
    }
  });
} else {
  console.warn('⚠️ SMTP is not fully configured. Email sending is disabled.');
  // Provide a lightweight dummy transporter that throws descriptive error so callers can handle it
  transporter = {
    sendMail: async () => {
      const err = new Error('SMTP configuration missing or incomplete');
      err.code = 'SMTP_NOT_CONFIGURED';
      throw err;
    }
  };
}

export { transporter, smtpAvailable };

// Send email verification
export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${config.clientUrl}/verify-email/${token}`;

  const mailOptions = {
    from: config.smtp.from,
    to: email,
    subject: 'Verify Your TechStore Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a0a0f; color: #00b8d9; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #00b8d9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TechStore</h1>
          </div>
          <div class="content">
            <h2>Welcome to TechStore, ${name}!</h2>
            <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>TechStore - Tashkent, Uzbekistan</p>
            <p>Support: support@techstore.uz | Sales: sales@techstore.uz</p>
            <p>Phone: +998 90 123 45 67 | +998 91 765 43 21</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (!smtpAvailable) throw new Error('SMTP_NOT_CONFIGURED');
  await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${config.clientUrl}/reset-password/${token}`;

  const mailOptions = {
    from: config.smtp.from,
    to: email,
    subject: 'Reset Your TechStore Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a0a0f; color: #00b8d9; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #00b8d9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TechStore</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>TechStore - Tashkent, Uzbekistan</p>
            <p>Support: support@techstore.uz</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (!smtpAvailable) throw new Error('SMTP_NOT_CONFIGURED');
  await transporter.sendMail(mailOptions);
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, name, order) => {
  const mailOptions = {
    from: config.smtp.from,
    to: email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0a0a0f; color: #00b8d9; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-size: 20px; font-weight: bold; color: #00b8d9; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TechStore</h1>
          </div>
          <div class="content">
            <h2>Order Confirmed!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for your order! Your order has been received and is being processed.</p>
            <div class="order-details">
              <h3>Order #${order.orderNumber}</h3>
              ${order.items.map(item => `
                <div class="item">
                  <strong>${item.productSnapshot.name}</strong><br>
                  Quantity: ${item.quantity} × ${item.price.toLocaleString()} UZS
                </div>
              `).join('')}
              <div class="total">Total: ${order.total.toLocaleString()} UZS</div>
            </div>
            <p><strong>Delivery Address:</strong><br>
            ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            <p>We'll send you another email when your order ships.</p>
          </div>
          <div class="footer">
            <p>TechStore - Tashkent, Uzbekistan</p>
            <p>Support: support@techstore.uz | Phone: +998 90 123 45 67</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (!smtpAvailable) throw new Error('SMTP_NOT_CONFIGURED');
  await transporter.sendMail(mailOptions);
};

// Send newsletter email
export const sendNewsletterEmail = async (email, subject, content) => {
  const mailOptions = {
    from: config.smtp.from,
    to: email,
    subject: subject,
    html: content
  };

  if (!smtpAvailable) throw new Error('SMTP_NOT_CONFIGURED');
  await transporter.sendMail(mailOptions);
};
