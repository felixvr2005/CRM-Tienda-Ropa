module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // disallow console in server code (we use structured logger)
    'no-console': ['error', { allow: ['warn', 'info'] }],
  },
  overrides: [
    {
      files: ['src/pages/api/**/*.{ts,js}', 'src/lib/**/*.{ts,js}'],
      rules: {
        'no-console': ['error', { allow: [] }]
      }
    },
    {
      // allow console in client code and debug pages
      files: ['src/components/**/*.{ts,tsx,js,jsx}', 'src/lib/order-modals.ts', 'src/pages/admin/devoluciones/debug-*.astro'],
      rules: { 'no-console': 'off' }
    }
  ]
};
