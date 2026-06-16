import type { DebuggerPaintOrder } from "../../ecs/debugger-orders/types/debugger.js";
import type { CameraViewport } from "../world-map/types/camera-viewport.js";
import type { RenderObject } from "./types/render-objects.js";

export interface RendererFrame {
  deltaTime: number;
  viewport: CameraViewport;
  worldWidth: number;
  worldHeight: number;
  worldRenderObjects: RenderObject[];
  uiRenderObjects: RenderObject[];
  debugBorderSprites: boolean;
  debugPaintOrders: DebuggerPaintOrder[];
}
