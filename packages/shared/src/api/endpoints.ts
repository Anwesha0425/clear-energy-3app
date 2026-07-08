import type { ApiClient } from './client';
import type { OrderRow, CustomerOrderDTO, TripStopDTO, PendingActionDTO } from '../types/order';
import {
  mapCustomerOrderToRow,
  mapTripStopToRow,
  mapPendingActionToRow,
} from '../types/order';

/**
 * getCustomerOrders — wraps GET /orders?customerId=<id>
 *
 * Returns OrderRow[] on success, throws ApiError on failure.
 * The re-throw is intentional: React Query's queryFn is expected to throw
 * so that isError / error states work natively. Callers that want Result<T>
 * directly should call client.request() instead.
 *
 * json-server note: ?customerId=c-001 filters rows where customerId === "c-001".
 * A non-existent ID returns 200 + [] — handled as EmptyState (not ErrorState).
 */
export async function getCustomerOrders(
  client: ApiClient,
  customerId: string,
  signal?: AbortSignal,
): Promise<OrderRow[]> {
  const res = await client.request<CustomerOrderDTO[]>(
    `/orders?customerId=${encodeURIComponent(customerId)}`,
    { signal },
  );
  if (!res.ok) throw res.error;
  return res.data.map(mapCustomerOrderToRow);
}

/**
 * getDriverTrip — wraps GET /trips?driverId=<id>
 *
 * json-server serves the "trips" key as a flat array.
 * We filter by driverId on the query string (json-server handles this).
 * Stops are sorted by `seq` to match the route order shown in the mockup.
 */
export async function getDriverTrip(
  client: ApiClient,
  driverId: string,
  signal?: AbortSignal,
): Promise<OrderRow[]> {
  const res = await client.request<TripStopDTO[]>(
    `/trips?driverId=${encodeURIComponent(driverId)}`,
    { signal },
  );
  if (!res.ok) throw res.error;
  // Sort by seq to guarantee route order
  return res.data
    .sort((a, b) => a.seq - b.seq)
    .map(mapTripStopToRow);
}

/**
 * getAdminPendingActions — wraps GET /pending-actions?adminId=<id>
 *
 * json-server key is "pending-actions" (hyphenated) — matches mock-api.json.
 * Returns flat array; grouping by category is done in the screen, not here.
 */
export async function getAdminPendingActions(
  client: ApiClient,
  adminId: string,
  signal?: AbortSignal,
): Promise<OrderRow[]> {
  const res = await client.request<PendingActionDTO[]>(
    `/pending-actions?adminId=${encodeURIComponent(adminId)}`,
    { signal },
  );
  if (!res.ok) throw res.error;
  return res.data.map(mapPendingActionToRow);
}
