import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Surface, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { formatCurrency, formatDateTime, shortenHash } from '../utils/formatCurrency';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSuccess'>;

export const PaymentSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transaction, packageInfo } = route.params;

  const scale = useSharedValue(0);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 180 });
  }, []);

  const goHome = () => {
    navigation.popToTop();
  };

  const goTransactions = () => {
    navigation.popToTop();
    setTimeout(() => navigation.navigate('DrawerRoot', { screen: 'TransactionHistory' } as any), 100);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success hero */}
        <LinearGradient colors={[colors.heroDark, colors.successDark]} style={styles.hero}>
          <Animated.View style={[styles.checkWrap, checkStyle]}>
            <LinearGradient colors={gradients.success} style={styles.checkCircle}>
              <MaterialCommunityIcons name="check-bold" size={ms(40)} color={colors.white} />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.heroTitle}>Payment Successful!</Text>
          <Text style={styles.heroSub}>
            {packageInfo.credits} credits added to your account
          </Text>
          <View style={styles.creditsAdded}>
            <MaterialCommunityIcons name="diamond" size={ms(16)} color={colors.success} />
            <Text style={styles.creditsAddedText}>+{packageInfo.credits} credits</Text>
          </View>
        </LinearGradient>

        {/* Receipt */}
        <Surface style={styles.receipt} elevation={2}>
          <Text style={styles.receiptTitle}>Receipt</Text>
          <Divider style={styles.divider} />
          {[
            { label: 'Package', value: `${packageInfo.label} · ${packageInfo.credits} credits` },
            { label: 'Credits Added', value: `+${packageInfo.credits}`, highlight: true },
            { label: 'USDC Amount', value: formatCurrency(transaction.usdcAmount, 'USDC') },
            { label: 'Status', value: transaction.status.toUpperCase() },
            { label: 'Network', value: transaction.network.toUpperCase() },
            { label: 'Date & Time', value: formatDateTime(transaction.createdAt) },
          ].map((row) => (
            <View key={row.label} style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{row.label}</Text>
              <Text style={[styles.receiptValue, row.highlight && { color: colors.success, fontWeight: '800' }]}>
                {row.value}
              </Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.hashWrap}>
            <Text style={styles.hashLabel}>TRANSACTION HASH</Text>
            <Text style={styles.hashValue}>{shortenHash(transaction.txHash, 14, 10)}</Text>
          </View>
        </Surface>

        {/* CTA buttons */}
        <Button
          mode="contained"
          onPress={goHome}
          style={styles.btn}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
          buttonColor={colors.accent}
        >
          Back to Dashboard
        </Button>
        <Button
          mode="outlined"
          onPress={goTransactions}
          style={[styles.btn, styles.btnOutline]}
          contentStyle={styles.btnContent}
          textColor={colors.primary}
        >
          View All Transactions
        </Button>

        {transaction.network === 'mock' && (
          <View style={styles.demoNote}>
            <MaterialCommunityIcons name="information-outline" size={ms(14)} color={colors.premium} />
            <Text style={styles.demoNoteText}>Demo mode · No real funds were moved.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  hero: {
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
  },
  checkWrap: { marginBottom: spacing.sm },
  checkCircle: {
    width: ms(88), height: ms(88), borderRadius: ms(44),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: ms(8) },
    shadowOpacity: 0.4,
    shadowRadius: ms(16),
    elevation: 10,
  },
  heroTitle: { color: colors.white, fontSize: ms(24), fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: ms(14), textAlign: 'center' },
  creditsAdded: {
    flexDirection: 'row', alignItems: 'center', gap: ms(6),
    backgroundColor: `${colors.success}25`, borderRadius: radius.pill,
    paddingHorizontal: s(16), paddingVertical: vs(8), marginTop: spacing.sm,
  },
  creditsAddedText: { color: colors.success, fontSize: ms(16), fontWeight: '800' },
  receipt: {
    margin: spacing.lg, borderRadius: radius.xl,
    backgroundColor: colors.card, overflow: 'hidden',
  },
  receiptTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, padding: spacing.md, paddingBottom: spacing.sm },
  divider: { backgroundColor: colors.border },
  receiptRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: vs(12),
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  receiptLabel: { fontSize: ms(13), color: colors.muted },
  receiptValue: { fontSize: ms(13), fontWeight: '600', color: colors.primary },
  hashWrap: { padding: spacing.md },
  hashLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(1), marginBottom: vs(4) },
  hashValue: { fontSize: ms(14), fontWeight: '700', color: colors.primary, fontFamily: 'monospace' },
  btn: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: radius.lg },
  btnOutline: { borderColor: colors.border },
  btnContent: { paddingVertical: vs(4) },
  btnLabel: { fontSize: ms(15), fontWeight: '700' },
  demoNote: {
    flexDirection: 'row', alignItems: 'center', gap: ms(6),
    justifyContent: 'center', marginTop: spacing.md,
  },
  demoNoteText: { fontSize: ms(12), color: colors.premium },
});
