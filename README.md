# بيت لي (Btlee) — Real Estate Platform

منصة عقارية تربط أصحاب العقارات بالمشترين والمستأجرين مباشرة بدون وسطاء وبدون عمولات.

## البنية

```
Btlee/
├── client/    Next.js 16 + Tailwind v4 + shadcn/ui + TypeScript
└── server/    Express.js 5 + MongoDB + TypeScript
```

## التشغيل

### Backend

```bash
cd server
cp .env.example .env
# Fill values: MONGODB_URI, JWT secrets, Cloudinary, SMTP
npm install
npm run seed   # creates the default admin
npm run dev    # http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.example .env
# Set NEXT_PUBLIC_API_URL
npm install
npm run dev    # http://localhost:3000
```

## الـ Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS v4, shadcn/ui, Framer Motion, TypeScript, next-intl |
| Backend | Express.js 5, MongoDB (Mongoose), TypeScript |
| Auth | JWT (Access + Refresh) |
| Images | Cloudinary |
| Maps | OpenStreetMap + Leaflet |
| Email | Nodemailer |
| Forms | React Hook Form + Zod |

## الـ Features

- بحث وفلترة متقدمة على العقارات
- نشر إعلانات بـ 15 fields + Validation كاملة
- دورة حياة الإعلان: pending → approved/rejected → sold/rented
- المفضلة (Wishlist)
- البحثات المحفوظة + إشعارات لما يطابق عقار جديد
- الإبلاغ عن إعلانات
- إشعارات داخل المنصة + Email
- لوحة تحكم Admin مع Dark/Light mode
- Bilingual: عربي (RTL) + إنجليزي (LTR)
- Onboarding Popup بعد التسجيل
- صفحة عامة لكل معلن

## الـ Architecture

**Feature-based** في الـ client والـ server. كل feature ليها folder خاص بيها فيها كل اللي يخصها.
