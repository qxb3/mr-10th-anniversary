export type Direction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'

type MoveHandler = (
  direction: Direction,
) => void

export default class Control {
  private readonly onMove: MoveHandler

  private readonly keys = new Set<string>()

  constructor(onMove: MoveHandler) {
    this.onMove = onMove

    window.addEventListener(
      'keydown',
      this.handleKeyDown,
    )

    window.addEventListener(
      'keyup',
      this.handleKeyUp,
    )
  }

  update() {
    const direction = this.getHeldDirection()

    if (direction) {
      this.onMove(direction)
    }
  }

  private handleKeyDown = (
    event: KeyboardEvent,
  ) => {
    const key = event.key.toLowerCase()

    if (!this.isMovementKey(key)) {
      return
    }

    if (event.repeat) {
      return
    }

    this.keys.add(key)
  }

  private handleKeyUp = (
    event: KeyboardEvent,
  ) => {
    this.keys.delete(
      event.key.toLowerCase(),
    )
  }

  private getHeldDirection(): Direction | null {
    if (
      this.keys.has('w') ||
      this.keys.has('arrowup')
    ) {
      return 'up'
    }

    if (
      this.keys.has('s') ||
      this.keys.has('arrowdown')
    ) {
      return 'down'
    }

    if (
      this.keys.has('a') ||
      this.keys.has('arrowleft')
    ) {
      return 'left'
    }

    if (
      this.keys.has('d') ||
      this.keys.has('arrowright')
    ) {
      return 'right'
    }

    return null
  }

  private isMovementKey(key: string) {
    return (
      key === 'w' ||
      key === 'a' ||
      key === 's' ||
      key === 'd' ||
      key === 'arrowup' ||
      key === 'arrowdown' ||
      key === 'arrowleft' ||
      key === 'arrowright'
    )
  }

  destroy() {
    window.removeEventListener(
      'keydown',
      this.handleKeyDown,
    )

    window.removeEventListener(
      'keyup',
      this.handleKeyUp,
    )

    this.keys.clear()
  }
}
