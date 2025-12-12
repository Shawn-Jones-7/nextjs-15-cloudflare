import comments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import react from '@eslint-react/eslint-plugin'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { flatConfigs as importX } from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import node from 'eslint-plugin-n'
import reactHooks from 'eslint-plugin-react-hooks'
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect'
import security from 'eslint-plugin-security'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
// eslint-disable-next-line @typescript-eslint/no-deprecated -- tseslint.config still works, migration to ESLint core defineConfig can be done later
export default tseslint.config(
  {
    ignores: [
      'node_modules',
      '.next',
      'cloudflare-env.d.ts',
      '.open-next',
      '.velite',
      'velite.config.ts',
      'reports/**',
      'scripts/**',
      'coverage/**',
      'specs/**/contracts/**',
    ],
  },

  js.configs.recommended,
  // eslint-disable-next-line import-x/no-named-as-default-member -- using tseslint.configs is the correct pattern
  ...tseslint.configs.strictTypeChecked,
  // eslint-disable-next-line import-x/no-named-as-default-member -- using tseslint.configs is the correct pattern
  ...tseslint.configs.stylisticTypeChecked,
  importX.recommended,
  importX.typescript,
  comments.recommended,
  // eslint-disable-next-line import-x/no-named-as-default-member
  security.configs.recommended,
  unicorn.configs.recommended,
  node.configs['flat/recommended'],

  ...compat.config({
    extends: ['plugin:@next/next/recommended'],
  }),
  react.configs['recommended-type-checked'],
  reactHooks.configs.flat.recommended,
  reactYouMightNotNeedAnEffect.configs.recommended,
  jsxA11y.flatConfigs.strict,

  ...compat.config({ extends: ['plugin:drizzle/all'] }),

  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ...jsxA11y.flatConfigs.strict.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.builtin,
        ...globals.browser,
      },
    },
    settings: {
      node: {
        tryExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    },
  },

  {
    files: ['**/*.cjs', '**/*.cts'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },

  {
    files: ['**/structured-data.tsx'],
    rules: {
      // JSON-LD structured data requires dangerouslySetInnerHTML by design.
      // Content is safe: we control the schema objects and use JSON.stringify().
      '@eslint-react/dom/no-dangerously-set-innerhtml': 'off',
    },
  },

  {
    files: ['**/blog.ts'],
    rules: {
      // #velite is a build-time path alias to .velite directory (Velite-generated).
      // ESLint import resolver cannot resolve it, but TypeScript handles it via paths config.
      'import-x/no-unresolved': ['error', { ignore: ['^#velite$'] }],
      // Dynamic import of #velite returns typed exports, safe to assign.
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false,
        },
      ],

      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        {
          allowConstantLoopConditions: true,
        },
      ],

      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],

      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            env: true,
            e: true,
            ctx: true,
            req: true,
            res: true,
            arg: true,
            args: true,
            opts: true,
            prop: true,
            props: true,
            util: true,
            utils: true,
            db: true,
            Db: true,
            generateStaticParams: true,
            params: true,
          },
        },
      ],

      'n/exports-style': ['error', 'exports'],
      'n/no-missing-import': 'off',
      'n/no-extraneous-import': 'off',
      'n/no-unsupported-features/node-builtins': [
        'error',
        { version: '>=22.16.0' },
      ],

      // React "You Might Not Need an Effect" rules
      // https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect
      'react-you-might-not-need-an-effect/no-derived-state': 'error',
      'react-you-might-not-need-an-effect/no-chain-state-updates': 'error',
      'react-you-might-not-need-an-effect/no-event-handler': 'error',
      'react-you-might-not-need-an-effect/no-adjust-state-on-prop-change':
        'error',
      'react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change':
        'error',
      'react-you-might-not-need-an-effect/no-pass-live-state-to-parent':
        'error',
      'react-you-might-not-need-an-effect/no-pass-data-to-parent': 'error',
      'react-you-might-not-need-an-effect/no-pass-ref-to-parent': 'error',
      'react-you-might-not-need-an-effect/no-initialize-state': 'error',
      'react-you-might-not-need-an-effect/no-empty-effect': 'error',
    },
  },

  // =============================================================================
  // Test Files Configuration (must be near the end for correct priority)
  // Pattern based on: https://github.com/Shawn-Jones-7/tucsenberg-web-frontier
  // =============================================================================
  {
    name: 'test-files-config',
    files: [
      '**/*.spec.{ts,tsx}',
      '**/*.test.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
      '**/tests/**/*.{ts,tsx}',
      '**/specs/**/*.{ts,tsx}',
      '**/mocks/**/*.{ts,tsx}',
      '**/fixtures/**/*.{ts,tsx}',
    ],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
      },
    },
    rules: {
      // === Complexity limits relaxed for test files ===
      'max-lines-per-function': [
        'warn',
        { max: 700, skipBlankLines: true, skipComments: true },
      ],
      complexity: ['warn', 20],
      'max-nested-callbacks': ['warn', 6],
      'max-lines': [
        'warn',
        { max: 800, skipBlankLines: true, skipComments: true },
      ],
      'max-statements': ['warn', 50],

      // === Test-specific patterns ===
      'no-magic-numbers': 'off',
      'no-unused-expressions': 'off',
      'no-empty-function': 'off',
      'prefer-arrow-callback': 'off',
      'require-await': 'off',
      'no-underscore-dangle': 'off',

      // === Unicorn rules relaxed ===
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-callback-reference': 'off',

      // === TypeScript rules relaxed ===
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // === React/Next rules relaxed ===
      '@eslint-react/hooks-extra/no-unnecessary-use-prefix': 'off',

      // === Security rules relaxed ===
      'security/detect-object-injection': 'off',

      // === Other rules ===
      'no-constant-binary-expression': 'off',
      'drizzle/enforce-delete-with-where': 'off',
      'n/no-unsupported-features/node-builtins': 'off',

      // === Console allowed in tests ===
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
    },
  },

  // Final override to ensure test rules take precedence
  {
    name: 'test-files-final-override',
    files: [
      '**/*.spec.{ts,tsx}',
      '**/*.test.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
      '**/tests/**/*.{ts,tsx}',
      '**/specs/**/*.{ts,tsx}',
      '**/mocks/**/*.{ts,tsx}',
      '**/fixtures/**/*.{ts,tsx}',
    ],
    rules: {
      // Ensure these critical rules are off for tests (override any global settings)
      'no-restricted-imports': 'off',
      'no-restricted-syntax': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'warn',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'no-constant-binary-expression': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  prettier,
)
