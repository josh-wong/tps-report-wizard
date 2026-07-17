import { app, shell, BrowserWindow, session, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerReportIpcHandlers } from './ipc'
import type { NagIpcHooks } from './ipc'
import { ElectronStoreBackend } from './store/electronStoreBackend'
import { createKeyStore } from './keyStore'
import { createNagSettingsStore } from './nag/nagSettingsStore'
import { TrayNagController } from './nag/trayNagController'
import { createAppMenu, updateMenuState } from './menu'
import type { MenuState } from './menu'
import { IPC_CHANNELS } from '@shared/ipc'

const CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"

function createWindow(hasDraftPresent: () => boolean): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 720,
    minHeight: 560,
    show: false,
    autoHideMenuBar: true,
    title: "Initech TPS Report Wizard '99",
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Only ever hand off http(s) links to the OS browser — never file://,
    // javascript:, or other schemes that could be smuggled in via
    // AI-generated report content in a later phase (SEC-3).
    try {
      const url = new URL(details.url)
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        shell.openExternal(details.url)
      }
    } catch {
      // Malformed URL — ignore rather than risk passing it to the shell.
    }
    return { action: 'deny' }
  })

  // "You can't just leave" close-attempt guard (FR-6b, FR-6d). Intercept the
  // native close (X button, Cmd+Q, etc.); if a draft report exists, offer a
  // Lumbergh-flavored choice. "Close anyway" always works — the guardrail is
  // a gag, not a trap.
  let forceClose = false
  mainWindow.on('close', (event) => {
    if (forceClose) return
    if (!hasDraftPresent()) return

    event.preventDefault()
    ipcMain.once(IPC_CHANNELS.confirmCloseResponse, (_event, closeAnyway: unknown) => {
      if (closeAnyway === true) {
        forceClose = true
        mainWindow.close()
      }
    })
    mainWindow.webContents.send(IPC_CHANNELS.confirmCloseRequest)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.initech.tps-report-wizard')

  // Enforce CSP at the network layer too, on top of the <meta> tag in
  // index.html (SEC-3: keys/content never leak via a loosened policy).
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CONTENT_SECURITY_POLICY]
      }
    })
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const reportStore = new ElectronStoreBackend()
  const nagSettings = createNagSettingsStore()

  const nagControllerRef: { current: TrayNagController | null } = { current: null }
  const mainWindow = createWindow(() => nagControllerRef.current?.hasDraftPresent() ?? false)

  const nagController = new TrayNagController(mainWindow, nagSettings)
  nagControllerRef.current = nagController
  nagController.attach()

  const nagHooks: NagIpcHooks = {
    getQuietMode: () => nagController.getQuietMode(),
    setQuietMode: (enabled) => nagController.setQuietMode(enabled),
    onActivityPing: () => nagController.onActivityPing(),
    onDraftPresentChanged: (present) => nagController.setDraftPresent(present),
    onReportSaved: (report) => {
      if (report.status === 'filed') nagController.onReportFiled()
    }
  }

  registerReportIpcHandlers(reportStore, createKeyStore(), nagHooks)

  let currentMenuState: MenuState = {
    hasActiveReport: false,
    isEditing: false,
    hasReports: false
  }

  const currentAppMenu = createAppMenu(mainWindow, currentMenuState)
  Menu.setApplicationMenu(currentAppMenu)

  const setMenuState = (updates: Partial<MenuState>): void => {
    currentMenuState = { ...currentMenuState, ...updates }
    updateMenuState(currentAppMenu, currentMenuState)
  }

  ipcMain.handle(IPC_CHANNELS.menuUpdateReportState, (_event, updates: unknown) => {
    if (typeof updates !== 'object' || updates === null) return
    const allowedKeys = ['hasActiveReport', 'isEditing', 'hasReports'] as const
    const validated: Partial<MenuState> = {}
    for (const key of allowedKeys) {
      const value = (updates as Record<string, unknown>)[key]
      if (typeof value === 'boolean') {
        validated[key] = value
      }
    }
    setMenuState(validated)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(() => nagController.hasDraftPresent())
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q, consistent with the per-OS tray behavior in
// TrayNagController (design doc §11.4).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
