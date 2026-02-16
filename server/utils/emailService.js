import nodemailer from 'nodemailer';
import config from '../config/config.js';
import sgMailPkg from '@sendgrid/mail';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const sgMail = sgMailPkg;

// Providers availability
const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
const hasBrevo = Boolean(process.env.BREVO_API_KEY);

if (hasSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Brevo (Sendinblue) client if API key present
let brevoClient = null;
if (hasBrevo) {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
  } catch (err) {
    console.error('Brevo init error:', err && err.message ? err.message : err);
    brevoClient = null;
  }
}

// SMTP fallback configuration
let transporter = null;
let smtpAvailable = false;

const defaultTimeouts = {
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT) || 30000,
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 30000,
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT) || 45000
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
    console.log('💡 Suggestion: Set SENDGRID_API_KEY environment variable for reliable email delivery');
    transporter = null;
  }
};

// Initialize SMTP transport asynchronously
initSmtpTransport().catch(e => {
  console.error('SMTP init error:', e);
  smtpAvailable = false;
  transporter = null;
});

// Helper to normalize recipient(s)
const normalizeTo = (to) => {
  if (!to) return [];
  if (Array.isArray(to)) return to.map(t => (typeof t === 'string' ? { email: t } : t));
  if (typeof to === 'string') return [{ email: to }];
  if (typeof to === 'object' && to.email) return [to];
  return [];
};

// Generic mail sender: prefers Brevo (HTTP) -> SendGrid -> SMTP
const sendMailGeneric = async ({ to, subject, html, text, from }) => {
  const fromAddr = from || config.smtp.from || 'TechStore <support@techstore.uz>';

  // Try Brevo (Sendinblue) HTTP API first
  if (hasBrevo && brevoClient) {
    try {
      const sender = {};
      const m = fromAddr.match(/^(.*) <(.+)>$/);
      if (m) {
        sender.name = m[1];
        sender.email = m[2];
      } else {
        sender.name = 'TechStore';
        sender.email = fromAddr;
      }

      const sendSmtpEmail = {
        sender,
        to: normalizeTo(to),
        subject,
        htmlContent: html || text || '',
        textContent: text || html || ''
      };
      const resp = await brevoClient.sendTransacEmail(sendSmtpEmail);
      return resp;
    } catch (err) {
      console.error('Brevo send error:', err && (err.response?.body || err.message) ? (err.response?.body || err.message) : err);
      // fall through to next provider
    }
  }

  // SendGrid next
  if (hasSendGrid) {
    try {
      const msg = { to, from: fromAddr, subject, html, text };
      const res = await sgMail.send(msg);
      return res;
    } catch (err) {
      console.error('SendGrid send error:', err && err.message ? err.message : err);
      // fallthrough to SMTP
    }
  }

  // SMTP fallback
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
export { sendMailGeneric };

