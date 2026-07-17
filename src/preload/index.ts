import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc'
import type { IpcApi } from '../shared/ipc'

export interface MenuApi {
  onNewReport(callback: () => void): () => void
  onOpenReport(callback: () => void): () => void
  onSaveReport(callback: () => void): () => void
  onExportPdf(callback: () => void): () => void
  onPrint(callback: () => void): () => void
  onSettings(callback: () => void): () => void
  onAbout(callback: () => void): () => void
  onKeyboardShortcuts(callback: () => void): () => void
  onRecentReports(callback: () => void): () => void
  updateMenuState(state: {
    hasActiveReport?: boolean
    isEditing?: boolean
    hasReports?: boolean
  }): Promise<void>
  onConfirmCloseRequest(callback: () => void): () => void
  sendConfirmCloseResponse(closeAnyway: boolean): void
}

// No channel ever returns a decrypted API key (SEC-2).
const electronAPI: IpcApi = {
  generate: (req) => ipcRenderer.invoke(IPC_CHANNELS.generate, req),
  reviewWithBobs: (req) => ipcRenderer.invoke(IPC_CHANNELS.reviewWithBobs, req),
  testConnection: (p, candidateKey) =>
    ipcRenderer.invoke(IPC_CHANNELS.testConnection, p, candidateKey),
  saveKey: (p, key) => ipcRenderer.invoke(IPC_CHANNELS.saveKey, p, key),
  deleteKeys: (p) => ipcRenderer.invoke(IPC_CHANNELS.deleteKeys, p),
  setEngineEnabled: (enabled) => ipcRenderer.invoke(IPC_CHANNELS.setEngineEnabled, enabled),
  getProviderStatus: () => ipcRenderer.invoke(IPC_CHANNELS.getProviderStatus),
  listReports: () => ipcRenderer.invoke(IPC_CHANNELS.listReports),
  getReport: (id) => ipcRenderer.invoke(IPC_CHANNELS.getReport, id),
  saveReport: (r) => ipcRenderer.invoke(IPC_CHANNELS.saveReport, r),
  removeReport: (id) => ipcRenderer.invoke(IPC_CHANNELS.removeReport, id),
  exportPdf: (r) => ipcRenderer.invoke(IPC_CHANNELS.exportPdf, r),
  getQuietMode: () => ipcRenderer.invoke(IPC_CHANNELS.getQuietMode),
  setQuietMode: (enabled) => ipcRenderer.invoke(IPC_CHANNELS.setQuietMode, enabled),
  activityPing: () => ipcRenderer.send(IPC_CHANNELS.activityPing),
  setDraftPresent: (present) => ipcRenderer.send(IPC_CHANNELS.setDraftPresent, present)
}

const menuApi: MenuApi = {
  onNewReport: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuNewReport, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuNewReport, callback)
  },
  onOpenReport: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuOpenReport, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuOpenReport, callback)
  },
  onSaveReport: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuSaveReport, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuSaveReport, callback)
  },
  onExportPdf: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuExportPdf, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuExportPdf, callback)
  },
  onPrint: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuPrint, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuPrint, callback)
  },
  onSettings: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuSettings, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuSettings, callback)
  },
  onAbout: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuAbout, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuAbout, callback)
  },
  onKeyboardShortcuts: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuKeyboardShortcuts, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuKeyboardShortcuts, callback)
  },
  onRecentReports: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.menuRecentReports, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.menuRecentReports, callback)
  },
  updateMenuState: (state) => ipcRenderer.invoke(IPC_CHANNELS.menuUpdateReportState, state),
  onConfirmCloseRequest: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.confirmCloseRequest, callback)
    return () => ipcRenderer.off(IPC_CHANNELS.confirmCloseRequest, callback)
  },
  sendConfirmCloseResponse: (closeAnyway) =>
    ipcRenderer.send(IPC_CHANNELS.confirmCloseResponse, closeAnyway)
}

// Use `contextBridge` APIs to expose Electron APIs to the renderer only if
// context isolation is enabled — it always is (see src/main/index.ts).
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
    contextBridge.exposeInMainWorld('menuAPI', menuApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI
  // @ts-ignore (define in dts)
  window.menuAPI = menuApi
}
