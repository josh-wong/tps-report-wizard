import type { IpcApi } from '../shared/ipc'
import type { MenuApi } from './index'

declare global {
  interface Window {
    electronAPI: IpcApi
    menuAPI: MenuApi
  }
}
