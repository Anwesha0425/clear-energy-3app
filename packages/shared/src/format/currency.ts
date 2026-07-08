/**
 * formatPaiseToINR — converts integer paise to a formatted Indian Rupee string.
 *
 * Why paise as integer:
 *   Floating point rupee math is a real bug class (₹1.10 + ₹2.20 ≠ ₹3.30).
 *   All money is stored and transmitted as integer paise; formatting is the
 *   only layer that converts to a human-readable string.
 *
 * Why Intl.NumberFormat('en-IN'):
 *   Produces correct Indian digit grouping (lakh/crore: 3 then 2 digits).
 *   e.g. 123456789 paise → ₹12,34,567.89 — a naive en-US format gets this wrong.
 *
 * Edge cases:
 *   - 0 paise → ₹0.00 (valid: comped/free order, not a bug)
 *   - Negative paise → -₹500.00 (refund/adjustment)
 *   - Non-integer input: Math.round() is applied defensively before dividing.
 *     Paise should never be fractional, but a bad upstream payload could send 1234.5.
 */
const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPaiseToINR(paise: number): string {
  const rupees = Math.round(paise) / 100;
  return INR_FORMATTER.format(rupees);
}
