import type { DebuggerPaintOrder } from "../../ecs/debugger-orders/types/debugger.js";
import { AmbientRenderer } from "./ambient-renderer.js";
import { ParticleRenderer } from "./particle-renderer.js";
import {
  PARTICLE_TYPE_BLOOD,
  PARTICLE_TYPE_DUST,
  PARTICLE_TYPE_GENERIC,
  PARTICLE_TYPE_SPARK,
  type ParticleType,
  type RGB,
  type SpawnEvent,
  type TrajectoryType,
} from "./particle-renderer.types.js";
import type { RendererFrame } from "./render-frame.js";
import { buildDebugVertices, createProgram, parseColorToRgba } from "./renderer-shared.js";
import { ScreenEffectRenderer } from "./screen-effect-renderer.js";
import type { RenderObject } from "./types/render-objects.js";
import { UIRenderer } from "./ui-renderer.js";
import { WeatherRenderer } from "./weather-renderer.js";
import { WorldRenderer } from "./world-renderer.js";
import {
  cloneRainConfig,
  LOW_RAIN,
  NO_SCREEN_EFFECT_TINT,
  normalizeRainConfig,
  normalizeScreenEffectTint,
  type RainConfig,
  type ResolvedAmbientEffectConfig,
  type ScreenEffectTint,
} from "../weather/weather-types.js";

export type { TrajectoryType, RGB, ParticleType, SpawnEvent };
export {
  PARTICLE_TYPE_GENERIC,
  PARTICLE_TYPE_BLOOD,
  PARTICLE_TYPE_DUST,
  PARTICLE_TYPE_SPARK,
};

export class RendererEngine {
  private debugBorderSprites = false;
  private isInitialized = false;
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private worldRenderer!: WorldRenderer;
  private particleRenderer!: ParticleRenderer;
  private weatherRenderer!: WeatherRenderer;
  private ambientRenderer!: AmbientRenderer;
  private screenEffectRenderer!: ScreenEffectRenderer;
  private uiRenderer!: UIRenderer;
  private debugProgram!: WebGLProgram;
  private debugBuffer!: WebGLBuffer;
  private debugVAO!: WebGLVertexArrayObject;
  private elapsedTime = 0;
  private rainConfig: RainConfig = {
    ...cloneRainConfig(LOW_RAIN),
    enabled: false,
    intensity: 0,
  };
  private ambientEffects: ResolvedAmbientEffectConfig[] = [];
  private screenEffectTint: ScreenEffectTint = { ...NO_SCREEN_EFFECT_TINT };

  constructor() {
    this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
    if (!this.gl) {
      alert("WebGL is not available");
      throw new Error("WebGL2 is not available.");
    }
  }

  init(): void {
    const gl = this.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    this.worldRenderer = new WorldRenderer(gl, this.canvas);
    this.particleRenderer = new ParticleRenderer(gl, this.canvas);
    this.weatherRenderer = new WeatherRenderer(gl, this.canvas);
    this.ambientRenderer = new AmbientRenderer(gl, this.canvas);
    this.screenEffectRenderer = new ScreenEffectRenderer(gl, this.canvas);
    this.uiRenderer = new UIRenderer(gl, this.canvas);
    this.initDebugger();
    this.isInitialized = true;
  }

  enqueueSpawns(events: SpawnEvent[]): void {
    this.particleRenderer.enqueueSpawns(events);
  }

  setRainConfig(config: RainConfig): void {
    this.rainConfig = normalizeRainConfig(cloneRainConfig(config));
  }

  setAmbientEffects(effects: ResolvedAmbientEffectConfig[]): void {
    this.ambientEffects = effects.map((effect) => ({
      ...effect,
      uvBounds: { ...effect.uvBounds },
    }));
  }

  setScreenEffectTint(tint: ScreenEffectTint): void {
    this.screenEffectTint = normalizeScreenEffectTint(tint);
  }

  renderFrame(frame: RendererFrame): void {
    if (!this.isInitialized) {
      return;
    }

    this.elapsedTime += frame.deltaTime;
    this.debugBorderSprites = frame.debugBorderSprites;

    this.beginScenePass();
    this.renderWorldPass(frame.worldRenderObjects);
    this.renderParticlePass(frame.deltaTime, frame.viewport.left, frame.viewport.top, frame.worldWidth, frame.worldHeight);
    this.renderWeatherPass(frame.viewport, frame.worldWidth, frame.worldHeight);
    this.renderAmbientPass(frame.viewport, frame.worldWidth, frame.worldHeight);
    this.renderScreenEffectPass();
    this.renderUiPass(frame.uiRenderObjects);
    this.renderDebugPass(frame.debugPaintOrders);
  }

