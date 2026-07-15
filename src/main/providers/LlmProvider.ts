import type { Provider } from '@shared/types'

export interface LlmProvider {
  readonly id: Provider
  complete(input: { system: string; user: string; maxTokens?: number }): Promise<string>
  test(): Promise<{ ok: boolean; message: string }>
}
