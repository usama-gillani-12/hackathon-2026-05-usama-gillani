import React, { useEffect } from 'react';
import { Image, Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, gradients } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { ScoredProduct } from '../types/product';
import { formatCurrency } from '../utils/formatCurrency';
import { hapticLight } from '../utils/haptics';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { RecommendationBadge } from './RecommendationBadge';

interface Props {
  scored: ScoredProduct;
  isLocked: boolean;
  onPress?: () => void;
  onAction?: () => void;
  style?: ViewStyle;
  selected?: boolean;
  selectable?: boolean;
}

function getTrendColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 65) return colors.accent;
  if (score >= 50) return colors.warning;
  return colors.muted;
}

function getTrendLabel(score: number): string {
  if (score >= 80) return 'HOT';
  if (score >= 65) return 'Rising';
  return 'Watch';
}

// ── Score chip ────────────────────────────────────────────────────────────────
// Gradient-filled when rating10 >= 9 (premium-tier), outlined otherwise.
// Premium tier gently pulses to draw the eye.
const ScoreChip: React.FC<{ rating10: number; winningScore: number }> = ({ rating10, winningScore }) => {
  const isHighTier = rating10 >= 9;
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!isHighTier) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1100 }),
        withTiming(1, { duration: 1100 }),
      ),
      -1,
      false,
    );
  }, [isHighTier, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  if (isHighTier) {
    return (
      <Animated.View style={[styles.scoreChip, styles.scoreChipHigh, pulseStyle]}>
        <LinearGradient
          colors={gradients.premium}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <AppText variant="caption2" tabular color="#fff" style={styles.scoreChipNum}>
          {rating10}
        </AppText>
        <AppText variant="caption2" color="rgba(255,255,255,0.85)">
          /10
        </AppText>
      </Animated.View>
    );
  }

  const trendColor = getTrendColor(winningScore);
  return (
    <View style={[styles.scoreChip, { borderColor: trendColor + '88', borderWidth: 1.5 }]}>
      <AppText variant="caption2" tabular color={trendColor} style={styles.scoreChipNum}>
        {rating10}
      </AppText>
      <AppText variant="caption2" color={colors.textCaption}>
        /10
      </AppText>
    </View>
  );
};

// ── Premium lock overlay ──────────────────────────────────────────────────────
// Covers the entire card with a blurred frosted layer + a centered gold
// "Unlock for X credits" pill. The card content stays *visible underneath* —
// users see the value (image, score, badges) but can't read details. That's
// the conversion driver.
const PremiumLockOverlay: React.FC<{ unlockCost: number; onAction?: () => void }> = ({
  unlockCost,
  onAction,
}) => (
  <View style={styles.lockOverlay} pointerEvents="box-none">
    {Platform.OS === 'ios' ? (
      <BlurView
        blurType="dark"
        blurAmount={14}
        reducedTransparencyFallbackColor={colors.heroDark}
        style={StyleSheet.absoluteFill}
      />
    ) : (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15,18,28,0.78)' }]} />
    )}

    <View style={styles.lockContent} pointerEvents="box-none">
      <View style={styles.lockIconWrap}>
        <LinearGradient
          colors={gradients.premium}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <MaterialCommunityIcons name="lock" size={ms(18)} color="#fff" />
      </View>
      <AppText variant="footnote" color="rgba(255,255,255,0.7)" center style={{ marginTop: vs(8) }}>
        PREMIUM PRODUCT
      </AppText>
      {onAction ? (
        <Pressable
          onPress={() => {
            hapticLight();
            onAction();
          }}
          style={styles.unlockPill}
        >
          <LinearGradient
            colors={gradients.premium}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <MaterialCommunityIcons name="diamond" size={ms(13)} color="#fff" />
          <AppText variant="callout" color="#fff" style={{ fontWeight: '800' }}>
            Unlock · {unlockCost} cr
          </AppText>
        </Pressable>
      ) : (
        <View style={[styles.unlockPill, { opacity: 0.85 }]}>
          <LinearGradient
            colors={gradients.premium}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <MaterialCommunityIcons name="diamond" size={ms(13)} color="#fff" />
          <AppText variant="callout" color="#fff" style={{ fontWeight: '800' }}>
            Unlock · {unlockCost} cr
          </AppText>
        </View>
      )}
    </View>
  </View>
);

