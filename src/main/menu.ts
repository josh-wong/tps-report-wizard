import { Menu, BrowserWindow, app } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'

export interface MenuState {
  hasActiveReport: boolean
  isEditing: boolean
  hasReports: boolean
}

export function createAppMenu(mainWindow: BrowserWindow, state: MenuState): Menu {
  const isMac = process.platform === 'darwin'

  const fileMenu = {
    label: '&File',
    submenu: [
      {
        label: '&New Report',
        accelerator: 'CmdOrCtrl+N',
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuNewReport)
      },
      {
        id: 'openReport',
        label: '&Open Report',
        accelerator: 'CmdOrCtrl+O',
        enabled: state.hasReports && !state.isEditing,
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuOpenReport)
      },
      { type: 'separator' },
      {
        id: 'saveReport',
        label: '&Save Report',
        accelerator: 'CmdOrCtrl+S',
        enabled: state.hasActiveReport && state.isEditing,
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuSaveReport)
      },
      {
        id: 'exportPdf',
        label: '&Export as PDF',
        accelerator: 'CmdOrCtrl+E',
        enabled: state.hasActiveReport && state.isEditing,
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuExportPdf)
      },
      {
        id: 'print',
        label: '&Print',
        accelerator: 'CmdOrCtrl+P',
        enabled: state.hasActiveReport,
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuPrint)
      },
      { type: 'separator' },
      {
        label: 'Se&ttings',
        accelerator: 'CmdOrCtrl+,',
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuSettings)
      },
      { type: 'separator' },
      isMac
        ? { role: 'quit' as const }
        : {
            label: 'E&xit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => app.quit()
          }
    ]
  }

  const editMenu = {
    label: '&Edit',
    submenu: [
      { role: 'undo' as const },
      { role: 'redo' as const },
      { type: 'separator' as const },
      { role: 'cut' as const },
      { role: 'copy' as const },
      { role: 'paste' as const },
      ...(isMac
        ? [
            { type: 'separator' as const },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' as const }, { role: 'stopSpeaking' as const }]
            }
          ]
        : [])
    ]
  }

  const reportsMenu = {
    label: '&Reports',
    submenu: [
      {
        id: 'recentReports',
        label: '&Recent Reports',
        enabled: state.hasReports,
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuRecentReports)
      }
    ]
  }

  const flairMenu = {
    label: 'F&lair',
    submenu: [
      {
        label: 'Flair Coming Soon',
        enabled: false
      }
    ]
  }

  const helpMenu = {
    label: '&Help',
    submenu: [
      {
        label: '&Keyboard Shortcuts',
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuKeyboardShortcuts)
      },
      { type: 'separator' },
      {
        label: '&About',
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuAbout)
      }
    ]
  }

  const template = [fileMenu, editMenu, reportsMenu, flairMenu, helpMenu]

  return Menu.buildFromTemplate(template as any)
}

export function updateMenuState(menu: Menu, state: MenuState): void {
  // Find and update menu items by iterating through the menu items
  const updateItem = (label: string, enabled: boolean): void => {
    const item = menu.getMenuItemById(label)
    if (item) {
      item.enabled = enabled
    }
  }

  updateItem('openReport', state.hasReports && !state.isEditing)
  updateItem('saveReport', state.hasActiveReport && state.isEditing)
  updateItem('exportPdf', state.hasActiveReport && state.isEditing)
  updateItem('print', state.hasActiveReport)
  updateItem('recentReports', state.hasReports)
}
