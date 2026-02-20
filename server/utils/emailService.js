import nodemailer from 'nodemailer';
import config from '../config/config.js';
import sgMailPkg from '@sendgrid/mail';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const sgMail = sgMailPkg;

// Providers availability
const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
const hasBrevo = Boolean(process.env.BREVO_API_KEY);

console.log('📧 Email providers check:');
console.log(`  • SendGrid available: ${hasSendGrid ? '✅' : '❌'}`);
console.log(`  • Brevo available: ${hasBrevo ? '✅' : '❌'}`);

if (hasSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('  ✓ SendGrid API key configured');
}

if (!process.env.EMAIL_FROM) {
  console.log('  ⚠️ No EMAIL_FROM configured - default sender will be used. If using SendGrid, ensure the sender email/domain is verified.');
}

// Initialize Brevo (Sendinblue) client if API key present
let brevoClient = null;
if (hasBrevo) {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
    console.log('  ✓ Brevo API client initialized');
  } catch (err) {
    console.error('  ❌ Brevo init error:', err && err.message ? err.message : err);
    brevoClient = null;
  }
} else {
  console.log('  ⚠️ No BREVO_API_KEY environment variable found');
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

// Log email transport priority
setTimeout(() => {
  console.log('📧 Email transport priority (first available will be used):');
  if (hasBrevo && brevoClient) console.log('  1️⃣ Brevo HTTP API (preferred)');
  else console.log('  1️⃣ Brevo HTTP API (not available)');
  if (hasSendGrid) console.log('  2️⃣ SendGrid');
  else console.log('  2️⃣ SendGrid (not available)');
  if (smtpAvailable) console.log('  3️⃣ SMTP fallback');
  else console.log('  3️⃣ SMTP fallback (not available)');
  
  const hasAnyTransport = (hasBrevo && brevoClient) || hasSendGrid || smtpAvailable;
  if (!hasAnyTransport) {
    console.error('❌ WARNING: No email transport configured! Users cannot receive OTP/reset emails.');
    console.log('   Solution: Set BREVO_API_KEY or SENDGRID_API_KEY environment variable on Render.');
  }
}, 1000);

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

  // Log basic envelope for easier debugging of template mismatches
  try {
    const toLog = Array.isArray(to) ? to.map(t => (typeof t === 'string' ? t : t.email)).join(',') : (typeof to === 'string' ? to : (to?.email || 'unknown'));
    console.log(`📤 Preparing to send email - Subject: "${subject}" To: ${toLog} From: ${fromAddr}`);
    if (html) console.log(`📄 HTML preview: ${String(html).slice(0,120).replace(/\s+/g,' ')}${String(html).length>120?"...":""}`);
  } catch (e) {
    // ignore logging errors
  }

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
      // Normalize SendGrid message shape (supports string or object for `to`)
      const msg = { to, from: fromAddr, subject, html, text };
      const res = await sgMail.send(msg);
      return res;
    } catch (err) {
      // Better debug output: SendGrid errors often include a response.body with details
      const details = err?.response?.body || err?.message || err;
      console.error('SendGrid send error:', details);
      if (err?.response?.statusCode === 403 || (err?.code && Number(err.code) === 403)) {
        console.error('  → SendGrid returned 403 Forbidden. Common causes: invalid/revoked API key, API key missing "Mail Send" permission, or unverified sender email/domain.');
        console.error('    Suggestion: verify SENDGRID_API_KEY, and set `EMAIL_FROM` to a verified sender or add a verified sending domain in SendGrid.');
      }
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
  const text = `Order ${order.orderNumber}\n${order.items.map(i=>`${i.productSnapshot?.name||i.name} x${i.quantity} - ${i.price}`).join('\n')}\nTotal: ${order.total}`;
  return sendMailGeneric({ to: email, subject: `Order Confirmation - ${order.orderNumber}`, html: body, text });
};

export const sendNewsletterEmail = async (email, subject, content) => {
  return sendMailGeneric({ to: email, subject, html: content });
};

export { smtpAvailable };
export { sendMailGeneric };

