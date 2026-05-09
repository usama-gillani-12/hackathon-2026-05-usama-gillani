import 'react-native-get-random-values';
import '@ethersproject/shims';
import '@walletconnect/react-native-compat';
import 'react-native-url-polyfill/auto';
import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

LogBox.ignoreLogs([
  // react-native-vector-icons logs full glyphmap when a font isn't registered yet
  'fontFamily "MaterialCommunityIcons" is not a system font',
  'Unrecognized font family',
  // WalletConnect internal relay noise
  'WalletConnectModal',
  'No matching key',
]);

AppRegistry.registerComponent(appName, () => App);
