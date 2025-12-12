/**
 * Shared fetch utility with timeout, retry, and exponential backoff.
 *
 * Features:
 * - Timeout via AbortSignal.timeout()
 * - Exponential backoff with jitter
 * - Retriable: network errors, HTTP 5xx, HTTP 429
 * - Non-retriable: HTTP 4xx (except 429)
 */

/** Error classification for fetch failures */
export type FetchErrorClassification =
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'http_retriable'
  | 'http_non_retriable'

/** Configuration for fetchWithRetry */
export interface FetchRetryConfig {
  /** Max retry attempts (excluding initial request). Default: 3 */
  maxRetries?: number
  /** Initial retry delay in ms. Default: 1000 */
  initialDelayMs?: number
  /** Request timeout in ms. Default: 10000 */
  timeoutMs?: number
}

/** Custom error with classification for better error handling */
export class FetchRetryError extends Error {
  readonly classification: FetchErrorClassification
  readonly status?: number
  readonly responseBody?: unknown

  constructor(
    message: string,
    classification: FetchErrorClassification,
    status?: number,
    responseBody?: unknown,
    cause?: unknown,
  ) {
    super(message, { cause })
    this.name = 'FetchRetryError'
    this.classification = classification
    this.status = status
    this.responseBody = responseBody
  }

  get retriable(): boolean {
    return (
      this.classification === 'network' ||
      this.classification === 'timeout' ||
      this.classification === 'http_retriable'
    )
  }
}

const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  timeoutMs: 10_000,
} as const

/**
 * Fetch with automatic retry and exponential backoff.
 *
 * @throws {FetchRetryError} On non-retriable errors or exhausted retries
 */
export async function fetchWithRetry<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  config?: FetchRetryConfig,
): Promise<T> {
  const { maxRetries, initialDelayMs, timeoutMs } = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const url = extractUrl(input)
  const totalAttempts = maxRetries + 1

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(input, init, timeoutMs)

      if (response.ok) {
        return (await response.json()) as T
      }

      const { status } = response
      const isRetriable = isRetriableStatus(status)
      const body = await safeParseJson(response)

      if (isRetriable && attempt < totalAttempts) {
        const delay = calculateBackoff(attempt, initialDelayMs)
        console.warn(
          `[fetchWithRetry] HTTP ${String(status)} from ${url}, retrying in ${String(delay)}ms (${String(attempt)}/${String(totalAttempts)})`,
        )
        await sleep(delay)
        continue
      }

      throw new FetchRetryError(
        `HTTP ${String(status)} from ${url}`,
        isRetriable ? 'http_retriable' : 'http_non_retriable',
        status,
        body,
      )
    } catch (error) {
      if (error instanceof FetchRetryError) {
        throw error
      }

      const classification = classifyError(error, init?.signal)

      if (classification === 'aborted') {
        throw new FetchRetryError(`Request aborted: ${url}`, 'aborted')
      }

      if (attempt < totalAttempts) {
        const delay = calculateBackoff(attempt, initialDelayMs)
        console.warn(
          `[fetchWithRetry] ${classification} error for ${url}, retrying in ${String(delay)}ms (${String(attempt)}/${String(totalAttempts)})`,
        )
        await sleep(delay)
        continue
      }

      throw new FetchRetryError(
        error instanceof Error ? error.message : `Fetch failed: ${url}`,
        classification,
        undefined,
        undefined,
        error,
      )
    }
  }

  throw new FetchRetryError(`Exhausted retries for ${url}`, 'network')
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal

  return fetch(input, { ...init, signal })
}

function isRetriableStatus(status: number): boolean {
  return status === 429 || status >= 500
}

function calculateBackoff(attempt: number, initialDelayMs: number): number {
  const base = initialDelayMs * 2 ** (attempt - 1)
  const jitter = 0.5 + Math.random() * 0.5
  return Math.round(base * jitter)
}

function sleep(ms: number): Promise<void> {
  if (isTestEnvironment()) {
    return Promise.resolve()
  }
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isTestEnvironment(): boolean {
  if (typeof process === 'undefined') return false
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'
}

function classifyError(
  error: unknown,
  signal?: AbortSignal | null,
): 'timeout' | 'aborted' | 'network' {
  if (error instanceof Error && error.name === 'AbortError') {
    return signal?.aborted ? 'aborted' : 'timeout'
  }
  return 'network'
}

function extractUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  return input.url
}

async function safeParseJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return undefined
  }
}
