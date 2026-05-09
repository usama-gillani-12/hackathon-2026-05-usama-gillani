import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator as PaperSpinner, Surface, Text } from 'react-native-paper';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SUBSCRIPTION_PASS } from '../services/creditService';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';

interface Props {
  onSubscribe: () => void;
  processing: boolean;
}

export const SubscriptionPassCard: React.FC<Props> = ({ onSubscribe, processing }) => (
  <Surface style={styles.card} elevation={2}>
    <LinearGradient
      colors={gradients.premium}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <MaterialCommunityIcons name="crown" size={ms(24)} color={colors.white} />
      <View style={styles.headerText}>
        <Text style={styles.title}>{SUBSCRIPTION_PASS.label}</Text>
        <Text style={styles.subtitle}>Auto-renews monthly</Text>
      </View>
      <View style={styles.priceWrap}>
        <Text style={styles.price}>${SUBSCRIPTION_PASS.usdcPerMonth}</Text>
        <Text style={styles.priceUnit}>/mo</Text>
      </View>
    </LinearGradient>

    <View style={styles.body}>
      <View style={styles.creditsRow}>
        <MaterialCommunityIcons name="diamond" size={ms(16)} color={colors.premium} />
        <Text style={styles.creditsLine}>
          {SUBSCRIPTION_PASS.creditsPerMonth} credits delivered monthly
        </Text>
      </View>

      {SUBSCRIPTION_PASS.perks.map((perk, i) => (
        <View key={i} style={styles.perkRow}>
          <MaterialCommunityIcons name="check-circle-outline" size={ms(14)} color={colors.success} />
          <Text style={styles.perkText}>{perk}</Text>
        </View>
      ))}

      <TouchableOpacity onPress={onSubscribe} disabled={processing} activeOpacity={0.85}>
        <LinearGradient
          colors={gradients.gold}
          style={styles.subscribeBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {processing ? (
            <PaperSpinner size={ms(18)} color={colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="crown" size={ms(16)} color={colors.white} />
              <Text style={styles.subscribeBtnText}>Start Monthly Pass</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Billed monthly in USDC on Base · Cancel anytime
      </Text>
    </View>
  </Surface>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    overflow: 'hidden',
    marginBottom: vs(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: s(12),
  },
  headerText: { flex: 1 },
  title: { color: colors.white, fontSize: ms(17), fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: ms(11), marginTop: vs(2) },
  priceWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: s(2) },
  price: { color: colors.white, fontSize: ms(28), fontWeight: '900' },
  priceUnit: { color: 'rgba(255,255,255,0.7)', fontSize: ms(13), marginBottom: vs(4) },
  body: { padding: spacing.md, gap: vs(10) },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    backgroundColor: colors.premiumSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  creditsLine: { fontSize: ms(14), fontWeight: '700', color: colors.primary },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(8),
  },
  perkText: { flex: 1, fontSize: ms(13), color: colors.muted, lineHeight: ms(19) },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    borderRadius: radius.xl,
    paddingVertical: vs(14),
    marginTop: vs(4),
  },
  subscribeBtnText: { color: colors.white, fontSize: ms(16), fontWeight: '800' },
  disclaimer: {
    fontSize: ms(11),
    color: colors.muted,
    textAlign: 'center',
    marginTop: vs(-4),
  },
});
