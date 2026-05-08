import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Surface, ActivityIndicator as PaperSpinner } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  FadeInDown,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CREDIT_PACKAGES, getCreditBalance } from '../services/creditService';
import { getPaymentService, isDemoPaymentMode } from '../services/paymentService';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { CreditPackage } from '../types/credits';
import { BottomTabParamList } from '../types/navigation';

type Props = BottomTabScreenProps<BottomTabParamList, 'BuyCredits'>;

const VALUE_PROPS = [
  { icon: 'fire', label: 'Unlock premium 9/10 & 10/10 opportunities', color: colors.warning },
  { icon: 'rocket-launch-outline', label: 'Full supplier sourcing angles revealed', color: colors.accent },
  { icon: 'bullhorn-outline', label: 'Ready-to-run ad copy & target audiences', color: colors.success },
  { icon: 'clipboard-check-outline', label: 'Complete product test plan included', color: colors.premium },
];

const ROI_EXAMPLES = [
  { product: 'LED Face Mask', investment: '$15', revenue: '$8,400/mo', margin: '72%' },
  { product: 'Pet Water Fountain', investment: '$9', revenue: '$4,200/mo', margin: '65%' },
  { product: 'Posture Corrector', investment: '$3', revenue: '$2,800/mo', margin: '58%' },
];

