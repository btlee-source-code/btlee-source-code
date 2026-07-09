# Bt Lee Mobile — Architecture

React Native (Expo + expo-router) app. **Feature-based**, mirroring the web
client (`apps/web/src`) so the two stay consistent. Arabic-first (RTL), brand
parity via NativeWind tokens + the Cairo font.

## Layout

```
src/
├─ app/                     expo-router — THIN screens only (route → feature component)
│  ├─ _layout.tsx           Providers (redux, auth, wishlist) + fonts + root Stack
│  ├─ (tabs)/               bottom tabs: index (home) · properties · wishlist · profile
│  ├─ properties/[id].tsx   property detail route
│  └─ login.tsx · register.tsx
│
├─ features/                one folder per feature — the vertical slices
│  ├─ auth/        { api, components, hooks, store }
│  ├─ properties/  { api, components, list, detail }
│  ├─ wishlist/    { api, components, hooks, store }
│  └─ home/        { components }
│
├─ shared/                  cross-feature building blocks
│  ├─ api/                  httpClient (axios + Bearer/refresh), authStorage (SecureStore)
│  ├─ components/           ui/ (TextField…) · layout/ (Logo…)
│  ├─ hooks/                useFetch, useDebounce
│  ├─ lib/                  constants (enums + Arabic labels), format (price/date)
│  ├─ store/                redux store config + typed hooks (slices live in features/*/store)
│  └─ types/                property, user
│
└─ config/                  env (API base URL), strings (Arabic UI text)
```

## Conventions

- **Screens are thin.** Files in `app/` just render a feature component; all UI
  and logic live in `features/<feature>/`.
- **Feature owns its state.** Redux slices live in `features/<feature>/store/
  <feature>.slice.ts`; `shared/store/index.ts` only wires them together.
- **File naming** matches the web: `*.api.ts`, `*.slice.ts`, `useX.ts`.
- **Data layer** reuses the web response envelope `{ status, data, meta }` and
  the same endpoints. Public reads need no auth; the mobile client sends
  `X-Client: mobile` so the backend returns tokens in the JSON body.
- **Styling** uses NativeWind classes bound to the web design tokens
  (`tailwind.config.js`); use `font-cairo[-medium|-semibold|-bold]` for the
  brand font.

## Adding a feature

Create `features/<name>/{api,components,hooks,store}`, add a thin route under
`app/`, and register any slice in `shared/store/index.ts`. No cross-cutting
changes needed.
