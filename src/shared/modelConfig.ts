// All model identifiers live here. Never hardcode a model string in feature
// code (TC-4). Verify current IDs against provider docs before each release.
//
// Current pricing (per 1M tokens):
// - claude-haiku-4-5: $1 input / $5 output
//   https://platform.claude.com/docs/en/about-claude/pricing
// - gpt-5.6-luna: $1 input / $6 output
//   https://developers.openai.com/api/docs/pricing
export const MODEL_CONFIG = {
  claude: {
    default: 'claude-haiku-4-5'
  },
  openai: {
    default: 'gpt-5.6-luna'
  }
} as const

// Human-readable names for the models above, for display in the UI.
export const MODEL_LABELS = {
  claude: 'Claude Haiku 4.5',
  openai: 'GPT-5.6 Luna'
} as const