export const BuyCreditsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<any>();
  const [balance, setBalance] = useState(0);
  const [selectedId, setSelectedId] = useState<string>(CREDIT_PACKAGES[1]?.id ?? CREDIT_PACKAGES[0]?.id);
  const [processing, setProcessing] = useState(false);
  const [roiIndex, setRoiIndex] = useState(0);

  const pulseOpacity = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));

  const refresh = useCallback(async () => {
    setBalance(await getCreditBalance());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      const interval = setInterval(() => {
        setRoiIndex((i) => (i + 1) % ROI_EXAMPLES.length);
      }, 3500);
      return () => clearInterval(interval);
    }, [refresh]),
  );

  const startPulse = () => {
    pulseOpacity.value = withRepeat(withTiming(0.4, { duration: 600 }), -1, true);
  };
  const stopPulse = () => {
    pulseOpacity.value = withTiming(1, { duration: 200 });
  };

  const onPay = async () => {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === selectedId);
    if (!pkg) return;
    setProcessing(true);
    startPulse();
    try {
      const service = getPaymentService();
      const intent = await service.createUsdcPaymentIntent(pkg);
      const result = await service.verifyUsdcPayment(intent.intentId);
      const tx = await service.addCredits(pkg, result);
      navigation.navigate('PaymentSuccess', { transaction: tx, packageInfo: pkg });
    } finally {
      setProcessing(false);
      stopPulse();
    }
  };

  const selectedPkg = CREDIT_PACKAGES.find((p) => p.id === selectedId);
  const roi = ROI_EXAMPLES[roiIndex];

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Balance hero */}
        <LinearGradient colors={[colors.heroDark, colors.heroMid, colors.heroDark]} style={styles.hero}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceLeft}>
              <MaterialCommunityIcons name="diamond" size={ms(28)} color={colors.premium} />
              <View>
                <Text style={styles.balanceVal}>{balance}</Text>
                <Text style={styles.balanceLbl}>credits available</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionHistory')}
              style={styles.historyBtn}
            >
              <MaterialCommunityIcons name="history" size={ms(14)} color="rgba(255,255,255,0.5)" />
              <Text style={styles.historyText}>History</Text>
            </TouchableOpacity>
          </View>

          {isDemoPaymentMode() && (
            <View style={styles.demoBadge}>
              <View style={styles.demoDot} />
              <Text style={styles.demoText}>USDC DEMO MODE — No real funds required</Text>
            </View>
          )}

          {/* Live ROI example ticker */}
          <View style={styles.roiCard}>
            <View style={styles.roiHeader}>
              <MaterialCommunityIcons name="trending-up" size={ms(14)} color={colors.success} />
              <Text style={styles.roiTitle}>Recent Seller Win</Text>
            </View>
            <Text style={styles.roiProduct}>{roi.product}</Text>
            <View style={styles.roiStats}>
              <View style={styles.roiStat}>
                <Text style={styles.roiStatLabel}>INVESTED</Text>
                <Text style={[styles.roiStatVal, { color: colors.premium }]}>{roi.investment} USDC</Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={ms(18)} color="rgba(255,255,255,0.3)" />
              <View style={styles.roiStat}>
                <Text style={styles.roiStatLabel}>MONTHLY REVENUE</Text>
                <Text style={[styles.roiStatVal, { color: colors.success }]}>{roi.revenue}</Text>
              </View>
              <View style={styles.roiStat}>
                <Text style={styles.roiStatLabel}>MARGIN</Text>
                <Text style={[styles.roiStatVal, { color: colors.accent }]}>{roi.margin}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* What you unlock */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT CREDITS UNLOCK</Text>
          <Surface style={styles.unlockCard} elevation={1}>
            {VALUE_PROPS.map((v, i) => (
              <View
                key={i}
                style={[styles.unlockRow, i < VALUE_PROPS.length - 1 && styles.unlockRowBorder]}
              >
                <View style={[styles.unlockIcon, { backgroundColor: v.color + '18' }]}>
                  <MaterialCommunityIcons name={v.icon} size={ms(16)} color={v.color} />
                </View>
                <Text style={styles.unlockText}>{v.label}</Text>
                <MaterialCommunityIcons name="check-circle" size={ms(16)} color={v.color} />
              </View>
            ))}
          </Surface>
        </Animated.View>

        {/* Packages */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
          <Text style={styles.sectionLabel}>CHOOSE A PACKAGE</Text>
          <Text style={styles.sectionSub}>1 credit = 1 USDC · 3 credits unlock one premium product</Text>
          {CREDIT_PACKAGES.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              selected={selectedId === pkg.id}
              onPress={() => setSelectedId(pkg.id)}
            />
          ))}
        </Animated.View>

        {/* Pay button */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Animated.View style={[pulseStyle]}>
            <TouchableOpacity onPress={onPay} disabled={processing} activeOpacity={0.85}>
              <LinearGradient
                colors={processing ? [colors.textDisabled, colors.textDisabled] : gradients.accent}
                style={styles.payBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {processing ? (
                  <View style={styles.processingRow}>
                    <PaperSpinner size={ms(18)} color={colors.white} />
                    <Text style={styles.payBtnLabel}>Confirming on-chain…</Text>
                  </View>
                ) : (
                  <View style={styles.payBtnContent}>
                    <MaterialCommunityIcons name="lightning-bolt" size={ms(18)} color={colors.white} />
                    <Text style={styles.payBtnLabel}>
                      Pay {selectedPkg?.usdcAmount ?? 0} USDC · Get {selectedPkg?.credits ?? 0} Credits
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Security section */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Surface style={styles.securityCard} elevation={1}>
            <View style={styles.securityHeader}>
              <MaterialCommunityIcons name="shield-check" size={ms(18)} color={colors.success} />
              <Text style={styles.securityTitle}>Secure USDC Payment</Text>
            </View>
            {[
              { icon: 'server-outline', text: 'Payment verified server-side — never on the client' },
              { icon: 'key-outline', text: 'No private keys or seed phrases stored on device' },
              { icon: 'lock-outline', text: 'End-to-end encrypted transaction flow' },
            ].map((b, i) => (
              <View key={i} style={styles.securityRow}>
                <View style={styles.securityIcon}>
                  <MaterialCommunityIcons name={b.icon} size={ms(13)} color={colors.accent} />
                </View>
                <Text style={styles.securityText}>{b.text}</Text>
              </View>
            ))}
          </Surface>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PackageCard: React.FC<{ pkg: CreditPackage; selected: boolean; onPress: () => void }> = ({
  pkg,
  selected,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.packageWrap}>
    <Surface
      style={[styles.packageCard, selected && styles.packageCardSelected]}
      elevation={selected ? 3 : 1}
    >
      {selected && (
        <View style={styles.checkMark}>
          <MaterialCommunityIcons name="check-circle" size={ms(22)} color={colors.accent} />
        </View>
      )}
      {pkg.highlight && (
        <LinearGradient
          colors={gradients.premium}
          style={styles.popularBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.popularText}>⭐ MOST POPULAR</Text>
        </LinearGradient>
      )}
      <View style={styles.packageBody}>
        <View style={styles.packageLeft}>
          <Text style={styles.packageCredits}>{pkg.credits} credits</Text>
          <Text style={styles.packageLabel}>
            {pkg.label} · ~{Math.floor(pkg.credits / 3)} products unlocked
          </Text>
        </View>
        <View style={styles.packageRight}>
          <Text style={styles.packagePrice}>{pkg.usdcAmount} USDC</Text>
          <Text style={styles.packagePer}>
            {(pkg.usdcAmount / pkg.credits).toFixed(2)} USDC/credit
          </Text>
        </View>
      </View>
    </Surface>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },

  hero: { padding: spacing.lg, paddingBottom: vs(24), gap: ms(14) },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(12) },
  balanceVal: { color: colors.white, fontSize: ms(42), fontWeight: '900', lineHeight: ms(46) },
  balanceLbl: { color: 'rgba(255,255,255,0.5)', fontSize: ms(12), marginTop: vs(-2) },
  historyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: s(5),
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.pill,
    paddingHorizontal: s(12), paddingVertical: vs(7),
  },
  historyText: { color: 'rgba(255,255,255,0.5)', fontSize: ms(12), fontWeight: '600' },

  demoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: ms(7),
    backgroundColor: 'rgba(192,139,48,0.2)', borderRadius: radius.pill,
    paddingHorizontal: s(14), paddingVertical: vs(7), alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(192,139,48,0.4)',
  },
  demoDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: colors.premium },
  demoText: { color: colors.premium, fontSize: ms(11), fontWeight: '700' },

  roiCard: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: radius.xl, padding: ms(14),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  roiHeader: { flexDirection: 'row', alignItems: 'center', gap: s(6), marginBottom: vs(6) },
  roiTitle: { color: colors.success, fontSize: ms(11), fontWeight: '700', letterSpacing: 0.3 },
  roiProduct: { color: colors.white, fontSize: ms(16), fontWeight: '800', marginBottom: vs(10) },
  roiStats: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  roiStat: { flex: 1 },
  roiStatLabel: { fontSize: ms(9), color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.5 },
  roiStatVal: { fontSize: ms(14), fontWeight: '800', marginTop: vs(2) },

  section: { paddingHorizontal: spacing.lg, marginTop: vs(20) },
  sectionLabel: {
    fontSize: ms(11), fontWeight: '800', color: colors.muted,
    letterSpacing: ms(1.2), marginBottom: vs(8),
  },
  sectionSub: { fontSize: ms(12), color: colors.muted, marginBottom: vs(12) },

  unlockCard: { borderRadius: radius.xl, backgroundColor: colors.card, overflow: 'hidden' },
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: ms(12), padding: ms(14) },
  unlockRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  unlockIcon: { width: ms(34), height: ms(34), borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  unlockText: { flex: 1, fontSize: ms(13), color: colors.primary, fontWeight: '600', lineHeight: ms(19) },

  packageWrap: { marginBottom: vs(10) },
  packageCard: {
    borderRadius: radius.xl, backgroundColor: colors.card,
    borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden',
  },
  packageCardSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  checkMark: { position: 'absolute', top: ms(12), right: ms(12), zIndex: 1 },
  popularBadge: { paddingVertical: vs(6), alignItems: 'center' },
  popularText: { color: colors.white, fontSize: ms(11), fontWeight: '800', letterSpacing: 0.5 },
  packageBody: { flexDirection: 'row', alignItems: 'center', padding: ms(16), gap: spacing.md },
  packageLeft: { flex: 1 },
  packageCredits: { fontSize: ms(20), fontWeight: '800', color: colors.primary },
  packageLabel: { fontSize: ms(12), color: colors.muted, marginTop: vs(2) },
  packageRight: { alignItems: 'flex-end' },
  packagePrice: { fontSize: ms(20), fontWeight: '800', color: colors.primary },
  packagePer: { fontSize: ms(11), color: colors.muted, marginTop: vs(2) },

  payBtn: { borderRadius: radius.xl, paddingVertical: vs(16), alignItems: 'center', justifyContent: 'center' },
  payBtnContent: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  payBtnLabel: { color: colors.white, fontSize: ms(17), fontWeight: '800' },
  processingRow: { flexDirection: 'row', alignItems: 'center', gap: s(10) },

  securityCard: { borderRadius: radius.xl, padding: spacing.lg, backgroundColor: colors.card },
  securityHeader: { flexDirection: 'row', alignItems: 'center', gap: ms(8), marginBottom: vs(14) },
  securityTitle: { fontSize: ms(15), fontWeight: '800', color: colors.primary },
  securityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: ms(10), marginBottom: vs(10) },
  securityIcon: {
    width: ms(28), height: ms(28), borderRadius: radius.sm,
    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  securityText: { flex: 1, fontSize: ms(13), color: colors.muted, lineHeight: ms(20) },
});
