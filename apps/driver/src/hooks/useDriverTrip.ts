import { useQuery } from '@tanstack/react-query';
import { createApiClient, getDriverTrip } from '@clear-energy/shared';
import { API_BASE_URL, DRIVER_ID } from '../constants';

const apiClient = createApiClient({ baseUrl: API_BASE_URL });

/**
 * useDriverTrip — React Query hook for the Driver "Today's Trip" screen.
 *
 * Stops are returned sorted by seq from the endpoint wrapper.
 *
 * TODO [idempotency stub]: future "Mark Delivered" / "Skip Stop" actions
 * would generate crypto.randomUUID() per tap, passed as idempotencyKey to
 * client.request(). Same key on retry, new key for new action.
 */
export function useDriverTrip() {
  return useQuery({
    queryKey: ['driver-trip', DRIVER_ID],
    queryFn: ({ signal }) => getDriverTrip(apiClient, DRIVER_ID, signal),
    staleTime: 15_000, // driver data changes frequently — shorter stale window
    retry: shouldRetry,
  });
}
