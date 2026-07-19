import { Menu, BrowserWindow, app, type MenuItemConstructorOptions } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'

export interface MenuState {
  hasActiveReport: boolean
  isEditing: boolean
  hasReports: boolean
}

export function createAppMenu(mainWindow: BrowserWindow, state: MenuState): Menu {
  const isMac = process.platform === 'darwin'

  const fileMenu: MenuItemConstructorOptions = {
    label: '&File',
    submenu: [
      {
        label: '&New report',
        accelerator: 'CmdOrCtrl+N',
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuNewReport)
      },
      {
        id: 'openReport',
        label: '&Open report',
        accelerator: 'CmdOrCtrl+O',
        enabled: state.hasReports && !state.isEditing,
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuOpenReport)
      },
      { type: 'separator' },
      {
        id: 'saveReport',
        label: '&Save report',
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

  const helpMenu: MenuItemConstructorOptions = {
    label: '&Help',
    submenu: [
      {
        label: '&Keyboard shortcuts',
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuKeyboardShortcuts)
      },
      { type: 'separator' },
      {
        label: '&About',
        click: () => mainWindow.webContents.send(IPC_CHANNELS.menuAbout)
      }
    ]
  }

  const template: MenuItemConstructorOptions[] = [fileMenu, helpMenu]

  return Menu.buildFromTemplate(template)
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
}
