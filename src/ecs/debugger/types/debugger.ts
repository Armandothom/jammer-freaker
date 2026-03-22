abstract class DebuggerPainterOrderBase {
  color! : string; //hexCode
  ignoreZoomFactor?: boolean
}

export abstract class DebuggerPainterOrderCircle extends DebuggerPainterOrderBase {
  type! : 'circle'
  centroidX! : number;
  centroidY! : number;
  width! : number;
}

export abstract class DebuggerPainterOrderFill extends DebuggerPainterOrderBase {
  type! : 'fill'
  x!: number
  y!: number
  width! : number;
  height! : number;
}

export type DebuggerPaintOrder = DebuggerPainterOrderCircle | DebuggerPainterOrderFill;
