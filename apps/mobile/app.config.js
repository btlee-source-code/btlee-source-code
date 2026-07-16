/**
 * Dynamic Expo config layered on top of app.json.
 *
 * Expo loads this file (when present) and hands us the fully-resolved app.json
 * as `config`. We only override `android.googleServicesFile` so it can come from
 * an EAS file secret at build time:
 *   - Cloud builds (EAS): the `GOOGLE_SERVICES_JSON` file env var is materialized
 *     to a temp path and injected here — the real google-services.json is never
 *     committed to git.
 *   - Local dev / `expo run:android`: the env var is undefined, so we fall back
 *     to the gitignored ./google-services.json sitting in this folder.
 *
 * Everything else stays in app.json — this file is intentionally a thin shim.
 */
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
