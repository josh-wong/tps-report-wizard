import Store from 'electron-store'

interface NagSettingsData {
  quietMode: boolean
}

const store = new Store<NagSettingsData>({
  name: 'nag-settings',
  defaults: { quietMode: false }
})

export interface NagSettingsStore {
  getQuietMode(): boolean
  setQuietMode(enabled: boolean): void
}

export function createNagSettingsStore(): NagSettingsStore {
  return {
    getQuietMode(): boolean {
      return store.get('quietMode')
    },
    setQuietMode(enabled: boolean): void {
      store.set('quietMode', enabled)
    }
  }
}
