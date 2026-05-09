import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator as PaperSpinner, Surface, Text } from 'react-native-paper';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useAccount } from 'wagmi';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { formatAddress } from '../services/walletService';
import { useWalletStore } from '../stores/useWalletStore';

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

const styles = StyleSheet.create({
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    borderRadius: radius.xl,
    paddingVertical: vs(16),
    paddingHorizontal: spacing.xl,
  },
  connectBtnText: {
    color: colors.white,
    fontSize: ms(16),
    fontWeight: '800',
  },
  connectedCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.successSubtle,
    borderWidth: 1,
    borderColor: colors.borderSuccess,
    padding: spacing.md,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  connectedDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.success,
  },
  connectedAddress: {
    flex: 1,
    fontSize: ms(14),
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  networkBadge: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: s(10),
    paddingVertical: vs(3),
  },
  networkBadgeText: {
    fontSize: ms(10),
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.4,
  },
  disconnectBtn: {
    marginTop: vs(8),
    alignSelf: 'flex-end',
  },
  disconnectText: {
    fontSize: ms(12),
    color: colors.muted,
    fontWeight: '600',
  },
});
