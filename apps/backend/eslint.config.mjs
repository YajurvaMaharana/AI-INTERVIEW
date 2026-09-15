// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      // These are already enforced by the TypeScript compiler with strict
      // settings (noUnusedLocals, noUnusedParameters) — disable to avoid
      // duplicate warnings.
      '@typescript-eslint/no-unused-vars': 'off',

      // The auth middleware uses `declare global { namespace Express { ... } }`
      // which is the standard pattern for augmenting Express Request types.
      // This is not a regular namespace — it's a declaration merge.
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
);
