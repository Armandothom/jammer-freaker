import { SOUND_KEYS, SOUND_VOLUME } from "../../game/asset-manager/consts/sound-mapped.values.js";
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { extractUvBounds } from "../../game/renderer/renderer-shared.js";
import { WeatherManager } from "../../game/weather/weather-manager.js";
import { ResolvedAmbientEffectConfig } from "../../game/weather/weather-types.js";
import { ISystem } from "./system.interface.js";

export class WeatherSystem implements ISystem {
  private static readonly LOW_RAIN_LAYER_DELAY_SECONDS = 3;

  private lowRainPrimarySoundId: string | null = null;
  private lowRainSecondarySoundId: string | null = null;
  private lowRainSecondaryDelayRemainingSeconds = 0;

  constructor(
    private weatherManager: WeatherManager,
    private spriteManager: SpriteManager,
    private rendererEngine: RendererEngine,
    private soundManager?: SoundManager,
  ) { }

  update(deltaTime: number): void {
    this.rendererEngine.setRainConfig(this.weatherManager.getRainConfig());
    this.rendererEngine.setAmbientEffects(this.resolveAmbientEffects());
    this.rendererEngine.setScreenEffectTint(this.weatherManager.getScreenEffectTint());
    this.syncLowRainAudio(deltaTime);
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

  private syncLowRainAudio(deltaTime: number): void {
    if (!this.soundManager) {
      return;
    }

    if (!this.weatherManager.isLowRainActive()) {
      this.stopLowRainAudio();
      return;
    }

    if (!this.lowRainPrimarySoundId) {
      this.startLowRainAudio();
    }

    if (this.lowRainSecondarySoundId) {
      return;
    }

    this.lowRainSecondaryDelayRemainingSeconds = Math.max(
      0,
      this.lowRainSecondaryDelayRemainingSeconds - deltaTime,
    );

    if (this.lowRainSecondaryDelayRemainingSeconds > 0) {
      return;
    }

    this.lowRainSecondarySoundId = this.soundManager.playSound(
      SOUND_KEYS.LOW_RAIN,
      true,
      Math.min(SOUND_VOLUME.LOW_RAIN * 1.02, 1),
    );
  }

  private startLowRainAudio(): void {
    if (!this.soundManager) {
      return;
    }

    this.stopLowRainAudio();
    this.lowRainPrimarySoundId = this.soundManager.playSound(
      SOUND_KEYS.LOW_RAIN,
      true,
      SOUND_VOLUME.LOW_RAIN,
    );
    this.lowRainSecondaryDelayRemainingSeconds = WeatherSystem.LOW_RAIN_LAYER_DELAY_SECONDS;
  }

  private stopLowRainAudio(): void {
    if (!this.soundManager) {
      return;
    }

    if (this.lowRainPrimarySoundId) {
      this.soundManager.stopSound(this.lowRainPrimarySoundId);
      this.lowRainPrimarySoundId = null;
    }

    if (this.lowRainSecondarySoundId) {
      this.soundManager.stopSound(this.lowRainSecondarySoundId);
      this.lowRainSecondarySoundId = null;
    }

    this.lowRainSecondaryDelayRemainingSeconds = 0;
  }
}
