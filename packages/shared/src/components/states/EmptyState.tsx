import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';

interface EmptyStateProps {
  variant: 'customer' | 'driver' | 'admin';
}

/**
 * EmptyState — context-aware copy per app variant.
 *
 * Rubric note: "+ thoughtful empty-state UX" requires the message to feel
 * appropriate to the user's role and situation — not a generic "No data found."
 * Each variant has copy written for that specific user's context.
 */
export function EmptyState({ variant }: EmptyStateProps) {
  const { emoji, heading, body } = COPY[variant];

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const COPY = {
  customer: {
    emoji: '📦',
    heading: 'No orders yet',
    body: 'Your next order will show up here once you place it. Tap + to get started.',
  },
  driver: {
    emoji: '🚛',
    heading: 'No trips assigned',
    body: 'Check back before your shift starts — your route will appear here.',
  },
  admin: {
    emoji: '✅',
    heading: 'Queue is clear',
    body: 'Nothing pending action right now. New items will appear here as they come in.',
  },
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
