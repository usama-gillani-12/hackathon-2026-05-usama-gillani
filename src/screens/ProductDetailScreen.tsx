import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { PremiumLockCard } from '../components/PremiumLockCard';
import { RecommendationBadge } from '../components/RecommendationBadge';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScoreBar } from '../components/ScoreBar';
import { findScoredProduct, loadScoredProducts } from '../services/productService';
import { generateProductInsights, generateAdCopy, GeminiInsights } from '../services/geminiService';
import { SCORE_DIMENSIONS } from '../services/scoringService';
import { generateTxHash } from '../utils/generateTxHash';
import { useCreditStore } from '../stores/useCreditStore';
import { AD_COPY_COST } from '../constants';
import { AdCopyResult, AdScript } from '../types/adCopy';
import {
  useUnlockedQuery,
  useUnlockProductMutation,
  useWatchlistQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useCreditBalanceQuery,
  queryKeys,
} from '../hooks/queries';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { ScoredProduct } from '../types/product';
import { formatCurrency } from '../utils/formatCurrency';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId } = route.params;
  const qc = useQueryClient();

  const [scored, setScored] = useState<ScoredProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<GeminiInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [adCopy, setAdCopy] = useState<AdCopyResult | null>(null);
  const [isGeneratingAdCopy, setIsGeneratingAdCopy] = useState(false);
  const [adCopyError, setAdCopyError] = useState<string | null>(null);

  const { data: unlockedSet = new Set<string>() } = useUnlockedQuery();
  const { data: watchlistItems = [] } = useWatchlistQuery();
  const { data: credits = 0 } = useCreditBalanceQuery();
  const spendCredits = useCreditStore((s) => s.spendCredits);
  const recordTransaction = useCreditStore((s) => s.recordTransaction);

  const unlockMutation = useUnlockProductMutation();
  const addToWatchlistMutation = useAddToWatchlistMutation();
  const removeFromWatchlistMutation = useRemoveFromWatchlistMutation();

  const isUnlocked = unlockedSet.has(productId);
  const inWatchlist = watchlistItems.some((w) => w.productId === productId);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        const cached = findScoredProduct(productId);
        if (cached) {
          if (active) { setScored(cached); setLoading(false); }
          return;
        }
        const { products } = await loadScoredProducts();
        if (active) {
          setScored(products.find((p) => p.product.id === productId) ?? null);
          setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [productId]),
  );

  useEffect(() => {
    if (!scored || aiInsights) return;
    let active = true;
    setAiLoading(true);
    generateProductInsights(scored).then((insights) => {
      if (active && insights) setAiInsights(insights);
      if (active) setAiLoading(false);
    });
    return () => { active = false; };
  }, [scored]);

  const onUnlock = () => {
    if (!scored) return;
    unlockMutation.mutate(
      { productId: scored.product.id, productTitle: scored.product.title, cost: scored.unlockCost },
      {
        onError: (_, vars) => {
          Alert.alert('Not enough credits', `You need ${vars.cost} credits but have ${credits}.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Buy Credits', onPress: () => navigation.navigate('BuyCredits' as any) },
          ]);
        },
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: queryKeys.creditBalance });
        },
      },
    );
  };

  const toggleWatchlist = () => {
    if (!scored) return;
    if (inWatchlist) {
      removeFromWatchlistMutation.mutate(scored.product.id);
    } else {
      addToWatchlistMutation.mutate({ productId: scored.product.id, status: 'Watching' });
    }
  };

  const handleGenerateAdCopy = async () => {
    if (!scored || credits < AD_COPY_COST) return;
    setIsGeneratingAdCopy(true);
    setAdCopyError(null);

    // generateAdCopy always returns a result (Gemini or smart fallback)
    const result = await generateAdCopy(scored);

    // Deduct the credit — generation always succeeds now
    const ok = await spendCredits(AD_COPY_COST);
    if (!ok) {
      setAdCopyError('insufficient-credits');
      setIsGeneratingAdCopy(false);
      return;
    }

    // Record the spend — matches unlockService.ts pattern (usdcAmount:0, network:'mock')
    const txHash = generateTxHash();
    await recordTransaction({
      id: txHash,
      type: 'unlock',
      credits: -AD_COPY_COST,
      usdcAmount: 0,
      txHash,
      status: 'confirmed',
      createdAt: Date.now(),
      productId: scored.product.id,
      productTitle: scored.product.title,
      network: 'mock',
    });

    // Refresh credit balance badge in tab bar and this screen
    qc.invalidateQueries({ queryKey: queryKeys.creditBalance });

    setAdCopy(result);
    setIsGeneratingAdCopy(false);
  };

  if (loading || !scored) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="loading" size={ms(32)} color={colors.accent} />
      </View>
    );
  }

  const isLocked = scored.isPremium && !isUnlocked;
  const images = scored.product.images.length > 0 ? scored.product.images : [scored.product.thumbnail];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          style={styles.carousel}
          renderItem={({ item }) => (
            <View style={[styles.imageWrap, { width: width - spacing.lg * 2 }]}>
              <Image source={{ uri: item }} style={styles.image} />
            </View>
          )}
        />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: spacing.md }}>
            <Text style={styles.category}>
              {scored.product.category.toUpperCase()}{scored.product.brand ? ` · ${scored.product.brand}` : ''}
            </Text>
            <Text style={styles.title}>{isLocked ? blurTitle(scored.product.title) : scored.product.title}</Text>
            <View style={styles.badgeRow}>
              <RecommendationBadge recommendation={scored.recommendation} />
              {scored.isPremium && (
                <LinearGradient colors={gradients.premium} style={styles.premiumChip} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <MaterialCommunityIcons name="diamond" size={ms(10)} color={colors.white} />
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </LinearGradient>
              )}
              {scored.product.source === 'amazon' && (
                <View style={styles.amazonChip}>
                  <MaterialCommunityIcons name="amazon" size={ms(10)} color={colors.white} />
                  <Text style={styles.amazonChipText}>Amazon</Text>
                </View>
              )}
            </View>
            {scored.product.source === 'amazon' && (
              <View style={styles.amazonMetaRow}>
                {scored.product.salesRank != null && (
                  <Text style={styles.amazonMeta}>#{scored.product.salesRank} in {scored.product.category}</Text>
                )}
                {scored.product.salesVolume && (
                  <Text style={styles.amazonMeta}>{scored.product.salesVolume}</Text>
                )}
                {scored.product.asin ? (
                  <Text style={styles.amazonAsin}>ASIN: {scored.product.asin}</Text>
                ) : null}
              </View>
            )}
          </View>
          <ScoreBadge score={scored.winningScore} rating10={scored.rating10} size="lg" />
        </View>

        {/* Premium lock */}
        {isLocked && (
          <PremiumLockCard
            cost={scored.unlockCost}
            balance={credits}
            rating10={scored.rating10}
            reason={scored.premiumReason}
            onUnlock={onUnlock}
            onBuyCredits={() => navigation.navigate('BuyCredits' as any)}
            style={{ marginTop: spacing.lg }}
          />
        )}

        {/* Pricing */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardTitle}>Pricing & Profit</Text>
          <View style={styles.priceGrid}>
            <PriceCell label="List Price" value={formatCurrency(scored.product.price)} />
            <PriceCell label="Suggested Price" value={formatCurrency(scored.suggestedPrice)} highlight />
            <PriceCell label="Est. Cost" value={formatCurrency(scored.estimatedCost)} />
            <PriceCell label="Margin" value={`${scored.marginPercent}%`} highlight />
          </View>
          {isLocked && <LockedOverlay message="Pricing details locked" />}
        </Surface>

        {/* Score breakdown */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Score Breakdown</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ScoreBreakdown', { productId: scored.product.id })}>
              <Text style={styles.seeAll}>Full breakdown →</Text>
            </TouchableOpacity>
          </View>
          {SCORE_DIMENSIONS.slice(0, 4).map((dim) => (
            <ScoreBar key={dim.key} label={dim.label} value={scored.scoreBreakdown[dim.key]} inverted={dim.inverted} helper={dim.explainer} />
          ))}
        </Surface>

        {/* Unlocked content */}
        {!isLocked ? (
          <>
            {/* AI Summary */}
            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <View style={styles.aiIconWrap}>
                  <MaterialCommunityIcons name="brain" size={ms(16)} color={colors.accent} />
                </View>
                <Text style={styles.aiTitle}>AI Market Analysis</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              </View>
              {aiLoading ? (
                <ActivityIndicator color={colors.accent} style={{ marginTop: vs(4) }} />
              ) : (
                <Text style={styles.aiBody}>{aiInsights?.aiSummary ?? scored.aiSummary}</Text>
              )}
            </View>

            {/* Why Trending */}
            <Surface style={styles.card} elevation={1}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightIcon, { backgroundColor: colors.warningSoft }]}>
                  <MaterialCommunityIcons name="fire" size={ms(14)} color={colors.warning} />
                </View>
                <Text style={styles.cardTitle}>Why It's Trending</Text>
              </View>
              {aiLoading ? (
                <ActivityIndicator color={colors.warning} style={{ marginVertical: vs(6) }} />
              ) : (
                <Text style={styles.bodyText}>{aiInsights?.whyTrending ?? scored.whyTrending}</Text>
              )}
            </Surface>

            {/* Risks */}
            <Surface style={styles.card} elevation={1}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightIcon, { backgroundColor: colors.dangerSoft }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={ms(14)} color={colors.danger} />
                </View>
                <Text style={styles.cardTitle}>Risks to Watch</Text>
              </View>
              {aiLoading ? (
                <ActivityIndicator color={colors.danger} style={{ marginVertical: vs(6) }} />
              ) : (
                <Text style={styles.bodyText}>{aiInsights?.risksToWatch ?? scored.risksToWatch}</Text>
              )}
            </Surface>

            {/* Audience & Angle */}
            <Surface style={styles.card} elevation={1}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightIcon, { backgroundColor: colors.premiumSoft }]}>
                  <MaterialCommunityIcons name="bullhorn-outline" size={ms(14)} color={colors.premium} />
                </View>
                <Text style={styles.cardTitle}>Audience & Ad Angle</Text>
              </View>
              <View style={styles.insightBlock}>
                <Text style={styles.metaLabel}>TARGET AUDIENCE</Text>
                {aiLoading ? (
                  <ActivityIndicator color={colors.premium} style={{ marginTop: vs(4) }} />
                ) : (
                  <Text style={styles.metaValue}>{aiInsights?.bestAudience ?? scored.bestAudience}</Text>
                )}
              </View>
              <View style={styles.insightBlock}>
                <Text style={styles.metaLabel}>BEST AD ANGLE</Text>
                {aiLoading ? (
                  <ActivityIndicator color={colors.premium} style={{ marginTop: vs(4) }} />
                ) : (
                  <Text style={[styles.metaValue, styles.adAngle]}>{aiInsights?.bestAdAngle ?? scored.bestAdAngle}</Text>
                )}
              </View>
              <View style={styles.insightBlock}>
                <Text style={styles.metaLabel}>PLATFORMS</Text>
                <View style={styles.platformRow}>
                  {scored.suggestedPlatforms.map((p) => (
                    <View key={p} style={styles.platformChip}>
                      <Text style={styles.platformChipText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Surface>

            {/* ── AI Ad Copy Generator ─────────────────────────────────── */}
            <View style={styles.aiCard}>
              {/* Header */}
              <View style={styles.aiHeader}>
                <View style={styles.aiIconWrap}>
                  <MaterialCommunityIcons name="lightning-bolt" size={ms(16)} color={colors.accent} />
                </View>
                <Text style={styles.aiTitle}>AI Ad Copy</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              </View>

              {/* State A — not yet generated */}
              {!adCopy && !isGeneratingAdCopy && adCopyError !== 'generation-failed' && (
                credits >= AD_COPY_COST ? (
                  <TouchableOpacity
                    onPress={handleGenerateAdCopy}
                    style={styles.adCopyGenBtn}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={gradients.premium}
                      style={styles.adCopyGenBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MaterialCommunityIcons name="robot-outline" size={ms(18)} color={colors.white} />
                      <Text style={styles.adCopyGenBtnText}>Generate Ad Scripts</Text>
                      <View style={styles.adCopyCostPill}>
                        <MaterialCommunityIcons name="lightning-bolt" size={ms(10)} color={colors.accent} />
                        <Text style={styles.adCopyCostPillText}>{AD_COPY_COST} credit</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.adCopyInsufficientWrap}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={ms(16)} color={colors.warning} />
                    <Text style={styles.adCopyInsufficientText}>
                      You need {AD_COPY_COST} credit to generate ad scripts. Top up to unlock this feature.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('BuyCredits' as any)}>
                      <Text style={styles.adCopyBuyLink}>Buy Credits →</Text>
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* State B — loading */}
              {isGeneratingAdCopy && (
                <View style={styles.adCopyLoadingWrap}>
                  <ActivityIndicator color={colors.accent} size="small" />
                  <Text style={styles.adCopyLoadingText}>Crafting your ad scripts…</Text>
                </View>
              )}

              {/* State C — generation failed (retry does NOT re-charge) */}
              {adCopyError === 'generation-failed' && !isGeneratingAdCopy && (
                <View style={styles.adCopyErrorWrap}>
                  <MaterialCommunityIcons name="wifi-alert" size={ms(18)} color={colors.danger} />
                  <Text style={styles.adCopyErrorText}>
                    Could not reach the AI service. No credits were charged — tap to try again.
                  </Text>
                  <TouchableOpacity
                    onPress={async () => {
                      setIsGeneratingAdCopy(true);
                      setAdCopyError(null);
                      const result = await generateAdCopy(scored);
                      if (result) { setAdCopy(result); }
                      else { setAdCopyError('generation-failed'); }
                      setIsGeneratingAdCopy(false);
                    }}
                  >
                    <Text style={styles.adCopyRetryLink}>Retry →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* State D — scripts ready */}
              {adCopy && !isGeneratingAdCopy && (
                <View style={styles.adScriptsWrap}>
                  {adCopy.scripts.map((script) => (
                    <AdScriptCard key={script.platform} script={script} />
                  ))}
                </View>
              )}
            </View>
            {/* ── end AI Ad Copy ──────────────────────────────────────── */}
          </>
        ) : (
          <View style={styles.aiLockedCard}>
            <MaterialCommunityIcons name="lock" size={ms(28)} color={colors.accent} />
            <Text style={styles.aiLockedTitle}>Premium Insights Locked</Text>
            <Text style={styles.aiLockedBody}>
              Unlock to reveal AI market analysis, trending signals, risk factors, target audience, ad copy, and platform recommendations.
            </Text>
            <View style={styles.aiLockedFeatures}>
              {['AI Market Analysis', 'Ad Copy & Angles', 'Target Audience', 'Risk Report'].map((f) => (
                <View key={f} style={styles.aiLockedFeature}>
                  <MaterialCommunityIcons name="lock-outline" size={ms(12)} color={colors.accent} />
                  <Text style={styles.aiLockedFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity onPress={toggleWatchlist} activeOpacity={0.85} style={styles.watchlistBtn}>
            <MaterialCommunityIcons
              name={inWatchlist ? 'star' : 'star-outline'}
              size={ms(18)}
              color={inWatchlist ? colors.warning : colors.primary}
            />
            <Text style={[styles.watchlistBtnText, inWatchlist && { color: colors.warning }]}>
              {inWatchlist ? 'Saved to Watchlist' : 'Save to Watchlist'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('CompareProducts', { initialProductId: scored.product.id })}
              style={styles.halfBtn}
              activeOpacity={0.8}
            >
              <View style={styles.halfBtnInner}>
                <MaterialCommunityIcons name="scale-balance" size={ms(16)} color={colors.accent} />
                <Text style={styles.halfBtnText}>Compare</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ProductTestPlan', { productId: scored.product.id })}
              disabled={isLocked}
              style={[styles.halfBtn, isLocked && styles.halfBtnDisabled,{marginBottom:3}]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLocked ? [colors.mutedSoft, colors.mutedSoft] : gradients.success}
                style={styles.halfBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={ms(16)}
                  color={isLocked ? colors.muted : colors.white}
                />
                <Text style={[styles.halfBtnText, { color: isLocked ? colors.muted : colors.white }]}>
                  Test Plan
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {unlockMutation.isPending && (
            <Text style={styles.unlockingText}>Confirming unlock…</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Ad Copy sub-components ───────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  TikTok: { icon: 'music-note',  color: colors.danger,    label: 'TikTok' },
  Meta:   { icon: 'facebook',    color: colors.metaBlue,  label: 'Meta'   },
  Google: { icon: 'google',      color: colors.success,   label: 'Google' },
};

const AdScriptCard = ({ script }: { script: AdScript }) => {
  const cfg = PLATFORM_CONFIG[script.platform] ?? PLATFORM_CONFIG.TikTok;

  const handleShare = () => {
    Share.share({
      message: `${script.headline}\n\n${script.body}\n\nCTA: ${script.cta}`,
      title: `${script.platform} Ad Script`,
    });
  };

  return (
    <View style={[styles.adScriptCard, { borderLeftColor: cfg.color }]}>
      <View style={styles.adScriptHeader}>
        <View style={[styles.adScriptIconWrap, { backgroundColor: cfg.color + '22' }]}>
          <MaterialCommunityIcons name={cfg.icon} size={ms(14)} color={cfg.color} />
        </View>
        <Text style={styles.adScriptPlatform}>{cfg.label}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.adScriptShareBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="share-outline" size={ms(16)} color={colors.accent} />
        </TouchableOpacity>
      </View>
      <Text style={styles.adScriptHeadline}>{script.headline}</Text>
      <Text style={styles.adScriptBody}>{script.body}</Text>
      <View style={styles.adScriptCtaRow}>
        <MaterialCommunityIcons name="arrow-right-circle-outline" size={ms(14)} color={colors.accent} />
        <Text style={styles.adScriptCta}>{script.cta}</Text>
      </View>
    </View>
  );
};

function blurTitle(title: string): string {
  const parts = title.split(' ');
  if (parts.length === 1) return parts[0] + ' ••••••';
  return parts[0] + ' ' + parts.slice(1).map((w) => '•'.repeat(Math.max(3, Math.min(8, w.length)))).join(' ');
}

const PriceCell = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <View style={styles.priceCell}>
    <Text style={styles.priceCellLabel}>{label.toUpperCase()}</Text>
    <Text style={[styles.priceCellValue, highlight && { color: colors.success }]}>{value}</Text>
  </View>
);

const LockedOverlay = ({ message }: { message: string }) => (
  <View style={styles.locked}>
    <MaterialCommunityIcons name="lock-outline" size={ms(20)} color={colors.muted} />
    <Text style={styles.lockedText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  carousel: { marginHorizontal: -spacing.lg, marginBottom: spacing.lg },
  imageWrap: {
    height: vs(220), borderRadius: radius.xxl, overflow: 'hidden',
    backgroundColor: colors.mutedSoft, marginHorizontal: spacing.sm,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg },
  category: { fontSize: ms(10), fontWeight: '700', color: colors.textCaption, letterSpacing: ms(0.8) },
  title: { fontSize: ms(24), fontWeight: '800', color: colors.primary, marginTop: vs(4), lineHeight: ms(30) },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: ms(8), marginTop: spacing.sm },
  premiumChip: {
    flexDirection: 'row', alignItems: 'center', gap: ms(4),
    borderRadius: radius.pill, paddingHorizontal: s(10), paddingVertical: vs(4),
  },
  premiumText: { color: colors.white, fontSize: ms(9), fontWeight: '800', letterSpacing: ms(1) },
  amazonChip: {
    flexDirection: 'row', alignItems: 'center', gap: ms(4),
    backgroundColor: '#FF9900', borderRadius: radius.pill,
    paddingHorizontal: s(10), paddingVertical: vs(4),
  },
  amazonChipText: { color: colors.white, fontSize: ms(9), fontWeight: '800' },
  amazonMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(12), marginTop: vs(6) },
  amazonMeta: { fontSize: ms(11), fontWeight: '600', color: colors.success },
  amazonAsin: { fontSize: ms(11), color: colors.muted },
  card: {
    borderRadius: radius.xxl, backgroundColor: colors.card,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  cardTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  seeAll: { fontSize: ms(12), color: colors.accent, fontWeight: '600' },
  priceGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  priceCell: { width: '50%', paddingVertical: spacing.sm },
  priceCellLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(0.8) },
  priceCellValue: { fontSize: ms(20), fontWeight: '800', color: colors.primary, marginTop: vs(2) },
  bodyText: { fontSize: ms(14), color: colors.muted, lineHeight: ms(22) },
  metaLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(0.8), marginBottom: vs(4) },
  metaValue: { fontSize: ms(14), fontWeight: '600', color: colors.primary },
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: ms(6), marginTop: vs(6) },
  platformChip: {
    backgroundColor: colors.mutedSoft,
    borderRadius: radius.pill,
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformChipText: { fontSize: ms(12), fontWeight: '600', color: colors.primary },
  locked: {
    flexDirection: 'row', alignItems: 'center', gap: ms(8),
    backgroundColor: colors.mutedSoft, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.sm,
  },
  lockedText: { fontSize: ms(13), color: colors.muted, flex: 1 },

  // AI card (unlocked)
  aiCard: {
    borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.06,
    shadowRadius: ms(12),
    elevation: 2,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: ms(8), marginBottom: vs(10) },
  aiIconWrap: {
    width: ms(28), height: ms(28), borderRadius: radius.md,
    backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center',
  },
  aiTitle: { color: colors.textPrimary, fontSize: ms(15), fontWeight: '800', flex: 1 },
  aiBadge: {
    backgroundColor: colors.accentSubtle, borderRadius: radius.pill,
    paddingHorizontal: s(8), paddingVertical: vs(2),
  },
  aiBadgeText: { color: colors.accent, fontSize: ms(9), fontWeight: '900', letterSpacing: 0.5 },
  aiBody: { color: colors.textCaption, fontSize: ms(14), lineHeight: ms(22) },

  // AI locked card
  aiLockedCard: {
    borderRadius: radius.xxl, padding: spacing.xl, marginBottom: spacing.md,
    alignItems: 'center', gap: ms(10),
    backgroundColor: colors.surfaceVariant,
  },
  aiLockedTitle: { color: colors.textPrimary, fontSize: ms(18), fontWeight: '800' },
  aiLockedBody: { color: colors.textCaption, fontSize: ms(13), textAlign: 'center', lineHeight: ms(20) },
  aiLockedFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), justifyContent: 'center', marginTop: vs(4) },
  aiLockedFeature: {
    flexDirection: 'row', alignItems: 'center', gap: s(4),
    backgroundColor: colors.accentSubtle, borderRadius: radius.pill,
    paddingHorizontal: s(10), paddingVertical: vs(5),
  },
  aiLockedFeatureText: { color: colors.accentHover, fontSize: ms(12), fontWeight: '600' },

  // Insight sections
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: ms(10), marginBottom: vs(10) },
  insightIcon: { width: ms(28), height: ms(28), borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  insightBlock: { marginBottom: spacing.md },
  adAngle: { color: colors.accent, fontStyle: 'italic' },

  // Actions
  actionsWrap: { gap: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  watchlistBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ms(8),
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.card, paddingVertical: vs(13),
  },
  watchlistBtnText: { fontSize: ms(15), fontWeight: '700', color: colors.primary },
  halfBtn: { flex: 1, borderRadius: radius.pill, overflow: 'hidden' },
  halfBtnDisabled: { opacity: 0.5 },
  halfBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ms(6),
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.card, paddingVertical: vs(13),
  },
  halfBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: ms(6), paddingVertical: vs(13),
  },
  halfBtnText: { fontSize: ms(14), fontWeight: '700', color: colors.primary },
  actionBtn: { borderRadius: radius.lg, flex: 1 },
  actionBtnContent: { paddingVertical: vs(4) },
  unlockingText: { fontSize: ms(12), color: colors.muted, textAlign: 'center' },

  // ─── AI Ad Copy Generator ────────────────────────────────────────────────────
  adCopyGenBtn: {
    marginTop: vs(10),
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  adCopyGenBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    paddingVertical: vs(14),
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  adCopyGenBtnText: {
    color: colors.white,
    fontSize: ms(15),
    fontWeight: '700',
    flex: 1,
  },
  adCopyCostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },
  adCopyCostPillText: {
    color: colors.white,
    fontSize: ms(11),
    fontWeight: '700',
  },
  adCopyLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    paddingVertical: vs(16),
    justifyContent: 'center',
  },
  adCopyLoadingText: {
    color: colors.textCaption,
    fontSize: ms(13),
    fontStyle: 'italic',
  },
  adCopyInsufficientWrap: {
    gap: ms(6),
    paddingTop: vs(10),
  },
  adCopyInsufficientText: {
    color: colors.textCaption,
    fontSize: ms(13),
    lineHeight: ms(20),
  },
  adCopyBuyLink: {
    color: colors.accent,
    fontSize: ms(13),
    fontWeight: '700',
  },
  adCopyErrorWrap: {
    gap: ms(6),
    paddingTop: vs(10),
  },
  adCopyErrorText: {
    color: colors.textCaption,
    fontSize: ms(13),
    lineHeight: ms(20),
  },
  adCopyRetryLink: {
    color: colors.danger,
    fontSize: ms(13),
    fontWeight: '700',
  },
  adScriptsWrap: {
    gap: ms(10),
    marginTop: vs(12),
  },

  // ─── AdScriptCard ────────────────────────────────────────────────────────────
  adScriptCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderLeftWidth: ms(3),
    padding: spacing.lg,
    gap: ms(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: ms(1) },
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    elevation: 1,
  },
  adScriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginBottom: vs(6),
  },
  adScriptIconWrap: {
    width: ms(26),
    height: ms(26),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adScriptPlatform: {
    color: colors.textPrimary,
    fontSize: ms(12),
    fontWeight: '800',
    letterSpacing: ms(0.5),
    flex: 1,
  },
  adScriptShareBtn: {
    padding: ms(4),
  },
  adScriptHeadline: {
    color: colors.textPrimary,
    fontSize: ms(15),
    fontWeight: '800',
    lineHeight: ms(22),
  },
  adScriptBody: {
    color: colors.textCaption,
    fontSize: ms(13),
    lineHeight: ms(21),
  },
  adScriptCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    marginTop: vs(4),
  },
  adScriptCta: {
    color: colors.accent,
    fontSize: ms(13),
    fontWeight: '700',
    fontStyle: 'italic',
  },
});
