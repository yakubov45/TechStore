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
