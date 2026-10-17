import { Application, Assets, Container, TextureStyle } from 'pixi.js'

import Map from './map.ts'
import Camera from './camera.ts'

import Player from './player.ts'
import Control from './control.ts'

(async () => {
  const app = await initApp()

  const world = new Container()
  app.stage.addChild(world)

  const map = new Map()
  await map.load()

  world.addChild(map.view)

  const camera = new Camera(world, map.width, map.height, app)
  camera.setZoom(4)

  const playerTexture = await Assets.load('assets/player.png')

  const player = new Player(6, 19, playerTexture, map)
  world.addChild(player.view)

  const control = new Control((direction) => {
    player.move(direction)
  })

  app.ticker.add((time) => {
    control.update()
    player.update(time.deltaTime)
    camera.follow(player.view.x, player.view.y)
  })
})()

async function initApp() {
  TextureStyle.defaultOptions.scaleMode = 'nearest'

  const app = new Application()
  await app.init({ background: '#000000', resizeTo: window })

  document
    .getElementById('pixi-container')!
    .appendChild(app.canvas)

  return app
}
