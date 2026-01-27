import { missingEnvVars } from '../src/lib/env';

describe('missingEnvVars', () => {
  test('returns missing keys', () => {
    const required = ['A', 'B', 'C'];
    const prev = process.env.A;
    delete process.env.A;
    process.env.B = '1';

    const missing = missingEnvVars(required);
    expect(missing).toContain('A');
    expect(missing).toContain('C');
    expect(missing).not.toContain('B');

    if (prev !== undefined) process.env.A = prev;
  });
});
