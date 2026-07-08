export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error != null && typeof error === 'object' && 'kind' in error) {
    const kind = (error as { kind: string }).kind;
    if (kind === 'abort') return false;
    if (kind === 'http') {
      const status = (error as { status?: number }).status;
      if (status != null && status < 500) return false;
    }
  }
  return failureCount < 2;
}