  clear(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  renderSprites(renderObjects: RenderObject[]): void {
    this.worldRenderer.render(renderObjects, this.debugBorderSprites);
  }

  setParticleViewport(left: number, top: number): void {
    this.particleRenderer.setViewport(left, top);
  }

  setParticleWorldBounds(width: number, height: number): void {
    this.particleRenderer.setWorldBounds(width, height);
  }

  uploadSpawnBatch(): void {
    this.particleRenderer.uploadSpawnBatch();
  }

  updateParticles(deltaTime: number): void {
    this.particleRenderer.update(deltaTime);
  }

  disarmSpawnStyleRects(): void {
    this.particleRenderer.disarmSpawnStyleRects();
  }

  renderParticles(): void {
    this.particleRenderer.render();
  }

  renderDebugPaint(paintOrder: DebuggerPaintOrder): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.debugProgram);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vertices = buildDebugVertices(paintOrder, this.canvas);
    const [red, green, blue, alpha] = parseColorToRgba(paintOrder.color);
    const colorLocation = gl.getUniformLocation(this.debugProgram, "u_color");

    gl.bindVertexArray(this.debugVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.debugBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);
    gl.uniform4f(colorLocation, red, green, blue, alpha);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    gl.bindVertexArray(null);
    gl.depthMask(true);
  }

  toggleDebugBorderSprite(status: boolean): void {
    this.debugBorderSprites = status;
  }

  get isLoaded(): boolean {
    return this.isInitialized;
  }

  private beginScenePass(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  private renderWorldPass(renderObjects: RenderObject[]): void {
    this.worldRenderer.render(renderObjects, this.debugBorderSprites);
  }

  private renderParticlePass(
    deltaTime: number,
    viewportLeft: number,
    viewportTop: number,
    worldWidth: number,
    worldHeight: number,
  ): void {
    this.particleRenderer.setViewport(viewportLeft, viewportTop);
    this.particleRenderer.setWorldBounds(worldWidth, worldHeight);
    this.particleRenderer.uploadSpawnBatch();
    this.particleRenderer.update(deltaTime);
    this.particleRenderer.disarmSpawnStyleRects();
    this.particleRenderer.render();
  }

  private renderWeatherPass(
    viewport: RendererFrame["viewport"],
    worldWidth: number,
    worldHeight: number,
  ): void {
    this.weatherRenderer.render(this.rainConfig, viewport, worldWidth, worldHeight, this.elapsedTime);
  }

  private renderAmbientPass(
    viewport: RendererFrame["viewport"],
    worldWidth: number,
    worldHeight: number,
  ): void {
    this.ambientRenderer.render(this.ambientEffects, viewport, worldWidth, worldHeight, this.elapsedTime);
  }

  private renderScreenEffectPass(): void {
    if (this.screenEffectTint.a <= 0) {
      return;
    }

    this.screenEffectRenderer.render(this.screenEffectTint);
  }

  private renderUiPass(renderObjects: RenderObject[]): void {
    this.uiRenderer.render(renderObjects, this.debugBorderSprites);
  }

  private renderDebugPass(debugPaintOrders: DebuggerPaintOrder[]): void {
    for (const debugPaintOrder of debugPaintOrders) {
      this.renderDebugPaint(debugPaintOrder);
    }
  }

  private initDebugger(): void {
    const vertexShaderSource = `
      attribute vec3 a_position;

      void main() {
        gl_Position = vec4(a_position, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;

      uniform vec4 u_color;

      void main() {
        gl_FragColor = u_color;
      }
    `;

    this.debugProgram = createProgram(this.gl, vertexShaderSource, fragmentShaderSource, "DebugRenderShader");
    const debugVAO = this.gl.createVertexArray();
    const debugBuffer = this.gl.createBuffer();

    if (!debugVAO || !debugBuffer) {
      throw new Error("Unable to allocate debug renderer resources.");
    }

    this.debugVAO = debugVAO;
    this.debugBuffer = debugBuffer;

    this.gl.bindVertexArray(this.debugVAO);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.debugBuffer);
    const positionLocation = this.gl.getAttribLocation(this.debugProgram, "a_position");
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }
}
