import { EventEmitter } from 'events'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Report } from '@shared/types'

vi.mock('../../../resources/icon.png?asset', () => ({ default: '/fake/icon.png' }))

const trayInstances: FakeTray[] = []

class FakeTray {
  toolTip = ''
  contextMenu: unknown = null
  handlers: Record<string, () => void> = {}
  constructor() {
    trayInstances.push(this)
  }
  setToolTip(text: string): void {
    this.toolTip = text
  }
  setContextMenu(menu: unknown): void {
    this.contextMenu = menu
  }
  on(event: string, handler: () => void): void {
    this.handlers[event] = handler
  }
}

const notificationInstances: FakeNotification[] = []

class FakeNotification {
  handlers: Record<string, (...args: unknown[]) => void> = {}
  shown = false
  constructor(public opts: { title: string; body: string }) {
    notificationInstances.push(this)
  }
  on(event: string, handler: (...args: unknown[]) => void): void {
    this.handlers[event] = handler
  }
  show(): void {
    this.shown = true
  }
}

vi.mock('electron', () => ({
  app: { dock: { setBadge: vi.fn() }, badgeCount: 0 },
  Notification: FakeNotification,
  Tray: FakeTray,
  Menu: { buildFromTemplate: (template: unknown) => template },
  nativeImage: { createFromPath: () => ({ resize: () => 'fake-image' }) }
}))

class FakeWindow extends EventEmitter {
  shown = false
  focused = false
  show(): void {
    this.shown = true
  }
  focus(): void {
    this.focused = true
  }
}

function makeReport(status: 'draft' | 'filed'): Report {
  return {
    id: 'TPS-0001',
    author: 'peter',
    department: 'Accounting',
    date: '2026-07-16',
    seed: 'seed',
    body: 'body',
    coverSheet: true,
    status,
    createdAt: 0,
    updatedAt: 0
  }
}

describe('TrayNagController', () => {
  let TrayNagController: typeof import('./trayNagController').TrayNagController

  beforeEach(async () => {
    vi.resetModules()
    vi.useFakeTimers()
    trayInstances.length = 0
    notificationInstances.length = 0
    ;({ TrayNagController } = await import('./trayNagController'))
  })

  function setup(
    reports: Report[],
    quietMode = false
  ): {
    controller: InstanceType<typeof TrayNagController>
    window: FakeWindow
  } {
    const window = new FakeWindow()
    const store = {
      list: vi.fn().mockResolvedValue(reports),
      get: vi.fn(),
      save: vi.fn(),
      remove: vi.fn()
    }
    const settings = {
      getQuietMode: () => quietMode,
      setQuietMode: vi.fn()
    }
    const controller = new TrayNagController(
      window as unknown as import('electron').BrowserWindow,
      store,
      settings
    )
    controller.attach()
    return { controller, window }
  }

  it('does not nag when there is no draft report', async () => {
    const { window } = setup([makeReport('filed')])
    window.emit('blur')
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000)
    expect(notificationInstances.length).toBe(0)
  })

  it('does not nag when quiet mode is enabled', async () => {
    const { window } = setup([makeReport('draft')], true)
    window.emit('blur')
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000)
    expect(notificationInstances.length).toBe(0)
  })

  it('shows a notification after the idle threshold with a draft present', async () => {
    const { window } = setup([makeReport('draft')])
    window.emit('blur')
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000)
    expect(notificationInstances.length).toBe(1)
  })

  it('stops nagging once the window regains focus', async () => {
    const { window } = setup([makeReport('draft')])
    window.emit('blur')
    await vi.advanceTimersByTimeAsync(0)
    window.emit('focus')
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000)
    expect(notificationInstances.length).toBe(0)
  })

  it('restores and focuses the window when a nag notification is clicked', async () => {
    const { window } = setup([makeReport('draft')])
    window.emit('blur')
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000)

    notificationInstances[0].handlers.click()
    expect(window.shown).toBe(true)
    expect(window.focused).toBe(true)
  })

  it('creates a tray icon on attach', () => {
    setup([makeReport('draft')])
    expect(trayInstances.length).toBe(1)
  })
})
