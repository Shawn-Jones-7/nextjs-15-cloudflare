/**
 * Global Test Setup
 *
 * This file is loaded before all tests via vitest.config.ts setupFiles.
 * It provides global mocks for Next.js and Cloudflare dependencies.
 */

import { vi } from 'vitest'

// =============================================================================
// Mock process.env for browser environment
// =============================================================================

if (typeof process === 'undefined') {
  ;(
    globalThis as unknown as { process: { env: Record<string, string> } }
  ).process = {
    env: {
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
      NODE_ENV: 'test',
    },
  }
}

// =============================================================================
// Mock @opennextjs/cloudflare
// =============================================================================

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(() =>
    Promise.resolve({
      env: {},
      ctx: {
        waitUntil: vi.fn(),
        passThroughOnException: vi.fn(),
      },
    }),
  ),
}))

// =============================================================================
// Mock next-intl
// =============================================================================

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  useMessages: () => ({}),
  useNow: () => new Date(),
  useTimeZone: () => 'UTC',
  useFormatter: () => ({
    dateTime: () => '',
    number: () => '',
    relativeTime: () => '',
  }),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => key)),
  getLocale: vi.fn(() => Promise.resolve('en')),
  getMessages: vi.fn(() => Promise.resolve({})),
  getNow: vi.fn(() => Promise.resolve(new Date())),
  getTimeZone: vi.fn(() => Promise.resolve('UTC')),
  getFormatter: vi.fn(() =>
    Promise.resolve({
      dateTime: () => '',
      number: () => '',
      relativeTime: () => '',
    }),
  ),
  setRequestLocale: vi.fn(),
}))

// =============================================================================
// Mock next/navigation
// =============================================================================

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'en' }),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// =============================================================================
// Mock next/headers
// =============================================================================

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(() => false),
    getAll: vi.fn(() => []),
  })),
}))
