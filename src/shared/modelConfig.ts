// All model identifiers live here. Never hardcode a model string in feature
// code (TC-4). Verify current IDs against provider docs before each release.
export const MODEL_CONFIG = {
  claude: {
    default: 'claude-haiku-4-5-20251001',
    quality: 'claude-sonnet-4-6'
  },
  openai: {
    default: 'gpt-4o-mini',
    quality: 'gpt-4o'
  }
} as const
