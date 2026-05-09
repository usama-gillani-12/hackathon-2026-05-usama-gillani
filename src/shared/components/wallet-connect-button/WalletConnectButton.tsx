import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ActivityIndicator as PaperSpinner, Surface, Text } from 'react-native-paper';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useAccount } from 'wagmi';
import { colors, gradients } from '@theme/colors';
import { ms } from '@theme/responsive';
import { formatAddress } from '@core/services/walletService';
import { useWalletStore } from '@core/stores/useWalletStore';
import { styles } from './WalletConnectButton.styles';

interface Props {
  onConnected?: (address: `0x${string}`) => void;
}

export const WalletConnectButton: React.FC<Props> = ({ onConnected }) => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { isConnecting, setConnecting, disconnect } = useWalletStore();

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await open();
      if (address) {
        onConnected?.(address as `0x${string}`);
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  if (isConnected && address) {
    return (
      <Surface style={styles.connectedCard} elevation={1}>
        <View style={styles.connectedRow}>
          <View style={styles.connectedDot} />
          <MaterialCommunityIcons name="wallet-outline" size={ms(16)} color={colors.success} />
          <Text style={styles.connectedAddress}>
            {formatAddress(address as `0x${string}`)}
          </Text>
          <View style={styles.networkBadge}>
            <Text style={styles.networkBadgeText}>Base Sepolia</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectBtn}>
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      </Surface>
    );
  }

  return (
    <TouchableOpacity onPress={handleConnect} disabled={isConnecting} activeOpacity={0.85}>
      <LinearGradient
        colors={gradients.accent}
        style={styles.connectBtn}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {isConnecting ? (
          <PaperSpinner size={ms(18)} color={colors.white} />
        ) : (
          <>
            <MaterialCommunityIcons name="wallet-plus-outline" size={ms(18)} color={colors.white} />
            <Text style={styles.connectBtnText}>Connect Wallet to Pay</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

