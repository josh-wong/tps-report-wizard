import { beforeEach, describe, expect, it, vi } from 'vitest'

const encryptionAvailable = { value: true }
const decryptFails = { value: false }

vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => encryptionAvailable.value,
    // Fake "encryption" that's easy to invert/corrupt in tests.
    encryptString: (plain: string) => Buffer.from(`enc:${plain}`),
    decryptString: (buf: Buffer) => {
      if (decryptFails.value) throw new Error('decryption failed')
      const text = buf.toString()
      if (!text.startsWith('enc:')) throw new Error('bad ciphertext')
      return text.slice('enc:'.length)
    }
  }
}))

vi.mock('electron-store', () => {
  return {
    default: class FakeStore<T extends Record<string, unknown>> {
      private data: T
      constructor(opts: { defaults: T }) {
        this.data = { ...opts.defaults }
      }
      get<K extends keyof T>(key: K): T[K] {
        return this.data[key]
      }
      set<K extends keyof T>(key: K, value: T[K]): void {
        this.data[key] = value
      }
    }
  }
})

describe('keyStore', () => {
  let createKeyStore: typeof import('./keyStore').createKeyStore

  beforeEach(async () => {
    encryptionAvailable.value = true
    decryptFails.value = false
    vi.resetModules()
    ;({ createKeyStore } = await import('./keyStore'))
  })

  it('round-trips a saved key through encrypt/decrypt', () => {
    const store = createKeyStore()
    store.saveKey('claude', 'sk-ant-test')
    expect(store.getKey('claude')).toBe('sk-ant-test')
  })

  it('returns null for a provider with no saved key', () => {
    const store = createKeyStore()
    expect(store.getKey('openai')).toBeNull()
  })

  it('throws KEY_DECRYPT_FAILED when the stored ciphertext cannot be decrypted', () => {
    const store = createKeyStore()
    store.saveKey('claude', 'sk-ant-test')

    // Simulate a decrypt failure (e.g. OS keychain changed) on a subsequent read.
    decryptFails.value = true
    expect(() => store.getKey('claude')).toThrowError('KEY_DECRYPT_FAILED')
  })

  it('getKey returns null when encryption is unavailable', () => {
    encryptionAvailable.value = false
    const store = createKeyStore()
    expect(store.getKey('claude')).toBeNull()
  })

  it('saveKey throws when encryption is unavailable', () => {
    encryptionAvailable.value = false
    const store = createKeyStore()
    expect(() => store.saveKey('claude', 'sk-ant-test')).toThrow()
  })

  it('deleteKey removes the key and clears provider if it matched', () => {
    const store = createKeyStore()
    store.saveKey('claude', 'sk-ant-test')
    store.setProvider('claude')
    store.setEnabled(true)

    expect(store.deleteKey('claude')).toBe(true)
    expect(store.getKey('claude')).toBeNull()
    expect(store.getStatus()).toEqual({ provider: null, hasKey: false })
  })

  it('deleteKey returns false when there was nothing to delete', () => {
    const store = createKeyStore()
    expect(store.deleteKey('claude')).toBe(false)
  })

  it('getStatus reports hasKey only when a provider is set, a key exists, and enabled is true', () => {
    const store = createKeyStore()
    store.saveKey('claude', 'sk-ant-test')
    store.setProvider('claude')

    // Not yet enabled.
    expect(store.getStatus()).toEqual({ provider: null, hasKey: false })

    store.setEnabled(true)
    expect(store.getStatus()).toEqual({ provider: 'claude', hasKey: true })
  })

  it('disabling persists independently of key presence (does not revert on next read)', () => {
    const store = createKeyStore()
    store.saveKey('claude', 'sk-ant-test')
    store.setProvider('claude')
    store.setEnabled(true)
    expect(store.getStatus().hasKey).toBe(true)

    store.setEnabled(false)
    // Key is still in storage, but the user's disable choice must win.
    expect(store.getStatus()).toEqual({ provider: null, hasKey: false })
    expect(store.getKey('claude')).toBe('sk-ant-test')
  })
})
