import type { Tone, Provider } from './types'
import { buildSystemPrompt } from './tonePrompts'

// Pricing as of July 2026. Verify against official provider docs before each release:
// - Anthropic: https://platform.claude.com/docs/en/about-claude/pricing
// - OpenAI: https://developers.openai.com/api/docs/pricing
// If prices change, update both PRICE_PER_MILLION and the UI labels in SettingsScreen.tsx.
const PRICE_PER_MILLION = {
  claude: {
    input: 1.0,
    output: 5.0
  },
  openai: {
    input: 1.0,
    output: 6.0
  }
} as const

const TOKENS_PER_CHARACTER = 0.25 // Rough approximation: ~4 chars per token

function estimateTokens(text: string): number {
  return Math.ceil(text.length * TOKENS_PER_CHARACTER)
}

export function estimateGenerationCost(seed: string, tone: Tone, provider: Provider): number {
  const systemPrompt = buildSystemPrompt(tone)

  const inputTokens = estimateTokens(seed) + estimateTokens(systemPrompt)
  const maxOutputTokens = 700

  const pricing = PRICE_PER_MILLION[provider]
  const inputCost = (inputTokens * pricing.input) / 1_000_000
  const outputCost = (maxOutputTokens * pricing.output) / 1_000_000

  return inputCost + outputCost
}

export function formatCost(dollars: number): string {
  if (dollars < 0.001) {
    return `~$${(dollars * 1_000_000).toFixed(2)}µ`
  }
  return `~$${dollars.toFixed(4)}`
}
