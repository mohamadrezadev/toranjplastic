import { describe, expect, it } from 'vitest';
import {
  calculateQuotation,
  MAX_RIALS,
  parseQuantityThousandths,
  parseRials,
} from './quotation.calculation.js';

const valid = {
  items: [
    { quantity: '2.500', unitPriceRials: '1000', lineTotalRials: '2500' },
    { quantity: '3', unitPriceRials: '2000', lineTotalRials: '6000' },
  ],
  subtotalRials: '8500',
  discountRials: '500',
  taxRials: '800',
  additionalCostRials: '200',
  totalRials: '9000',
};

describe('quotation calculation', () => {
  it('parses bounded rial and decimal quantity strings exactly', () => {
    expect(parseRials('0')).toBe(0n);
    expect(parseRials(MAX_RIALS.toString())).toBe(MAX_RIALS);
    expect(parseQuantityThousandths('12.34')).toBe(12340n);
  });

  it('derives item, subtotal and final totals without floating point', () => {
    expect(calculateQuotation(valid)).toMatchObject({
      subtotalRials: 8500n,
      totalRials: 9000n,
    });
  });

  it.each([
    { ...valid, items: [] },
    { ...valid, items: Array.from({ length: 51 }, () => valid.items[0]) },
    { ...valid, subtotalRials: '8501' },
    { ...valid, discountRials: '9000' },
    { ...valid, totalRials: '9001' },
    { ...valid, items: [{ ...valid.items[0], lineTotalRials: '2499' }] },
    { ...valid, items: [{ ...valid.items[0], quantity: '0' }] },
    {
      ...valid,
      items: [
        {
          ...valid.items[0],
          quantity: '1.001',
          unitPriceRials: '1',
          lineTotalRials: '1',
        },
      ],
    },
    { ...valid, taxRials: (MAX_RIALS + 1n).toString() },
    { ...valid, discountRials: '-1' },
  ])(
    'rejects inconsistent, fractional-rial, unbounded, or malformed input %#',
    (input) => {
      expect(() => calculateQuotation(input)).toThrowError(
        expect.objectContaining({ status: 400 }),
      );
    },
  );
});
