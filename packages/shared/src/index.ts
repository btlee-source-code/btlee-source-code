/**
 * @btlee/shared — cross-platform source of truth (no UI).
 *
 * Consumed today by apps/mobile (Expo/Metro). apps/web + apps/server keep local
 * mirrors for now and treat this package as canonical; wiring them to import it
 * directly is deferred until the Vercel/Railway workspace-install config is
 * confirmed (a bare `import` here must resolve at their build/runtime too).
 *
 * Relative imports are EXTENSIONLESS on purpose: Metro's resolver does not remap
 * `.js` → `.ts`, so `.js` specifiers (which NodeNext would require) break the
 * mobile bundler. If a NodeNext runtime (the server) ever consumes this package,
 * add a build step that emits `.js` instead of switching these back.
 */
export * from './constants/index';
export * from './schemas/index';
export * from './types/index';
