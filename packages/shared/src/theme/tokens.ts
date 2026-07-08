/**
 * Design tokens — shared across all 3 apps.
 *
 * Apps import from @clear-energy/shared, not from local files.
 * This means a brand colour change touches one file, not three.
 */
export const colors = {
  // Brand
  brand: '#0F766E',
  brandDark: '#0E5D56',
  brandLight: '#CCFBF1',

  // Status — customer order
  statusActive: '#059669',    // emerald-600 — out_for_delivery, active
  statusDelivered: '#475569', // slate-600
  statusCancelled: '#E11D48', // rose-600
  statusPending: '#D97706',   // amber-600
  statusDone: '#059669',      // emerald-600

  // Admin priority
  priorityHigh: '#DC2626',     // red-600
  priorityMed: '#D97706',      // amber-600
  priorityLow: '#6B7280',      // gray-500
  priorityBreached: '#BE123C', // rose-700

  // Driver ETA
  etaGreen: '#059669',   // < 15 min
  etaAmber: '#D97706',   // < 45 min
  etaRed: '#DC2626',     // ≥ 45 min or null/overdue

  // Category colours (admin)
  categoryCash: '#059669',       // emerald
  categoryMiEmpty: '#D97706',    // amber
  categoryMiFull: '#2563EB',     // blue
  categoryUnassigned: '#7C3AED', // violet
  categoryKyc: '#E11D48',        // rose
  categoryPriorDelivery: '#0284C7', // sky
  categoryDefault: '#6B7280',    // gray

  // Neutral
  white: '#FFFFFF',
  background: '#F8FAFC',  // slate-50
  surface: '#FFFFFF',
  border: '#E2E8F0',      // slate-200
  textPrimary: '#0F172A', // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94A3B8',   // slate-400
  textInverted: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  // Font sizes
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,

  // Font weights (as string literals for React Native StyleSheet)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;
