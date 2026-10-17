import { Assets, Container, Texture } from 'pixi.js'
import { parseMap, parseTsx, ResolvedMap, TiledMap, TiledMapData } from 'pixi-tiledmap'

export default class MapManager {
  public view!: Container
  public tileSize!: number
  public width!: number
  public height!: number

  private mapData!: ResolvedMap

  public async load() {
    const mapRaw: TiledMapData = await (await fetch('assets/town.tmj')).json()
    const tilesRaw = await (await fetch('assets/tiles.tsx')).text()

    const externalTilesets = new Map()
    externalTilesets.set('tiles.tsx', parseTsx(tilesRaw))

    const mapData = parseMap(mapRaw, { externalTilesets })
    for (const layer of mapData.layers.filter(l => ['safezone', 'level', 'npc', 'warp'].includes(l.name))) {
      layer.visible = false
    }

    const tilesetTextures = new Map<string, Texture>()
    tilesetTextures.set('tiles.png', await Assets.load('assets/tiles.png'))

    const view = new TiledMap(mapData, { tilesetTextures })

    this.view = view
    this.mapData = mapData

    this.tileSize = this.mapData.tilewidth
    this.width = this.mapData.width * this.tileSize
    this.height = this.mapData.height * this.tileSize
  }

  public isBlocked(x: number, y: number): boolean {
    if (y < 0 || y >= this.height / this.tileSize) return true

    for (const layer of this.mapData.layers) {
      if (layer.type !== 'tilelayer' || !layer.tiles || layer.name === 'Ground') continue

      const tile = layer.tiles[y * this.mapData.width + x]
      if (!tile) continue

      const tileset = this.mapData.tilesets[0]
      const tilesetTile = tileset.tiles.get(tile.localId)

      const blocked = tilesetTile?.properties?.some(
        prop => prop.name === 'blocked'
      ) ?? false

      return blocked
    }

    return false
  }
}
