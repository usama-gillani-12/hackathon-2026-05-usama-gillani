import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { vs } from '@theme/responsive';
import { AppButton } from '@shared/components/app-button';
import { styles } from './PremiumLockCard.styles';

interface Props {
  cost: number;
  balance: number;
  rating10: number;
  onUnlock: () => void;
  onBuyCredits: () => void;
  reason?: string;
  style?: ViewStyle;
}

export const PremiumLockCard: React.FC<Props> = ({ cost, balance, rating10, onUnlock, onBuyCredits, reason, style }) => {
  const canUnlock = balance >= cost;
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.lockBadge}>
          <Text style={[typography.tiny, { color: colors.premium }]}>PREMIUM · {rating10}/10</Text>
        </View>
      </View>

      <Text style={[typography.h2, { color: colors.primary, marginTop: spacing.sm }]}>
        Premium insight is locked
      </Text>
      <Text style={[typography.small, { color: colors.muted, marginTop: vs(4) }]}>
        {reason || 'This product scored in our highest tier. Spend credits to reveal the full intelligence.'}
      </Text>

      <View style={styles.rowSplit}>
        <View style={styles.pill}>
          <Text style={[typography.tiny, { color: colors.muted }]}>UNLOCK COST</Text>
          <Text style={[typography.h2, { color: colors.primary }]}>{cost} credits</Text>
        </View>
        <View style={styles.pill}>
          <Text style={[typography.tiny, { color: colors.muted }]}>YOUR BALANCE</Text>
          <Text style={[typography.h2, { color: canUnlock ? colors.success : colors.danger }]}>{balance} credits</Text>
        </View>
      </View>

      {canUnlock ? (
        <AppButton title={`Unlock with ${cost} credits`} variant="premium" fullWidth onPress={onUnlock} style={{ marginTop: spacing.md }} />
      ) : (
        <AppButton title="Buy USDC Credits" variant="primary" fullWidth onPress={onBuyCredits} style={{ marginTop: spacing.md }} />
      )}

      <Text style={[typography.tiny, { color: colors.muted, marginTop: spacing.sm, textAlign: 'center' }]}>
        Mock USDC settlement · Production payments must be verified by your backend.
      </Text>
    </View>
  );
};

