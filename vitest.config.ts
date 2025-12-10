import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['./src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
          exclude: [
            ...defaultExclude,
            './src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)',
          ],
          setupFiles: ['./src/tests/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['./src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
          exclude: defaultExclude,
          setupFiles: ['./src/tests/setup.ts'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Pages and Server Components (tested via E2E)
        'src/app/**/*',
        'src/middleware.ts',
        // External libraries
        'src/components/ui/**/*',
        // Test files
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        'src/tests/**/*',
        // Config and declarations
        'src/env.ts',
        'src/lib/blog.ts',
        'src/lib/feature-flags.ts',
        'src/lib/i18n/metadata.ts',
        'src/lib/i18n/routing.ts',
        'src/lib/api/airtable.ts',
        'src/queue/**/*',
        'src/i18n/**/*',
        'src/data/**/*',
        // Presentational components (tested via E2E, no logic)
        'src/components/blog/**/*',
        'src/components/common/**/*',
        'src/components/products/**/*',
        'src/components/sections/**/*',
        'src/components/seo/**/*',
        'src/components/whatsapp/**/*',
        'src/components/forms/contact-modal.tsx',
        'src/components/layout/footer.tsx',
      ],
      thresholds: {
        statements: 85,
        lines: 85,
        functions: 80,
        branches: 70,
      },
    },
  },
})
