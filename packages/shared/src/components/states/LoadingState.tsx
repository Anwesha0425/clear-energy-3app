import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme/tokens';

interface LoadingStateProps {
  /** Number of skeleton rows to show. Defaults to 3. */
  count?: number;
}

/**
 * LoadingState — skeleton rows, not a spinner.
 * Skeleton feels more "shipped" and communicates the shape of the list
 * to come, reducing layout shift when data arrives.
 */
export function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.row}>
        <View style={styles.iconSkeleton} />
        <View style={styles.textBlock}>
          <View style={[styles.line, { width: '40%' }]} />
          <View style={[styles.line, { width: '70%', marginTop: 8 }]} />
          <View style={[styles.line, { width: '30%', marginTop: 8 }]} />
        </View>
      </View>
      <View style={[styles.line, { width: '25%', marginTop: 12 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconSkeleton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: '#E2E8F0',
  },
  textBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  line: {
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: '#E2E8F0',
  },
});
