import { describe, it, expect } from 'vitest'
import { NagScheduler } from './NagScheduler'

describe('NagScheduler', () => {
  it('should start in idle state', () => {
    const scheduler = new NagScheduler()
    expect(scheduler.getState()).toBe('idle')
  })

  it('should transition from idle to armed on window blur', () => {
    const scheduler = new NagScheduler()
    scheduler.onWindowBlurred()
    expect(scheduler.getState()).toBe('armed')
  })

  it('should return to idle on window focus', () => {
    const scheduler = new NagScheduler()
    scheduler.onWindowBlurred()
    expect(scheduler.getState()).toBe('armed')
    scheduler.onWindowFocused()
    expect(scheduler.getState()).toBe('idle')
  })

  it('should transition through nag states on idle threshold', () => {
    const scheduler = new NagScheduler()
    scheduler.onWindowBlurred()
    expect(scheduler.getState()).toBe('armed')

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getState()).toBe('nag_1')

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getState()).toBe('nag_2')

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getState()).toBe('nag_3')

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getState()).toBe('silent_badge')
  })

  it('should return to armed on activity detection', () => {
    const scheduler = new NagScheduler()
    scheduler.onWindowBlurred()
    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getState()).toBe('nag_1')

    scheduler.onActivityDetected()
    expect(scheduler.getState()).toBe('armed')
  })

  it('should return to idle when draft is filed', () => {
    const scheduler = new NagScheduler()
    scheduler.onWindowBlurred()
    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getState()).toBe('nag_1')

    scheduler.onDraftFiled()
    expect(scheduler.getState()).toBe('idle')
  })

  it('should not nag when quiet mode is enabled', () => {
    const scheduler = new NagScheduler({ quietMode: true })
    scheduler.onWindowBlurred()
    expect(scheduler.getState()).toBe('idle')
  })

  it('should return to idle when quiet mode is enabled mid-nag', () => {
    const scheduler = new NagScheduler()
    scheduler.onWindowBlurred()
    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getState()).toBe('nag_1')

    scheduler.setQuietMode(true)
    expect(scheduler.getState()).toBe('idle')
  })

  it('should provide correct nag messages from ladder', () => {
    const quoteLadder = ['msg1', 'msg2', 'msg3']
    const scheduler = new NagScheduler({ quoteLadder })
    scheduler.onWindowBlurred()

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getNagMessage()).toBe('msg1')

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getNagMessage()).toBe('msg2')

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getNagMessage()).toBe('msg3')

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getNagMessage()).toBeNull()
  })

  it('should return correct backoff times', () => {
    const scheduler = new NagScheduler({
      idleThresholdMs: 1000,
      backoffSteps: [2000, 3000]
    })

    scheduler.onWindowBlurred()
    expect(scheduler.getNextBackoffMs()).toBe(1000) // armed → first threshold

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getNextBackoffMs()).toBe(2000) // nag_1 → 5 min backoff

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getNextBackoffMs()).toBe(3000) // nag_2 → 10 min backoff

    scheduler.onIdleThresholdExceeded()
    expect(scheduler.getNextBackoffMs()).toBe(3000) // nag_3 → cap at last backoff
  })

  it('should handle multiple blur/focus cycles', () => {
    const scheduler = new NagScheduler()

    scheduler.onWindowBlurred()
    expect(scheduler.getState()).toBe('armed')

    scheduler.onWindowFocused()
    expect(scheduler.getState()).toBe('idle')

    scheduler.onWindowBlurred()
    expect(scheduler.getState()).toBe('armed')

    scheduler.onWindowFocused()
    expect(scheduler.getState()).toBe('idle')
  })
})
