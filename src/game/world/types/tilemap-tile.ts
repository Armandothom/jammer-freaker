import { SpriteName } from "./sprite-name.enum.js"

export abstract class TilemapTile {
  x! : number
  y! : number
  spriteName! : SpriteName
}