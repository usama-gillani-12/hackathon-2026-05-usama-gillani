import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { vs, s } from '@theme/responsive';
import { styles } from './CreditBalanceCard.styles';

interface Props {
  balance: number;
  onPressBuy?: () => void;
  onPressHistory?: () => void;
  demoMode?: boolean;
  style?: ViewStyle;
}

export const CreditBalanceCard: React.FC<Props> = ({ balance, onPressBuy, onPressHistory, demoMode = true, style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.shine} />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.tiny, { color: 'rgba(255,255,255,0.7)' }]}>USDC CREDITS</Text>
          <Text style={[typography.displayLg, { color: colors.white, marginTop: vs(4) }]}>{balance}</Text>
          <Text style={[typography.small, { color: 'rgba(255,255,255,0.7)', marginTop: vs(4) }]}>
            Spend credits to unlock 9/10 and 10/10 winning insights.
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={onPressBuy} style={styles.primaryAction}>
            <Text style={[typography.smallStrong, { color: colors.primary }]}>Buy Credits</Text>
          </Pressable>
          {onPressHistory ? (
            <Pressable onPress={onPressHistory} style={styles.secondaryAction}>
              <Text style={[typography.smallStrong, { color: colors.white }]}>History</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {demoMode ? (
        <View style={styles.demoTag}>
          <View style={styles.demoDot} />
          <Text style={[typography.tiny, { color: colors.white, marginLeft: s(6) }]}>USDC CREDIT DEMO MODE</Text>
        </View>
      ) : null}
    </View>
  );
};

