export enum RenderObjectLayer {
  TERRAIN = 'terrain',
  OVER_TERRAIN = 'overTerrain'
}

export abstract class RenderObject {
  xWorldPosition! : number
  yWorldPosition! : number
  zLevel! : number
  spriteSheetTexture!: WebGLTexture
  uvCoordinates!: number[]
  height!: number;
  width!: number;
  angleRotation!: number | null
  offsetRotation!: number
}