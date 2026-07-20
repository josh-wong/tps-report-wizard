import { useEffect, useState } from 'react'
import type { Provider } from '@shared/types'
import { DeleteKeyConfirmDialog } from '../components/DeleteKeyConfirmDialog'

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  claude: 'Claude'
}

interface SettingsScreenProps {
  initialProvider: Provider | null
  initialHasKey: boolean
  onClose: () => void
  onStatusChange: (provider: Provider | null, hasKey: boolean) => void
}

function SettingsScreen({
  initialProvider,
  initialHasKey,
  onClose,
  onStatusChange
}: SettingsScreenProps): React.JSX.Element {
  const [useAi, setUseAi] = useState(initialHasKey)
  const [provider, setProvider] = useState<Provider>(initialProvider ?? 'claude')
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [quietMode, setQuietModeState] = useState(false)

  useEffect(() => {
    window.electronAPI
      .getQuietMode()
      .then(setQuietModeState)
      .catch((err) => console.error('Failed to get quiet mode:', err))
  }, [])

  const handleQuietModeChange = (checked: boolean): void => {
    setQuietModeState(checked)
    void window.electronAPI.setQuietMode(checked)
  }

  const handleSaveKey = async (): Promise<void> => {
    if (!apiKey.trim()) return
    setSaving(true)
    setSaveMessage(null)
    setTestResult(null)
    try {
      await window.electronAPI.saveKey({ provider }, apiKey)
      onStatusChange(provider, true)
      setSaveMessage('Key saved.')
      setApiKey('')
    } catch {
      setSaveMessage('Failed to save key. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (): Promise<void> => {
    setTesting(true)
    setTestResult(null)
    try {
      // Pass the unsaved key from the input field so the user can test before
      // committing. Falls back to the stored key in main if the field is empty.
      const result = await window.electronAPI.testConnection({ provider }, apiKey || undefined)
      setTestResult(result)
    } catch {
      setTestResult({ ok: false, message: 'Connection test failed.' })
    } finally {
      setTesting(false)
    }
  }

  const handleProviderChange = (p: Provider): void => {
    setProvider(p)
    setTestResult(null)
    setSaveMessage(null)
    setApiKey('') // Clear the API key state when changing providers.
  }

  const handleUseAiChange = (checked: boolean): void => {
    setUseAi(checked)
    void window.electronAPI.setEngineEnabled(checked)
    if (!checked) {
      onStatusChange(null, false)
    }
  }

  const handleDeleteKey = async (): Promise<void> => {
    setConfirmingDelete(false)
    setDeleting(true)
    setSaveMessage(null)
    setTestResult(null)
    try {
      const success = await window.electronAPI.deleteKeys({ provider })
      if (success) {
        onStatusChange(null, false)
        setSaveMessage('Key deleted.')
        setUseAi(false)
      } else {
        setSaveMessage('Failed to delete key.')
      }
    } catch {
      setSaveMessage('Failed to delete key.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {confirmingDelete && (
        <DeleteKeyConfirmDialog
          providerLabel={PROVIDER_LABELS[provider]}
          onConfirm={handleDeleteKey}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
      <div className="window-body tps-body">
        <fieldset>
          <legend>Report engine</legend>
          <div className="field-row">
            <input
              id="engine-local"
              type="radio"
              name="engine"
              checked={!useAi}
              onChange={(e) => handleUseAiChange(!e.target.checked)}
            />
            <label htmlFor="engine-local">Corporate Nonsense Engine (offline, no key)</label>
          </div>
          <div className="field-row">
            <input
              id="engine-ai"
              type="radio"
              name="engine"
              checked={useAi}
              onChange={(e) => handleUseAiChange(e.target.checked)}
            />
            <label htmlFor="engine-ai">Use my AI API key (desktop only)</label>
          </div>
        </fieldset>

        {useAi && (
          <fieldset>
            <legend>AI provider</legend>

            <div
              className="memo-banner"
              style={{ background: '#ffe', borderColor: '#aa8', marginBottom: 10 }}
            >
              💰 Pricing and models as of July 2026. For up-to-date pricing, check{' '}
              <a
                href="https://platform.claude.com/docs/en/about-claude/pricing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Anthropic
              </a>{' '}
              or{' '}
              <a
                href="https://developers.openai.com/api/docs/pricing"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI
              </a>
              .
            </div>

            <div className="field-row" style={{ marginBottom: 10, gap: 16 }}>
              <input
                id="provider-claude"
                type="radio"
                name="provider"
                checked={provider === 'claude'}
                onChange={() => handleProviderChange('claude')}
              />
              <label htmlFor="provider-claude">
                Anthropic (Claude Haiku 4.5) – $1/$5 per 1M tokens
              </label>
              <input
                id="provider-openai"
                type="radio"
                name="provider"
                checked={provider === 'openai'}
                onChange={() => handleProviderChange('openai')}
              />
              <label htmlFor="provider-openai">OpenAI (GPT-5.6 Luna) – $1/$6 per 1M tokens</label>
            </div>

            <div className="field-row-stacked" style={{ marginBottom: 10 }}>
              <label htmlFor="api-key">
                API key{' '}
                <span className="note">
                  {initialHasKey ? '– A key is already saved; enter a new one to replace it' : ''}
                </span>
              </label>
              <input
                id="api-key"
                type="password"
                placeholder={provider === 'claude' ? 'sk-ant-…' : 'sk-proj-…'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setSaveMessage(null)
                }}
                style={{ width: '100%' }}
              />
            </div>

            <div className="field-row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={handleSaveKey} disabled={saving || !apiKey.trim()}>
                {saving ? 'Saving…' : 'Save key'}
              </button>
              <button type="button" onClick={handleTest} disabled={testing}>
                {testing ? 'Testing…' : 'Test connection'}
              </button>
              {initialHasKey && (
                <button type="button" onClick={() => setConfirmingDelete(true)} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete key'}
                </button>
              )}
              {testResult && (
                <span className={testResult.ok ? 'settings-ok' : 'settings-err'}>
                  {testResult.ok ? '✓ ' : '✗ '}
                  {testResult.message}
                </span>
              )}
              {saveMessage && <span className="note">{saveMessage}</span>}
            </div>
          </fieldset>
        )}

        <div
          className="memo-banner"
          style={{ background: '#eef', borderColor: '#88a', marginTop: 12 }}
        >
          🔒 Your key is encrypted locally (safeStorage) and never leaves this machine. Calls go out
          from the main process; the app never puts your key in the browser or a URL.
        </div>

        <fieldset style={{ marginTop: 12 }}>
          <legend>Nag notifications</legend>
          <div className="field-row">
            <input
              id="quiet-mode"
              type="checkbox"
              checked={quietMode}
              onChange={(e) => handleQuietModeChange(e.target.checked)}
            />
            <label htmlFor="quiet-mode">Quiet mode – Don&apos;t nag me about unfiled reports</label>
          </div>
        </fieldset>

        <div className="editor-actions" style={{ marginTop: 12 }}>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  )
}

export default SettingsScreen
