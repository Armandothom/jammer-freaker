/**
 * BaseSprite taken from the tileset, contains only static data. Used to map the tile from the tileset source image.
**/
export abstract class BaseSprite {
  tilesetCoord! : {row : number, col : number}
}