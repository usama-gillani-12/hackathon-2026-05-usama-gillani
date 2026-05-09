import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { ScoreBadge } from '@shared/components/score-badge';
import { ScoreBar } from '@shared/components/score-bar';
import { SCORE_DIMENSIONS } from '@core/services/scoringService';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ms } from '@theme/responsive';
import { useScoreBreakdown } from './ScoreBreakdown.hooks';
import { styles } from './ScoreBreakdown.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreBreakdown'>;

export const ScoreBreakdownScreen: React.FC<Props> = ({ route }) => {
  const { scored, recInfo } = useScoreBreakdown(route);

  if (!scored || !recInfo) return null;

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

        {/* Social Buzz Sources breakdown */}
        {scored.socialBuzzSources && (
          <Surface style={styles.card} elevation={1}>
            <View style={styles.buzzHeader}>
              <MaterialCommunityIcons name="signal-variant" size={ms(18)} color={colors.accent} />
              <Text style={styles.cardTitle}>Social Buzz Sources</Text>
            </View>
            <Text style={styles.buzzSub}>
              Final buzz score is a weighted blend — YouTube search volume (60%) + Reddit community engagement (40%).
            </Text>

            {/* YouTube */}
            <View style={styles.buzzSourceRow}>
              <View style={styles.buzzSourceLabel}>
                <View style={[styles.buzzDot, { backgroundColor: '#FF0000' }]} />
                <Text style={styles.buzzSourceName}>YouTube</Text>
                <Text style={styles.buzzSourcePct}>60%</Text>
              </View>
              <View style={styles.buzzBarWrap}>
                <View style={[styles.buzzBarFill, { width: `${scored.socialBuzzSources.youtube}%`, backgroundColor: '#FF0000' }]} />
              </View>
              <Text style={[styles.buzzScore, { color: '#FF0000' }]}>{scored.socialBuzzSources.youtube}</Text>
            </View>

            {/* Reddit */}
            <View style={styles.buzzSourceRow}>
              <View style={styles.buzzSourceLabel}>
                <View style={[styles.buzzDot, { backgroundColor: '#FF6600' }]} />
                <Text style={styles.buzzSourceName}>Reddit</Text>
                <Text style={styles.buzzSourcePct}>40%</Text>
              </View>
              <View style={styles.buzzBarWrap}>
                <View style={[styles.buzzBarFill, { width: `${scored.socialBuzzSources.reddit}%`, backgroundColor: '#FF6600' }]} />
              </View>
              <Text style={[styles.buzzScore, { color: '#FF6600' }]}>{scored.socialBuzzSources.reddit}</Text>
            </View>

            {/* Blended result */}
            <View style={styles.buzzBlendRow}>
              <Text style={styles.buzzBlendLabel}>Blended Score</Text>
              <Text style={styles.buzzBlendValue}>{scored.scoreBreakdown.socialBuzz}/100</Text>
            </View>
          </Surface>
        )}

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
