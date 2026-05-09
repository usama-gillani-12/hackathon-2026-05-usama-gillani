import React from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { ProductCard } from '@shared/components/product-card';
import { ListFooterLoader } from '@shared/components/list-footer-loader';
import { colors, gradients } from '@theme/colors';
import { radius } from '@theme/spacing';
import { ms } from '@theme/responsive';
import { useCompareProducts, MAX_SELECTED, COMPARE_ROWS } from './CompareProducts.hooks';
import { styles } from './CompareProducts.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'CompareProducts'>;

export const CompareProductsScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    unlocked,
    selected,
    showCompare,
    setShowCompare,
    toggle,
    pagedProducts,
    total,
    hasMore,
    isLoadingMore,
    loadMore,
    selectedProducts,
    winner,
  } = useCompareProducts(route);

  if (showCompare && selectedProducts.length >= 2) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Winner callout */}
          {winner && (
            <LinearGradient colors={gradients.success} style={styles.winnerCard}>
              <MaterialCommunityIcons name="trophy" size={ms(24)} color={colors.white} />
              <View style={{ flex: 1 }}>
                <Text style={styles.winnerLabel}>Best to Test First</Text>
                <Text style={styles.winnerTitle} numberOfLines={1}>{winner.product.title}</Text>
                <Text style={styles.winnerSub}>{winner.winningScore} pts · {winner.rating10}/10 · {winner.marginPercent}% margin</Text>
              </View>
              <Button
                mode="contained"
                compact
                onPress={() => navigation.navigate('ProductDetail', { productId: winner.product.id })}
                buttonColor="rgba(255,255,255,0.25)"
                labelStyle={{ color: colors.white, fontSize: ms(12) }}
                style={{ borderRadius: radius.md }}
              >
                Open →
              </Button>
            </LinearGradient>
          )}

          {/* Comparison table */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle}>Side-by-Side Comparison</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Product name headers */}
                <View style={styles.tableRow}>
                  <Text style={styles.metricCol}>{''}</Text>
                  {selectedProducts.map((p) => (
                    <View key={p.product.id} style={styles.valueCol}>
                      <Text style={styles.tableHeader} numberOfLines={2}>{p.product.title}</Text>
                    </View>
                  ))}
                </View>

                {COMPARE_ROWS.map((row) => (
                  <View key={row.label} style={styles.tableRow}>
                    <Text style={styles.metricLabel}>{row.label}</Text>
                    {selectedProducts.map((p) => {
                      const isWin = row.highlight(p, selectedProducts);
                      return (
                        <View key={p.product.id} style={[styles.valueCol, isWin && styles.valueColHighlight]}>
                          <Text style={[styles.valueText, isWin && styles.valueTextHighlight]}>
                            {row.getValue(p)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </Surface>

          {/* AI conclusion */}
          {winner && (
            <Surface style={styles.card} elevation={1}>
              <Text style={styles.cardTitle}>AI Conclusion</Text>
              <Text style={styles.conclusionText}>
                <Text style={styles.bold}>{winner.product.title}</Text> scored highest at {winner.winningScore} pts ({winner.rating10}/10) with {winner.marginPercent}% margin and a <Text style={styles.bold}>{winner.recommendation}</Text> signal. Start there with a 3–5 day TikTok or Meta test before scaling.
              </Text>
            </Surface>
          )}

          <View style={styles.footer}>
            <Button mode="outlined" onPress={() => setShowCompare(false)} style={styles.footerBtn} textColor={colors.primary}>
              Edit Selection
            </Button>
            {winner && (
              <Button mode="contained" onPress={() => navigation.navigate('ProductDetail', { productId: winner.product.id })} style={styles.footerBtn} buttonColor={colors.accent}>
                Open Winner
              </Button>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Surface style={styles.banner} elevation={1}>
        <Text style={styles.bannerTitle}>Pick up to 3 products</Text>
        <Text style={styles.bannerSub}>{selected.length}/{MAX_SELECTED} selected · tap a card to toggle</Text>
      </Surface>

      <FlatList
        data={pagedProducts}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.content}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => (
          <ProductCard
            scored={item}
            isLocked={item.isPremium && !unlocked.has(item.product.id)}
            selectable
            selected={selected.includes(item.product.id)}
            onPress={() => toggle(item.product.id)}
          />
        )}
        ListFooterComponent={
          <ListFooterLoader
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            total={total}
            shown={pagedProducts.length}
            label="products"
          />
        }
      />

      <View style={styles.compareFooter}>
        <Button
          mode="contained"
          onPress={() => setShowCompare(true)}
          disabled={selected.length < 2}
          style={styles.compareBtn}
          contentStyle={styles.compareBtnContent}
          labelStyle={styles.compareBtnLabel}
          buttonColor={colors.accent}
        >
          {selected.length < 2 ? `Select ${2 - selected.length} more to compare` : `Compare ${selected.length} Products`}
        </Button>
      </View>
    </SafeAreaView>
  );
};
