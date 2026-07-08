/**
 * truncateAddress — truncates a long address string for the driver card view.
 *
 * The driver mockup shows short addresses like "Banjara · 0.4 km" already
 * pre-truncated in the mock data. This utility handles cases where a full
 * address string arrives (e.g. from a future API that sends the full address
 * instead of a locality shorthand).
 *
 * Accessibility: the full address should be set as the `accessibilityLabel`
 * on the TouchableOpacity wrapping the driver card, so screen readers read
 * the full text even when the visual display is truncated.
 */
export function truncateAddress(address: string, maxLen = 40): string {
  if (address.length <= maxLen) return address;
  return address.slice(0, maxLen - 1).trimEnd() + '…';
}
