abstract class DebugPainterOrderBase {
  color! : string; //hexCode
  ignoreZoomFactor?: boolean
}

export abstract class DebugPainterOrderCircle extends DebugPainterOrderBase {
  type! : 'circle'
  centroidX! : number;
  centroidY! : number;
  width! : number;
}

export abstract class DebugPainterOrderFill extends DebugPainterOrderBase {
  type! : 'fill'
  x!: number
  y!: number
  width! : number;
  height! : number;
}

export type DebuggerPaintOrder = DebugPainterOrderCircle | DebugPainterOrderFill;

export class DebuggerSpawnerOrder {
  x! : number;
  y! : number;
  type! : DebuggerSpawnerOrderType;
}

export class DebuggerMoveOrder {
  x! : number;
  y! : number;
  entityId! : number;
}

export enum DebuggerSpawnerOrderType {
  INFANTRY = "infantry"
}
