/**
 * Result<T, E> — discriminated union for typed API outcomes.
 *
 * Why: Using Result instead of throw/catch keeps error paths visible at the
 * type level. In queryFn we re-throw `res.error` so React Query's native
 * `isError` state fires — see api/endpoints.ts for details.
 */
export type Result<T, E = import('./api-errors').ApiError> =
  | { ok: true; data: T }
  | { ok: false; error: E };
