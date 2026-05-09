import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingVertical: vs(4),
    paddingHorizontal: s(8),
    marginLeft: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
});
