import { Application, Container } from 'pixi.js'

export default class Camera {
  x = 0
  y = 0
  zoom = 1

  constructor(
    private world: Container,
    private mapWidth: number,
    private mapHeight: number,
    private app: Application,
  ) {}

  follow(x: number, y: number) {
    this.x = x
    this.y = y

    this.update()
  }

  setZoom(zoom: number) {
    this.zoom = zoom
    this.update()
  }

  update() {
    const screenW = this.app.screen.width
    const screenH = this.app.screen.height

    const viewW = screenW / this.zoom
    const viewH = screenH / this.zoom

    const halfW = viewW / 2
    const halfH = viewH / 2

    if (viewW >= this.mapWidth) {
      this.x = this.mapWidth / 2
    } else {
      this.x = Math.max(
        halfW,
        Math.min(this.mapWidth - halfW, this.x)
      )
    }

    if (viewH >= this.mapHeight) {
      this.y = this.mapHeight / 2
    } else {
      this.y = Math.max(
        halfH,
        Math.min(this.mapHeight - halfH, this.y)
      )
    }

    this.world.scale.set(this.zoom)

    this.world.position.set(
      screenW / 2 - this.x * this.zoom,
      screenH / 2 - this.y * this.zoom,
    )
  }
}
