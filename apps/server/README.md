# Bt Lee — Server (Backend API)

Express.js + MongoDB + TypeScript backend for the Bt Lee real estate platform.

## Setup

```bash
npm install
cp .env.example .env
# Fill in .env with real values
npm run dev
```

Server runs on `http://localhost:5000` by default.

## Scripts

- `npm run dev` — start in development with hot reload (tsx watch)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled production build
- `npm run type-check` — type-check without emitting
- `npm run seed` — seed database with sample data

## Architecture

Feature-based modular structure. Each feature owns its model, routes, controller, service, and validators.

```
src/
├── config/        — env validation, DB connection, cloudinary
├── shared/        — errors, middlewares, utils, types
├── modules/       — feature modules (auth, properties, wishlist, ...)
├── routes/        — central route aggregator
├── jobs/          — scheduled tasks (e.g. expiring listings)
├── seeds/         — seed scripts
├── app.ts         — express app factory
└── server.ts      — entry point
```

## API Endpoints

All routes are prefixed with `/api`. Example base URL in production:
`https://api.btlee-eg.com/api`.

**Authentication** — access + refresh JWTs are stored in `httpOnly` cookies that the
server sets on login/register, so the browser sends them automatically. Send requests
with credentials included. When an access token expires, call `POST /auth/refresh` to
renew it (the client does this automatically on a `401`).

**Response shape**

```jsonc
// success
{ "status": "success", "data": { /* ... */ } }
// error
{ "status": "error", "message": "Human-readable reason" }
```

**Access legend** — 🔓 public · 🔒 logged-in user · 👑 admin

**Rate limits** — 300 requests / 15 min per IP globally; 20 / 15 min on `/auth/*`;
10 / 15 min on `/admin/auth/login`.

### Health

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| GET | `/health` | 🔓 | Liveness check. Returns `{ status: "ok", timestamp }`. |

### Auth — `/auth`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| POST | `/auth/register` | 🔓 | Create a new account (name, email, password) and sign in. |
| POST | `/auth/login` | 🔓 | Sign in with email + password; sets the auth cookies. |
| POST | `/auth/refresh` | 🔓 | Issue a fresh access token from the refresh cookie. |
| POST | `/auth/logout` | 🔓 | Clear the auth cookies (sign out). |
| POST | `/auth/forgot-password` | 🔓 | Email a password-reset token to the user. |
| POST | `/auth/reset-password` | 🔓 | Set a new password using the emailed token. |

### Users — `/users`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| GET | `/users/me` | 🔒 | Get the signed-in user's profile. |
| PATCH | `/users/me` | 🔒 | Update the signed-in user's profile (name, phone, …). |
| POST | `/users/me/change-password` | 🔒 | Change the signed-in user's password. |
| POST | `/users/me/onboarding` | 🔒 | Save the user's goal (buy / rent / sell / browse) after signup. |
| GET | `/users/:userId/public` | 🔓 | Public profile of an owner (for the owner page). |

### Properties — `/properties`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| GET | `/properties` | 🔓 | List / search / filter approved listings. Query: `search, type, listingType, category, governorate, minPrice, maxPrice, minBedrooms, minArea, page, limit`. |
| GET | `/properties/featured` | 🔓 | Admin-curated featured listings (home page). |
| GET | `/properties/latest` | 🔓 | Newest approved listings (home page). |
| GET | `/properties/suggestions` | 🔓 | Autocomplete suggestions for the search bar. |
| GET | `/properties/mine` | 🔒 | The current user's own listings (any status). |
| GET | `/properties/:id` | 🔓 | One listing's full details (personalized for a signed-in viewer). |
| GET | `/properties/:id/similar` | 🔓 | Listings similar to the given one. |
| GET | `/properties/by-owner/:ownerId` | 🔓 | Public listings belonging to one owner. |
| POST | `/properties` | 🔒 | Create a listing (starts as `pending` until an admin approves it). |
| PATCH | `/properties/:id` | 🔒 | Update one of your own listings. |
| DELETE | `/properties/:id` | 🔒 | Delete one of your own listings. |
| POST | `/properties/:id/mark` | 🔒 | Mark your listing as sold or rented. |

### Wishlist — `/wishlist`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| GET | `/wishlist` | 🔒 | Get the user's saved properties. |
| POST | `/wishlist/:propertyId` | 🔒 | Add a property to the wishlist. |
| DELETE | `/wishlist/:propertyId` | 🔒 | Remove a property from the wishlist. |
| GET | `/wishlist/:propertyId/check` | 🔒 | Check whether a property is in the wishlist. |

### Notifications — `/notifications`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| GET | `/notifications` | 🔒 | List the user's notifications. |
| GET | `/notifications/unread-count` | 🔒 | Unread count (for the navbar bell badge). |
| POST | `/notifications/:id/read` | 🔒 | Mark one notification as read. |
| POST | `/notifications/read-all` | 🔒 | Mark all notifications as read. |

### Saved searches — `/saved-searches`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| GET | `/saved-searches` | 🔒 | List the user's saved search filters. |
| POST | `/saved-searches` | 🔒 | Save a search (filters + name). New matching listings notify the user. |
| DELETE | `/saved-searches/:id` | 🔒 | Delete a saved search. |

### Reports — `/reports`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| POST | `/reports` | 🔒 | Report a property (`propertyId`, `reason`, optional `details`) for admin review. |

### Uploads — `/uploads`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| POST | `/uploads/images` | 🔒 | Upload up to 15 property images to Cloudinary (multipart field `images`, ≤ 5 MB each). |
| DELETE | `/uploads/images` | 🔒 | Delete an uploaded image by its `publicId`. |

### Admin auth — `/admin/auth`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| POST | `/admin/auth/login` | 🔓 | Admin sign-in (separate from user auth); sets admin cookies. |
| POST | `/admin/auth/refresh` | 🔓 | Renew the admin access token from the admin refresh cookie. |
| POST | `/admin/auth/logout` | 🔓 | Clear the admin cookies. |

### Admin — `/admin`

| Method | Endpoint | Access | Description |
|--------|----------|:------:|-------------|
| GET | `/admin/dashboard` | 👑 | Platform stats (property / user / report counts). |
| GET | `/admin/properties` | 👑 | List all properties, filterable by `status` (pending, approved, …). |
| POST | `/admin/properties/:id/review` | 👑 | Approve or reject a pending listing (with a reason). |
| POST | `/admin/properties/:id/featured` | 👑 | Add / remove a listing from the featured set. |
| DELETE | `/admin/properties/:id` | 👑 | Permanently delete any listing. |
| GET | `/admin/users` | 👑 | List all registered users. |
| POST | `/admin/users/:userId/block` | 👑 | Block or unblock a user. |
| GET | `/admin/reports` | 👑 | List property reports (open / reviewed / dismissed). |
| PATCH | `/admin/reports/:id` | 👑 | Update a report's status (`reviewed` or `dismissed`). |
