import { useState } from 'react'
import type { Provider } from '@shared/types'

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
    if (!checked) {
      onStatusChange(null, false)
    } else if (initialHasKey) {
      onStatusChange(provider, true)
    }
  }

  const handleDeleteKey = async (): Promise<void> => {
    if (!window.confirm(`Delete the ${provider} API key?`)) return
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
          <label htmlFor="engine-ai">Use my AI key (desktop only)</label>
        </div>
      </fieldset>

      {useAi && (
        <fieldset>
          <legend>AI provider</legend>

          <div className="field-row" style={{ marginBottom: 10, gap: 16 }}>
            <input
              id="provider-claude"
              type="radio"
              name="provider"
              checked={provider === 'claude'}
              onChange={() => handleProviderChange('claude')}
            />
            <label htmlFor="provider-claude">Claude</label>
            <input
              id="provider-openai"
              type="radio"
              name="provider"
              checked={provider === 'openai'}
              onChange={() => handleProviderChange('openai')}
            />
            <label htmlFor="provider-openai">OpenAI</label>
          </div>

          <div className="field-row-stacked" style={{ marginBottom: 10 }}>
            <label htmlFor="api-key">
              API key{' '}
              <span className="note">
                {initialHasKey ? '— a key is already saved; enter a new one to replace it' : ''}
              </span>
            </label>
            <input
              id="api-key"
              type="password"
              placeholder={provider === 'claude' ? 'sk-ant-…' : 'sk-…'}
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
              <button type="button" onClick={handleDeleteKey} disabled={deleting}>
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
        from the main process — the app never puts your key in the browser or a URL.
      </div>

      <div className="editor-actions" style={{ marginTop: 12 }}>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default SettingsScreen
