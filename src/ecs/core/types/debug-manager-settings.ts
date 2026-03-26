export enum DebugSettingKey {
  SPRITE_BOUNDS = "spriteBounds",
  DEBUG_PAINT = "debugPaint",
  AI_PATH = "aiPath",
}

export class DebugManagerSettings {
  showSpriteBounds : boolean;
  showDebugPaint : boolean;
  showAiPath : boolean;

  constructor() {
    this.showSpriteBounds = false;
    this.showDebugPaint = false;
    this.showAiPath = false;
  } 
}