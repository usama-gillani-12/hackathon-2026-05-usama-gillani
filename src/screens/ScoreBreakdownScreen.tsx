import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScoreBar } from '../components/ScoreBar';
import { findScoredProduct, loadScoredProducts } from '../services/productService';
import { SCORE_DIMENSIONS } from '../services/scoringService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, vs } from '../theme/responsive';
import { ScoredProduct } from '../types/product';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreBreakdown'>;

const RECOMMENDATION_INFO = {
  'Test Now': { icon: 'rocket-launch', color: colors.success, message: 'Move fast — fundamentals are strong across demand and margin.' },
  'Watch Closely': { icon: 'eye-outline', color: colors.warning, message: 'Strong signals but worth one more validation pass before scaling.' },
  'Research More': { icon: 'magnify', color: colors.accent, message: 'Mixed signals — consider sourcing or audience tweaks.' },
  'Avoid for Now': { icon: 'close-circle-outline', color: colors.danger, message: 'High risk for the expected return — likely better options elsewhere.' },
};

export const ScoreBreakdownScreen: React.FC<Props> = ({ route }) => {
  const { productId } = route.params;
  const [scored, setScored] = useState<ScoredProduct | null>(null);

  useEffect(() => {
    (async () => {
      const cached = findScoredProduct(productId);
      if (cached) { setScored(cached); return; }
      const { products } = await loadScoredProducts();
      setScored(products.find((p) => p.product.id === productId) ?? products[0] ?? null);
    })();
  }, [productId]);

  if (!scored) return null;

  const recInfo = RECOMMENDATION_INFO[scored.recommendation];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[colors.heroDark, colors.heroMid]} style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>WINNING SCORE METHODOLOGY</Text>
            <Text style={styles.heroTitle} numberOfLines={2}>{scored.product.title}</Text>
            <Text style={styles.heroFormula}>
              Demand×0.25 + Buzz×0.20 + Profit×0.20 + Rating×0.15 + Shipping×0.10 + Competition×0.05 + Risk×0.05
            </Text>
          </View>
          <ScoreBadge score={scored.winningScore} rating10={scored.rating10} size="lg" />
        </LinearGradient>

        {/* Recommendation banner */}
        <View style={[styles.recBanner, { backgroundColor: `${recInfo.color}18`, borderColor: `${recInfo.color}40` }]}>
          <MaterialCommunityIcons name={recInfo.icon} size={ms(20)} color={recInfo.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.recLabel, { color: recInfo.color }]}>{scored.recommendation}</Text>
            <Text style={styles.recMessage}>{recInfo.message}</Text>
          </View>
        </View>

        {/* Score breakdown */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>All 7 Dimensions</Text>
          {SCORE_DIMENSIONS.map((dim) => (
            <ScoreBar
              key={dim.key}
              label={dim.label}
              value={scored.scoreBreakdown[dim.key]}
              inverted={dim.inverted}
              helper={dim.explainer}
            />
          ))}
        </Surface>

        {/* Interpretation */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>What This Means</Text>
          <Text style={styles.bodyText}>
            Rated <Text style={styles.bold}>{scored.rating10}/10</Text> with <Text style={styles.bold}>{scored.winningScore} weighted points</Text>. Recommendation: <Text style={[styles.bold, { color: recInfo.color }]}>{scored.recommendation}</Text>.
          </Text>
          <Text style={[styles.bodyText, { marginTop: spacing.sm }]}>{recInfo.message}</Text>
          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              {scored.winningScore >= 85 ? 'Top 10% of all products scanned this session.' : scored.winningScore >= 70 ? 'Above average — strong fundamentals across most dimensions.' : scored.winningScore >= 55 ? 'Average performance — a few dimensions need improvement.' : 'Below average — consider other products before investing.'}
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: spacing.lg, gap: spacing.md,
  },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: ms(9), fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: ms(1.2), marginBottom: vs(6) },
  heroTitle: { fontSize: ms(18), fontWeight: '800', color: colors.white, lineHeight: ms(24), marginBottom: vs(8) },
  heroFormula: { fontSize: ms(10), color: 'rgba(255,255,255,0.4)', lineHeight: ms(16) },
  recBanner: {
    flexDirection: 'row', alignItems: 'center', gap: ms(12),
    marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm,
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  recLabel: { fontSize: ms(14), fontWeight: '800', marginBottom: vs(2) },
  recMessage: { fontSize: ms(12), color: colors.muted, lineHeight: ms(18) },
  card: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.card,
  },
  cardTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  bodyText: { fontSize: ms(14), color: colors.muted, lineHeight: ms(22) },
  bold: { fontWeight: '700', color: colors.primary },
  highlight: {
    marginTop: spacing.md, backgroundColor: colors.accentSoft,
    borderRadius: radius.md, padding: spacing.md,
  },
  highlightText: { fontSize: ms(13), color: colors.accent, fontWeight: '600' },
});
