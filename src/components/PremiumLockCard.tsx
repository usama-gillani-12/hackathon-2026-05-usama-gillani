import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { s, vs } from '../theme/responsive';
import { AppButton } from './AppButton';

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.premiumSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.premiumSoft,
  },
  headerRow: {
    flexDirection: 'row',
  },
  lockBadge: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: vs(4),
    paddingHorizontal: s(10),
  },
  rowSplit: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md as unknown as number,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.premiumSubtle,
  },
});
