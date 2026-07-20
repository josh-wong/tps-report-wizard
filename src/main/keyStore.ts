import { safeStorage } from 'electron'
import Store from 'electron-store'
import type { Provider } from '@shared/types'

interface KeyStoreData {
  provider: Provider | null
  // Encrypted key bytes stored as base64 strings, one per provider.
  encryptedKeys: Partial<Record<Provider, string>>
  // Whether the user wants the AI engine active. Tracked separately from key
  // presence so unchecking "Use my AI API key" persists across restarts instead
  // of reverting to AI mode just because a key still exists in safeStorage.
  enabled: boolean
}

const store = new Store<KeyStoreData>({
  name: 'provider-keys',
  defaults: { provider: null, encryptedKeys: {}, enabled: false }
})

export interface KeyStore {
  saveKey(provider: Provider, key: string): void
  getKey(provider: Provider): string | null
  setProvider(provider: Provider): void
  setActiveProvider(provider: Provider): boolean
  setEnabled(enabled: boolean): void
  getStatus(): { provider: Provider | null; hasKey: boolean; savedProviders: Provider[] }
  deleteKey(provider: Provider): boolean
}

export function createKeyStore(): KeyStore {
  return {
    saveKey(provider: Provider, key: string): void {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('safeStorage encryption is not available on this machine.')
      }
      const encrypted = safeStorage.encryptString(key)
      const encryptedKeys = store.get('encryptedKeys')
      store.set('encryptedKeys', { ...encryptedKeys, [provider]: encrypted.toString('base64') })
    },

    getKey(provider: Provider): string | null {
      if (!safeStorage.isEncryptionAvailable()) return null
      const encryptedKeys = store.get('encryptedKeys')
      const b64 = encryptedKeys[provider]
      if (!b64) return null
      try {
        return safeStorage.decryptString(Buffer.from(b64, 'base64'))
      } catch {
        // Distinct from "no key saved" so callers can tell the user their
        // stored key is corrupted (e.g. OS keychain changed) rather than
        // just missing.
        throw new Error('KEY_DECRYPT_FAILED')
      }
    },

    setProvider(provider: Provider): void {
      store.set('provider', provider)
    },

    // Switches which saved key is active without requiring the user to
    // re-enter it. Only succeeds if a key already exists for that provider,
    // otherwise callers should route the user through saveKey instead.
    setActiveProvider(provider: Provider): boolean {
      const encryptedKeys = store.get('encryptedKeys')
      if (!encryptedKeys[provider]) return false
      store.set('provider', provider)
      return true
    },

    setEnabled(enabled: boolean): void {
      store.set('enabled', enabled)
    },

    deleteKey(provider: Provider): boolean {
      const encryptedKeys = store.get('encryptedKeys')
      if (!encryptedKeys || !encryptedKeys[provider]) return false

      const newKeys = { ...encryptedKeys }
      delete newKeys[provider]
      store.set('encryptedKeys', newKeys)

      if (store.get('provider') === provider) {
        const remaining = (Object.keys(newKeys) as Provider[])[0] ?? null
        store.set('provider', remaining)
      }
      return true
    },

    getStatus(): { provider: Provider | null; hasKey: boolean; savedProviders: Provider[] } {
      const provider = store.get('provider')
      const savedProviders = Object.keys(store.get('encryptedKeys')) as Provider[]
      if (!provider || !store.get('enabled')) {
        return { provider: null, hasKey: false, savedProviders }
      }
      const encryptedKeys = store.get('encryptedKeys')
      const hasKey = !!encryptedKeys[provider]
      return { provider: provider as Provider | null, hasKey, savedProviders }
    }
  }
}
