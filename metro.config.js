const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

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
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
