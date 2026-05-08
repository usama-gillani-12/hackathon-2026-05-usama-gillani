import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ProductCard } from '../components/ProductCard';
import { loadScoredProducts } from '../services/productService';
import { getUnlockedIdSet } from '../services/unlockService';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { ScoredProduct } from '../types/product';
import { formatCurrency } from '../utils/formatCurrency';

type Props = NativeStackScreenProps<RootStackParamList, 'CompareProducts'>;

const MAX_SELECTED = 3;

const COMPARE_ROWS = [
  { label: 'Score', getValue: (p: ScoredProduct) => `${p.winningScore} pts`, highlight: (p: ScoredProduct, all: ScoredProduct[]) => p.winningScore === Math.max(...all.map((x) => x.winningScore)) },
  { label: 'Rating', getValue: (p: ScoredProduct) => `${p.rating10}/10`, highlight: () => false },
  { label: 'Price', getValue: (p: ScoredProduct) => formatCurrency(p.product.price), highlight: () => false },
  { label: 'Margin', getValue: (p: ScoredProduct) => `${p.marginPercent}%`, highlight: (p: ScoredProduct, all: ScoredProduct[]) => p.marginPercent === Math.max(...all.map((x) => x.marginPercent)) },
  { label: 'Social Buzz', getValue: (p: ScoredProduct) => `${Math.round(p.scoreBreakdown.socialBuzz)}/100`, highlight: () => false },
  { label: 'Competition', getValue: (p: ScoredProduct) => `${Math.round(p.scoreBreakdown.competition)}/100`, highlight: () => false },
  { label: 'Risk', getValue: (p: ScoredProduct) => `${Math.round(p.scoreBreakdown.risk)}/100`, highlight: () => false },
  { label: 'Shipping', getValue: (p: ScoredProduct) => `${Math.round(p.scoreBreakdown.shippingEase)}/100`, highlight: () => false },
  { label: 'Verdict', getValue: (p: ScoredProduct) => p.recommendation, highlight: () => false },
];

