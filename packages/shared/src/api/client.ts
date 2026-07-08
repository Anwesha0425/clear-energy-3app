import { ApiError } from '../types/api-errors';
import type { Result } from '../types/result';

export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  /** Request timeout in ms. Defaults to 8000. */
  timeoutMs?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /**
   * Caller-owned AbortSignal — typically from React Query's queryFn signal
   * or a useEffect cleanup controller. The client merges this with its own
   * internal timeout abort.
   */
  signal?: AbortSignal;
  /**
   * Idempotency key for write operations. Generate once per *logical* action
   * (e.g. via crypto.randomUUID() at the point the user taps "Confirm").
   * Pass the SAME key on retries of that action.
   * Generate a NEW key only when a genuinely new action starts.
   *
   * Note: currently no writes exist in scope (read-only brief), but the
   * header is wired and ready for Phase 2.
   */
  idempotencyKey?: string;
  body?: unknown;
}

/**
 * createApiClient — thin fetch wrapper with:
 * - Per-request timeout + abort merging
 * - Typed Result<T> return (never throws — callers decide to re-throw)
 * - Idempotency-Key header wiring (ready for writes)
 * - Structured error kind: 'network' | 'http' | 'abort' | 'parse'
 *
 * Retry note: retry-with-backoff is intentionally NOT built here.
 * React Query handles retries at the query layer with its own backoff.
 * Building it twice would create confusing interaction. Flagged in README.
 */
export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, defaultHeaders = {}, timeoutMs = 8000 } = config;

  async function request<T>(
    path: string,
    opts: RequestOptions = {},
  ): Promise<Result<T>> {
    // Internal timeout controller — merged with caller's signal if provided.
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(
      () => timeoutController.abort(new ApiError('Request timed out', 'abort')),
      timeoutMs,
    );

    // AbortSignal.any() merges multiple signals — supported in all modern envs.
    // Falls back to caller-only or timeout-only if AbortSignal.any is absent.
    const mergedSignal: AbortSignal = (() => {
      if (opts.signal) {
        if (typeof AbortSignal.any === 'function') {
          return AbortSignal.any([opts.signal, timeoutController.signal]);
        }
        // Fallback: prefer caller signal (covers useEffect cleanup)
        return opts.signal;
      }
      return timeoutController.signal;
    })();

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: opts.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(opts.idempotencyKey
            ? { 'Idempotency-Key': opts.idempotencyKey }
            : {}),
          ...defaultHeaders,
        },
        body: opts.body != null ? JSON.stringify(opts.body) : undefined,
        signal: mergedSignal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          ok: false,
          error: new ApiError(`HTTP ${res.status}: ${res.statusText}`, 'http', res.status),
        };
      }

      let data: T;
      try {
        data = (await res.json()) as T;
      } catch {
        return {
          ok: false,
          error: new ApiError('Failed to parse response JSON', 'parse'),
        };
      }

      return { ok: true, data };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      // AbortError covers both timeout abort and caller signal abort
      if (
        err instanceof DOMException && err.name === 'AbortError' ||
        (err instanceof Error && err.name === 'AbortError')
      ) {
        return {
          ok: false,
          error: new ApiError('Request aborted', 'abort'),
        };
      }

      return {
        ok: false,
        error: new ApiError(
          err instanceof Error ? err.message : 'Unknown network error',
          'network',
        ),
      };
    }
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
