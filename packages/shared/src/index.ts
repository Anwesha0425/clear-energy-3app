/**
 * @clear-energy/shared — public export surface.
 *
 * Apps MUST import only from this file, never from internal paths like
 * '@clear-energy/shared/src/types/order'.
 *
 * Rule: if a symbol isn't exported here, it's private to the shared package.
 */

// ─── Types ─────────────────────────────────────────────────────────────────
export type { OrderRow, OrderStatus, AdminPriority } from './types/order';
export type { Result } from './types/result';
export { ApiError } from './types/api-errors';

// ─── API ───────────────────────────────────────────────────────────────────
export { createApiClient } from './api/client';
export type { ApiClient, ApiClientConfig } from './api/client';
export { getCustomerOrders, getDriverTrip, getAdminPendingActions } from './api/endpoints';

// ─── Format ────────────────────────────────────────────────────────────────
export { formatPaiseToINR } from './format/currency';
export { truncateAddress } from './format/address';

// ─── Theme ─────────────────────────────────────────────────────────────────
export { colors, spacing, radius, typography } from './theme/tokens';

// ─── Components ────────────────────────────────────────────────────────────
export { OrderCard } from './components/OrderCard';
export { LoadingState } from './components/states/LoadingState';
export { EmptyState } from './components/states/EmptyState';
export { ErrorState } from './components/states/ErrorState';
