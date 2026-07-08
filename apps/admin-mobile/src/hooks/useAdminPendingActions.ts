import { useQuery } from '@tanstack/react-query';
import { createApiClient, getAdminPendingActions } from '@clear-energy/shared';
import { API_BASE_URL, ADMIN_ID } from '../constants';

const apiClient = createApiClient({ baseUrl: API_BASE_URL });

/**
 * useAdminPendingActions — React Query hook for the Admin "Pending Actions" screen.
 *
 * Returns a flat OrderRow[] sorted by SLA-breach risk (handled in screen by grouping).
 * Refetch interval is short (10s) since admin queues are time-sensitive.
 *
 * TODO [idempotency stub]: future "Approve" / "Assign" actions would generate
 * crypto.randomUUID() at the point the admin taps the button, same key on retry.
 */
export function useAdminPendingActions() {
  return useQuery({
    queryKey: ['admin-pending-actions', ADMIN_ID],
    queryFn: ({ signal }) => getAdminPendingActions(apiClient, ADMIN_ID, signal),
    staleTime: 10_000, // admin queues are time-sensitive
    refetchInterval: 30_000, // auto-refresh every 30s
    retry: (failureCount, error) => {
      if (error != null && typeof error === 'object' && 'kind' in error) {
        const kind = (error as { kind: string }).kind;
        if (kind === 'abort') return false;
        if (kind === 'http') {
          const status = (error as { status?: number }).status;
          if (status != null && status < 500) return false;
        }
      }
      return failureCount < 2;
    },
  });
}
