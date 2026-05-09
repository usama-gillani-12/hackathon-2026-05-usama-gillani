import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, shadow, spacing } from '@theme/spacing';
import { vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  middle: { flex: 1, paddingHorizontal: spacing.md, gap: 0 },
  mt6: { marginTop: vs(6) },
  mt4: { marginTop: vs(4) },
  statsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
});
