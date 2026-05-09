import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { vs } from '@theme/responsive';
import { CreditTransaction } from '@t/credits';
import { formatCurrency, formatDateTime, shortenHash } from '@utils/formatCurrency';
import { styles } from './TransactionCard.styles';

interface Props {
  tx: CreditTransaction;
}

const STATUS_PALETTE: Record<CreditTransaction['status'], { bg: string; fg: string }> = {
  confirmed: { bg: colors.successSoft, fg: colors.success },
  pending: { bg: colors.warningSoft, fg: colors.warning },
  failed: { bg: colors.dangerSoft, fg: colors.danger },
};

export const TransactionCard: React.FC<Props> = ({ tx }) => {
  const palette = STATUS_PALETTE[tx.status];
  const isUnlock = tx.type === 'unlock';
  const title = isUnlock ? `Unlock · ${tx.productTitle ?? 'Premium product'}` : tx.packageLabel ?? 'USDC purchase';
  const usdcDisplay = isUnlock ? '—' : formatCurrency(tx.usdcAmount, 'USDC');
  const creditsLabel = `${tx.credits >= 0 ? '+' : ''}${tx.credits} credits`;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyStrong, { color: colors.primary }]} numberOfLines={1}>{title}</Text>
          <Text style={[typography.small, { color: colors.muted, marginTop: vs(2) }]}>{formatDateTime(tx.createdAt)}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: palette.bg }]}>
          <Text style={[typography.tiny, { color: palette.fg }]}>{tx.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Meta label="Credits" value={creditsLabel} positive={tx.credits >= 0} />
        <Meta label="USDC" value={usdcDisplay} />
        <Meta label="Network" value={tx.network} />
      </View>
      <Text style={[typography.tiny, { color: colors.muted, marginTop: spacing.sm }]} numberOfLines={1}>
        Tx: {shortenHash(tx.txHash, 10, 8)}
      </Text>
    </View>
  );
};

const Meta: React.FC<{ label: string; value: string; positive?: boolean }> = ({ label, value, positive }) => (
  <View style={{ marginRight: spacing.lg }}>
    <Text style={[typography.tiny, { color: colors.muted }]}>{label.toUpperCase()}</Text>
    <Text
      style={[
        typography.bodyStrong,
        { color: positive === false ? colors.danger : colors.primary },
      ]}
    >
      {value}
    </Text>
  </View>
);

