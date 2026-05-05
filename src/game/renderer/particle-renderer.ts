import {
  PARTICLE_TYPE_BLOOD,
  PARTICLE_TYPE_DUST,
  PARTICLE_TYPE_SPARK,
  type SpawnEvent,
} from "./particle-renderer.types.js";
import { createProgram } from "./renderer-shared.js";

type TrackedBloodStain = {
  admittedAt: number;
  position: { x: number; y: number };
  expiresAt: number;
  slotId: number;
};

export class ParticleRenderer {
  private static readonly TEX_UNIT_STATE_READ = 1;
  private static readonly TEX_UNIT_SPAWN_KIN = 2;
  private static readonly TEX_UNIT_SPAWN_TRIGGER = 3;
  private static readonly TEX_UNIT_SPAWN_COLOR = 4;
  private static readonly TEX_UNIT_SPAWN_POSITION = 5;
  private static readonly TEX_UNIT_PARTICLE_LIFE = 6;
  private static readonly TEX_UNIT_PARTICLE_STAIN = 7;

  private readonly simulationProgram: WebGLProgram;
  private readonly particleRenderProgram: WebGLProgram;
  private readonly simulationFBO: WebGLFramebuffer;
  private readonly simulationVAO: WebGLVertexArrayObject;
  private readonly simulationVBO: WebGLBuffer;
  private readonly particleRenderVAO: WebGLVertexArrayObject;
  private readonly particleRenderVBO: WebGLBuffer;
  private readonly spawnPosition: WebGLTexture;
  private readonly spawnKinematic: WebGLTexture;
  private readonly spawnTrigger: WebGLTexture;
  private readonly spawnColor: WebGLTexture;
  private readonly particleLifeMeta: WebGLTexture;
  private readonly particleStainMeta: WebGLTexture;
  private stateTextureA!: WebGLTexture;
  private stateTextureB!: WebGLTexture;
  private stateRead!: WebGLTexture;
  private stateWrite!: WebGLTexture;
  private particleTextureWidth = 0;
  private particleTextureHeight = 0;
  private particleMaxCapacity = 0;
  private spawnHead = 0;
  private readonly pendingSpawns: SpawnEvent[] = [];
  private readonly lastSpawnRects: { x: number; y: number; width: number; height: number }[] = [];
  private particleViewportLeft = 0;
  private particleViewportTop = 0;
  private particleWorldWidth = 1;
  private particleWorldHeight = 1;
  private readonly vmax = 1;
  private readonly maxFlightLife = 6;
  private readonly maxStainLife = 600;
  private readonly maxCombinedLife = this.maxFlightLife + this.maxStainLife;
  private readonly maxSize = 20;
  private readonly yGravity = -9.81;
  private readonly maxWorldStains = 2048;
  private readonly maxStainsInViewport = 512;
  private readonly trackedBloodStains: TrackedBloodStain[] = [];
  private stainClock = 0;

  constructor(
    private gl: WebGL2RenderingContext,
    private canvas: HTMLCanvasElement,
    capacity = 512,
  ) {
    this.simulationProgram = this.compileSimulationProgram();
    const simulationFBO = gl.createFramebuffer();
    const simulationVAO = gl.createVertexArray();
    const simulationVBO = gl.createBuffer();

    if (!simulationFBO || !simulationVAO || !simulationVBO) {
      throw new Error("Unable to allocate particle simulation resources.");
    }

    this.simulationFBO = simulationFBO;
    this.simulationVAO = simulationVAO;
    this.simulationVBO = simulationVBO;

    this.initParticleSimulation(capacity);
    this.initSimulationQuad();

    this.particleRenderProgram = this.compileParticleRenderProgram();
    const particleRenderVAO = gl.createVertexArray();
    const particleRenderVBO = gl.createBuffer();

    if (!particleRenderVAO || !particleRenderVBO) {
      throw new Error("Unable to allocate particle draw resources.");
    }

    this.particleRenderVAO = particleRenderVAO;
    this.particleRenderVBO = particleRenderVBO;
    this.initParticleRender();

    const spawnPosition = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    const spawnKinematic = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    const spawnTrigger = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    const spawnColor = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    const particleLifeMeta = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    const particleStainMeta = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);

