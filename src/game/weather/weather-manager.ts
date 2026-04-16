import {
  cloneRainConfig,
  HEAVY_RAIN,
  LOW_RAIN,
  MEDIUM_RAIN,
  NIGHT_TINT,
  NO_SCREEN_EFFECT_TINT,
  type AmbientEffectConfig,
  type RainConfig,
  type ScreenEffectTint,
} from "./weather-types.js";

type RainDebugPreset = "low" | "medium" | "high" | "disabled" | "custom";

export class WeatherManager {
  private rainConfig: RainConfig = {
    ...cloneRainConfig(LOW_RAIN),
    enabled: false,
    intensity: 0,
  };
  private ambientEffects: AmbientEffectConfig[] = [];
  private screenEffectTint: ScreenEffectTint = { ...NO_SCREEN_EFFECT_TINT };
  private currentRainPreset: RainDebugPreset = "disabled";
  private lastEnabledScreenEffectTint: ScreenEffectTint = { ...NIGHT_TINT };
  private screenEffectTintEnabled = false;

  setRainConfig(config: RainConfig): void {
    this.rainConfig = cloneRainConfig(config);
    this.currentRainPreset = this.resolveRainPreset(this.rainConfig);
  }

  setLowRain(): void {
    this.setRainConfig(LOW_RAIN);
    this.currentRainPreset = "low";
  }

  setMediumRain(): void {
    this.setRainConfig(MEDIUM_RAIN);
    this.currentRainPreset = "medium";
  }

  setHeavyRain(): void {
    this.setRainConfig(HEAVY_RAIN);
    this.currentRainPreset = "high";
  }

  disableRain(): void {
    this.rainConfig = {
      ...this.rainConfig,
      enabled: false,
      intensity: 0,
    };
    this.currentRainPreset = "disabled";
  }

  getRainConfig(): RainConfig {
    return cloneRainConfig(this.rainConfig);
  }

  cycleRainPreset(): RainDebugPreset {
    const currentPreset = this.currentRainPreset === "custom"
      ? "disabled"
      : this.currentRainPreset;

    switch (currentPreset) {
      case "low":
        this.setMediumRain();
        break;

      case "medium":
        this.setHeavyRain();
        break;

      case "high":
        this.disableRain();
        break;

      case "disabled":
      default:
        this.setLowRain();
        break;
    }

    console.log(`[WeatherDebug] Rain preset set to: ${this.describeRainPreset(this.currentRainPreset)}.`);
    return this.currentRainPreset;
  }

  setAmbientEffects(effects: AmbientEffectConfig[]): void {
    this.ambientEffects = effects.map((effect) => ({ ...effect }));
  }

  clearAmbientEffects(): void {
    this.ambientEffects = [];
  }

  getAmbientEffects(): AmbientEffectConfig[] {
    return this.ambientEffects.map((effect) => ({ ...effect }));
  }

  setScreenEffectTint(tint: ScreenEffectTint): void {
    this.screenEffectTint = { ...tint };
    this.screenEffectTintEnabled = tint.a > 0;
    if (this.screenEffectTintEnabled) {
      this.lastEnabledScreenEffectTint = { ...tint };
    }
  }

  clearScreenEffectTint(): void {
    this.screenEffectTint = { ...NO_SCREEN_EFFECT_TINT };
    this.screenEffectTintEnabled = false;
  }

  getScreenEffectTint(): ScreenEffectTint {
    return { ...this.screenEffectTint };
  }

  toggleScreenEffectTint(): boolean {
    if (this.screenEffectTintEnabled) {
      this.clearScreenEffectTint();
    } else {
      this.setScreenEffectTint(this.lastEnabledScreenEffectTint);
    }

    console.log(`[WeatherDebug] Screen tint set to: ${this.screenEffectTintEnabled ? "screen_tint" : "no_screen_tint"}.`);
    return this.screenEffectTintEnabled;
  }

  private resolveRainPreset(config: RainConfig): RainDebugPreset {
    if (!config.enabled || config.intensity <= 0) {
      return "disabled";
    }

    if (this.isRainConfigEqual(config, LOW_RAIN)) {
      return "low";
    }

    if (this.isRainConfigEqual(config, MEDIUM_RAIN)) {
      return "medium";
    }

    if (this.isRainConfigEqual(config, HEAVY_RAIN)) {
      return "high";
    }

    return "custom";
  }

  private isRainConfigEqual(left: RainConfig, right: RainConfig): boolean {
    return left.enabled === right.enabled &&
      left.intensity === right.intensity &&
      left.speed === right.speed &&
      left.angle === right.angle &&
      left.opacity === right.opacity &&
      left.dropLength === right.dropLength &&
      left.dropWidth === right.dropWidth &&
      left.maxDrops === right.maxDrops &&
      left.variation === right.variation &&
      left.seed === right.seed &&
      left.splashDuration === right.splashDuration &&
      left.splashOpacity === right.splashOpacity &&
      left.minRingRadiusX === right.minRingRadiusX &&
      left.maxRingRadiusX === right.maxRingRadiusX &&
      left.minRingRadiusY === right.minRingRadiusY &&
      left.maxRingRadiusY === right.maxRingRadiusY &&
      left.viewportCoverageScale === right.viewportCoverageScale &&
      left.dropColor.r === right.dropColor.r &&
      left.dropColor.g === right.dropColor.g &&
      left.dropColor.b === right.dropColor.b &&
      left.dropColor.a === right.dropColor.a &&
      left.splashColor.r === right.splashColor.r &&
      left.splashColor.g === right.splashColor.g &&
      left.splashColor.b === right.splashColor.b &&
      left.splashColor.a === right.splashColor.a;
  }

  private describeRainPreset(preset: RainDebugPreset): string {
    switch (preset) {
      case "low":
        return "low rain";

      case "medium":
        return "medium rain";

      case "high":
        return "high rain";

      case "disabled":
        return "disabled";

      case "custom":
      default:
        return "custom";
    }
  }
}
