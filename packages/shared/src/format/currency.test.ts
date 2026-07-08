import { describe, it, expect } from 'vitest';
import { formatPaiseToINR } from './currency';

/**
 * Currency formatting tests.
 *
 * The critical case is the crore-scale test (123456789 paise → ₹12,34,567.89)
 * which specifically validates Indian digit grouping (3 then 2 digits, lakh/crore style).
 * A naive en-US implementation would produce ₹1,234,567.89 — wrong grouping.
 *
 * Note on Intl.NumberFormat output: the ₹ symbol placement and exact non-breaking
 * space usage may vary slightly by Node.js version/ICU data. We use toContain()
 * for the numeric part and check the ₹ symbol separately where needed.
 */
describe('formatPaiseToINR', () => {
  it('formats zero paise as ₹0.00 — valid comped order, not a bug', () => {
    const result = formatPaiseToINR(0);
    expect(result).toContain('0.00');
    expect(result).toContain('₹');
  });

  it('formats 100 paise as ₹1.00', () => {
    const result = formatPaiseToINR(100);
    expect(result).toContain('1.00');
    expect(result).toContain('₹');
  });

  it('formats 118000 paise (₹1,180.00) correctly', () => {
    const result = formatPaiseToINR(118000);
    expect(result).toContain('1,180.00');
    expect(result).toContain('₹');
  });

  it('formats 123456789 paise with Indian crore grouping (₹12,34,567.89)', () => {
    // This is the key test — en-US would give 1,234,567.89 (wrong grouping)
    // en-IN gives 12,34,567.89 (correct lakh/crore grouping)
    const result = formatPaiseToINR(123456789);
    expect(result).toContain('12,34,567.89');
    expect(result).toContain('₹');
  });

  it('formats negative paise (refund/adjustment) without crashing', () => {
    const result = formatPaiseToINR(-50000);
    // Should be -₹500.00 in some form
    expect(result).toContain('500.00');
    expect(result).toContain('₹');
    // Should have a negative indicator
    expect(result).toMatch(/-|−/); // hyphen-minus or minus sign
  });

  it('handles non-integer paise defensively via Math.round', () => {
    // Should NOT throw; rounds to nearest paise before dividing
    expect(() => formatPaiseToINR(1234.5)).not.toThrow();
    // 1234.5 paise → Math.round(1234.5) = 1235 → ₹12.35
    const result = formatPaiseToINR(1234.5);
    expect(result).toContain('12.35');
  });
});
