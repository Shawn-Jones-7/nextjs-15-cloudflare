/**
 * Mock Interfaces for Testing
 *
 * These interfaces define the contract for test mocks.
 * Actual implementations go in src/tests/mocks/
 */

import type { Mock } from 'vitest'

// =============================================================================
// KVNamespace Mock Interface
// =============================================================================

export interface MockKVNamespace {
  get: Mock<
    (
      key: string,
      type?: 'text' | 'json' | 'arrayBuffer' | 'stream',
    ) => Promise<unknown>
  >
  put: Mock<
    (
      key: string,
      value: string,
      options?: KVNamespacePutOptions,
    ) => Promise<void>
  >
  delete: Mock<(key: string) => Promise<void>>
  list: Mock<
    (
      options?: KVNamespaceListOptions,
    ) => Promise<KVNamespaceListResult<unknown, string>>
  >

  // Test helper methods
  _store: Map<string, { value: string; expiration?: number }>
  _clear: () => void
}

export interface KVNamespacePutOptions {
  expiration?: number
  expirationTtl?: number
  metadata?: unknown
}

export interface KVNamespaceListOptions {
  prefix?: string
  limit?: number
  cursor?: string
}

export interface KVNamespaceListResult<Metadata, Key> {
  keys: Array<{ name: Key; expiration?: number; metadata?: Metadata }>
  list_complete: boolean
  cursor?: string
}

// =============================================================================
// D1Database Mock Interface
// =============================================================================

export interface MockD1Database {
  prepare: Mock<(query: string) => MockD1PreparedStatement>
  batch: Mock<(statements: MockD1PreparedStatement[]) => Promise<D1Result[]>>
  exec: Mock<(query: string) => Promise<D1ExecResult>>

  // Test helper methods
  _rows: Record<string, unknown>[]
  _setRows: (rows: Record<string, unknown>[]) => void
  _clear: () => void
}

export interface MockD1PreparedStatement {
  bind: Mock<(...values: unknown[]) => MockD1PreparedStatement>
  run: Mock<() => Promise<D1Result>>
  first: Mock<<T = unknown>() => Promise<T | null>>
  all: Mock<<T = unknown>() => Promise<D1Result<T>>>
}

export interface D1Result<T = unknown> {
  success: boolean
  results?: T[]
  meta?: {
    duration?: number
    changes?: number
    last_row_id?: number
    served_by?: string
  }
}

export interface D1ExecResult {
  count: number
  duration: number
}

// =============================================================================
// Cloudflare Environment Mock Interface
// =============================================================================

export interface MockCloudflareEnv {
  CONTACT_FORM_D1: MockD1Database
  NEXT_INC_CACHE_KV: MockKVNamespace
  TURNSTILE_SECRET_KEY: string
  RESEND_API_KEY: string
  RESEND_FROM_EMAIL: string
  RESEND_TO_EMAIL: string
}

// =============================================================================
// Fetch Mock Interfaces
// =============================================================================

export interface MockFetchResponse {
  ok: boolean
  status: number
  statusText: string
  json: Mock<() => Promise<unknown>>
  text: Mock<() => Promise<string>>
}

export interface TurnstileVerifyRequest {
  secret: string
  response: string
  remoteip?: string
}

export interface TurnstileVerifyResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

export interface ResendEmailRequest {
  from: string
  to: string
  subject: string
  html: string
}

export interface ResendEmailResponse {
  id?: string
  error?: { message: string }
}

// =============================================================================
// Mock Factory Function Signatures
// =============================================================================

/**
 * Creates an in-memory KVNamespace mock
 */
export type CreateMockKV = () => MockKVNamespace

/**
 * Creates an in-memory D1Database mock
 */
export type CreateMockD1 = () => MockD1Database

/**
 * Creates a complete Cloudflare environment mock
 */
export type CreateMockEnv = (
  overrides?: Partial<MockCloudflareEnv>,
) => MockCloudflareEnv

/**
 * Creates a mock fetch function for Turnstile verification
 */
export type CreateTurnstileFetchMock = (
  response: TurnstileVerifyResponse,
  options?: { delay?: number; throwError?: boolean },
) => Mock

/**
 * Creates a mock fetch function for Resend email API
 */
export type CreateResendFetchMock = (
  response: ResendEmailResponse,
  options?: { status?: number; delay?: number },
) => Mock
