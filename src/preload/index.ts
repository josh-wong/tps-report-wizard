import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc'
import type { IpcApi } from '../shared/ipc'

// Narrow, typed bridge exposed to the renderer. No channel ever returns a
// decrypted API key (SEC-2). Report persistence handlers (list/get/save/
// remove) are wired up in the main process; the remaining calls will reject
// with "no handler registered" until the AI provider and export phases wire
// them up too — that is expected at this stage.
const electronAPI: IpcApi = {
  generate: (req) => ipcRenderer.invoke(IPC_CHANNELS.generate, req),
  reviewWithBobs: (req) => ipcRenderer.invoke(IPC_CHANNELS.reviewWithBobs, req),
  testConnection: (p) => ipcRenderer.invoke(IPC_CHANNELS.testConnection, p),
  saveKey: (p, key) => ipcRenderer.invoke(IPC_CHANNELS.saveKey, p, key),
  getProviderStatus: () => ipcRenderer.invoke(IPC_CHANNELS.getProviderStatus),
  listReports: () => ipcRenderer.invoke(IPC_CHANNELS.listReports),
  getReport: (id) => ipcRenderer.invoke(IPC_CHANNELS.getReport, id),
  saveReport: (r) => ipcRenderer.invoke(IPC_CHANNELS.saveReport, r),
  removeReport: (id) => ipcRenderer.invoke(IPC_CHANNELS.removeReport, id),
  exportPdf: (r) => ipcRenderer.invoke(IPC_CHANNELS.exportPdf, r)
}

// Use `contextBridge` APIs to expose Electron APIs to the renderer only if
// context isolation is enabled — it always is (see src/main/index.ts).
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI
}