    this.spawnPosition = spawnPosition;
    this.spawnKinematic = spawnKinematic;
    this.spawnTrigger = spawnTrigger;
    this.spawnColor = spawnColor;
    this.particleLifeMeta = particleLifeMeta;
    this.particleStainMeta = particleStainMeta;
    this.clearTextures([
      this.spawnPosition,
      this.spawnKinematic,
      this.spawnTrigger,
      this.spawnColor,
      this.particleLifeMeta,
      this.particleStainMeta,
    ]);
  }

  enqueueSpawns(events: SpawnEvent[]): void {
    this.pendingSpawns.push(...events);
  }

  setViewport(left: number, top: number): void {
    this.particleViewportLeft = left;
    this.particleViewportTop = top;
  }

  setWorldBounds(width: number, height: number): void {
    this.particleWorldWidth = Math.max(width, 1);
    this.particleWorldHeight = Math.max(height, 1);
  }

  uploadSpawnBatch(): void {
    this.lastSpawnRects.length = 0;
    if (!this.pendingSpawns.length) {
      return;
    }

    this.pruneExpiredTrackedStains();

    const gl = this.gl;
    const spawnEvents = this.pendingSpawns.length > this.particleMaxCapacity
      ? this.pendingSpawns.slice(-this.particleMaxCapacity)
      : this.pendingSpawns;
    const startId = this.spawnHead;
    const enc8 = (value: number) => Math.min(255, Math.max(0, Math.floor(value)));
    const clamp01s = (value: number) => {
      const epsilon = 1.0 / 1024.0;
      return Math.min(1.0 - epsilon, Math.max(epsilon, value));
    };
    const packUnorm16 = (value01: number): [number, number] => {
      const clamped = Math.min(1.0, Math.max(0.0, value01));
      const quantized = Math.min(65535, Math.max(0, Math.round(clamped * 65535.0)));
      return [(quantized >> 8) & 255, quantized & 255];
    };
    const encVel01 = (value: number) => (value / this.vmax) * 0.5 + 0.5;
    const encodeFlagsByte = (trajectoryType: number, isStained: boolean) => {
      if (isStained) {
        return trajectoryType === 1 ? 255 : 170;
      }

      return trajectoryType === 1 ? 85 : 0;
    };

    const worldWidth = Math.max(this.particleWorldWidth, 1);
    const worldHeight = Math.max(this.particleWorldHeight, 1);
    const positionPacked: number[] = [];
    const kinematicPacked: number[] = [];
    const triggerPacked: number[] = [];
    const colorPacked: number[] = [];
    const particleLifePacked: number[] = [];
    const particleStainPacked: number[] = [];

    for (let spawnIndex = 0; spawnIndex < spawnEvents.length; spawnIndex += 1) {
      const spawnEvent = spawnEvents[spawnIndex];
      const slotId = (startId + spawnIndex) % this.particleMaxCapacity;
      const flightLife = Math.min(this.maxFlightLife, Math.max(0, spawnEvent.flightLife));
      const isStained = this.tryTrackBloodStain(spawnEvent, flightLife, slotId);
      const stainLife = isStained
        ? Math.min(this.maxStainLife, Math.max(0, spawnEvent.stainLife))
        : 0;
      const totalLife = Math.min(this.maxCombinedLife, Math.max(0, flightLife + stainLife));
      const stainSize = isStained
        ? (spawnEvent.stainConfig?.size ?? spawnEvent.size)
        : 0;
      const stainColor = isStained
        ? (spawnEvent.stainConfig?.color ?? spawnEvent.color)
        : [0, 0, 0] as const;

      const x01 = Math.min(1.0, Math.max(0.0, spawnEvent.position.x / worldWidth));
      const y01 = Math.min(1.0, Math.max(0.0, spawnEvent.position.y / worldHeight));
      const [xHi, xLo] = packUnorm16(x01);
      const [yHi, yLo] = packUnorm16(y01);

      const velocityX01 = clamp01s(encVel01(spawnEvent.velocity.x / this.canvas.width));
      const velocityY01 = clamp01s(encVel01(spawnEvent.velocity.y / this.canvas.height));
      const [totalLifeHi, totalLifeLo] = packUnorm16(totalLife / this.maxCombinedLife);
      const flightLifeNorm = Math.min(1, Math.max(0, flightLife / this.maxFlightLife));
      const sizeNorm = Math.min(1, Math.max(0, spawnEvent.size / this.maxSize));
      const stainSizeNorm = Math.min(1, Math.max(0, stainSize / this.maxSize));
      const particleTypeByte = spawnEvent.particleType === PARTICLE_TYPE_SPARK
        ? 255
        : spawnEvent.particleType === PARTICLE_TYPE_DUST
          ? 170
          : spawnEvent.particleType === PARTICLE_TYPE_BLOOD
            ? 85
            : 0;

      positionPacked.push(xHi, xLo, yHi, yLo);
      kinematicPacked.push(
        enc8(velocityX01 * 255),
        enc8(velocityY01 * 255),
        enc8(sizeNorm * 255),
        encodeFlagsByte(spawnEvent.trajectoryType, isStained),
      );
      triggerPacked.push(255, 0, 0, 0);
      colorPacked.push(
        spawnEvent.color[0],
        spawnEvent.color[1],
        spawnEvent.color[2],
        particleTypeByte,
      );
      particleLifePacked.push(totalLifeHi, totalLifeLo, enc8(flightLifeNorm * 255), 0);
      particleStainPacked.push(
        stainColor[0],
        stainColor[1],
        stainColor[2],
        enc8(stainSizeNorm * 255),
      );
    }

    const count = positionPacked.length / 4;
    if (count === 0) {
      this.pendingSpawns.length = 0;
      return;
    }

    const positionData = new Uint8Array(positionPacked);
    const kinematicData = new Uint8Array(kinematicPacked);
    const triggerData = new Uint8Array(triggerPacked);
    const colorData = new Uint8Array(colorPacked);
    const particleLifeData = new Uint8Array(particleLifePacked);
    const particleStainData = new Uint8Array(particleStainPacked);
    const width = this.particleTextureWidth;

    const writeRange = (
      data: Uint8Array,
      texture: WebGLTexture,
      start: number,
      length: number,
      sourceOffsetBytes: number,
      trackClearRect: boolean,
    ) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      let remaining = length;
      let cursor = start;
      let byteOffset = sourceOffsetBytes;

      while (remaining > 0) {
        const startX = cursor % width;
        const startY = Math.floor(cursor / width);
        const run = Math.min(remaining, width - startX);
        const slice = data.subarray(byteOffset, byteOffset + (run * 4));

        gl.texSubImage2D(gl.TEXTURE_2D, 0, startX, startY, run, 1, gl.RGBA, gl.UNSIGNED_BYTE, slice);

        if (trackClearRect) {
          this.lastSpawnRects.push({ x: startX, y: startY, width: run, height: 1 });
        }

        remaining -= run;
        cursor += run;
        byteOffset += run * 4;
      }
    };

    if (startId + count <= this.particleMaxCapacity) {
      writeRange(positionData, this.spawnPosition, startId, count, 0, false);
      writeRange(kinematicData, this.spawnKinematic, startId, count, 0, false);
      writeRange(triggerData, this.spawnTrigger, startId, count, 0, true);
      writeRange(colorData, this.spawnColor, startId, count, 0, false);
      writeRange(particleLifeData, this.particleLifeMeta, startId, count, 0, false);
      writeRange(particleStainData, this.particleStainMeta, startId, count, 0, false);
    } else {
      const first = this.particleMaxCapacity - startId;
      writeRange(positionData, this.spawnPosition, startId, first, 0, false);
      writeRange(positionData, this.spawnPosition, 0, count - first, first * 4, false);

      writeRange(kinematicData, this.spawnKinematic, startId, first, 0, false);
      writeRange(kinematicData, this.spawnKinematic, 0, count - first, first * 4, false);

      writeRange(triggerData, this.spawnTrigger, startId, first, 0, true);
      writeRange(triggerData, this.spawnTrigger, 0, count - first, first * 4, true);

      writeRange(colorData, this.spawnColor, startId, first, 0, false);
      writeRange(colorData, this.spawnColor, 0, count - first, first * 4, false);

      writeRange(particleLifeData, this.particleLifeMeta, startId, first, 0, false);
      writeRange(particleLifeData, this.particleLifeMeta, 0, count - first, first * 4, false);

      writeRange(particleStainData, this.particleStainMeta, startId, first, 0, false);
      writeRange(particleStainData, this.particleStainMeta, 0, count - first, first * 4, false);
    }

    this.spawnHead = (startId + count) % this.particleMaxCapacity;
    this.pendingSpawns.length = 0;
  }

  disarmSpawnStyleRects(): void {
    if (!this.lastSpawnRects.length) {
      return;
    }

    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_TRIGGER);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnTrigger);

    for (const rect of this.lastSpawnRects) {
      const zeros = new Uint8Array(rect.width * rect.height * 4);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        zeros,
      );
    }

    this.lastSpawnRects.length = 0;
  }

  update(deltaTime: number): void {
    this.stainClock += deltaTime;
    this.pruneExpiredTrackedStains();

    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.simulationFBO);
    this.attachStateWriteToFBO();
    gl.viewport(0, 0, this.particleTextureWidth, this.particleTextureHeight);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, true);
    gl.useProgram(this.simulationProgram);

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_STATE_READ);
    gl.bindTexture(gl.TEXTURE_2D, this.stateRead);
    gl.uniform1i(
      gl.getUniformLocation(this.simulationProgram, "u_stateRead"),
      ParticleRenderer.TEX_UNIT_STATE_READ,
    );

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_TRIGGER);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnTrigger);
    gl.uniform1i(
      gl.getUniformLocation(this.simulationProgram, "u_spawnTrigger"),
      ParticleRenderer.TEX_UNIT_SPAWN_TRIGGER,
    );

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_PARTICLE_LIFE);
    gl.bindTexture(gl.TEXTURE_2D, this.particleLifeMeta);
    gl.uniform1i(
      gl.getUniformLocation(this.simulationProgram, "u_particleLife"),
      ParticleRenderer.TEX_UNIT_PARTICLE_LIFE,
    );

    gl.uniform1f(gl.getUniformLocation(this.simulationProgram, "u_deltaTime"), deltaTime);
    gl.uniform1f(gl.getUniformLocation(this.simulationProgram, "u_maxCombinedLife"), this.maxCombinedLife);

    gl.bindVertexArray(this.simulationVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.swapParticleStates();
  }

  render(): void {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.particleRenderProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_STATE_READ);
    gl.bindTexture(gl.TEXTURE_2D, this.stateRead);
    gl.uniform1i(
      gl.getUniformLocation(this.particleRenderProgram, "u_stateRead"),
      ParticleRenderer.TEX_UNIT_STATE_READ,
    );
    gl.uniform2f(
      gl.getUniformLocation(this.particleRenderProgram, "u_texSize"),
      this.particleTextureWidth,
      this.particleTextureHeight,
    );

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_POSITION);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnPosition);
    gl.uniform1i(
      gl.getUniformLocation(this.particleRenderProgram, "u_spawnPosition"),
      ParticleRenderer.TEX_UNIT_SPAWN_POSITION,
    );

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_KIN);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnKinematic);
    gl.uniform1i(
      gl.getUniformLocation(this.particleRenderProgram, "u_spawnKinematic"),
      ParticleRenderer.TEX_UNIT_SPAWN_KIN,
    );

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_COLOR);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnColor);
    gl.uniform1i(
      gl.getUniformLocation(this.particleRenderProgram, "u_spawnColor"),
      ParticleRenderer.TEX_UNIT_SPAWN_COLOR,
    );

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_PARTICLE_LIFE);
    gl.bindTexture(gl.TEXTURE_2D, this.particleLifeMeta);
    gl.uniform1i(
      gl.getUniformLocation(this.particleRenderProgram, "u_particleLife"),
      ParticleRenderer.TEX_UNIT_PARTICLE_LIFE,
    );

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_PARTICLE_STAIN);
    gl.bindTexture(gl.TEXTURE_2D, this.particleStainMeta);
    gl.uniform1i(
      gl.getUniformLocation(this.particleRenderProgram, "u_particleStain"),
      ParticleRenderer.TEX_UNIT_PARTICLE_STAIN,
    );

    gl.uniform1f(gl.getUniformLocation(this.particleRenderProgram, "u_maxCombinedLife"), this.maxCombinedLife);
    gl.uniform1f(gl.getUniformLocation(this.particleRenderProgram, "u_maxFlightLife"), this.maxFlightLife);
    gl.uniform1f(gl.getUniformLocation(this.particleRenderProgram, "u_vmax"), this.vmax);
    gl.uniform2f(gl.getUniformLocation(this.particleRenderProgram, "u_gravity"), 0.0, -this.yGravity);
    gl.uniform2f(
      gl.getUniformLocation(this.particleRenderProgram, "u_worldSize"),
      this.particleWorldWidth,
      this.particleWorldHeight,
    );
    gl.uniform2f(
      gl.getUniformLocation(this.particleRenderProgram, "u_viewportOrigin"),
      this.particleViewportLeft,
      this.particleViewportTop,
    );
    gl.uniform2f(
      gl.getUniformLocation(this.particleRenderProgram, "u_viewportSize"),
      this.canvas.width,
      this.canvas.height,
    );
    gl.uniform1f(gl.getUniformLocation(this.particleRenderProgram, "u_maxSizePx"), this.maxSize);

    gl.bindVertexArray(this.particleRenderVAO);
    gl.drawArrays(gl.POINTS, 0, this.particleMaxCapacity);
    gl.bindVertexArray(null);
    gl.depthMask(true);
  }

  private tryTrackBloodStain(spawnEvent: SpawnEvent, flightLife: number, slotId: number): boolean {
    if (spawnEvent.particleType !== PARTICLE_TYPE_BLOOD || !spawnEvent.isStained) {
      return false;
    }

    const stainLife = Math.min(this.maxStainLife, Math.max(0, spawnEvent.stainLife));
    if (stainLife <= 0) {
      return false;
    }

    const landingPosition = this.computeProjectedPosition(
      spawnEvent.position,
      spawnEvent.velocity,
      flightLife,
      spawnEvent.trajectoryType,
    );

    if (this.trackedBloodStains.length >= this.maxWorldStains) {
      this.evictOldestTrackedStain(false);
    }

    if (this.isWithinCurrentViewport(landingPosition) && this.countTrackedStainsInViewport() >= this.maxStainsInViewport) {
      this.evictOldestTrackedStain(true);
    }

    this.trackedBloodStains.push({
      admittedAt: this.stainClock,
      position: landingPosition,
      expiresAt: this.stainClock + flightLife + stainLife,
      slotId,
    });

    return true;
  }

  private pruneExpiredTrackedStains(): void {
    for (let index = this.trackedBloodStains.length - 1; index >= 0; index -= 1) {
      if (this.trackedBloodStains[index].expiresAt <= this.stainClock) {
        this.trackedBloodStains.splice(index, 1);
      }
    }
  }

  private countTrackedStainsInViewport(): number {
    let count = 0;
    for (const stain of this.trackedBloodStains) {
      if (this.isWithinCurrentViewport(stain.position)) {
        count += 1;
      }
    }

    return count;
  }

  private evictOldestTrackedStain(onlyWithinViewport: boolean): void {
    let oldestIndex = -1;
    let oldestAdmittedAt = Number.POSITIVE_INFINITY;

    for (let index = 0; index < this.trackedBloodStains.length; index += 1) {
      const trackedStain = this.trackedBloodStains[index];
      if (onlyWithinViewport && !this.isWithinCurrentViewport(trackedStain.position)) {
        continue;
      }

      if (trackedStain.admittedAt >= oldestAdmittedAt) {
        continue;
      }

      oldestAdmittedAt = trackedStain.admittedAt;
      oldestIndex = index;
    }

    if (oldestIndex < 0) {
      return;
    }

    const [evictedStain] = this.trackedBloodStains.splice(oldestIndex, 1);
    this.clearParticleSlot(evictedStain.slotId);
  }

  private computeProjectedPosition(
    position: SpawnEvent["position"],
    velocity: SpawnEvent["velocity"],
    flightLife: number,
    trajectoryType: SpawnEvent["trajectoryType"],
  ): { x: number; y: number } {
    if (trajectoryType === 1) {
      return {
        x: position.x + (velocity.x * flightLife),
        y: position.y + (velocity.y * flightLife) + (0.5 * (-this.yGravity) * (flightLife * flightLife)),
      };
    }

    return {
      x: position.x + (velocity.x * flightLife),
      y: position.y + (velocity.y * flightLife),
    };
  }

  private isWithinCurrentViewport(position: { x: number; y: number }): boolean {
    return (
      position.x >= this.particleViewportLeft &&
      position.x <= this.particleViewportLeft + this.canvas.width &&
      position.y >= this.particleViewportTop &&
      position.y <= this.particleViewportTop + this.canvas.height
    );
  }

  private clearParticleSlot(slotId: number): void {
    const x = slotId % this.particleTextureWidth;
    const y = Math.floor(slotId / this.particleTextureWidth);
    const zero = new Uint8Array(4);

    for (const texture of [this.stateRead, this.stateWrite]) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texSubImage2D(
        this.gl.TEXTURE_2D,
        0,
        x,
        y,
        1,
        1,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        zero,
      );
    }
  }

  private compileSimulationProgram(): WebGLProgram {
    const vertexShader = `
      attribute vec2 a_position;
      varying vec2 v_uv;

      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 v_uv;

      uniform sampler2D u_stateRead;
      uniform sampler2D u_spawnTrigger;
      uniform sampler2D u_particleLife;
      uniform float u_deltaTime;
      uniform float u_maxCombinedLife;

      float decodeUnorm16(vec2 packedBytes) {
        vec2 bytes = floor((packedBytes * 255.0) + 0.5);
        return ((bytes.x * 256.0) + bytes.y) / 65535.0;
      }

      vec2 encodeUnorm16(float value01) {
        float clamped = clamp(value01, 0.0, 1.0);
        float quantized = floor((clamped * 65535.0) + 0.5);
        float high = floor(quantized / 256.0);
        float low = mod(quantized, 256.0);
        return vec2(high, low) / 255.0;
      }

      void main() {
        vec4 sr = texture2D(u_stateRead, v_uv);
        vec4 st = texture2D(u_spawnTrigger, v_uv);
        vec4 lm = texture2D(u_particleLife, v_uv);

        float remainingLife = decodeUnorm16(sr.rg) * u_maxCombinedLife;
        float totalLife = decodeUnorm16(lm.rg) * u_maxCombinedLife;
        float nextRemainingLife = max(remainingLife - u_deltaTime, 0.0);
        float wasAlive = step(0.0001, remainingLife);
        float doSpawn = (1.0 - wasAlive) * step(0.001, st.r);
        float lifeRem = mix(nextRemainingLife, totalLife, doSpawn);
        vec2 packedLife = encodeUnorm16(lifeRem / u_maxCombinedLife);

        gl_FragColor = vec4(packedLife, 0.0, 0.0);
      }
    `;

    return createProgram(this.gl, vertexShader, fragmentShader, "ParticleSimulationShader");
  }

  private compileParticleRenderProgram(): WebGLProgram {
    const vertexShader = `
      attribute float a_particleID;

      uniform sampler2D u_stateRead;
      uniform sampler2D u_spawnPosition;
      uniform sampler2D u_spawnKinematic;
      uniform sampler2D u_spawnColor;
      uniform sampler2D u_particleLife;
      uniform sampler2D u_particleStain;
      uniform vec2 u_texSize;

      uniform float u_maxCombinedLife;
      uniform float u_maxFlightLife;
      uniform float u_vmax;
      uniform vec2  u_gravity;
      uniform vec2  u_worldSize;
      uniform vec2  u_viewportOrigin;
      uniform vec2  u_viewportSize;
      uniform float u_maxSizePx;

      varying float v_alive;
      varying float v_alpha;
      varying vec3  v_color;
      varying float v_particleType;
      varying float v_seed;
      varying float v_stainPhase;

      vec2 idToUV(float id) {
        float x = mod(id, u_texSize.x);
        float y = floor(id / u_texSize.x);
        return (vec2(x, y) + 0.5) / u_texSize;
      }

      float decodeSigned(float x01, float vmax) {
        return (x01 * 2.0 - 1.0) * vmax;
      }

      float decodeUnorm16(vec2 packedBytes) {
        vec2 bytes = floor((packedBytes * 255.0) + 0.5);
        return ((bytes.x * 256.0) + bytes.y) / 65535.0;
      }

      float saturate(float value) {
        return clamp(value, 0.0, 1.0);
      }

      float decodeParticleType(float packedValue) {
        float byteValue = floor((packedValue * 255.0) + 0.5);
        if (byteValue < 42.5) return 0.0;
        if (byteValue < 127.5) return 1.0;
        if (byteValue < 212.5) return 2.0;
        return 3.0;
      }

      float decodeTrajectoryType(float packedFlags) {
        float byteValue = floor((packedFlags * 255.0) + 0.5);
        if (byteValue < 42.5) return 0.0;
        if (byteValue < 127.5) return 1.0;
        if (byteValue < 212.5) return 0.0;
        return 1.0;
      }

      float decodeStainFlag(float packedFlags) {
        float byteValue = floor((packedFlags * 255.0) + 0.5);
        return step(127.5, byteValue);
      }

      float hash12(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float computeFade(float life01, float particleType) {
        if (particleType < 0.5) {
          return smoothstep(0.0, 0.08, life01) * (1.0 - smoothstep(0.72, 1.0, life01));
        }
        if (particleType < 1.5) {
          return smoothstep(0.0, 0.05, life01) * (1.0 - smoothstep(0.48, 1.0, life01));
        }
        if (particleType < 2.5) {
          return smoothstep(0.0, 0.18, life01) * (1.0 - smoothstep(0.30, 1.0, life01));
        }
        return smoothstep(0.0, 0.02, life01) * (1.0 - smoothstep(0.10, 1.0, life01));
      }

      float computeSizeScale(float life01, float particleType, float seed) {
        if (particleType < 0.5) {
          return mix(1.0 + (seed * 0.12), 0.82, smoothstep(0.0, 1.0, life01));
        }
        if (particleType < 1.5) {
          return mix(0.95 + (seed * 0.22), 0.54, smoothstep(0.18, 1.0, life01));
        }
        if (particleType < 2.5) {
          return mix(0.72 + (seed * 0.20), 1.42 + (seed * 0.18), smoothstep(0.0, 1.0, life01));
        }
        return mix(0.90 + (seed * 0.26), 0.18, smoothstep(0.0, 1.0, life01));
      }

      vec3 computeColor(vec3 baseColor, float life01, float particleType) {
        if (particleType < 0.5) {
          return mix(baseColor, baseColor * 0.70, smoothstep(0.35, 1.0, life01));
        }
        if (particleType < 1.5) {
          return mix(baseColor * 1.05, baseColor * 0.62, smoothstep(0.16, 1.0, life01));
        }
        if (particleType < 2.5) {
          return mix(baseColor * 0.92, baseColor * 0.52, smoothstep(0.0, 1.0, life01));
        }
        return mix(vec3(1.0, 0.98, 0.86), baseColor * 0.76, smoothstep(0.0, 0.55, life01));
      }

      void main() {
        vec2 uv = idToUV(a_particleID);
        vec4 st = texture2D(u_stateRead, uv);
        vec4 sp = texture2D(u_spawnPosition, uv);
        vec4 sk = texture2D(u_spawnKinematic, uv);
        vec4 sc = texture2D(u_spawnColor, uv);
        vec4 lm = texture2D(u_particleLife, uv);
        vec4 sm = texture2D(u_particleStain, uv);

        float remainingLife = decodeUnorm16(st.rg) * u_maxCombinedLife;
        float totalLife = decodeUnorm16(lm.rg) * u_maxCombinedLife;
        float flightLife = max(lm.b * u_maxFlightLife, 1e-5);
        float stainLife = max(totalLife - flightLife, 0.0);
        float sizeNorm = sk.b;
        float stainSizeNorm = sm.a;
        float trajectoryType = decodeTrajectoryType(sk.a);
        float isStained = decodeStainFlag(sk.a);
        float particleType = decodeParticleType(sc.a);
        float elapsed = max(totalLife - remainingLife, 0.0);
        float flightAge = min(elapsed, flightLife);
        float flight01 = saturate(flightAge / flightLife);
        float stainAge = max(elapsed - flightLife, 0.0);
        float stain01 = stainLife > 0.0 ? saturate(stainAge / stainLife) : 1.0;

        v_alive = step(0.0001, remainingLife) * step(0.0001, totalLife);
        v_stainPhase = v_alive * isStained * step(flightLife - 0.0001, elapsed);

        vec2 world0 = vec2(
          decodeUnorm16(sp.rg) * u_worldSize.x,
          decodeUnorm16(sp.ba) * u_worldSize.y
        );
        vec2 v0 = vec2(
          decodeSigned(sk.r, u_vmax) * u_viewportSize.x,
          decodeSigned(sk.g, u_vmax) * u_viewportSize.y
        );

        vec2 accel = mix(vec2(0.0), u_gravity, step(0.5, trajectoryType));
        vec2 s_lin = world0 + v0 * flightAge;
        vec2 s_par = world0 + v0 * flightAge + 0.5 * accel * (flightAge * flightAge);
        vec2 s = mix(s_lin, s_par, step(0.5, trajectoryType));

        vec2 screenPos = s - u_viewportOrigin;
        vec2 posClip = vec2(
          (screenPos.x / u_viewportSize.x) * 2.0 - 1.0,
          1.0 - (screenPos.y / u_viewportSize.y) * 2.0
        );
        posClip = mix(vec2(2.0, 2.0), posClip, v_alive);

        float seed = hash12((uv * u_texSize) + (sc.rb * 255.0));
        float fade = computeFade(flight01, particleType);
        float sizeScale = computeSizeScale(flight01, particleType, seed);
        float stainAlpha = 0.30 * (1.0 - smoothstep(0.82, 1.0, stain01));
        float stainSize = stainSizeNorm * u_maxSizePx * (0.96 + (seed * 0.18));

        vec3 flightColor = computeColor(sc.rgb, flight01, particleType);
        vec3 stainColor = mix(sm.rgb, sm.rgb * 0.72, smoothstep(0.0, 1.0, stain01));

        v_alpha = mix(v_alive * fade, v_alive * stainAlpha, v_stainPhase);
        v_color = mix(flightColor, stainColor, v_stainPhase);
        v_particleType = particleType;
        v_seed = seed;

        gl_Position = vec4(posClip, 0.0, 1.0);
        gl_PointSize = max(
          1.0,
          mix(
            sizeNorm * u_maxSizePx * sizeScale,
            stainSize,
            v_stainPhase
          ) * v_alive
        );
      }
    `;

    const fragmentShader = `
      precision mediump float;

      varying float v_alive;
      varying float v_alpha;
      varying vec3  v_color;
      varying float v_particleType;
      varying float v_seed;
      varying float v_stainPhase;

      float particleMask(vec2 point, float particleType, float seed) {
        float radial = length(point);
        float angle = atan(point.y, point.x);

        if (particleType < 0.5) {
          return 1.0 - smoothstep(0.55, 1.0, radial);
        }

        if (particleType < 1.5) {
          float wobble = 0.08 * sin((angle * 5.0) + (seed * 6.2831853));
          return 1.0 - smoothstep(0.62 + wobble, 1.0 + wobble, radial);
        }

        if (particleType < 2.5) {
          vec2 dustPoint = point * vec2(0.82, 1.12);
          float dustRadial = length(dustPoint);
          return 1.0 - smoothstep(0.28, 1.0, dustRadial);
        }

        float core = 1.0 - smoothstep(0.12, 0.48, radial);
        float glow = 1.0 - smoothstep(0.24, 1.0, radial);
        return max(core, glow * 0.55);
      }

      float stainMask(vec2 point, float seed) {
        vec2 warpedPoint = point * vec2(1.10, 0.86);
        float radial = length(warpedPoint);
        float angle = atan(point.y, point.x);
        float wobble = 0.10 * sin((angle * 4.0) + (seed * 6.2831853));
        wobble += 0.06 * cos((angle * 7.0) + (seed * 3.1415926));
        float edge = 0.68 + wobble;
        float core = 1.0 - smoothstep(edge, 1.02 + wobble, radial);
        float fringe = 1.0 - smoothstep(0.20, 1.0, radial);
        return max(core, fringe * 0.32);
      }

      void main() {
        if (v_alive < 0.5) discard;
        vec2 point = (gl_PointCoord * 2.0) - 1.0;
        float isStain = step(0.5, v_stainPhase);
        float mask = mix(
          particleMask(point, v_particleType, v_seed),
          stainMask(point, v_seed),
          isStain
        );
        float alpha = v_alpha * mask;
        if (alpha <= 0.001) discard;

        gl_FragColor = vec4(v_color * alpha, alpha);
      }
    `;

    return createProgram(this.gl, vertexShader, fragmentShader, "ParticleRendererShader");
  }

  private initParticleSimulation(capacity: number): void {
    this.particleMaxCapacity = capacity;
    this.particleTextureWidth = Math.ceil(Math.sqrt(capacity));
    this.particleTextureHeight = Math.ceil(capacity / this.particleTextureWidth);
    this.stateTextureA = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    this.stateTextureB = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    this.stateRead = this.stateTextureA;
    this.stateWrite = this.stateTextureB;
    this.attachStateWriteToFBO();
    this.clearTextures([this.stateTextureA, this.stateTextureB]);
  }

  private initSimulationQuad(): void {
    const gl = this.gl;
    const vertices = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);

    gl.bindVertexArray(this.simulationVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.simulationVBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const attributeLocation = gl.getAttribLocation(this.simulationProgram, "a_position");
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  private initParticleRender(): void {
    const gl = this.gl;
    const particleIds = new Float32Array(this.particleMaxCapacity);
    for (let index = 0; index < particleIds.length; index += 1) {
      particleIds[index] = index;
    }

    gl.bindVertexArray(this.particleRenderVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleRenderVBO);
    gl.bufferData(gl.ARRAY_BUFFER, particleIds, gl.STATIC_DRAW);

    const attributeLocation = gl.getAttribLocation(this.particleRenderProgram, "a_particleID");
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(attributeLocation, 1, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  private createStateTexture(width: number, height: number): WebGLTexture {
    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error("Unable to allocate particle texture.");
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    return texture;
  }

  private clearTextures(textures: WebGLTexture[]): void {
    const zero = new Uint8Array(this.particleTextureWidth * this.particleTextureHeight * 4);
    for (const texture of textures) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texSubImage2D(
        this.gl.TEXTURE_2D,
        0,
        0,
        0,
        this.particleTextureWidth,
        this.particleTextureHeight,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        zero,
      );
    }
  }

  private attachStateWriteToFBO(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.simulationFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.stateWrite, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Particle FBO incomplete: 0x${status.toString(16)}`);
    }
  }

  private swapParticleStates(): void {
    const nextRead = this.stateWrite;
    this.stateWrite = this.stateRead;
    this.stateRead = nextRead;
  }
}
