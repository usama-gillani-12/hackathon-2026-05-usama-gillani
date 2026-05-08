import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Surface, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { findScoredProduct, loadScoredProducts } from '../services/productService';
import { buildTestPlan } from '../services/scoringService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { ProductTestPlan, ScoredProduct } from '../types/product';
import { formatCurrency } from '../utils/formatCurrency';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductTestPlan'>;

export const ProductTestPlanScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId } = route.params;
  const [scored, setScored] = useState<ScoredProduct | null>(null);
  const [plan, setPlan] = useState<ProductTestPlan | null>(null);

  useEffect(() => {
    (async () => {
      let s = findScoredProduct(productId);
      if (!s) {
        const { products } = await loadScoredProducts();
        s = products.find((p) => p.product.id === productId);
      }
      if (s) { setScored(s); setPlan(buildTestPlan(s)); }
    })();
  }, [productId]);

  if (!scored || !plan) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[colors.heroDark, colors.heroMid]} style={styles.hero}>
          <Text style={styles.heroLabel}>AI-GENERATED TEST PLAN</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>{scored.product.title}</Text>
          <View style={styles.heroStats}>
            <HeroStat icon="currency-usd" label="Budget" value={`$${plan.testingBudget}`} />
            <View style={styles.heroStatDivider} />
            <HeroStat icon="calendar-outline" label="Duration" value={`${plan.testDurationDays} days`} />
            <View style={styles.heroStatDivider} />
            <HeroStat icon="percent" label="Margin" value={`${scored.marginPercent}%`} />
          </View>
        </LinearGradient>

        {/* Pricing strategy */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>Pricing Strategy</Text>
          <Divider style={styles.divider} />
          {[
            { label: 'Suggested Selling Price', value: formatCurrency(plan.suggestedPrice), highlight: true },
            { label: 'Estimated Cost', value: formatCurrency(scored.estimatedCost), highlight: false },
            { label: 'Estimated Margin', value: `${scored.marginPercent}%`, highlight: true },
          ].map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={[styles.rowValue, row.highlight && { color: colors.success }]}>{row.value}</Text>
            </View>
          ))}
        </Surface>

        {/* Audience & angle */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>Audience & Angle</Text>
          <Divider style={styles.divider} />
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>TARGET AUDIENCE</Text>
            <Text style={styles.infoValue}>{plan.targetAudience}</Text>
          </View>
          <View style={[styles.infoBlock, { marginTop: spacing.md }]}>
            <Text style={styles.infoLabel}>BEST AD ANGLE</Text>
            <Text style={styles.infoValue}>{plan.adAngle}</Text>
          </View>
        </Surface>

        {/* First ad copy */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>First Ad Copy</Text>
          <View style={styles.adBox}>
            <MaterialCommunityIcons name="format-quote-open" size={ms(20)} color={colors.accent} />
            <Text style={styles.adCopyText}>{plan.firstAdCopy}</Text>
          </View>
        </Surface>

        {/* Test setup */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>Test Setup</Text>
          <Divider style={styles.divider} />
          {[
            { label: 'Total Budget', value: `$${plan.testingBudget}` },
            { label: 'Duration', value: `${plan.testDurationDays} days` },
            { label: 'Platforms', value: scored.suggestedPlatforms.join(', ') },
          ].map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.successMetric}>
            <Text style={styles.infoLabel}>SUCCESS METRIC</Text>
            <Text style={styles.successMetricText}>{plan.successMetric}</Text>
          </View>
        </Surface>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          contentStyle={styles.backBtnContent}
          textColor={colors.primary}
          icon="arrow-left"
        >
          Back to Product
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const HeroStat = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.heroStat}>
    <MaterialCommunityIcons name={icon} size={ms(16)} color="rgba(255,255,255,0.5)" />
    <Text style={styles.heroStatValue}>{value}</Text>
    <Text style={styles.heroStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  hero: { padding: spacing.lg, paddingBottom: spacing.xl },
  heroLabel: { fontSize: ms(9), fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: ms(1.2), marginBottom: vs(8) },
  heroTitle: { fontSize: ms(20), fontWeight: '800', color: colors.white, lineHeight: ms(26), marginBottom: spacing.lg },
  heroStats: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg, padding: spacing.md,
  },
  heroStat: { flex: 1, alignItems: 'center', gap: ms(4) },
  heroStatValue: { fontSize: ms(18), fontWeight: '800', color: colors.white },
  heroStatLabel: { fontSize: ms(10), color: 'rgba(255,255,255,0.5)' },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  card: {
    marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.card,
  },
  cardTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  divider: { backgroundColor: colors.border, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: vs(10), borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: ms(13), color: colors.muted },
  rowValue: { fontSize: ms(13), fontWeight: '700', color: colors.primary },
  infoBlock: {},
  infoLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(0.8), marginBottom: vs(4) },
  infoValue: { fontSize: ms(14), fontWeight: '600', color: colors.primary, lineHeight: ms(22) },
  adBox: {
    backgroundColor: colors.accentSoft, borderRadius: radius.lg,
    padding: spacing.md, borderLeftWidth: ms(4), borderLeftColor: colors.accent,
    gap: spacing.sm,
  },
  adCopyText: { fontSize: ms(14), color: colors.primary, fontStyle: 'italic', lineHeight: ms(22) },
  successMetric: { marginTop: spacing.md },
  successMetricText: { fontSize: ms(14), color: colors.primary, lineHeight: ms(22), marginTop: vs(4) },
  backBtn: { marginHorizontal: spacing.lg, marginTop: spacing.md, borderRadius: radius.lg, borderColor: colors.border },
  backBtnContent: { paddingVertical: vs(4) },
});