export const ProductCard: React.FC<Props> = ({
  scored,
  isLocked,
  onPress,
  onAction,
  style,
  selected,
  selectable,
}) => {
  const { product, winningScore, rating10, isPremium, recommendation, marginPercent, unlockCost } = scored;
  const showLocked = isPremium && isLocked;
  const trendColor = getTrendColor(winningScore);
  const isHot = winningScore >= 80;

  // Spring press feedback
  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));

  return (
    <Animated.View style={[pressStyle, style]}>
      <Pressable
        onPress={() => {
          if (onPress) {
            hapticLight();
            onPress();
          }
        }}
        onPressIn={() => {
          pressScale.value = withSpring(0.97, { damping: 18, stiffness: 280 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 16, stiffness: 240 });
        }}
        style={[
          styles.card,
          selected && styles.cardSelected,
        ]}
      >
        {/* ── Hero image (16:10 aspect, top of card) ── */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.thumbnail }} style={styles.image} />

          {/* Gentle dark gradient at bottom for badge legibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)']}
            style={styles.imageScrim}
            pointerEvents="none"
          />

          {/* Hot accent stripe — only when high score AND not locked */}
          {isHot && !showLocked && (
            <LinearGradient
              colors={gradients.gold}
              style={styles.hotStripe}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          )}

          {/* Top-left badges */}
          <View style={styles.topLeftBadges}>
            {isPremium && (
              <LinearGradient
                colors={gradients.premium}
                style={styles.premiumChip}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="diamond" size={ms(10)} color="#fff" />
                <AppText variant="caption2" color="#fff" style={styles.premiumChipText}>
                  PRO
                </AppText>
              </LinearGradient>
            )}
            {product.source === 'amazon' && (
              <View style={styles.sourceChip}>
                <AppText variant="caption2" color="rgba(255,255,255,0.9)" style={styles.sourceChipText}>
                  AMZ
                </AppText>
              </View>
            )}
          </View>

          {/* Top-right score chip */}
          <View style={styles.scoreChipWrap}>
            <ScoreChip rating10={rating10} winningScore={winningScore} />
          </View>

          {/* Bottom-left category + trend chip on image */}
          {!showLocked && (
            <View style={styles.imageBottomRow}>
              <View style={styles.categoryPill}>
                <AppText variant="caption2" uppercase color="#fff" style={styles.categoryPillText}>
                  {product.category}
                </AppText>
              </View>
              <View style={[styles.trendBadge, { backgroundColor: trendColor + 'CC' }]}>
                <MaterialCommunityIcons
                  name={winningScore >= 65 ? 'trending-up' : 'trending-neutral'}
                  size={ms(11)}
                  color="#fff"
                />
                <AppText variant="caption2" color="#fff" style={styles.trendText}>
                  {getTrendLabel(winningScore)}
                </AppText>
              </View>
            </View>
          )}

        </View>

        {/* ── Content section (locked variant overlays a frosted unlock CTA) ── */}
        <View style={styles.content}>
          {/* Real values rendered underneath; under the lock blur they become
              illegible on iOS, but their presence keeps the layout height
              identical between locked and unlocked states. */}
          <AppText
            variant="headline"
            color={colors.textPrimary}
            numberOfLines={2}
            style={styles.title}
          >
            {product.title}
          </AppText>

          <View style={styles.metaRow}>
            <RecommendationBadge recommendation={recommendation} compact />
            {selectable && selected && (
              <View style={styles.selectedTag}>
                <AppText variant="caption2" color="#fff" style={{ fontWeight: '900', letterSpacing: 0.5 }}>
                  SELECTED
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <AppText variant="caption2" uppercase color={colors.textCaption}>
                Price
              </AppText>
              <AppText variant="callout" tabular color={colors.textPrimary} style={styles.statValue}>
                {formatCurrency(product.price)}
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <AppText variant="caption2" uppercase color={colors.textCaption}>
                Margin
              </AppText>
              <AppText
                variant="callout"
                tabular
                color={marginPercent >= 30 ? colors.success : colors.textPrimary}
                style={styles.statValue}
              >
                {marginPercent}%
              </AppText>
            </View>
            {product.rating > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <AppText variant="caption2" uppercase color={colors.textCaption}>
                    Rating
                  </AppText>
                  <View style={styles.ratingRow}>
                    <MaterialCommunityIcons name="star" size={ms(12)} color={colors.warning} />
                    <AppText variant="callout" tabular color={colors.textPrimary} style={styles.statValue}>
                      {product.rating.toFixed(1)}
                    </AppText>
                  </View>
                </View>
              </>
            )}
          </View>

          {onAction && !showLocked && (
            <AppButton
              title="View Full Analysis →"
              variant="secondary"
              size="sm"
              fullWidth
              onPress={onAction}
              style={{ marginTop: spacing.md }}
            />
          )}

          {showLocked && <PremiumLockOverlay unlockCost={unlockCost} onAction={onAction} />}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.md,
  },
  cardSelected: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },

  // ── Image (16:10)
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.heroLight,
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },

  hotStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ms(3),
  },

  // ── Badges over image
  topLeftBadges: {
    position: 'absolute',
    top: vs(10),
    left: s(10),
    flexDirection: 'row',
    gap: s(6),
  },
  premiumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
    borderRadius: radius.pill,
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
  },
  premiumChipText: { fontWeight: '900', letterSpacing: 0.5 },

  sourceChip: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sourceChipText: { fontWeight: '800', letterSpacing: 0.4 },

  scoreChipWrap: {
    position: 'absolute',
    top: vs(10),
    right: s(10),
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: s(1),
    minWidth: ms(48),
    borderRadius: radius.pill,
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    backgroundColor: 'rgba(15,18,28,0.55)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  scoreChipHigh: {
    // gradient fills via absolute child; this just sets the shape
  },
  scoreChipNum: { fontWeight: '900', letterSpacing: 0 },

  imageBottomRow: {
    position: 'absolute',
    bottom: vs(10),
    left: s(10),
    right: s(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  categoryPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: s(9),
    paddingVertical: vs(3),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    flexShrink: 1,
  },
  categoryPillText: { fontWeight: '800', letterSpacing: 0.6 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
    borderRadius: radius.pill,
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
  },
  trendText: { fontWeight: '800', letterSpacing: 0.4 },

  // ── Premium lock
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockContent: { alignItems: 'center', paddingHorizontal: spacing.lg },
  lockIconWrap: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(10),
    borderRadius: radius.pill,
    paddingHorizontal: s(16),
    paddingVertical: vs(9),
    overflow: 'hidden',
  },

  // ── Content
  content: {
    padding: spacing.md,
  },
  title: { marginBottom: vs(6) },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: s(6),
    marginBottom: spacing.sm,
  },
  selectedTag: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: vs(2),
    paddingHorizontal: s(8),
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    paddingVertical: vs(10),
    paddingHorizontal: s(8),
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: '800', marginTop: vs(2) },
  statDivider: { width: 1, height: ms(22), backgroundColor: colors.border },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: s(3) },
});
