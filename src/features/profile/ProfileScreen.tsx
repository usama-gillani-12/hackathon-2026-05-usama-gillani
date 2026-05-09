import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '@t/navigation';
import { colors, gradients } from '@theme/colors';
import { ms } from '@theme/responsive';
import { useProfile } from './Profile.hooks';
import { styles } from './Profile.styles';

type Props = DrawerScreenProps<DrawerParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { balance, transactions, totalCreditsSpent, stats, actions } = useProfile(navigation);

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
        {actions.map((item) => (
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
