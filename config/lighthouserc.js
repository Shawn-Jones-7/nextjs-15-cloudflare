/**
 * Lighthouse CI Configuration
 * Quality Gates per Constitution:
 * - Performance ≥ 90
 * - Accessibility ≥ 90
 * - Best Practices ≥ 95
 * - SEO ≥ 95
 */

const criticalUrls = [
  'http://localhost:3000',
  'http://localhost:3000/en',
  'http://localhost:3000/zh',
];

const allUrls = [
  ...criticalUrls,
  'http://localhost:3000/en/about',
  'http://localhost:3000/zh/about',
  'http://localhost:3000/en/contact',
  'http://localhost:3000/zh/contact',
  'http://localhost:3000/en/news',
  'http://localhost:3000/zh/news',
  'http://localhost:3000/en/cases',
  'http://localhost:3000/zh/cases',
];

const isDaily = process.env.CI_DAILY === 'true';

export const ci = {
  collect: {
    url: isDaily ? allUrls : criticalUrls,
    startServerCommand: 'pnpm start',
    startServerReadyPattern: 'Local:',
    startServerReadyTimeout: 60_000,
    numberOfRuns: 2,
  },
  assert: {
    assertions: {
      'categories:performance': [
        'error',
        { minScore: 0.9, aggregationMethod: 'optimistic' },
      ],
      'categories:accessibility': ['error', { minScore: 0.9 }],
      'categories:best-practices': ['error', { minScore: 0.95 }],
      'categories:seo': ['error', { minScore: 0.95 }],
      'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
      'largest-contentful-paint': ['error', { maxNumericValue: 4500 }],
      'cumulative-layout-shift': ['error', { maxNumericValue: 0.15 }],
      'total-blocking-time': ['error', { maxNumericValue: 200 }],
      'speed-index': ['error', { maxNumericValue: 3000 }],
      interactive: ['error', { maxNumericValue: 6000 }],
      'total-byte-weight': ['warn', { maxNumericValue: 512_000 }],
      'bootup-time': ['warn', { maxNumericValue: 4000 }],
      'unused-javascript': ['warn', { maxNumericValue: 153_600 }],
      'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],
    },
  },
  upload: {
    target: 'temporary-public-storage',
  },
};
