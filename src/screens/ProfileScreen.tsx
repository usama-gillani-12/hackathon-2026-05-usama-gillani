import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../types/navigation';
import { colors, gradients } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { useCreditStore } from '../stores/useCreditStore';
import { useProductStore } from '../stores/useProductStore';
import { useWatchlistStore } from '../stores/useWatchlistStore';
import { getUnlockedIdSet } from '../services/unlockService';

type Props = DrawerScreenProps<DrawerParamList, 'Profile'>;

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const balance = useCreditStore((s) => s.balance);
  const transactions = useCreditStore((s) => s.transactions);
  const products = useProductStore((s) => s.products);
  const watchlistItems = useWatchlistStore((s) => s.items);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    getUnlockedIdSet().then((set) => setUnlockedCount(set.size));
  }, []);

  const totalCreditsSpent = transactions
    .filter((t) => t.type === 'unlock')
    .reduce((sum, t) => sum + Math.abs(t.credits), 0);

  const avgScore =
    products.length > 0
      ? Math.round(products.reduce((s, p) => s + p.winningScore, 0) / products.length)
      : 0;

  const stats: StatItem[] = [
    { label: 'Products Scanned', value: products.length || 52, icon: 'magnify', color: colors.accent },
    { label: 'Products Unlocked', value: unlockedCount, icon: 'lock-open-outline', color: colors.premium },
    { label: 'Watchlist Items', value: watchlistItems.length, icon: 'star-outline', color: colors.warning },
    { label: 'Avg Score', value: `${avgScore || 76}/100`, icon: 'chart-line', color: colors.success },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.backBtn}>
            <MaterialCommunityIcons name="menu" size={ms(24)} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Profile</Text>
          <View style={{ width: ms(40) }} />
        </View>

        {/* Avatar hero */}
        <LinearGradient colors={[colors.heroDark, colors.heroMid]} style={styles.heroCard}>
          <LinearGradient
            colors={[colors.accent, colors.premium]}
            style={styles.avatarRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>JP</Text>
            </View>
          </LinearGradient>
          <Text style={styles.heroName}>John Park</Text>
          <Text style={styles.heroEmail}>john@trendpro.app</Text>
          <LinearGradient
            colors={gradients.premium}
            style={styles.tierBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons name="diamond" size={ms(12)} color={colors.white} />
            <Text style={styles.tierLabel}>Pro Member</Text>
          </LinearGradient>
        </LinearGradient>

        {/* Credit summary */}
        <Surface style={styles.creditSummary} elevation={1}>
          <View style={styles.creditItem}>
            <Text style={styles.creditVal}>{balance}</Text>
            <Text style={styles.creditLbl}>Credits Left</Text>
          </View>
          <View style={styles.creditDivider} />
          <View style={styles.creditItem}>
            <Text style={styles.creditVal}>{totalCreditsSpent}</Text>
            <Text style={styles.creditLbl}>Credits Used</Text>
          </View>
          <View style={styles.creditDivider} />
          <View style={styles.creditItem}>
            <Text style={styles.creditVal}>{transactions.length}</Text>
            <Text style={styles.creditLbl}>Transactions</Text>
          </View>
        </Surface>

        {/* Stats grid */}
        <Text style={styles.sectionLabel}>YOUR STATS</Text>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <Surface key={s.label} style={styles.statCard} elevation={1}>
              <View style={[styles.statIconWrap, { backgroundColor: `${s.color}18` }]}>
                <MaterialCommunityIcons name={s.icon} size={ms(20)} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Surface>
          ))}
        </View>

        {/* Actions */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        {[
          { icon: 'pencil-outline', label: 'Edit Profile', sub: 'Update your name and email', onPress: () => {} },
          { icon: 'diamond-outline', label: 'Upgrade Plan', sub: 'Get more credits and features', onPress: () => (navigation as any).navigate('BuyCredits') },
          { icon: 'share-outline', label: 'Share TrendPro', sub: 'Tell your network about this tool', onPress: () => {} },
          { icon: 'bell-outline', label: 'Notifications', sub: 'Manage your alerts', onPress: () => navigation.navigate('Notifications') },
        ].map((item) => (
          <TouchableOpacity key={item.label} onPress={item.onPress} activeOpacity={0.7}>
            <Surface style={styles.actionRow} elevation={1}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name={item.icon} size={ms(20)} color={colors.accent} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>{item.label}</Text>
                <Text style={styles.actionSub}>{item.sub}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={ms(20)} color={colors.muted} />
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: ms(40),
    height: ms(40),
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: colors.primary,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarRing: {
    width: ms(88),
    height: ms(88),
    borderRadius: ms(44),
    padding: ms(3),
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: ms(82),
    height: ms(82),
    borderRadius: ms(41),
    backgroundColor: colors.heroLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.white,
    fontSize: ms(28),
    fontWeight: '800',
  },
  heroName: {
    color: colors.white,
    fontSize: ms(22),
    fontWeight: '800',
    marginBottom: vs(4),
  },
  heroEmail: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: ms(13),
    marginBottom: spacing.md,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    paddingHorizontal: s(14),
    paddingVertical: vs(6),
    borderRadius: radius.pill,
  },
  tierLabel: {
    color: colors.white,
    fontSize: ms(12),
    fontWeight: '700',
  },
  creditSummary: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    flexDirection: 'row',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
  },
  creditItem: { flex: 1, alignItems: 'center' },
  creditVal: { fontSize: ms(22), fontWeight: '800', color: colors.primary },
  creditLbl: { fontSize: ms(11), color: colors.muted, marginTop: vs(2) },
  creditDivider: { width: 1, backgroundColor: colors.border },
  sectionLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: ms(1.2),
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '47.5%',
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  statIconWrap: {
    width: ms(36),
    height: ms(36),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { fontSize: ms(22), fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: ms(11), color: colors.muted, marginTop: vs(2) },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    gap: spacing.md,
  },
  actionIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: { flex: 1 },
  actionLabel: { fontSize: ms(14), fontWeight: '600', color: colors.primary },
  actionSub: { fontSize: ms(12), color: colors.muted, marginTop: vs(1) },
});
