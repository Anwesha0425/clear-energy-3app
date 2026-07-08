import React from 'react';
import {
  View,
  Text,
  FlatList,
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
import { useDriverTrip } from '../hooks/useDriverTrip';

export function TodaysTripScreen() {
  const { data, isLoading, isError, error, refetch } = useDriverTrip();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader stopCount={null} />
        <LoadingState count={3} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader stopCount={null} />
        <ErrorState error={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader stopCount={0} />
        <EmptyState variant="driver" />
      </SafeAreaView>
    );
  }

  // Find the active stop to display ETA in map placeholder
  const activeStop = data.find((s) => s.status === 'active');
  const doneCount = data.filter((s) => s.status === 'done').length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader stopCount={data.length} />

      {/* Map placeholder — decorative as per mockup spec */}
      <MapPlaceholder activeStop={activeStop} />

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${(doneCount / data.length) * 100}%` as `${number}%` },
          ]}
        />
      </View>
      <Text style={styles.progressLabel}>
        {doneCount}/{data.length} stops completed
      </Text>

      {/* Stop list */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard variant="driver" order={item} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function ScreenHeader({ stopCount }: { stopCount: number | null }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Today's Route</Text>
      {stopCount != null && stopCount > 0 && (
        <View style={styles.stopCountBadge}>
          <Text style={styles.stopCountText}>{stopCount} stops</Text>
        </View>
      )}
    </View>
  );
}

function MapPlaceholder({ activeStop }: { activeStop?: OrderRow }) {
  return (
    <View style={styles.mapContainer}>
      {/* Decorative route SVG matching mockup */}
      <View style={styles.mapInner}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapLabel}>Route map</Text>
      </View>

      {/* Live ETA badge */}
      {activeStop?.etaMinutes != null && (
        <View style={styles.etaBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.etaBadgeText}>
            ETA next stop ·{' '}
            <Text style={{ color: colors.brand }}>
              {activeStop.etaMinutes} min
            </Text>
          </Text>
        </View>
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
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  stopCountBadge: {
    backgroundColor: colors.brandLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  stopCountText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.brandDark,
  },
  mapContainer: {
    height: 180,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mapInner: {
    alignItems: 'center',
  },
  mapEmoji: {
    fontSize: 40,
  },
  mapLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  etaBadge: {
    position: 'absolute',
    top: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusActive,
  },
  etaBadgeText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  progressLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
});
