export type NagState = 'idle' | 'armed' | 'nag_1' | 'nag_2' | 'nag_3' | 'silent_badge'

export interface NagConfig {
  idleThresholdMs: number
  backoffSteps: number[]
  quoteLadder: string[]
  quietMode: boolean
}

export class NagScheduler {
  private state: NagState = 'idle'
  private config: NagConfig
  private nagCount = 0

  constructor(config: Partial<NagConfig> = {}) {
    this.config = {
      idleThresholdMs: 2 * 60 * 1000, // 2 minutes
      backoffSteps: [5 * 60 * 1000, 10 * 60 * 1000], // 5 min, 10 min
      quoteLadder: [
        "Yeah, I'm gonna need you to go ahead and finish that TPS report.",
        "Uh, we're still waiting for that TPS report. Could you get that to us as soon as possible?",
        'So if you could just find the time to finish that report, that would be greeeat.'
      ],
      quietMode: false,
      ...config
    }
  }

  getState(): NagState {
    return this.state
  }

  setQuietMode(enabled: boolean): void {
    this.config.quietMode = enabled
    if (enabled && this.state !== 'idle') {
      this.setState('idle')
      this.nagCount = 0
    }
  }

  onWindowFocused(): void {
    if (this.state !== 'idle') {
      this.setState('idle')
      this.nagCount = 0
    }
  }

  onWindowBlurred(): void {
    // When window loses focus with a draft, arm the scheduler
    // This is called separately with a check for draft existence
    if (this.state === 'idle' && !this.config.quietMode) {
      this.setState('armed')
    }
  }

  onActivityDetected(): void {
    // Activity detected while potentially nagging—reset to armed
    if (this.state !== 'idle' && !this.config.quietMode) {
      this.setState('armed')
      this.nagCount = 0
    }
  }

  onDraftFiled(): void {
    // Report was filed—stop all nagging
    this.setState('idle')
    this.nagCount = 0
  }

  onIdleThresholdExceeded(): NagState {
    if (this.config.quietMode || this.state === 'idle') {
      return this.state
    }

    if (this.state === 'armed') {
      this.setState('nag_1')
      this.nagCount = 1
    } else if (this.state === 'nag_1') {
      this.setState('nag_2')
      this.nagCount = 2
    } else if (this.state === 'nag_2') {
      this.setState('nag_3')
      this.nagCount = 3
    } else if (this.state === 'nag_3') {
      this.setState('silent_badge')
      this.nagCount = 3
    }

    return this.state
  }

  getNagMessage(): string | null {
    if (this.state === 'silent_badge' || this.state === 'idle' || this.nagCount === 0) {
      return null
    }

    const index = Math.min(this.nagCount - 1, this.config.quoteLadder.length - 1)
    return this.config.quoteLadder[index]
  }

  getNextBackoffMs(): number {
    if (this.state === 'armed') {
      return this.config.idleThresholdMs
    }

    const backoffIndex = this.nagCount - 1
    if (backoffIndex < 0 || backoffIndex >= this.config.backoffSteps.length) {
      return this.config.backoffSteps[this.config.backoffSteps.length - 1]
    }

    return this.config.backoffSteps[backoffIndex]
  }

  private setState(newState: NagState): void {
    this.state = newState
  }
}
