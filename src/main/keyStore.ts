import { safeStorage } from 'electron'
import Store from 'electron-store'
import type { Provider } from '@shared/types'

interface KeyStoreData {
  provider: Provider | null
  // Encrypted key bytes stored as base64 strings, one per provider.
  encryptedKeys: Partial<Record<Provider, string>>
}

const store = new Store<KeyStoreData>({
  name: 'provider-keys',
  defaults: { provider: null, encryptedKeys: {} }
})

export interface KeyStore {
  saveKey(provider: Provider, key: string): void
  getKey(provider: Provider): string | null
  setProvider(provider: Provider): void
  getStatus(): { provider: Provider | null; hasKey: boolean }
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
      } catch (err) {
        console.warn('Failed to decrypt API key for provider:', provider)
        return null
      }
    },

    setProvider(provider: Provider): void {
      store.set('provider', provider)
    },

    deleteKey(provider: Provider): boolean {
      const encryptedKeys = store.get('encryptedKeys')
      if (!encryptedKeys || !encryptedKeys[provider]) return false
      
      // 1. Remove the specific key entry
      const newKeys = { ...encryptedKeys }
      delete newKeys[provider]
      store.set('encryptedKeys', newKeys)

      // 2. Global State Reset (Crucial for Requirement 1/Usability): If we delete a provider and that was the active provider, reset to 'No Key Available'.
      if (store.get('provider') === provider && !newKeys[provider]) {
        store.set('provider', null) // Reset the active provider field if it was cleared accidentally
      }
      return true
    },

    getStatus(): { provider: Provider | null; hasKey: boolean } {
      const provider = store.get('provider')
      if (!provider) return { provider: null, hasKey: false }
      const encryptedKeys = store.get('encryptedKeys')
      const hasKey = !!encryptedKeys[provider]
      return { provider: provider as Provider | null, hasKey }
    }
  }
}
