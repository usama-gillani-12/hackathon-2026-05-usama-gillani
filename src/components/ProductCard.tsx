import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, gradients } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ms, s, vs } from '../theme/responsive';
import { ScoredProduct } from '../types/product';
import { formatCurrency } from '../utils/formatCurrency';
import { AppButton } from './AppButton';
import { RecommendationBadge } from './RecommendationBadge';
import { ScoreBadge } from './ScoreBadge';

interface Props {
  scored: ScoredProduct;
  isLocked: boolean;
  onPress?: () => void;
  onAction?: () => void;
  style?: ViewStyle;
  selected?: boolean;
  selectable?: boolean;
}

function blurredTitle(title: string): string {
  const parts = title.split(' ');
  if (parts.length <= 1) return parts[0] + ' ••••••';
  return parts[0] + ' ' + parts.slice(1).map((w) => '•'.repeat(Math.max(3, Math.min(8, w.length)))).join(' ');
}

function getTrendColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 65) return colors.accent;
  if (score >= 50) return colors.warning;
  return colors.muted;
}

function getTrendIcon(score: number): string {
  if (score >= 80) return 'trending-up';
  if (score >= 65) return 'trending-up';
  return 'trending-neutral';
}

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
  const displayTitle = showLocked ? blurredTitle(product.title) : product.title;
  const trendColor = getTrendColor(winningScore);
  const isHot = winningScore >= 80;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        { opacity: pressed ? 0.94 : 1 },
        style,
      ]}
    >
      {/* Hot product top accent */}
      {isHot && !showLocked && (
        <View style={styles.hotAccent}>
          <LinearGradient
            colors={gradients.gold}
            style={styles.hotBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      )}

      <View style={styles.imageRow}>
        {/* Thumbnail */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.thumbnail }} style={styles.image} />
          {isPremium && (
            <LinearGradient
              colors={gradients.premium}
              style={styles.premiumChip}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="diamond" size={ms(9)} color={colors.white} />
              <Text style={styles.premiumChipText}>PRO</Text>
            </LinearGradient>
          )}
          {product.source === 'amazon' && (
            <View style={styles.sourceChip}>
              <Text style={styles.sourceChipText}>AMZ</Text>
            </View>
          )}
        </View>

        {/* Middle content */}
        <View style={styles.middle}>
          {/* Category + trend icon */}
          <View style={styles.categoryRow}>
            <Text style={[typography.tiny, { color: colors.textCaption }]} numberOfLines={1}>
              {product.category.toUpperCase()}
            </Text>
            {!showLocked && (
              <View style={[styles.trendBadge, { backgroundColor: trendColor + '18' }]}>
                <MaterialCommunityIcons name={getTrendIcon(winningScore)} size={ms(11)} color={trendColor} />
                <Text style={[styles.trendText, { color: trendColor }]}>
                  {winningScore >= 80 ? 'HOT' : winningScore >= 65 ? 'Rising' : 'Watch'}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              typography.h3,
              { color: showLocked ? colors.muted : colors.primary, marginTop: vs(2) },
            ]}
            numberOfLines={2}
          >
            {displayTitle}
          </Text>

          <View style={styles.metaRow}>
            <RecommendationBadge recommendation={recommendation} compact />
            {selectable && selected && (
              <View style={styles.selectedTag}>
                <Text style={[typography.tiny, { color: colors.white }]}>SELECTED</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>PRICE</Text>
              <Text style={styles.statValue}>{formatCurrency(product.price)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>MARGIN</Text>
              <Text style={[styles.statValue, { color: marginPercent >= 30 ? colors.success : colors.primary }]}>
                {marginPercent}%
              </Text>
            </View>
            {product.rating > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>RATING</Text>
                  <View style={styles.ratingRow}>
                    <MaterialCommunityIcons name="star" size={ms(11)} color={colors.warning} />
                    <Text style={styles.statValue}>{product.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Score badge */}
        <ScoreBadge score={winningScore} rating10={rating10} size="md" />
      </View>

      {/* Action button */}
      {onAction && (
        <AppButton
          title={showLocked ? `🔓  Unlock · ${unlockCost} credits` : 'View Full Analysis →'}
          variant={showLocked ? 'premium' : 'secondary'}
          size="sm"
          fullWidth
          onPress={onAction}
          style={{ marginTop: spacing.md }}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    padding: spacing.md,
    ...shadow.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },

  hotAccent: { marginBottom: vs(8), marginHorizontal: -spacing.md, marginTop: -spacing.md },
  hotBar: { height: vs(3) },

  imageRow: { flexDirection: 'row', alignItems: 'center' },
  imageWrap: {
    width: ms(72),
    height: ms(72),
    borderRadius: radius.lg,
    backgroundColor: colors.mutedSoft,
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },

  premiumChip: {
    position: 'absolute',
    top: vs(4),
    left: s(4),
    borderRadius: radius.pill,
    paddingVertical: vs(2),
    paddingHorizontal: s(5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(2),
  },
  premiumChipText: { color: colors.white, fontSize: ms(8), fontWeight: '800' },

  sourceChip: {
    position: 'absolute',
    bottom: vs(4),
    right: s(4),
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: radius.pill,
    paddingVertical: vs(1),
    paddingHorizontal: s(4),
  },
  sourceChipText: { color: 'rgba(255,255,255,0.9)', fontSize: ms(7.5), fontWeight: '700' },

  middle: { flex: 1, paddingHorizontal: spacing.md },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(2),
    borderRadius: radius.pill,
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
  },
  trendText: { fontSize: ms(9), fontWeight: '800', letterSpacing: 0.3 },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.xs as unknown as number,
  },
  selectedTag: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: vs(2),
    paddingHorizontal: s(8),
    marginLeft: spacing.xs,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.mutedSoft,
    borderRadius: radius.md,
    padding: vs(6),
    gap: s(0),
  },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: ms(9), color: colors.muted, fontWeight: '700', letterSpacing: 0.3 },
  statValue: { fontSize: ms(13), fontWeight: '800', color: colors.primary, marginTop: vs(1) },
  statDivider: { width: 1, height: ms(20), backgroundColor: colors.border },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: s(2) },
});
