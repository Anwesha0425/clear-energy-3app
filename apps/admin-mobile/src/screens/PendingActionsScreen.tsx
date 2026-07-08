import React, { useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {
  OrderCard,
  LoadingState,
  EmptyState,
  ErrorState,
  colors,
  spacing,
  radius,
  typography,
} from '@clear-energy/shared';
import type { OrderRow } from '@clear-energy/shared';
import { useAdminPendingActions } from '../hooks/useAdminPendingActions';

// ── Category display config ──────────────────────────────────────────────────
// Per mockup: cash=emerald, mi_empty=amber, unassigned=violet, kyc=rose, prior_delivery=sky

interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
  slaLabel: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  cash: {
    label: 'Cash',
    color: '#059669',
    bgColor: '#ECFDF5',
    emoji: '💵',
    slaLabel: 'SLA 60m',
  },
  mi_empty: {
    label: 'MI Empty',
    color: '#D97706',
    bgColor: '#FFFBEB',
    emoji: '📦',
  },
  mi_full: {
    label: 'MI Full',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    emoji: '🔵',
    slaLabel: 'SLA 24h',
  },
  unassigned: {
    label: 'Unassigned Orders',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    emoji: '👤',
    slaLabel: 'SLA 60m',
  },
  kyc: {
    label: 'KYC',
    color: '#E11D48',
    bgColor: '#FFF1F2',
    emoji: '🪪',
    slaLabel: 'SLA 48h',
  },
  prior_delivery: {
    label: 'Prior Delivery',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    emoji: '🚚',
    slaLabel: 'SLA 2h',
  },
};

function getCategoryConfig(category?: string): CategoryConfig {
  if (!category) {
    return { label: 'Other', color: colors.textMuted, bgColor: colors.background, emoji: '📋', slaLabel: '' };
  }
  return CATEGORY_CONFIG[category] ?? {
    label: category,
    color: colors.textMuted,
    bgColor: colors.background,
    emoji: '📋',
    slaLabel: '',
  };
}

// ── Group rows by category ────────────────────────────────────────────────────
interface SectionData {
  title: string;
  category: string;
  data: OrderRow[];
  config: CategoryConfig;
  breachedCount: number;
}

function groupByCategory(rows: OrderRow[]): SectionData[] {
  const grouped = new Map<string, OrderRow[]>();

  for (const row of rows) {
    const cat = row.category ?? 'other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(row);
  }

  // Sort categories: highest-priority first
  const CATEGORY_ORDER = ['cash', 'unassigned', 'mi_empty', 'prior_delivery', 'mi_full', 'kyc'];

  const sections: SectionData[] = [];
  for (const [cat, items] of grouped.entries()) {
    const config = getCategoryConfig(cat);
    const breachedCount = items.filter(
      (r) => r.ageMinutes != null && r.slaMinutes != null && r.ageMinutes > r.slaMinutes,
    ).length;
    sections.push({
      title: config.label,
      category: cat,
      data: items,
      config,
      breachedCount,
    });
  }

  sections.sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a.category);
    const bIdx = CATEGORY_ORDER.indexOf(b.category);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  return sections;
}

export function PendingActionsScreen() {
  const { data, isLoading, isError, error, refetch } = useAdminPendingActions();

  const handleAction = useCallback((order: OrderRow) => {
    // TODO [idempotency stub]: generate crypto.randomUUID() here, pass as
    // idempotencyKey to the write endpoint on "Approve"/"Assign" etc.
    // Same key on retry, new key for new action.
    Alert.alert(
      `${order.actionRequired ?? order.action ?? 'Action'}: ${order.id}`,
      order.summary ?? '',
      [{ text: 'OK' }],
    );
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader itemCount={null} />
        <LoadingState count={3} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader itemCount={null} />
        <ErrorState error={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader itemCount={0} />
        <EmptyState variant="admin" />
      </SafeAreaView>
    );
  }

  const sections = groupByCategory(data);
  const breachedTotal = data.filter(
    (r) => r.ageMinutes != null && r.slaMinutes != null && r.ageMinutes > r.slaMinutes,
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand} />

      <ScreenHeader
        itemCount={data.length}
        sectionCount={sections.length}
        breachedCount={breachedTotal}
      />

      {/* Sectioned list grouped by category */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, section }) => (
          <View style={[styles.itemWrapper, { borderLeftColor: section.config.color }]}>
            <OrderCard
              variant="admin"
              order={item}
              onAction={handleAction}
            />
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <CategoryHeader section={section} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

function CategoryHeader({ section }: { section: SectionData }) {
  const { config, data, breachedCount } = section;
  
  // Compute SLA label dynamically from the first item's data (if available)
  const slaMin = data[0]?.slaMinutes;
  const computedSlaLabel = slaMin != null ? formatSla(slaMin) : '';

  return (
    <View style={[styles.categoryHeader, { backgroundColor: config.bgColor, borderColor: config.color + '40' }]}>
      <View style={[styles.categoryIcon, { backgroundColor: config.color + '22' }]}>
        <Text style={{ fontSize: 16 }}>{config.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
          {config.label}
        </Text>
        <Text style={styles.categoryMeta}>
          {computedSlaLabel}
          {computedSlaLabel && data.length > 0 ? ' · ' : ''}
          {data.length > 0 ? `${data.length} pending` : ''}
          {breachedCount > 0 ? ` · ⚠ ${breachedCount} breached` : ''}
        </Text>
      </View>
    </View>
  );
}

function formatSla(minutes: number): string {
  if (minutes < 60) return `SLA ${minutes}m`;
  const h = Math.floor(minutes / 60);
  return `SLA ${h}h`;
}

function ScreenHeader({
  itemCount,
  sectionCount,
  breachedCount,
}: {
  itemCount: number | null;
  sectionCount?: number;
  breachedCount?: number;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={styles.headerTitle}>⚡ Pending Actions</Text>
      </View>
      {itemCount != null && sectionCount != null ? (
        <View style={styles.headerStats}>
          <Text style={styles.headerCount}>{itemCount}</Text>
          <View>
            <Text style={styles.headerSub}>
              items across {sectionCount} {sectionCount === 1 ? 'category' : 'categories'}
            </Text>
            <Text style={styles.headerSub}>
              Sorted by SLA-breach risk · Banjara Hills
              {(breachedCount ?? 0) > 0 ? ` · ⚠ ${breachedCount} breached` : ''}
            </Text>
          </View>
        </View>
      ) : (
        itemCount != null && <Text style={styles.headerSub}>{itemCount} items</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.white,
    flex: 1,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  headerCount: {
    fontSize: typography.xxxl,
    fontWeight: typography.extrabold,
    color: colors.white,
    lineHeight: 36,
  },
  headerSub: {
    fontSize: typography.xs,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  categoryMeta: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemWrapper: {
    borderLeftWidth: 3,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
});
