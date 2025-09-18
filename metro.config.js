const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports to handle import.meta properly
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['import', 'react-native'];

module.exports = config;