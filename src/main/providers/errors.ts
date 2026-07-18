// Converts raw provider/network errors into in-character messages before they
// cross the IPC boundary (SEC-3, design doc §15). Never leaks stack traces or
// raw API response bodies to the renderer.
export function humanizeError(err: unknown): string {
  const errorObj = err as Record<string, unknown>
  const msg = err instanceof Error ? err.message.toLowerCase() : ''
  const status = errorObj?.status as number | undefined
  const errorType = (errorObj?.error as Record<string, unknown>)?.type as string | undefined

  // Handle missing API key
  if (msg.includes('no_ai_key')) {
    return 'No API key configured. Set up your OpenAI or Claude API key in Settings.'
  }
  // Handle a stored key that fails to decrypt (e.g. OS keychain changed)
  if (msg.includes('key_decrypt_failed')) {
    return 'Your saved key could not be read. Please re-enter it in Settings.'
  }

  // Check structured error properties first (OpenAI/Anthropic SDKs)
  if (
    status === 401 ||
    errorType === 'authentication_error' ||
    errorType === 'invalid_request_error'
  ) {
    return "Yeaaah… that key doesn't seem to be working. If you could go ahead and check it."
  }
  if (status === 429 || errorType === 'rate_limit_error') {
    return 'The Bobs are in a meeting. Rate limit hit—try again in a moment.'
  }
  if (status === 402 || status === 400 || errorType === 'billing_error') {
    return 'Your account appears to be out of quota. Check your billing details.'
  }

  // Fall back to message string matching
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid api key')) {
    return "Yeaaah… that key doesn't seem to be working. If you could go ahead and check it."
  }
  if (msg.includes('429') || msg.includes('rate limit')) {
    return 'The Bobs are in a meeting. Rate limit hit—try again in a moment.'
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('econnrefused')) {
    return "Can't reach the server right now. Check your connection and try again."
  }
  if (msg.includes('quota') || msg.includes('billing') || msg.includes('insufficient')) {
    return 'Your account appears to be out of quota. Check your billing details.'
  }

  return 'Something went wrong on our end. Try again, or use the Nonsense Engine.'
}
