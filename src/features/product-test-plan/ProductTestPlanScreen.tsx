import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Surface, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ms } from '@theme/responsive';
import { formatCurrency } from '@utils/formatCurrency';
import { useProductTestPlan } from './ProductTestPlan.hooks';
import { styles } from './ProductTestPlan.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductTestPlan'>;

export const ProductTestPlanScreen: React.FC<Props> = ({ navigation, route }) => {
  const { scored, plan } = useProductTestPlan(route);

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
