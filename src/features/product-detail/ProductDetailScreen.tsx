import React from 'react';
import {
  ActivityIndicator, FlatList, Image,
  Platform, ScrollView, Share, StyleSheet, TouchableOpacity,
  View,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { PremiumLockCard } from '@shared/components/premium-lock-card';
import { RecommendationBadge } from '@shared/components/recommendation-badge';
import { ScoreBadge } from '@shared/components/score-badge';
import { ScoreBar } from '@shared/components/score-bar';
import { AppText } from '@shared/components/app-text';
import { SCORE_DIMENSIONS } from '@core/services/scoringService';
import { AD_COPY_COST } from '@constants';
import { AdScript } from '@t/adCopy';
import { colors, gradients } from '@theme/colors';
import { radius, spacing, shadow } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';
import { formatCurrency } from '@utils/formatCurrency';
import { hapticLight, hapticMedium } from '@utils/haptics';
import { generateAdCopy } from '@core/services/geminiService';
import { useProductDetail } from './ProductDetail.hooks';
import { styles } from './ProductDetail.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    width,
    scored,
    loading,
    aiInsights,
    aiLoading,
    adCopy,
    setAdCopy,
    isGeneratingAdCopy,
    setIsGeneratingAdCopy,
    adCopyError,
    setAdCopyError,
    carouselIndex,
    credits,
    isUnlocked,
    inWatchlist,
    unlockMutation,
    onUnlock,
    toggleWatchlist,
    handleShareProduct,
    handleBackPress,
    onCarouselScroll,
    handleGenerateAdCopy,
  } = useProductDetail({ navigation, route });

  if (loading || !scored) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isLocked = scored.isPremium && !isUnlocked;
  const images = scored.product.images.length > 0 ? scored.product.images : [scored.product.thumbnail];
  const carouselWidth = width;

  return (
    <View style={styles.safe}>
      {/* ── Floating top bar (back + share) ── */}
      <View style={[styles.topBar, ]} pointerEvents="box-none">
        <FloatingIconBtn icon="chevron-left" onPress={handleBackPress} />
        <FloatingIconBtn
          icon={inWatchlist ? 'star' : 'star-outline'}
          onPress={toggleWatchlist}
          tint={inWatchlist ? colors.warning : undefined}
        />
        <View style={{ flex: 1 }} />
        <FloatingIconBtn icon="share-variant-outline" onPress={handleShareProduct} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero image carousel — full bleed ── */}
        <View style={styles.heroCarousel}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri, i) => `${uri}-${i}`}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={[styles.heroImageWrap, { width: carouselWidth }]}>
                <Image source={{ uri: item }} style={styles.heroImage} />
              </View>
            )}
          />

          {/* Top scrim — improves contrast against status bar / floating buttons */}
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'transparent']}
            style={styles.heroTopScrim}
            pointerEvents="none"
          />

          {/* Bottom scrim — fades hero into content */}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.heroBottomScrim}
            pointerEvents="none"
          />

          {/* Image counter pill (bottom-left) */}
          {images.length > 1 && (
            <View style={styles.counterPill}>
              <AppText variant="caption2" color={colors.white} tabular>
                {carouselIndex + 1} / {images.length}
              </AppText>
            </View>
          )}

          {/* Score chip (bottom-right) */}
          <View style={styles.heroScoreChip}>
            <ScoreBadge score={scored.winningScore} rating10={scored.rating10} size="lg" />
          </View>
        </View>

        {/* ── Header content ── */}
        <View style={styles.headerSection}>
          <AppText variant="caption2" color={colors.textCaption} uppercase style={styles.category}>
            {scored.product.category}{scored.product.brand ? ` · ${scored.product.brand}` : ''}
          </AppText>
          <AppText variant="title1" color={colors.textPrimary} style={styles.title}>
            {isLocked ? blurTitle(scored.product.title) : scored.product.title}
          </AppText>

          <View style={styles.badgeRow}>
            <RecommendationBadge recommendation={scored.recommendation} />
            {scored.isPremium && (
              <LinearGradient
                colors={gradients.premium}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.premiumChip}
              >
                <MaterialCommunityIcons name="diamond" size={ms(10)} color={colors.white} />
                <AppText variant="caption2" color={colors.white} uppercase style={styles.premiumText}>Premium</AppText>
              </LinearGradient>
            )}
            {scored.product.source === 'amazon' && (
              <View style={styles.amazonChip}>
                <MaterialCommunityIcons name="amazon" size={ms(10)} color={colors.white} />
                <AppText variant="caption2" color={colors.white} uppercase style={styles.amazonChipText}>Amazon</AppText>
              </View>
            )}
          </View>

          {scored.product.source === 'amazon' && (
            <View style={styles.amazonMetaRow}>
              {scored.product.salesRank != null && (
                <AppText variant="footnote" color={colors.success} tabular>
                  #{scored.product.salesRank} in {scored.product.category}
                </AppText>
              )}
              {scored.product.salesVolume && (
                <AppText variant="footnote" color={colors.success}>{scored.product.salesVolume}</AppText>
              )}
              {scored.product.asin ? (
                <AppText variant="footnote" color={colors.muted} tabular>ASIN: {scored.product.asin}</AppText>
              ) : null}
            </View>
          )}
        </View>

        {/* Premium lock */}
        {isLocked && (
          <PremiumLockCard
            cost={scored.unlockCost}
            balance={credits}
            rating10={scored.rating10}
            reason={scored.premiumReason}
            onUnlock={onUnlock}
            onBuyCredits={() => { hapticLight(); navigation.navigate('BuyCredits' as any); }}
            style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}
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
            <AppText variant="headline" color={colors.textPrimary} style={styles.cardTitle}>Score Breakdown</AppText>
            <TouchableOpacity
              onPress={() => { hapticLight(); navigation.navigate('ScoreBreakdown', { productId: scored.product.id }); }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <AppText variant="footnote" color={colors.accent} style={styles.seeAll}>Full breakdown →</AppText>
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
                    onPress={() => { hapticMedium(); handleGenerateAdCopy(); }}
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
                    <TouchableOpacity onPress={() => { hapticLight(); navigation.navigate('BuyCredits' as any); }}>
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
                      hapticMedium();
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
        <View style={[styles.actionsWrap,]}>
          <TouchableOpacity onPress={toggleWatchlist} style={[styles.watchlistBtn,{}]}>
            <MaterialCommunityIcons
              name={inWatchlist ? 'star' : 'star-outline'}
              size={ms(18)}
              color={inWatchlist ? colors.warning : colors.primary}
            />
            <AppText
              variant="callout"
              color={inWatchlist ? colors.warning : colors.primary}
              style={styles.watchlistBtnText}
            >
              {inWatchlist ? 'Saved to Watchlist' : 'Save to Watchlist'}
            </AppText>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <SpringTouchable
              onPress={() => { hapticLight(); navigation.navigate('CompareProducts', { initialProductId: scored.product.id }); }}
              style={styles.halfBtn}
            >
              <View style={styles.halfBtnInner}>
                <MaterialCommunityIcons name="scale-balance" size={ms(16)} color={colors.accent} />
                <AppText variant="callout" color={colors.primary} style={styles.halfBtnText}>Compare</AppText>
              </View>
            </SpringTouchable>

            <SpringTouchable
              onPress={() => { hapticMedium(); navigation.navigate('ProductTestPlan', { productId: scored.product.id }); }}
              disabled={isLocked}
              style={[styles.halfBtn, isLocked && styles.halfBtnDisabled,]}
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
                <AppText
                  variant="callout"
                  color={isLocked ? colors.muted : colors.white}
                  style={styles.halfBtnText}
                >
                  Test Plan
                </AppText>
              </LinearGradient>
            </SpringTouchable>
          </View>

          {unlockMutation.isPending && (
            <Text style={styles.unlockingText}>Confirming unlock…</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Floating icon button (back / share) — BlurView pill ─────────────────────

const FloatingIconBtn: React.FC<{
  icon: string;
  onPress: () => void;
  tint?: string;
}> = ({ icon, onPress, tint }) => {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={aStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 12, stiffness: 320 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 280 }); }}
        activeOpacity={0.85}
        style={floatBtn.outer}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            blurType="dark"
            blurAmount={16}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.55)"
            style={floatBtn.fill}
          >
            <MaterialCommunityIcons name={icon} size={ms(20)} color={tint ?? colors.white} />
          </BlurView>
        ) : (
          <View style={[floatBtn.fill, floatBtn.androidFill]}>
            <MaterialCommunityIcons name={icon} size={ms(20)} color={tint ?? colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const floatBtn = StyleSheet.create({
  outer: {
    width: ms(38), height: ms(38), borderRadius: ms(19),
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    ...shadow.sm,
  },
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  androidFill: { backgroundColor: 'rgba(0,0,0,0.55)' },
});

// ─── Spring-press wrapper for action buttons ─────────────────────────────────

const SpringTouchable: React.FC<{
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  children: React.ReactNode;
}> = ({ onPress, disabled, style, children }) => {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[aStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 14, stiffness: 320 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 280 }); }}
        disabled={disabled}
        activeOpacity={0.88}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
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
