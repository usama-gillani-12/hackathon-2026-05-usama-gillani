// Load .env into process.env at Babel transpile time so
// babel-plugin-transform-inline-environment-variables can replace
// all process.env.EXPO_PUBLIC_* references with their literal values.
require('dotenv').config();

module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    'transform-inline-environment-variables',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@features': './src/features',
          '@shared': './src/shared',
          '@core': './src/core',
          '@theme': './src/theme',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@mocks': './src/mocks',
          '@constants': './src/constants/index.ts',
          '@t': './src/types',
        },
      },
    ],
    'react-native-reanimated/plugin', // must be last
  ],
};
