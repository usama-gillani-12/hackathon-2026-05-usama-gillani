// Load .env into process.env at Babel transpile time so
// babel-plugin-transform-inline-environment-variables can replace
// all process.env.EXPO_PUBLIC_* references with their literal values.
require('dotenv').config();

module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    'transform-inline-environment-variables',
    'react-native-reanimated/plugin', // must be last
  ],
};
