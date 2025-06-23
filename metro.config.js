const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolver o problema do tslib
config.resolver.alias = {
  tslib: require.resolve('tslib'),
};

// Solução para o erro "Component auth has not been registered yet" no Expo SDK 53
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;