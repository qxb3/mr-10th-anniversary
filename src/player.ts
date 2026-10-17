import {
  AnimatedSprite,
  Container,
  Texture,
} from 'pixi.js'

import Map from './map.ts'
import type { Direction } from './control.ts'

type PlayerEvent =
  | 'moveStart'
  | 'moveComplete'

type PlayerEventData = {
  moveStart: {
    direction: Direction
    fromX: number
    fromY: number
    toX: number
    toY: number
  }

  moveComplete: {
    direction: Direction
    tileX: number
    tileY: number
  }
}

type Listener<T> = (data: T) => void

export default class Player {
  readonly view: Container

  tileX: number
  tileY: number

  private readonly tileSize = 16
  private readonly moveDuration = 0.2

  private moving = false
  private moveElapsed = 0

  private startX = 0
  private startY = 0

  private targetX = 0
  private targetY = 0

  private map!: Map

  private direction: Direction = 'down'

  private readonly player: AnimatedSprite
  private readonly frames: Texture[]

  private readonly listeners = {
    moveStart: new Set<
      Listener<PlayerEventData['moveStart']>
    >(),

    moveComplete: new Set<
      Listener<PlayerEventData['moveComplete']>
    >(),
  }

  constructor(
    tileX: number,
    tileY: number,
    texture: Texture,
    map: Map,
  ) {
    this.tileX = tileX
    this.tileY = tileY
    this.map = map

    this.view = new Container()

    this.frames = Array.from(
      { length: 10 },
      (_, index) => {
        return new Texture({
          source: texture.source,
          frame: {
            x: index * this.tileSize,
            y: 0,
            width: this.tileSize,
            height: this.tileSize,
          },
        })
      },
    )

    this.player = new AnimatedSprite(
      this.frames,
    )

    this.player.animationSpeed = 0.15
    this.player.loop = true

    this.view.addChild(this.player)

    this.setIdleAnimation()

    this.view.position.set(
      tileX * this.tileSize,
      tileY * this.tileSize,
    )
  }

  update(deltaTime: number) {
    const deltaSeconds = deltaTime / 60

    if (this.moving) {
      this.updateMovement(deltaSeconds)
    }
  }

  move(direction: Direction) {
    if (this.moving) {
      return
    }

    this.startMovement(direction)
  }

  private startMovement(direction: Direction) {
    let targetX = this.tileX
    let targetY = this.tileY

    this.direction = direction

    switch (direction) {
      case 'up':
        targetY--
        break

      case 'down':
        targetY++
        break

      case 'left':
        targetX--
        break

      case 'right':
        targetX++
        break
    }

    if (this.map.isBlocked(targetX, targetY)) {
      this.setIdleAnimation()
      return
    }

    this.startX = this.tileX
    this.startY = this.tileY

    this.targetX = targetX
    this.targetY = targetY

    this.moveElapsed = 0
    this.moving = true

    this.setRunningAnimation()

    this.emit('moveStart', {
      direction,
      fromX: this.startX,
      fromY: this.startY,
      toX: this.targetX,
      toY: this.targetY,
    })
  }

  private updateMovement(
    deltaSeconds: number,
  ) {
    this.moveElapsed += deltaSeconds

    const progress = Math.min(
      this.moveElapsed / this.moveDuration,
      1,
    )

    const x = this.lerp(
      this.startX,
      this.targetX,
      progress,
    )

    const y = this.lerp(
      this.startY,
      this.targetY,
      progress,
    )

    this.view.position.set(
      x * this.tileSize,
      y * this.tileSize,
    )

    if (progress >= 1) {
      this.tileX = this.targetX
      this.tileY = this.targetY

      this.view.position.set(
        this.tileX * this.tileSize,
        this.tileY * this.tileSize,
      )

      this.moving = false
      this.moveElapsed = 0

      this.setIdleAnimation()

      this.emit('moveComplete', {
        direction: this.direction,
        tileX: this.tileX,
        tileY: this.tileY,
      })
    }
  }

  private setIdleAnimation() {
    let frameIndex: number

    switch (this.direction) {
      case 'up':
        frameIndex = 0
        break

      case 'down':
        frameIndex = 4
        break

      case 'left':
        frameIndex = 6
        break

      case 'right':
        frameIndex = 8
        break
    }

    this.player.stop()

    this.player.textures = [
      this.frames[frameIndex],
    ]

    this.player.gotoAndStop(0)
  }

  private setRunningAnimation() {
    let frames: Texture[]

    switch (this.direction) {
      case 'up':
        frames = [
          this.frames[1],
          this.frames[2],
        ]
        break

      case 'down':
        frames = [
          this.frames[3],
          this.frames[4],
          this.frames[5],
        ]
        break

      case 'left':
        frames = [
          this.frames[6],
          this.frames[7],
        ]
        break

      case 'right':
        frames = [
          this.frames[8],
          this.frames[9],
        ]
        break
    }

    this.player.textures = frames
    this.player.animationSpeed = 0.15
    this.player.loop = true
    this.player.play()
  }

  on<K extends PlayerEvent>(
    event: K,
    listener: Listener<PlayerEventData[K]>,
  ) {
    this.listeners[event].add(
      listener as never,
    )

    return () => {
      this.off(event, listener)
    }
  }

  off<K extends PlayerEvent>(
    event: K,
    listener: Listener<PlayerEventData[K]>,
  ) {
    this.listeners[event].delete(
      listener as never,
    )
  }

  private emit<K extends PlayerEvent>(
    event: K,
    data: PlayerEventData[K],
  ) {
    for (const listener of this.listeners[event]) {
      listener(data as never)
    }
  }

  private lerp(
    start: number,
    end: number,
    amount: number,
  ) {
    return start + (end - start) * amount
  }

  destroy() {
    this.listeners.moveStart.clear()
    this.listeners.moveComplete.clear()

    this.view.destroy({
      children: true,
    })
  }
}
