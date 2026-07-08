/**
 * ApiError — typed error with `kind` discriminator.
 *
 * Placed in types/ (not api/) so result.ts can reference it without a cycle.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly kind: 'network' | 'http' | 'abort' | 'parse',
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    // Maintains correct prototype chain in environments that transpile classes
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
