import { getTopProducts } from '../src/lib/reports';

const makeOrder = (items: any[]) => ({ order_items: items });

describe('getTopProducts', () => {
  test('aggregates quantities and revenue and returns top products', async () => {
    const orders = [
      makeOrder([
        { products: { name: 'A' }, quantity: 2, unit_price: 10 },
        { products: { name: 'B' }, quantity: 1, unit_price: 20 },
      ]),
      makeOrder([
        { products: { name: 'A' }, quantity: 3, unit_price: 10 },
        { products: { name: 'C' }, quantity: 5, unit_price: 5 },
      ]),
    ];

    const top = await getTopProducts(orders as any);
    expect(top[0].product_name).toBe('A');
    expect(top[0].product_quantity).toBe(5);
    expect(top.find(p => p.product_name === 'A')!.product_revenue).toBe('50.00');
    expect(top.find(p => p.product_name === 'C')!.product_quantity).toBe(5);
  });

  test('handles missing product name gracefully', async () => {
    const orders = [makeOrder([{ products: undefined, quantity: 1, unit_price: 9 }])];
    const top = await getTopProducts(orders as any);
    expect(top[0].product_name).toBe('Desconocido');
  });
});
