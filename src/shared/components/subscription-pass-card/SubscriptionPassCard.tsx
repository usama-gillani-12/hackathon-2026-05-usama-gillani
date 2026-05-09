import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ActivityIndicator as PaperSpinner, Surface, Text } from 'react-native-paper';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SUBSCRIPTION_PASS } from '@core/services/creditService';
import { colors, gradients } from '@theme/colors';
import { ms } from '@theme/responsive';
import { styles } from './SubscriptionPassCard.styles';

interface Props {
  onSubscribe: () => void;
  processing: boolean;
}

export const SubscriptionPassCard: React.FC<Props> = ({ onSubscribe, processing }) => (
  <Surface style={styles.card} elevation={2}>
    <LinearGradient
      colors={gradients.premium}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <MaterialCommunityIcons name="crown" size={ms(24)} color={colors.white} />
      <View style={styles.headerText}>
        <Text style={styles.title}>{SUBSCRIPTION_PASS.label}</Text>
        <Text style={styles.subtitle}>Auto-renews monthly</Text>
      </View>
      <View style={styles.priceWrap}>
        <Text style={styles.price}>${SUBSCRIPTION_PASS.usdcPerMonth}</Text>
        <Text style={styles.priceUnit}>/mo</Text>
      </View>
    </LinearGradient>

    <View style={styles.body}>
      <View style={styles.creditsRow}>
        <MaterialCommunityIcons name="diamond" size={ms(16)} color={colors.premium} />
        <Text style={styles.creditsLine}>
          {SUBSCRIPTION_PASS.creditsPerMonth} credits delivered monthly
        </Text>
      </View>

      {SUBSCRIPTION_PASS.perks.map((perk, i) => (
        <View key={i} style={styles.perkRow}>
          <MaterialCommunityIcons name="check-circle-outline" size={ms(14)} color={colors.success} />
          <Text style={styles.perkText}>{perk}</Text>
        </View>
      ))}

      <TouchableOpacity onPress={onSubscribe} disabled={processing} activeOpacity={0.85}>
        <LinearGradient
          colors={gradients.gold}
          style={styles.subscribeBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {processing ? (
            <PaperSpinner size={ms(18)} color={colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="crown" size={ms(16)} color={colors.white} />
              <Text style={styles.subscribeBtnText}>Start Monthly Pass</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Billed monthly in USDC on Base · Cancel anytime
      </Text>
    </View>
  </Surface>
);

