// Retries a provider call on rate-limit responses only (CLAUDE.md: "treat
// provider rate limits as a first-class concern... implement reasonable
// concurrency, backoff, and error handling"). All other errors (auth,
// billing, network) are rethrown immediately — retrying those just delays
// a failure the user needs to see.
function isRateLimitError(err: unknown): boolean {
  const errorObj = err as Record<string, unknown>
  const status = errorObj?.status as number | undefined
  const errorType = (errorObj?.error as Record<string, unknown>)?.type as string | undefined
  const msg = err instanceof Error ? err.message.toLowerCase() : ''
  return (
    status === 429 ||
    errorType === 'rate_limit_error' ||
    msg.includes('429') ||
    msg.includes('rate limit')
  )
}

export interface RetryOptions {
  retries?: number
  baseDelayMs?: number
}

export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, baseDelayMs = 500 }: RetryOptions = {}
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt >= retries || !isRateLimitError(err)) throw err
      const delay = baseDelayMs * 2 ** attempt
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}
