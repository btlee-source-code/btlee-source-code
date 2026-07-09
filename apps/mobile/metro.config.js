const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Expo SDK 52+ auto-configures Metro for monorepos, so no manual
// watchFolders / nodeModulesPaths are needed here.
const config = getDefaultConfig(__dirname);

// lucide-react-native ships its React Native build as `.mjs` files, which Metro
// does NOT treat as a source extension by default — so its icon imports fail with
// "None of these files exist: .../a-arrow-down.mjs". Adding 'mjs' fixes it.
if (!config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts.push('mjs');
}

module.exports = withNativeWind(config, { input: './src/global.css' });
