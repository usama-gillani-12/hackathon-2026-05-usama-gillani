import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, Surface, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { colors, gradients } from '@theme/colors';
import { ms } from '@theme/responsive';
import { formatCurrency, formatDateTime, shortenHash } from '@utils/formatCurrency';
import { usePaymentSuccess } from './PaymentSuccess.hooks';
import { styles } from './PaymentSuccess.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSuccess'>;

export const PaymentSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transaction, packageInfo, checkStyle, goHome, goTransactions, openExplorer } = usePaymentSuccess(navigation, route);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success hero */}
        <LinearGradient colors={[colors.heroDark, colors.successDark]} style={styles.hero}>
          <Animated.View style={[styles.checkWrap, checkStyle]}>
            <LinearGradient colors={gradients.success} style={styles.checkCircle}>
              <MaterialCommunityIcons name="check-bold" size={ms(40)} color={colors.white} />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.heroTitle}>Payment Successful!</Text>
          <Text style={styles.heroSub}>
            {packageInfo.credits} credits added to your account
          </Text>
          <View style={styles.creditsAdded}>
            <MaterialCommunityIcons name="diamond" size={ms(16)} color={colors.success} />
            <Text style={styles.creditsAddedText}>+{packageInfo.credits} credits</Text>
          </View>
        </LinearGradient>

        {/* Receipt */}
        <Surface style={styles.receipt} elevation={2}>
          <Text style={styles.receiptTitle}>Receipt</Text>
          <Divider style={styles.divider} />
          {[
            { label: 'Package', value: `${packageInfo.label} · ${packageInfo.credits} credits` },
            { label: 'Credits Added', value: `+${packageInfo.credits}`, highlight: true },
            { label: 'USDC Amount', value: formatCurrency(transaction.usdcAmount, 'USDC') },
            { label: 'Status', value: transaction.status.toUpperCase() },
            { label: 'Network', value: transaction.network.toUpperCase() },
            { label: 'Date & Time', value: formatDateTime(transaction.createdAt) },
          ].map((row) => (
            <View key={row.label} style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{row.label}</Text>
              <Text style={[styles.receiptValue, row.highlight && { color: colors.success, fontWeight: '800' }]}>
                {row.value}
              </Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.hashWrap}>
            <Text style={styles.hashLabel}>TRANSACTION HASH</Text>
            <Text style={styles.hashValue}>{shortenHash(transaction.txHash, 14, 10)}</Text>
            {transaction.network === 'base-sepolia' && (
              <TouchableOpacity
                onPress={openExplorer}
                style={styles.explorerLink}
              >
                <MaterialCommunityIcons name="open-in-new" size={ms(13)} color={colors.accent} />
                <Text style={styles.explorerText}>View on Base Sepolia Explorer</Text>
              </TouchableOpacity>
            )}
          </View>
        </Surface>

        {/* CTA buttons */}
        <Button
          mode="contained"
          onPress={goHome}
          style={styles.btn}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
          buttonColor={colors.accent}
        >
          Back to Dashboard
        </Button>
        <Button
          mode="outlined"
          onPress={goTransactions}
          style={[styles.btn, styles.btnOutline]}
          contentStyle={styles.btnContent}
          textColor={colors.primary}
        >
          View All Transactions
        </Button>

        {transaction.network === 'mock' && (
          <View style={styles.demoNote}>
            <MaterialCommunityIcons name="information-outline" size={ms(14)} color={colors.premium} />
            <Text style={styles.demoNoteText}>Demo mode · No real funds were moved.</Text>
          </View>
        )}
        {transaction.network === 'base-sepolia' && (
          <View style={[styles.demoNote, styles.testnetNote]}>
            <MaterialCommunityIcons name="flask-outline" size={ms(14)} color={colors.success} />
            <Text style={[styles.demoNoteText, { color: colors.success }]}>
              Confirmed on Base Sepolia Testnet · No real funds used
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
