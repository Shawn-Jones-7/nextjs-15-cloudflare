/**
 * Cloudflare Bindings Mock Implementation
 *
 * In-memory mocks for D1Database, KVNamespace, and CloudflareEnv.
 * These mocks enable unit testing without Miniflare or Workers runtime.
 */

import { vi } from 'vitest'

// =============================================================================
// KVNamespace Mock
// =============================================================================

export interface MockKVNamespace extends KVNamespace {
  _store: Map<string, { value: string; expiration?: number }>
  _clear: () => void
}

export function createMockKV(): MockKVNamespace {
  const store = new Map<string, { value: string; expiration?: number }>()

  const mock = {
    _store: store,
    _clear: () => { store.clear(); },

    get: vi.fn(async (key: string, options?: KVNamespaceGetOptions<string>) => {
      const entry = store.get(key)
      if (!entry) return null

      // Check expiration (stored as Unix timestamp in seconds)
      if (entry.expiration && Date.now() / 1000 >= entry.expiration) {
        store.delete(key)
        return null
      }

      const type =
        typeof options === 'string' ? options : (options?.type ?? 'text')
      if (type === 'json') {
        return JSON.parse(entry.value)
      }
      return entry.value
    }),

    put: vi.fn(
      async (
        key: string,
        value: string | ArrayBuffer | ReadableStream,
        options?: KVNamespacePutOptions,
      ) => {
        const stringValue =
          typeof value === 'string' ? value : JSON.stringify(value)
        store.set(key, {
          value: stringValue,
          expiration: options?.expirationTtl
            ? Math.floor(Date.now() / 1000) + options.expirationTtl
            : options?.expiration,
        })
      },
    ),

    delete: vi.fn(async (key: string) => {
      store.delete(key)
    }),

    list: vi.fn(async (options?: KVNamespaceListOptions) => {
      const keys = [...store.entries()]
        .filter(([name]) => !options?.prefix || name.startsWith(options.prefix))
        .slice(0, options?.limit ?? 1000)
        .map(([name, entry]) => ({
          name,
          expiration: entry.expiration,
        }))

      return {
        keys,
        list_complete: true,
        cacheStatus: null,
      }
    }),

    getWithMetadata: vi.fn(async () => ({
      value: null,
      metadata: null,
      cacheStatus: null,
    })),
  } as unknown as MockKVNamespace

  return mock
}

// =============================================================================
// D1Database Mock
// =============================================================================

export interface MockD1PreparedStatement extends D1PreparedStatement {
  _boundValues: unknown[]
}

export interface MockD1Database extends D1Database {
  _rows: Record<string, unknown>[]
  _setRows: (rows: Record<string, unknown>[]) => void
  _clear: () => void
  _lastStatement: MockD1PreparedStatement | null
}

export function createMockD1(): MockD1Database {
  let rows: Record<string, unknown>[] = []
  let lastStatement: MockD1PreparedStatement | null = null

  const createStatement = (_query: string): MockD1PreparedStatement => {
    const boundValues: unknown[] = []

    const statement: MockD1PreparedStatement = {
      _boundValues: boundValues,

      bind: vi.fn((...values: unknown[]) => {
        boundValues.push(...values)
        return statement
      }),

      run: vi.fn(async () => ({
        success: true,
        meta: {
          duration: 1,
          changes: 1,
          last_row_id: 1,
          served_by: 'mock',
          rows_read: 0,
          rows_written: 1,
        },
        results: [],
      })),

      first: vi.fn(async <T = unknown>(_column?: string): Promise<T | null> => {
        return (rows[0] as T) ?? null
      }),

      all: vi.fn(async <T = unknown>() => ({
        success: true,
        meta: {
          duration: 1,
          served_by: 'mock',
          rows_read: rows.length,
          rows_written: 0,
        },
        results: rows as T[],
      })),

      raw: vi.fn(async <T = unknown[]>() => rows.map(Object.values) as T[]),
    } as unknown as MockD1PreparedStatement

    lastStatement = statement
    return statement
  }

  const db = {
    _rows: rows,
    _setRows: (newRows: Record<string, unknown>[]) => {
      rows = newRows
    },
    _clear: () => {
      rows = []
      lastStatement = null
    },
    get _lastStatement() {
      return lastStatement
    },

    prepare: vi.fn((query: string) => createStatement(query)),

    batch: vi.fn(async <T = unknown>(statements: D1PreparedStatement[]) => {
      return statements.map(() => ({
        success: true,
        meta: { duration: 1 },
        results: [] as T[],
      }))
    }),

    exec: vi.fn(async (_query: string) => ({
      count: 1,
      duration: 1,
    })),

    dump: vi.fn(async () => new ArrayBuffer(0)),
  } as unknown as MockD1Database

  return db
}

// =============================================================================
// Cloudflare Environment Mock
// =============================================================================

export interface MockCloudflareEnvironment {
  CONTACT_FORM_D1: MockD1Database
  NEXT_INC_CACHE_KV: MockKVNamespace
  TURNSTILE_SECRET_KEY: string
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: string
  RESEND_API_KEY: string
  RESEND_FROM_EMAIL: string
  RESEND_TO_EMAIL: string
  AIRTABLE_API_KEY: string
  AIRTABLE_BASE_ID: string
  AIRTABLE_TABLE_NAME: string
  NOTIFICATION_EMAIL: string
}

/** @deprecated Use MockCloudflareEnvironment instead */
export type MockCloudflareEnv = MockCloudflareEnvironment

export function createMockEnvironment(
  overrides: Partial<MockCloudflareEnvironment> = {},
): MockCloudflareEnvironment {
  return {
    CONTACT_FORM_D1: createMockD1(),
    NEXT_INC_CACHE_KV: createMockKV(),
    TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-turnstile-site-key',
    RESEND_API_KEY: 'test-resend-api-key',
    RESEND_FROM_EMAIL: 'noreply@test.com',
    RESEND_TO_EMAIL: 'admin@test.com',
    AIRTABLE_API_KEY: 'test-airtable-api-key',
    AIRTABLE_BASE_ID: 'test-airtable-base-id',
    AIRTABLE_TABLE_NAME: 'test-airtable-table',
    NOTIFICATION_EMAIL: 'notification@test.com',
    ...overrides,
  }
}

/** @deprecated Use createMockEnvironment instead */
export const createMockEnv = createMockEnvironment
