# 🚀 TechStore - Premium E-Commerce & ERP Platform

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/Frontend-React.js_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Nodejs](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Security](https://img.shields.io/badge/Security-Zero_Trust-red?style=for-the-badge&logo=security)

**TechStore** is a state-of-the-art, enterprise-grade e-commerce platform built with the MERN stack. It features an advanced Zero-Trust security architecture, background AI-driven auto-translation, dynamic multi-currency systems, and role-based access control (RBAC) with dedicated panels for Admins, Assistants, Deliveries, and Customers.

## ✨ Kalit Imkoniyatlar (Key Features)

### 🛡️ Kiber-Xavfsizlik (Zero-Trust Security)
- **Progressiv Brute-Force Himoyasi:** IP manzil va akkaunt darajasida mudofaa (3 xato = 1 min blok; 5 xato = 15 min blok; 10 xato = Akkaunt 24 soatga muzlatiladi + Email ogohlantirish).
- **Qat'iy Rate Limiter:** API mutatsiyalariga (POST/PUT/DELETE) qarshi qat'iy DDOS himoyasi.
- **Payload Sanitization:** Barcha kiritilgan ma'lumotlar XSS va NoSQL Injection xavflariga qarshi tozalanadi.
- **Xavfsiz JWT Sessiyalar:** Kriptografik HTTP-only cookie'lar va kontekstual IP o'zgarishini nazorat qiluvchi audit mexanizmlari.

### 🌍 Avtomatlashtirilgan Multi-Lingval Tizim
- **Dinamik Avto-Tarjimon:** MongoDB `pre-save` hook'lari orqali Ingliz/O'zbek tilida kiritilgan ma'lumotlar (Mahsulotlar, Kategoriyalar) avtomatik tarzda Google Translate API yordamida boshqa tillarga (Rus, Ingliz) o'girilib bazaga saqlanadi. Frontendda kechikish bo'lmaydi (Zero-latency).
- **Admin Backfill API:** Ilgari qo'shilgan eski mahsulotlarni ommaviy tarjima qilish moduli.
- **Multi-Valyuta:** UZS va USD formatlari o'rtasida real vaqt kursida sinxron ishlash.

### 👥 Rolga Asoslangan Boshqaruv (RBAC)
- **Super Admin:** Dashboard analitika, POS (Kassa) skanneri orqali sotuv qilish, Bannerlar, Xodimlar rollari va xaritalarni tizim ichidan boshqarish.
- **Assistant:** Inventar (zaxira) qoldig'ini tekshirish va buyurtmalarni tasdiqlash uchun mo'ljallangan yordamchi oyna.
- **Delivery (Kuryer):** Kuryerlarga GPS manzil beruvchi tizim va xaridorni qabulida QR skaner orqali yetkazib berish tranzaksiyasini yopish.
- **Mijozlar:** Profil, xaridlar tarixi, sharhlar yozish, interaktiv savatcha va sevimlilar. 

### 🎨 Zamonaviy UI/UX (Framer Motion)
- **Framer Motion Animatsiyalari:** Barcha sahifalarga `AnimatePresence` orqali mantiqiy silliq "fade and slide" o'tishlari berilgan.
- **Neon Top Loader:** Marshrutlar almashganda tepadagi vizual chiziqli progress qismi.
- **Debounced Live Search:** Qidiruvga harf kiritilishi bilan soniya ulushida avto-takliflar (Sticky Search) chiqarish tizimi.
- **Dark/Light Mode:** Interfeys kechasi yoki mijoz tanloviga qarab qorong'u rejimga o'ta oladi.

## 🛠 Texnologiyalar
* **Frontend:** React.js, Vite, Zustand (State Management), Tailwind CSS, Framer Motion, React-i18next.
* **Backend:** Node.js, Express.js, JWT, Bcrypt.
* **Ma'lumotlar Bazasi:** MongoDB (Mongoose).
* **Aloqa & Xizmatlar:** SendGrid/Brevo (Email), Google Translate API (google-translate-api-x), HTML5-QRCode.

## 🚀 Loyihani Ishga Tushirish (Installation)

### 1-qadam: Repozitoriyni yuklab olish va paketlarni o'rnatish
```bash
# Backend uchun
cd server
npm install

# Frontend uchun
cd ../client
npm install
```

### 2-qadam: Muhit O'zgaruvchilari (Environment Variables)
`server` jildida `.env` fayl yarating:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/techstore
JWT_SECRET=maxfiy_kalit
COOKIE_SECRET=cookie_maxfiy_kalit
CLIENT_URL=http://localhost:5173
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 3-qadam: Dasturni yuritish
Bir vaqtning o'zida ikkita terminalni oching:

**Terminal 1 (Backend):**
```bash
cd server
npm start
# Server localhost:5000 da ishga tushadi
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# React sayt localhost:5173 da ishga tushadi
```

## 📂 Loyiha Strukturasi (Folder Structure)
```
TechStore/
├── client/                 # React.js Frontend
│   ├── src/
│   │   ├── components/     # UI Qismlari (Loaderlar, Buttonlar, Layout)
│   │   ├── pages/          # Asosiy Sahifalar (Home, Admin, Profile)
│   │   ├── store/          # Zustand State taminoti
│   │   ├── locales/        # i18n statik tarjima lug'atlari
│   │   └── App.jsx         # Marshrutlar (Routes & Animations)
├── server/                 # Node.js Backend
│   ├── controllers/        # Mantiqiy kontrollerlar (auth, products)
│   ├── models/             # Mongoose Schemalari (Pre-save hook'lari bilan)
│   ├── routes/             # API Yo'llari
│   ├── middleware/         # Xavfsizlik, JWT tekshiruv va Rate limiterlar
│   ├── utils/              # AvtoTarjimon, Email servislari
│   └── server.js           # Express App Initsializatsiyasi
└── README.md
```

## 📜 Muallif va Litsenziya
Ushbu loyiha yakuniy (startup) tijorat stendartlari asosida ishlab chiqildi.
Litsenziya: MIT License
