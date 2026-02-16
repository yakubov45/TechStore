# TechStore Deployment Guide

Ushbu loyihani internetga (production) chiqarish uchun quyidagi qadamlarni bajaring.

## 1. Environment Variables (.env)
Server katalogidagi `.env` faylini quyidagicha sozlang:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_random_secret
JWT_REFRESH_SECRET=your_another_random_secret
CLIENT_URL=https://techstore-uz-domain.com
STRIPE_SECRET_KEY=sk_live_...
```

## 2. Backend Deployment (Render.com)
- Github-ga yuklang.
- Render.com-da yangi "Web Service" yarating.
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: `server` (agar server alohida katalogda bo'lsa)

---

### Render uchun muhim o'zgaruvchilar:
Render "Environment" bo'limida quyidagilarni qo'shing:
- `NODE_ENV`: `production`
- `MONGODB_URI`: (Atlas-dan olingan link)
- `CLIENT_URL`: (Vercel-dan olingan frontend linki)
- `JWT_SECRET`: (Tasodifiy uzun qator)

## 3. Frontend Deployment (Vercel / Netlify)
- `client` katalogida:
- Build Command: `npm run build`
- Output Directory: `dist`

## 4. Database (MongoDB Atlas)
- MongoDB Atlas-da bepul klaster yarating.
- IP Access list-ga `0.0.0.0/0` qo'shing (yoki Render/Heroku IP-larini).
- Ulanish linkini `MONGODB_URI` ga qo'ying.

## 5. SSL & Security
Saytni `https` protokoli orqali ishlatish shart (Stripe uchun). Vercel va Render buni avtomatik ta'minlaydi.

---
**TechStore Support** - support@techstore.uz

## Security Hardening Checklist (Production)
Follow these steps before deploying to production to maximize security.

1) HTTPS / SSL
- Ensure your host (Render/Vercel/Cloudflare) provides TLS and certificates.
- Test with SSL Labs: https://www.ssllabs.com/ssltest/ (aim for A or A+)
- Enforce HTTPS and HSTS on the server (already enabled in `server/server.js`).

2) Security Headers
- We apply `helmet` and additional headers in `server/middleware/securityMiddleware.js`.
- Test with Mozilla Observatory: https://observatory.mozilla.org/

3) Cloudflare
- If using Cloudflare, enable WAF, Bot Protection, Rate Limiting, Always HTTPS, and set Security Level to High.

4) Environment Variables & Render
- Do NOT commit `.env` to git. Use `server/.env.example` as a template.
- Add secrets in Render/host environment settings only.

5) MongoDB Atlas
- Use IP access lists, strong passwords, least privilege DB user.

6) API protection
- Rate limiting is enabled for `/api` (see `server/server.js`).
- Use CORS allowlist via `config.clientUrl` and `ADDITIONAL_CLIENT_ORIGINS`.
- Validate inputs on endpoints (use `express-validator` where appropriate).

7) Dependency audit
- Run `npm audit` and `npm audit fix` before deploy.

8) Admin panel hiding
- Optionally set `ADMIN_PATH=/a9x2k-panel` in your environment to hide the default `/admin` path.

9) Automated scans
- Schedule regular scans: Sucuri, Mozilla Observatory, SSL Labs, OWASP ZAP.

Commands for quick checks:
```powershell
# Audit dependencies
cd server; npm audit; npm audit fix

# Run Mozilla Observatory / SSL Labs manually via their web UIs
```

