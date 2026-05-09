const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Direct path to the PostHog surveys module — bypasses the package's `exports`
// field which Metro doesn't honor by default.
const POSTHOG_SURVEYS_PATH = path.join(
  __dirname,
  'node_modules/@posthog/core/dist/surveys/index.js',
);

const config = {
  resolver: {
    extraNodeModules: {
      crypto: require.resolve('react-native-get-random-values'),
      stream: require.resolve('readable-stream'),
      http: require.resolve('@tradle/react-native-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('react-native-os'),
      url: require.resolve('react-native-url-polyfill'),
    },
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === '@posthog/core/surveys') {
        return { filePath: POSTHOG_SURVEYS_PATH, type: 'sourceFile' };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
