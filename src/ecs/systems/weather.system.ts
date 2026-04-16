import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { extractUvBounds } from "../../game/renderer/renderer-shared.js";
import { WeatherManager } from "../../game/weather/weather-manager.js";
import { ResolvedAmbientEffectConfig } from "../../game/weather/weather-types.js";
import { ISystem } from "./system.interface.js";

export class WeatherSystem implements ISystem {
  constructor(
    private weatherManager: WeatherManager,
    private spriteManager: SpriteManager,
    private rendererEngine: RendererEngine,
  ) {}

  update(_deltaTime: number): void {
    this.rendererEngine.setRainConfig(this.weatherManager.getRainConfig());
    this.rendererEngine.setAmbientEffects(this.resolveAmbientEffects());
    this.rendererEngine.setScreenEffectTint(this.weatherManager.getScreenEffectTint());
  }

  private resolveAmbientEffects(): ResolvedAmbientEffectConfig[] {
    return this.weatherManager.getAmbientEffects().map((effect) => {
      const spriteDetails = this.spriteManager.getSpriteProperties(effect.spriteName, effect.spriteSheetName);
      const spriteWidth = effect.spriteWidth ?? spriteDetails.sprite.originalRenderSpriteWidth;
      const spriteHeight = effect.spriteHeight ?? spriteDetails.sprite.originalRenderSpriteHeight;

      return {
        ...effect,
        spriteSheetTexture: spriteDetails.spriteSheet.texture,
        spriteWidth,
        spriteHeight,
        uvBounds: extractUvBounds(
          this.spriteManager.getUvCoordinates(effect.spriteName, effect.spriteSheetName),
        ),
      };
    });
  }
}
