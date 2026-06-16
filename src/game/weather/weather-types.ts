import type { SpriteSheetName } from "../asset-manager/types/sprite-sheet-name.enum.js";
import type { UvBounds } from "../renderer/renderer-shared.js";
import type { SpriteName } from "../world-map/types/sprite-name.enum.js";

export interface ColorRgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ScreenEffectTint {
  r: number;
  g: number;
  b: number;
  a: number;
}

function normalizeScreenEffectChannel(value: number): number {
  const normalizedValue = value > 1 ? value / 255 : value;
  return Math.min(1, Math.max(0, normalizedValue));
}

export function normalizeScreenEffectTint(tint: ScreenEffectTint): ScreenEffectTint {
  return {
    r: normalizeScreenEffectChannel(tint.r),
    g: normalizeScreenEffectChannel(tint.g),
    b: normalizeScreenEffectChannel(tint.b),
    a: normalizeScreenEffectChannel(tint.a),
  };
}

export function normalizeColorRgba(color: ColorRgba): ColorRgba {
  return {
    r: normalizeScreenEffectChannel(color.r),
    g: normalizeScreenEffectChannel(color.g),
    b: normalizeScreenEffectChannel(color.b),
    a: normalizeScreenEffectChannel(color.a),
  };
}

export interface RainConfig {
  enabled: boolean;
  intensity: number;
  speed: number;
  angle: number;
  opacity: number;
  dropLength: number;
  dropWidth: number;
  maxDrops: number;
  variation: number;
  seed: number;
  splashDuration: number;
  splashOpacity: number;
  minRingRadiusX: number;
  maxRingRadiusX: number;
  minRingRadiusY: number;
  maxRingRadiusY: number;
  dropColor: ColorRgba;
  splashColor: ColorRgba;
  viewportCoverageScale: number;
}

export type AmbientMotionMode = "vertical-fall" | "horizontal-drift";

export interface AmbientEffectConfig {
  id: string;
  enabled: boolean;
  spriteName: SpriteName;
  spriteSheetName: SpriteSheetName;
  count: number;
  intensity: number;
  speed: number;
  speedVariation: number;
  drift: number;
  scale: number;
  scaleVariation: number;
  rotationEnabled: boolean;
  rotationSpeed: number;
  alpha: number;
  motionMode: AmbientMotionMode;
  seed: number;
  spriteWidth?: number;
  spriteHeight?: number;
}

export interface ResolvedAmbientEffectConfig extends AmbientEffectConfig {
  spriteSheetTexture: WebGLTexture;
  spriteWidth: number;
  spriteHeight: number;
  uvBounds: UvBounds;
}

export function cloneRainConfig(config: RainConfig): RainConfig {
  return {
    ...config,
    dropColor: { ...config.dropColor },
    splashColor: { ...config.splashColor },
  };
}

export function normalizeRainConfig(config: RainConfig): RainConfig {
  return {
    ...config,
    dropColor: normalizeColorRgba(config.dropColor),
    splashColor: normalizeColorRgba(config.splashColor),
    viewportCoverageScale: Math.max(1, config.viewportCoverageScale),
  };
}

const DEFAULT_RAIN_DROP_COLOR: ColorRgba = {
  r: 0,
  g: 0,
  b: 0,
  a: 255,
};

const DEFAULT_RAIN_SPLASH_COLOR: ColorRgba = {
  r: 0,
  g: 0,
  b: 0,
  a: 224,
};

const BASE_RAIN_CONFIG: RainConfig = {
  enabled: true,
  intensity: 0.5,
  speed: 720,
  angle: 0.14,
  opacity: 0.8,
  dropLength: 18,
  dropWidth: 1.6,
  maxDrops: 320,
  variation: 0.35,
  seed: 1.0,
  splashDuration: 0.18,
  splashOpacity: 0.5,
  minRingRadiusX: 2.0,
  maxRingRadiusX: 8.0,
  minRingRadiusY: 0.75,
  maxRingRadiusY: 3.0,
  dropColor: DEFAULT_RAIN_DROP_COLOR,
  splashColor: DEFAULT_RAIN_SPLASH_COLOR,
  viewportCoverageScale: 1.1,
};

export const LOW_RAIN: RainConfig = {
  ...cloneRainConfig(BASE_RAIN_CONFIG),
  intensity: 0.3,
  speed: 640,
  opacity: 0.28,
  dropLength: 16,
  maxDrops: 220,
  variation: 0.28,
  splashOpacity: 0.35,
};

export const MEDIUM_RAIN: RainConfig = {
  ...cloneRainConfig(BASE_RAIN_CONFIG),
};

export const HEAVY_RAIN: RainConfig = {
  ...cloneRainConfig(BASE_RAIN_CONFIG),
  intensity: 0.95,
  speed: 860,
  opacity: 0.62,
  dropLength: 22,
  maxDrops: 440,
  variation: 0.42,
  splashOpacity: 0.6,
  maxRingRadiusX: 9.5,
  maxRingRadiusY: 3.5,
};

export const NO_SCREEN_EFFECT_TINT: ScreenEffectTint = {
  r: 0,
  g: 0,
  b: 0,
  a: 0,
};

export const NIGHT_TINT: ScreenEffectTint = {
  r: 3,
  g: 0,
  b: 35,
  a: 150,
};
