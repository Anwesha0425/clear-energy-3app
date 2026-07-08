import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ApiError } from '../../types/api-errors';
import { colors, spacing, radius, typography } from '../../theme/tokens';

interface ErrorStateProps {
  error: Error | ApiError | null | unknown;
  onRetry?: () => void;
}

/**
 * ErrorState — surfaces human-readable error message + Retry button.
 *
 * Abort errors ('abort' kind) should be filtered BEFORE rendering this component
 * since they happen on component unmount and should never surface to the user.
 * In practice, React Query's isError won't fire for abort errors when queryFn
 * re-throws — but we guard here too for safety.
 *
 * Error kinds:
 * - 'network': device offline, DNS failure, no server running
 * - 'http': server responded but with an error status (4xx, 5xx)
 * - 'parse': server returned non-JSON or malformed response
 * - 'abort': request was cancelled (should not reach this component)
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { heading, body } = resolveError(error);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.body}>{body}</Text>
      {onRetry != null && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityLabel="Retry loading"
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function isApiError(err: unknown): err is ApiError {
  return (
    err != null &&
    typeof err === 'object' &&
    'kind' in err &&
    typeof (err as { kind: unknown }).kind === 'string'
  );
}

function resolveError(error: unknown): { heading: string; body: string } {
  if (isApiError(error)) {
    switch (error.kind) {
      case 'abort':
        // Should not render — guard anyway
        return { heading: 'Cancelled', body: 'The request was cancelled.' };
      case 'network':
        return {
          heading: 'No connection',
          body: 'Check your internet connection and try again.',
        };
      case 'http':
        return {
          heading: `Server error${error.status ? ` (${error.status})` : ''}`,
          body: 'The server returned an error. Please try again shortly.',
        };
      case 'parse':
        return {
          heading: 'Unexpected response',
          body: 'We received an unreadable response. Please try again.',
        };
    }
  }
  if (error instanceof Error) {
    return {
      heading: 'Something went wrong',
      body: error.message || 'An unexpected error occurred.',
    };
  }
  return {
    heading: 'Something went wrong',
    body: 'An unexpected error occurred. Please try again.',
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  emoji: {
    fontSize: 48,
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
  retryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  retryText: {
    color: colors.white,
    fontWeight: typography.semibold,
    fontSize: typography.base,
  },
});
