import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ms, s, vs } from '../theme/responsive';

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.heroDark,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadow.cardLg,
  },
  shine: {
    position: 'absolute',
    top: vs(-40),
    right: s(-40),
    width: s(160),
    height: vs(160),
    borderRadius: ms(80),
    backgroundColor: 'rgba(192,139,48,0.35)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actions: {
    marginLeft: spacing.lg,
    alignItems: 'flex-end',
  },
  primaryAction: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
    marginBottom: spacing.sm,
  },
  secondaryAction: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  demoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192,139,48,0.25)',
    borderRadius: radius.pill,
    paddingVertical: vs(4),
    paddingHorizontal: s(8),
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  demoDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.accent,
  },
});
