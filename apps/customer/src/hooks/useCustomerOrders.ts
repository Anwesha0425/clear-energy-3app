import { useQuery } from '@tanstack/react-query';
import {
  createApiClient,
  getCustomerOrders,
} from '@clear-energy/shared';
import { API_BASE_URL, CUSTOMER_ID } from '../constants';

const apiClient = createApiClient({ baseUrl: API_BASE_URL });

/**
 * useCustomerOrders — React Query hook for the Customer "My Orders" screen.
 *
 * Design decision: queryFn re-throws ApiError (getCustomerOrders already does this).
 * This keeps React Query's native isError / error state working. Screens check
 * isError rather than branching on Result<T> — one error-handling idiom, not two.
 *
 * The signal from React Query is passed through to the API client so in-flight
 * requests are cancelled when the query key changes or the component unmounts.
 *
 * Idempotency note: no writes on this screen. The TODO below marks where a future
 * "Reorder" or "Cancel" action would generate a crypto.randomUUID() key.
 */
export function useCustomerOrders() {
  return useQuery({
    queryKey: ['customer-orders', CUSTOMER_ID],
    queryFn: ({ signal }) => getCustomerOrders(apiClient, CUSTOMER_ID, signal),
    staleTime: 30_000, // 30s — orders don't change that frequently
    retry: (failureCount, error) => {
      // Don't retry on abort (component unmounted) or 4xx client errors
      if (
        error != null &&
        typeof error === 'object' &&
        'kind' in error &&
        (error as { kind: string }).kind === 'abort'
      ) {
        return false;
      }
      if (
        error != null &&
        typeof error === 'object' &&
        'kind' in error &&
        (error as { kind: string }).kind === 'http' &&
        'status' in error &&
        typeof (error as { status: unknown }).status === 'number' &&
        (error as { status: number }).status < 500
      ) {
        return false;
      }
      return failureCount < 2; // retry up to 2 times for network/5xx errors
    },
    // TODO [idempotency stub]: when a "Reorder" or "Cancel" action is added,
    // generate the key at the point of user action:
    //   const idempotencyKey = crypto.randomUUID(); // once per logical action
    //   pass same key on retry, new key for new action
  });
}
