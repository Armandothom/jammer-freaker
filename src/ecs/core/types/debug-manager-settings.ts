export enum DebugSettingKey {
  SPRITE_BOUNDS = "spriteBounds",
  DEBUG_PAINT = "debugPaint",
  AI_PATH = "aiPath",
  INSPECT_TILE = "inspectTile",
}

export class DebugManagerSettings {
  showSpriteBounds : boolean;
  showDebugPaint : boolean;
  showAiPath : boolean;
  showInspectTile : boolean;

  constructor() {
    this.showSpriteBounds = false;
    this.showDebugPaint = false;
    this.showAiPath = false;
    this.showInspectTile = false;
  } 
}