export const CompareProductsScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialId = route.params?.initialProductId;
  const [products, setProducts] = useState<ScoredProduct[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string[]>(initialId ? [initialId] : []);
  const [loading, setLoading] = useState(true);
  const [showCompare, setShowCompare] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ products: scored }, ids] = await Promise.all([loadScoredProducts(), getUnlockedIdSet()]);
    setProducts(scored);
    setUnlocked(ids);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, id];
    });
  };

  const selectedProducts = useMemo(
    () => selected.map((id) => products.find((p) => p.product.id === id)).filter(Boolean) as ScoredProduct[],
    [selected, products],
  );

  const winner = useMemo(() => {
    if (selectedProducts.length < 2) return null;
    return selectedProducts.reduce((best, p) => (p.winningScore > best.winningScore ? p : best), selectedProducts[0]);
  }, [selectedProducts]);

  if (showCompare && selectedProducts.length >= 2) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Winner callout */}
          {winner && (
            <LinearGradient colors={gradients.success} style={styles.winnerCard}>
              <MaterialCommunityIcons name="trophy" size={ms(24)} color={colors.white} />
              <View style={{ flex: 1 }}>
                <Text style={styles.winnerLabel}>Best to Test First</Text>
                <Text style={styles.winnerTitle} numberOfLines={1}>{winner.product.title}</Text>
                <Text style={styles.winnerSub}>{winner.winningScore} pts · {winner.rating10}/10 · {winner.marginPercent}% margin</Text>
              </View>
              <Button
                mode="contained"
                compact
                onPress={() => navigation.navigate('ProductDetail', { productId: winner.product.id })}
                buttonColor="rgba(255,255,255,0.25)"
                labelStyle={{ color: colors.white, fontSize: ms(12) }}
                style={{ borderRadius: radius.md }}
              >
                Open →
              </Button>
            </LinearGradient>
          )}

          {/* Comparison table */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle}>Side-by-Side Comparison</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Product name headers */}
                <View style={styles.tableRow}>
                  <Text style={styles.metricCol}>{''}</Text>
                  {selectedProducts.map((p) => (
                    <View key={p.product.id} style={styles.valueCol}>
                      <Text style={styles.tableHeader} numberOfLines={2}>{p.product.title}</Text>
                    </View>
                  ))}
                </View>

                {COMPARE_ROWS.map((row) => (
                  <View key={row.label} style={styles.tableRow}>
                    <Text style={styles.metricLabel}>{row.label}</Text>
                    {selectedProducts.map((p) => {
                      const isWin = row.highlight(p, selectedProducts);
                      return (
                        <View key={p.product.id} style={[styles.valueCol, isWin && styles.valueColHighlight]}>
                          <Text style={[styles.valueText, isWin && styles.valueTextHighlight]}>
                            {row.getValue(p)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </Surface>

          {/* AI conclusion */}
          {winner && (
            <Surface style={styles.card} elevation={1}>
              <Text style={styles.cardTitle}>AI Conclusion</Text>
              <Text style={styles.conclusionText}>
                <Text style={styles.bold}>{winner.product.title}</Text> scored highest at {winner.winningScore} pts ({winner.rating10}/10) with {winner.marginPercent}% margin and a <Text style={styles.bold}>{winner.recommendation}</Text> signal. Start there with a 3–5 day TikTok or Meta test before scaling.
              </Text>
            </Surface>
          )}

          <View style={styles.footer}>
            <Button mode="outlined" onPress={() => setShowCompare(false)} style={styles.footerBtn} textColor={colors.primary}>
              Edit Selection
            </Button>
            {winner && (
              <Button mode="contained" onPress={() => navigation.navigate('ProductDetail', { productId: winner.product.id })} style={styles.footerBtn} buttonColor={colors.accent}>
                Open Winner
              </Button>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Surface style={styles.banner} elevation={1}>
        <Text style={styles.bannerTitle}>Pick up to 3 products</Text>
        <Text style={styles.bannerSub}>{selected.length}/{MAX_SELECTED} selected · tap a card to toggle</Text>
      </Surface>

      <FlatList
        data={products}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <ProductCard
            scored={item}
            isLocked={item.isPremium && !unlocked.has(item.product.id)}
            selectable
            selected={selected.includes(item.product.id)}
            onPress={() => toggle(item.product.id)}
          />
        )}
      />

      <View style={styles.compareFooter}>
        <Button
          mode="contained"
          onPress={() => setShowCompare(true)}
          disabled={selected.length < 2}
          style={styles.compareBtn}
          contentStyle={styles.compareBtnContent}
          labelStyle={styles.compareBtnLabel}
          buttonColor={colors.accent}
        >
          {selected.length < 2 ? `Select ${2 - selected.length} more to compare` : `Compare ${selected.length} Products`}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  banner: {
    backgroundColor: colors.card, padding: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  bannerTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary },
  bannerSub: { fontSize: ms(12), color: colors.muted, marginTop: vs(2) },
  winnerCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    margin: spacing.lg, borderRadius: radius.xl, padding: spacing.lg,
  },
  winnerLabel: { fontSize: ms(10), fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: ms(1) },
  winnerTitle: { fontSize: ms(16), fontWeight: '800', color: colors.white, marginTop: vs(2) },
  winnerSub: { fontSize: ms(12), color: 'rgba(255,255,255,0.7)', marginTop: vs(2) },
  card: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.card,
  },
  cardTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  metricCol: { width: s(100) },
  metricLabel: { width: s(100), fontSize: ms(12), fontWeight: '600', color: colors.muted },
  tableHeader: { fontSize: ms(11), fontWeight: '700', color: colors.primary, lineHeight: ms(16) },
  valueCol: { width: s(130), paddingHorizontal: spacing.sm },
  valueColHighlight: {
    backgroundColor: colors.successSoft, borderRadius: radius.sm,
  },
  valueText: { fontSize: ms(13), color: colors.muted },
  valueTextHighlight: { color: colors.success, fontWeight: '700' },
  conclusionText: { fontSize: ms(14), color: colors.muted, lineHeight: ms(22) },
  bold: { fontWeight: '700', color: colors.primary },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  footerBtn: { flex: 1, borderRadius: radius.lg },
  compareFooter: {
    padding: spacing.lg, backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  compareBtn: { borderRadius: radius.lg },
  compareBtnContent: { paddingVertical: vs(6) },
  compareBtnLabel: { fontSize: ms(15), fontWeight: '700' },
});
