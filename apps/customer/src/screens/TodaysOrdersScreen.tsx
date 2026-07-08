import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
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
import { useCustomerOrders } from '../hooks/useCustomerOrders';

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Returns' },
];

function filterOrders(orders: OrderRow[], tab: FilterTab): OrderRow[] {
  if (tab === 'all') return orders;
  if (tab === 'active') {
    return orders.filter((o) =>
      ['out_for_delivery', 'active', 'placed', 'assigned', 'confirmed', 'preparing'].includes(o.status),
    );
  }
  if (tab === 'delivered') {
    return orders.filter((o) => ['delivered', 'done'].includes(o.status));
  }
  if (tab === 'cancelled') {
    return orders.filter((o) => ['cancelled', 'returned', 'failed'].includes(o.status));
  }
  return orders;
}

export function TodaysOrdersScreen() {
  const { data, isLoading, isError, error, refetch } = useCustomerOrders();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader />
        <LoadingState count={3} />
      </SafeAreaView>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader />
        <ErrorState error={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const filtered = filterOrders(data ?? [], activeTab);

  // ── Empty ────────────────────────────────────────────────────────────────
  // Note: data?.length === 0 (200 + empty array) is the empty state,
  // NOT an error — json-server returns 200 [] for non-existent customerId.
  if (!data || data.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader />
        <EmptyState variant="customer" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader />

      {/* Filter tabs */}
      <View style={styles.tabRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order list — empty per-filter state */}
      {filtered.length === 0 ? (
        <View style={styles.filterEmpty}>
          <Text style={styles.filterEmptyText}>No {activeTab} orders</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard variant="customer" order={item} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function ScreenHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Orders</Text>
      <Text style={styles.headerSub}>Clear Energy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
  },
  tabActive: {
    backgroundColor: colors.brand,
  },
  tabText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  filterEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterEmptyText: {
    fontSize: typography.base,
    color: colors.textMuted,
  },
});
