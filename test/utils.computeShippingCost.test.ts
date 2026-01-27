import { computeShippingCost } from '../src/lib/utils';

describe('computeShippingCost', () => {
  test('default threshold (100) - below threshold', () => {
    expect(computeShippingCost(99.99)).toBe(4.95);
  });

  test('default threshold (100) - at threshold', () => {
    expect(computeShippingCost(100)).toBe(0);
  });

  test('custom threshold (boundary cases)', () => {
    // threshold 50: 49 => not free, 50 => free
    expect(computeShippingCost(49, 'standard', 50)).toBe(4.95);
    expect(computeShippingCost(50, 'standard', 50)).toBe(0);

    // threshold 100: 99 => not free, 100 => free
    expect(computeShippingCost(99, 'standard', 100)).toBe(4.95);
    expect(computeShippingCost(100, 'standard', 100)).toBe(0);
  });

  test('express and store methods', () => {
    expect(computeShippingCost(10, 'express')).toBe(9.95);
    expect(computeShippingCost(1000, 'store')).toBe(0);
  });
});
