import { app, BrowserWindow, Notification, Tray, Menu, nativeImage } from 'electron'
import { NagScheduler } from './NagScheduler'
import type { NagSettingsStore } from './nagSettingsStore'
import icon from '../../../resources/icon.png?asset'

const ACTIVITY_DEBOUNCE_MS = 5000

/**
 * Wires the pure NagScheduler state machine to real Electron timers, tray,
 * notifications, and window focus/blur — active only while the window is
 * away (blurred) and a draft report exists (design doc §11.3).
 *
 * "Draft present" is reported by the renderer (setDraftPresent), not read
 * from the ReportStore: an in-progress draft only lives in renderer state
 * until it's filed, so the store never contains an unsaved draft to find.
 */
export class TrayNagController {
  private readonly scheduler: NagScheduler
  private tray: Tray | null = null
  private timer: NodeJS.Timeout | null = null
  private lastActivityPing = 0
  private draftPresent = false

  constructor(
    private readonly mainWindow: BrowserWindow,
    private readonly settings: NagSettingsStore
  ) {
    this.scheduler = new NagScheduler({ quietMode: settings.getQuietMode() })
  }

  attach(): void {
    this.createTray()

    this.mainWindow.on('blur', () => this.handleBlur())
    this.mainWindow.on('focus', () => this.handleFocus())
    this.mainWindow.on('show', () => this.handleFocus())
  }

  onActivityPing(): void {
    const now = Date.now()
    if (now - this.lastActivityPing < ACTIVITY_DEBOUNCE_MS) return
    this.lastActivityPing = now
    this.scheduler.onActivityDetected()
    this.rearm()
  }

  onReportFiled(): void {
    this.scheduler.onDraftFiled()
    this.clearTimer()
    this.updateBadge()
  }

  setDraftPresent(present: boolean): void {
    this.draftPresent = present
    if (!present) {
      this.scheduler.onDraftFiled()
      this.clearTimer()
      this.updateBadge()
    }
  }

  hasDraftPresent(): boolean {
    return this.draftPresent
  }

  setQuietMode(enabled: boolean): void {
    this.settings.setQuietMode(enabled)
    this.scheduler.setQuietMode(enabled)
    if (enabled) {
      this.clearTimer()
      this.updateBadge()
    }
    this.updateTrayMenu()
  }

  getQuietMode(): boolean {
    return this.settings.getQuietMode()
  }

  private handleBlur(): void {
    if (!this.draftPresent) return
    this.scheduler.onWindowBlurred()
    this.rearm()
  }

  private handleFocus(): void {
    this.scheduler.onWindowFocused()
    this.clearTimer()
    this.updateBadge()
  }

  private rearm(): void {
    this.clearTimer()
    if (this.scheduler.getState() === 'idle' || this.scheduler.getState() === 'silent_badge') {
      return
    }
    this.timer = setTimeout(
      () => this.handleIdleThresholdExceeded(),
      this.scheduler.getNextBackoffMs()
    )
  }

  private handleIdleThresholdExceeded(): void {
    if (!this.draftPresent) {
      this.scheduler.onDraftFiled()
      return
    }

    const state = this.scheduler.onIdleThresholdExceeded()
    this.updateBadge()

    if (state === 'silent_badge') return

    this.showNagNotification()
    this.rearm()
  }

  private showNagNotification(): void {
    const message = this.scheduler.getNagMessage()
    if (!message) return

    // Notification actions render on macOS; other platforms fall back to
    // click-to-focus only, which still satisfies "Finish it" (FR-6c.4).
    const notification = new Notification({
      title: "Initech TPS Report Wizard '99",
      body: message,
      actions: [
        { type: 'button', text: 'Finish it' },
        { type: 'button', text: 'Snooze 15m' }
      ]
    })

    notification.on('click', () => this.finishIt())
    notification.on('action', (_event, index) => {
      if (index === 0) this.finishIt()
      else this.snooze()
    })

    notification.show()
  }

  private finishIt(): void {
    this.mainWindow.show()
    this.mainWindow.focus()
  }

  private snooze(): void {
    this.clearTimer()
    this.timer = setTimeout(() => this.handleIdleThresholdExceeded(), 15 * 60 * 1000)
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private updateBadge(): void {
    const showBadge = this.scheduler.getState() === 'silent_badge'
    if (process.platform === 'darwin') {
      app.dock?.setBadge(showBadge ? '•' : '')
    }
    app.badgeCount = showBadge ? 1 : 0
    this.updateTrayMenu()
  }

  private createTray(): void {
    const trayIcon = nativeImage.createFromPath(icon).resize({ width: 16, height: 16 })
    this.tray = new Tray(trayIcon)
    this.tray.setToolTip("Initech TPS Report Wizard '99")
    this.tray.on('click', () => this.finishIt())
    this.updateTrayMenu()
  }

  private updateTrayMenu(): void {
    if (!this.tray) return
    const menu = Menu.buildFromTemplate([
      { label: 'Finish report', click: () => this.finishIt() },
      {
        label: 'Quiet mode',
        type: 'checkbox',
        checked: this.settings.getQuietMode(),
        click: (item) => this.setQuietMode(item.checked)
      },
      { type: 'separator' },
      { label: 'Quit', role: 'quit' }
    ])
    this.tray.setContextMenu(menu)
  }
}
