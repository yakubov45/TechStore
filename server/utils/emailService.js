import nodemailer from 'nodemailer';
import config from '../config/config.js';
import sgMailPkg from '@sendgrid/mail';

const sgMail = sgMailPkg;

// Initialize SendGrid if API key present
const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
if (hasSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// SMTP fallback configuration
let transporter = null;
let smtpAvailable = false;

const defaultTimeouts = {
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT) || 10000,
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 10000,
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT) || 15000
};

const createTransport = (opts) => {
  return nodemailer.createTransport({
    host: opts.host,
    port: Number(opts.port),
    secure: Boolean(opts.secure),
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user: opts.user,
      pass: opts.pass
    },
    requireTLS: opts.requireTLS || false,
    tls: opts.tls || { rejectUnauthorized: false },
    logger: !!process.env.SMTP_DEBUG,
    debug: !!process.env.SMTP_DEBUG,
    ...defaultTimeouts
  });
};

const initSmtpTransport = async () => {
  const smtpCfg = config.smtp;
  if (!smtpCfg || !smtpCfg.host || !smtpCfg.port || !smtpCfg.user || !smtpCfg.pass) {
    smtpAvailable = false;
    return;
  }

  const baseOpts = {
    host: smtpCfg.host,
    port: Number(smtpCfg.port),
    secure: Number(smtpCfg.port) === 465,
    user: smtpCfg.user,
    pass: smtpCfg.pass
  };

  try {
    transporter = createTransport(baseOpts);
    await transporter.verify();
    smtpAvailable = true;
    console.log('✅ SMTP Server is ready (primary)');
    return;
  } catch (err) {
    console.warn('⚠️ SMTP primary failed:', err && err.message ? err.message : err);
  }

  // Fallback to common 587 STARTTLS
  try {
    const fallback = { ...baseOpts, port: 587, secure: false, requireTLS: true };
    transporter = createTransport(fallback);
    await transporter.verify();
    smtpAvailable = true;
    console.log('✅ SMTP Server is ready (fallback 587 STARTTLS)');
    return;
  } catch (err) {
    smtpAvailable = false;
    console.error('❌ SMTP fallback failed:', err && err.message ? err.message : err);
    transporter = null;
  }
};

// Initialize SMTP transport asynchronously
initSmtpTransport().catch(e => {
  console.error('SMTP init error:', e);
  smtpAvailable = false;
  transporter = null;
});

// Generic mail sender: prefers SendGrid, falls back to SMTP
const sendMailGeneric = async ({ to, subject, html, text, from }) => {
  const fromAddr = from || config.smtp.from || 'TechStore <support@techstore.uz>';

  if (hasSendGrid) {
    try {
      const msg = {
        to,
        from: fromAddr,
        subject,
        html,
        text
      };
      const res = await sgMail.send(msg);
      return res;
    } catch (err) {
      console.error('SendGrid send error:', err && err.message ? err.message : err);
      // fallthrough to SMTP if available
    }
  }

  if (smtpAvailable && transporter) {
    try {
      return await transporter.sendMail({ from: fromAddr, to, subject, html, text });
    } catch (err) {
      console.error('SMTP send error:', err && err.message ? err.message : err);
      throw err;
    }
  }

  const e = new Error('No email transport available');
  e.code = 'NO_EMAIL_TRANSPORT';
  throw e;
};

export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${config.clientUrl}/verify-email/${token}`;
  const html = `...`;
  // Keep HTML concise here or reuse a template module; for brevity use a simple template
  const body = `<!doctype html><html><body><h2>Hello ${name}</h2><p>Please verify: <a href="${verificationUrl}">Verify Email</a></p></body></html>`;
  return sendMailGeneric({ to: email, subject: 'Verify Your TechStore Email', html: body });
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${config.clientUrl}/reset-password/${token}`;
  const body = `<!doctype html><html><body><h2>Password reset</h2><p>Hi ${name}, click <a href="${resetUrl}">here</a> to reset.</p></body></html>`;
  return sendMailGeneric({ to: email, subject: 'Reset Your TechStore Password', html: body });
};

export const sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsHtml = order.items.map(item => `<div><strong>${item.productSnapshot?.name || item.name}</strong> x${item.quantity} - ${item.price}</div>`).join('');
  const body = `<!doctype html><html><body><h2>Order ${order.orderNumber}</h2>${itemsHtml}<p>Total: ${order.total}</p></body></html>`;
  return sendMailGeneric({ to: email, subject: `Order Confirmation - ${order.orderNumber}`, html: body });
};

export const sendNewsletterEmail = async (email, subject, content) => {
  return sendMailGeneric({ to: email, subject, html: content });
};

export { smtpAvailable };


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
