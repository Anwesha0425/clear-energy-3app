import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/tokens';

export const styles = StyleSheet.create({
  // ─── Card container ─────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginVertical: spacing.xs,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: colors.brand,
  },

  // ─── Card header row ─────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: '#FEF3C7', // amber-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  orderId: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontWeight: typography.semibold,
    fontVariant: ['tabular-nums'],
  },
  skuName: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  amount: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  placedAt: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ─── Status badge ─────────────────────────────────────────────────────
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },

  // ─── Driver-specific ─────────────────────────────────────────────────────
  driverMeta: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  seqBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  etaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  etaText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.white,
  },
  addressText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ─── Admin-specific ───────────────────────────────────────────────────────
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  summaryText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    flex: 1,
    flexWrap: 'wrap',
  },
  priorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  ageMeta: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.white,
  },
});
