import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, Surface, ActivityIndicator as PaperSpinner } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, gradients } from '@theme/colors';
import { ms, s, vs } from '@theme/responsive';
import { CreditPackage } from '@t/credits';
import { BottomTabParamList } from '@t/navigation';
import { WalletConnectButton } from '@shared/components/wallet-connect-button';
import { SubscriptionPassCard } from '@shared/components/subscription-pass-card';
import { getTotalCredits } from '@core/services/creditService';
import { useBuyCredits } from './BuyCredits.hooks';
import { styles } from './BuyCredits.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'BuyCredits'>;

const VALUE_PROPS = [
  { icon: 'fire', label: 'Unlock premium 9/10 & 10/10 opportunities', color: colors.warning },
  { icon: 'rocket-launch-outline', label: 'Full supplier sourcing angles revealed', color: colors.accent },
  { icon: 'bullhorn-outline', label: 'Ready-to-run ad copy & target audiences', color: colors.success },
  { icon: 'clipboard-check-outline', label: 'Complete product test plan included', color: colors.premium },
];

export const BuyCreditsScreen: React.FC<Props> = () => {
  const {
    navigation,
    isConnected,
    balance,
    selectedId,
    setSelectedId,
    processing,
    paymentError,
    tabIndex,
    setTabIndex,
    pulseStyle,
    onPay,
    onSubscribe,
    selectedPkg,
    roi,
    isTestnet,
    payEnabled,
    CREDIT_PACKAGES,
  } = useBuyCredits();

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Balance hero */}
        <LinearGradient colors={[colors.heroDark, colors.heroMid, colors.heroDark]} style={styles.hero}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceLeft}>
              <MaterialCommunityIcons name="diamond" size={ms(28)} color={colors.premium} />
              <View>
                <Text style={styles.balanceVal}>{balance}</Text>
                <Text style={styles.balanceLbl}>credits available</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionHistory')}
              style={styles.historyBtn}
            >
              <MaterialCommunityIcons name="history" size={ms(14)} color="rgba(255,255,255,0.5)" />
              <Text style={styles.historyText}>History</Text>
            </TouchableOpacity>
          </View>

          {isTestnet ? (
            <View style={styles.testnetBadge}>
              <View style={styles.testnetDot} />
              <Text style={styles.testnetText}>BASE SEPOLIA TESTNET · Real wallet required</Text>
            </View>
          ) : (
            <View style={styles.demoBadge}>
              <View style={styles.demoDot} />
              <Text style={styles.demoText}>USDC DEMO MODE — No real funds required</Text>
            </View>
          )}

          {/* Live ROI example ticker */}
          <View style={styles.roiCard}>
            <View style={styles.roiHeader}>
              <MaterialCommunityIcons name="trending-up" size={ms(14)} color={colors.success} />
              <Text style={styles.roiTitle}>Recent Seller Win</Text>
            </View>
            <Text style={styles.roiProduct}>{roi.product}</Text>
            <View style={styles.roiStats}>
              <View style={styles.roiStat}>
                <Text style={styles.roiStatLabel}>INVESTED</Text>
                <Text style={[styles.roiStatVal, { color: colors.premium }]}>{roi.investment} USDC</Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={ms(18)} color="rgba(255,255,255,0.3)" />
              <View style={styles.roiStat}>
                <Text style={styles.roiStatLabel}>MONTHLY REVENUE</Text>
                <Text style={[styles.roiStatVal, { color: colors.success }]}>{roi.revenue}</Text>
              </View>
              <View style={styles.roiStat}>
                <Text style={styles.roiStatLabel}>MARGIN</Text>
                <Text style={[styles.roiStatVal, { color: colors.accent }]}>{roi.margin}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* What you unlock */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT CREDITS UNLOCK</Text>
          <Surface style={styles.unlockCard} elevation={1}>
            {VALUE_PROPS.map((v, i) => (
              <View
                key={i}
                style={[styles.unlockRow, i < VALUE_PROPS.length - 1 && styles.unlockRowBorder]}
              >
                <View style={[styles.unlockIcon, { backgroundColor: v.color + '18' }]}>
                  <MaterialCommunityIcons name={v.icon} size={ms(16)} color={v.color} />
                </View>
                <Text style={styles.unlockText}>{v.label}</Text>
                <MaterialCommunityIcons name="check-circle" size={ms(16)} color={v.color} />
              </View>
            ))}
          </Surface>
        </Animated.View>

        {/* Tab switcher */}
        <Animated.View entering={FadeInDown.delay(130)} style={styles.section}>
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              onPress={() => setTabIndex(0)}
              style={[styles.tab, tabIndex === 0 && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tabIndex === 0 && styles.tabTextActive]}>One-Time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTabIndex(1)}
              style={[styles.tab, tabIndex === 1 && styles.tabActive]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="crown"
                size={ms(12)}
                color={tabIndex === 1 ? colors.white : colors.muted}
              />
              <Text style={[styles.tabText, tabIndex === 1 && styles.tabTextActive]}>Monthly Pass</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {tabIndex === 0 ? (
          <>
            {/* Packages */}
            <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
              <Text style={styles.sectionLabel}>CHOOSE A PACKAGE</Text>
              <Text style={styles.sectionSub}>Bulk tiers include bonus credits · Never pay full price</Text>
              {CREDIT_PACKAGES.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedId === pkg.id}
                  onPress={() => setSelectedId(pkg.id)}
                />
              ))}
            </Animated.View>

            {/* Payment error banner */}
            {paymentError ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={ms(15)} color={colors.danger} />
                <Text style={styles.errorBannerText}>{paymentError}</Text>
              </View>
            ) : null}

            {/* Wallet connect + pay button */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
              {isTestnet && (
                <>
                  <WalletConnectButton />
                  <View style={{ height: vs(12) }} />
                </>
              )}
              <Animated.View style={[pulseStyle]}>
                <TouchableOpacity onPress={onPay} disabled={!payEnabled} activeOpacity={0.85}>
                  <LinearGradient
                    colors={!payEnabled ? [colors.textDisabled, colors.textDisabled] : gradients.accent}
                    style={styles.payBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {processing ? (
                      <View style={styles.processingRow}>
                        <PaperSpinner size={ms(18)} color={colors.white} />
                        <Text style={styles.payBtnLabel}>Confirming on-chain…</Text>
                      </View>
                    ) : (
                      <View style={styles.payBtnContent}>
                        <MaterialCommunityIcons name="lightning-bolt" size={ms(18)} color={colors.white} />
                        <Text style={styles.payBtnLabel}>
                          {isTestnet && !isConnected
                            ? 'Connect Wallet to Continue'
                            : `Pay ${selectedPkg?.usdcAmount ?? 0} USDC · Get ${getTotalCredits(selectedPkg ?? CREDIT_PACKAGES[0])} Credits`}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </>
        ) : (
          <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
            {isTestnet && (
              <>
                <WalletConnectButton />
                <View style={{ height: vs(12) }} />
              </>
            )}
            <SubscriptionPassCard onSubscribe={onSubscribe} processing={processing} />
          </Animated.View>
        )}

        {/* Security section */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <Surface style={styles.securityCard} elevation={1}>
            <View style={styles.securityHeader}>
              <MaterialCommunityIcons name="shield-check" size={ms(18)} color={colors.success} />
              <Text style={styles.securityTitle}>Secure USDC Payment</Text>
            </View>
            {[
              { icon: 'ethereum', text: 'Transaction verified on Base Sepolia blockchain' },
              { icon: 'key-outline', text: 'Private keys stay in your wallet — never shared' },
              { icon: 'lock-outline', text: 'WalletConnect secure relay — open standard' },
            ].map((b, i) => (
              <View key={i} style={styles.securityRow}>
                <View style={styles.securityIcon}>
                  <MaterialCommunityIcons name={b.icon} size={ms(13)} color={colors.accent} />
                </View>
                <Text style={styles.securityText}>{b.text}</Text>
              </View>
            ))}
          </Surface>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PackageCard: React.FC<{ pkg: CreditPackage; selected: boolean; onPress: () => void }> = ({
  pkg,
  selected,
  onPress,
}) => {
  const total = getTotalCredits(pkg);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.packageWrap}>
      <Surface
        style={[styles.packageCard, selected && styles.packageCardSelected]}
        elevation={selected ? 3 : 1}
      >
        {/* {selected && (
          <View style={styles.checkMark}>
            <MaterialCommunityIcons name="check-circle" size={ms(22)} color={colors.accent} />
          </View>
        )} */}
        {(pkg.highlight || pkg.badgeText) && (
          <LinearGradient
            colors={gradients.premium}
            style={styles.popularBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.popularText}>
              {pkg.badgeText ? `⭐ ${pkg.badgeText}` : '⭐ MOST POPULAR'}
            </Text>
          </LinearGradient>
        )}
        <View style={styles.packageBody}>
          <View style={styles.packageLeft}>
            <Text style={styles.packageCredits}>
              {total} credits{pkg.bonusCredits ? ` (+${pkg.bonusCredits} bonus)` : ''}
            </Text>
            <Text style={styles.packageLabel}>
              {pkg.label} · ~{Math.floor(total / 3)} products unlocked
            </Text>
            {pkg.savingsPercent ? (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{pkg.savingsPercent}% off</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.packageRight}>
            <Text style={styles.packagePrice}>{pkg.usdcAmount} USDC</Text>
            <Text style={styles.packagePer}>
              {(pkg.usdcAmount / total).toFixed(2)} USDC/credit
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

