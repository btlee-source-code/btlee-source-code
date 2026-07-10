# Server Architecture

Feature-based Express + Mongoose API. Each `modules/<x>/` folder is a self-contained
vertical slice (`model → service → controller → routes`). Services are
transport-agnostic (no `req`/`res`); controllers are thin HTTP adapters. One API
serves **both** clients — the web (`apps/web`) and the mobile app (`apps/mobile`).

## Module ownership

The default is **shared** (web + mobile). A concern that belongs to one platform
is the exception and is called out here.

| Module | Platform | Notes |
|---|---|---|
| `auth` | shared | Cookies = web, `Authorization: Bearer` = mobile. One module, two transports (see `shared/middlewares/authMiddleware.ts`). Mobile sends `X-Client: mobile` so tokens are returned in the JSON body. |
| `users` | shared | Profile, wishlist array (see wishlist note). |
| `properties` | shared | The one listing domain today. Composes `shared/models/baseListing.ts`. |
| `wishlist` | shared | **No own model** — an array of Property ObjectIds on the User doc. |
| `ratings` | shared | 1–5 per user per target. |
| `reports` | shared | User reports against a target; admin reviews. |
| `saved-searches` | shared | Stored filter criteria + match notifications. |
| `notifications` | shared | In-app + email. |
| `cloudinary` (`/uploads`) | shared | Image signing/upload. |
| `admin-auth`, `admins` | **web only** | Admin dashboard (web). Separate cookie names. |

Route boundaries live in `routes/index.ts` under banner comments (Public/user vs Admin).

## Domain-readiness (why the shared systems don't hard-code "property")

The platform is built to absorb a **new listing domain** (e.g. `car`) later with
minimal, additive work — no rewrite of the shared systems. Three mechanisms:

1. **`LISTING_KINDS` / `TARGET_TYPES`** — `packages/shared/src/constants/shared.ts`
   is the canonical spine; the server mirrors `TARGET_TYPES` in
   `config/constants.ts` (it validates the DB; it does not import the shared
   package at runtime yet — see Deferred).
2. **`shared/models/baseListing.ts`** — the domain-agnostic listing spine
   (owner, seq, price, images, contact, duration/expiry, featured, counters,
   rating aggregates). `Property` spreads `baseListingFields` and adds only its
   own classification/specs/location/status. A new domain reuses the same base.
3. **`{ targetType, targetId }` on the shared systems** — `ratings` and `reports`
   carry a domain-agnostic target **alongside** the legacy `property` field
   (dual-written). `saved-searches` carries `targetType` (it matches many items,
   so no `targetId`). This is purely additive: existing data, indexes, and the
   web read path are untouched; the legacy `property` field was only relaxed from
   `required` to optional so a future non-property row can omit it.

### Adding a domain (playbook)

1. **Enums** → add `packages/shared/src/constants/<domain>.ts`; register the kind
   in `shared.ts` (`LISTING_KINDS`, `TARGET_TYPES`) and mirror it in the server's
   `config/constants.ts` `TARGET_TYPES`.
2. **Module** → create `modules/<domain>/` with the usual `model → service →
   controller → routes` slice. The model spreads `baseListingFields` and adds its
   own classification/specs + its own `status` enum.
3. **Wire routes** → one `apiRouter.use('/<domain>', <domain>Router)` line in
   `routes/index.ts` under the shared banner.
4. **Shared systems just work** → write `{ targetType: '<domain>', targetId }`
   when creating ratings/reports for the new domain. Then **drop the legacy
   `ratings` unique index `{ user: 1, property: 1 }`** (the partial
   `{ user, targetType, targetId }` index becomes the sole uniqueness guard), and
   add a `{ targetType, targetId }` index where you aggregate/list by target.

## Deferred (intentionally NOT done in the safe-foundation pass)

These are documented so the next contributor doesn't assume they're complete:

- **Wishlist → domain-agnostic.** Still an array of Property ObjectIds on the
  User doc. Converting it to `{ targetType, targetId }` entries (or its own
  collection) is the hard case (scalar-array migration) and was deferred to avoid
  touching a live endpoint with no immediate payoff. Left property-only on purpose.
- **Backfill.** Existing `ratings`/`reports` rows keep `targetType`/`targetId`
  UNSET (the partial index ignores them). A one-time backfill copying
  `targetType='property'`, `targetId=property` can run later on a DB copy first.
- **Report admin populate.** `reports.service.listReportsForAdmin` still
  `.populate('property', …)`. Generalizing to heterogeneous targets waits for a
  real second domain.
- **Wire `@btlee/shared` into web + server at runtime.** Today only `apps/mobile`
  consumes the shared package (Metro resolves its TS source). Web (Vercel) and
  server (Railway) keep local enum copies as canonical mirrors; wiring them to
  import the package needs their workspace-install/build config confirmed first
  (a bare `import '@btlee/shared'` must resolve at their build + runtime).
