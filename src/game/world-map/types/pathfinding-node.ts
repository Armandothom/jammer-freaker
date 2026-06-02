export abstract class PathfindingNode {
  x!: number
  y!: number
  h!: number
  f!: number
  g!: number
  previousCoordinate! : string | null
}

export abstract class PathfindingCoordinates {
  x! : number
  y! : number
}