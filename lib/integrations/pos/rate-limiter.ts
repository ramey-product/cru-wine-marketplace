/**
 * Rate Limiter with Exponential Backoff and Jitter
 *
 * Used by all POS adapters to handle API rate limits gracefully.
 * Implements retry logic with exponential backoff and random jitter
 * to avoid thundering herd problems when multiple retailers sync
 * simultaneously.
 *
 * Usage:
 *   const limiter = new RateLimiter({ maxRetries: 3, baseDelayMs: 500 })
 *   const data = await limiter.execute(() => fetch(url))
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for the rate limiter. */
export interface RateLimiterConfig {
  /** Maximum number of retry attempts. Default: 3. */
  maxRetries?: number
  /** Base delay in milliseconds for the first retry. Default: 500. */
  baseDelayMs?: number
  /** Maximum delay cap in milliseconds. Default: 30000 (30 seconds). */
  maxDelayMs?: number
  /** Jitter factor (0 to 1). 0 = no jitter, 1 = full jitter. Default: 1. */
  jitterFactor?: number
  /** HTTP status codes that should trigger a retry. Default: [429, 500, 502, 503, 504]. */
  retryableStatusCodes?: number[]
}

/** Error thrown when all retry attempts are exhausted. */
export class RateLimitExhaustedError extends Error {
  public readonly attempts: number
  public readonly lastStatusCode: number | undefined

  constructor(
    message: string,
    attempts: number,
    lastStatusCode?: number
  ) {
    super(message)
    this.name = 'RateLimitExhaustedError'
    this.attempts = attempts
    this.lastStatusCode = lastStatusCode
  }
}

// ---------------------------------------------------------------------------
// RateLimiter class
// ---------------------------------------------------------------------------

/**
 * Executes async operations with automatic retry on rate limit errors.
 *
 * Backoff formula: delay = min(baseDelay * 2^attempt, maxDelay)
 * Jitter:         delay = delay * (1 - jitterFactor * random())
 *
 * This ensures retries are spread over time and don't create synchronized
 * bursts that would exacerbate rate limiting.
 */
export class RateLimiter {
  private readonly maxRetries: number
  private readonly baseDelayMs: number
  private readonly maxDelayMs: number
  private readonly jitterFactor: number
  private readonly retryableStatusCodes: Set<number>

  constructor(config: RateLimiterConfig = {}) {
    this.maxRetries = config.maxRetries ?? 3
    this.baseDelayMs = config.baseDelayMs ?? 500
    this.maxDelayMs = config.maxDelayMs ?? 30_000
    this.jitterFactor = Math.max(0, Math.min(1, config.jitterFactor ?? 1))
    this.retryableStatusCodes = new Set(
      config.retryableStatusCodes ?? [429, 500, 502, 503, 504]
    )
  }

  /**
   * Execute an async operation with retry logic.
   *
   * The `fn` callback should perform the API call and return the Response.
   * If the response has a retryable status code, the limiter waits and retries.
   * If a `Retry-After` header is present, it is honored (up to maxDelayMs).
   *
   * @param fn - Async function that returns a fetch Response
   * @returns The successful Response
   * @throws RateLimitExhaustedError if all retries are exhausted
   */
  async execute(fn: () => Promise<Response>): Promise<Response> {
    let lastResponse: Response | undefined
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fn()

        // Success or non-retryable error — return immediately
        if (!this.retryableStatusCodes.has(response.status)) {
          return response
        }

        // Retryable status — store response and potentially retry
        lastResponse = response

        // If this was the last attempt, don't wait — fall through to throw
        if (attempt === this.maxRetries) {
          break
        }

        // Calculate delay, honoring Retry-After if present
        const delay = this.calculateDelay(attempt, response)
        await this.sleep(delay)
      } catch (err) {
        // Network errors (DNS failure, timeout, etc.) are retryable
        lastError = err instanceof Error ? err : new Error(String(err))

        if (attempt === this.maxRetries) {
          break
        }

        const delay = this.calculateDelay(attempt)
        await this.sleep(delay)
      }
    }

    // All retries exhausted
    const statusCode = lastResponse?.status
    const message = lastError
      ? `Rate limiter exhausted after ${this.maxRetries + 1} attempts: ${lastError.message}`
      : `Rate limiter exhausted after ${this.maxRetries + 1} attempts (HTTP ${statusCode})`

    throw new RateLimitExhaustedError(
      message,
      this.maxRetries + 1,
      statusCode
    )
  }

  /**
   * Calculate the delay for a given retry attempt.
   *
   * Uses exponential backoff with optional jitter.
   * Honors the `Retry-After` header if present on the response.
   */
  private calculateDelay(attempt: number, response?: Response): number {
    // Check for Retry-After header
    const retryAfter = response?.headers.get('Retry-After')
    if (retryAfter) {
      const retryAfterMs = this.parseRetryAfter(retryAfter)
      if (retryAfterMs > 0) {
        return Math.min(retryAfterMs, this.maxDelayMs)
      }
    }

    // Exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = this.baseDelayMs * Math.pow(2, attempt)
    const cappedDelay = Math.min(exponentialDelay, this.maxDelayMs)

    // Apply jitter: reduce delay by a random factor
    const jitter = 1 - this.jitterFactor * Math.random()
    return Math.floor(cappedDelay * jitter)
  }

  /**
   * Parse the Retry-After header value.
   * Supports both seconds (integer) and HTTP-date formats.
   * Returns delay in milliseconds.
   */
  private parseRetryAfter(value: string): number {
    // Try parsing as integer (seconds)
    const seconds = parseInt(value, 10)
    if (!isNaN(seconds) && seconds > 0) {
      return seconds * 1000
    }

    // Try parsing as HTTP-date
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      const delayMs = date.getTime() - Date.now()
      return delayMs > 0 ? delayMs : 0
    }

    return 0
  }

  /** Sleep for the specified number of milliseconds. */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
