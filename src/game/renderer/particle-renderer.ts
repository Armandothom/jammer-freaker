import { createProgram } from "./renderer-shared.js";
import {
  PARTICLE_TYPE_BLOOD,
  PARTICLE_TYPE_DUST,
  PARTICLE_TYPE_SPARK,
  type SpawnEvent,
} from "./particle-renderer.types.js";

export class ParticleRenderer {
  private static readonly TEX_UNIT_STATE_READ = 1;
  private static readonly TEX_UNIT_SPAWN_KIN = 2;
  private static readonly TEX_UNIT_SPAWN_STYLE = 3;
  private static readonly TEX_UNIT_SPAWN_COLOR = 4;
  private static readonly TEX_UNIT_SPAWN_POSITION = 5;

  private readonly simulationProgram: WebGLProgram;
  private readonly particleRenderProgram: WebGLProgram;
  private readonly simulationFBO: WebGLFramebuffer;
  private readonly fboStateRead: WebGLFramebuffer;
  private readonly simulationVAO: WebGLVertexArrayObject;
  private readonly simulationVBO: WebGLBuffer;
  private readonly particleRenderVAO: WebGLVertexArrayObject;
  private readonly particleRenderVBO: WebGLBuffer;
  private readonly spawnTexture: WebGLTexture;
  private readonly spawnKinematic: WebGLTexture;
  private readonly spawnStyle: WebGLTexture;
  private readonly spawnColor: WebGLTexture;
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
  private readonly maxLife = 6;
  private readonly maxSize = 20;
  private readonly yGravity = -9.81;

  constructor(
    private gl: WebGL2RenderingContext,
    private canvas: HTMLCanvasElement,
    capacity = 512,
  ) {
    this.simulationProgram = this.compileSimulationProgram();
    const simulationFBO = gl.createFramebuffer();
    const fboStateRead = gl.createFramebuffer();
    const simulationVAO = gl.createVertexArray();
    const simulationVBO = gl.createBuffer();

    if (!simulationFBO || !fboStateRead || !simulationVAO || !simulationVBO) {
      throw new Error("Unable to allocate particle simulation resources.");
    }

    this.simulationFBO = simulationFBO;
    this.fboStateRead = fboStateRead;
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

    const spawnTexture = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    const spawnKinematic = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    const spawnStyle = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);
    const spawnColor = this.createStateTexture(this.particleTextureWidth, this.particleTextureHeight);

    this.spawnTexture = spawnTexture;
    this.spawnKinematic = spawnKinematic;
    this.spawnStyle = spawnStyle;
    this.spawnColor = spawnColor;
    this.clearTextures([this.spawnTexture, this.spawnKinematic, this.spawnStyle, this.spawnColor]);
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

    const gl = this.gl;
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

    const worldWidth = Math.max(this.particleWorldWidth, 1);
    const worldHeight = Math.max(this.particleWorldHeight, 1);
    const positionPacked: number[] = [];
    const kinematicPacked: number[] = [];
    const stylePacked: number[] = [];
    const colorPacked: number[] = [];

    for (const spawnEvent of this.pendingSpawns) {
      const x01 = Math.min(1.0, Math.max(0.0, spawnEvent.position.x / worldWidth));
      const y01 = Math.min(1.0, Math.max(0.0, spawnEvent.position.y / worldHeight));
      const [xHi, xLo] = packUnorm16(x01);
      const [yHi, yLo] = packUnorm16(y01);

      const velocityX01 = clamp01s(encVel01(spawnEvent.velocity.x / this.canvas.width));
      const velocityY01 = clamp01s(encVel01(spawnEvent.velocity.y / this.canvas.height));
      const lifeNorm = Math.min(1, Math.max(0, spawnEvent.life / this.maxLife));
      const sizeNorm = Math.min(1, Math.max(0, spawnEvent.size / this.maxSize));
      const trajectoryTypeByte = spawnEvent.trajectoryType === 1 ? 255 : 0;
      const particleTypeByte = spawnEvent.particleType === PARTICLE_TYPE_SPARK
        ? 255
        : spawnEvent.particleType === PARTICLE_TYPE_DUST
          ? 170
          : spawnEvent.particleType === PARTICLE_TYPE_BLOOD
            ? 85
            : 0;

      positionPacked.push(xHi, xLo, yHi, yLo);
      kinematicPacked.push(enc8(velocityX01 * 255), enc8(velocityY01 * 255), 0, 0);
      stylePacked.push(enc8(lifeNorm * 255), enc8(sizeNorm * 255), trajectoryTypeByte, 0);
      colorPacked.push(
        spawnEvent.color[0],
        spawnEvent.color[1],
        spawnEvent.color[2],
        particleTypeByte,
      );
    }

    let count = positionPacked.length / 4;
    if (count === 0) {
      this.pendingSpawns.length = 0;
      return;
    }

    if (count > this.particleMaxCapacity) {
      const keepFrom = (count - this.particleMaxCapacity) * 4;
      positionPacked.splice(0, keepFrom);
      kinematicPacked.splice(0, keepFrom);
      stylePacked.splice(0, keepFrom);
      colorPacked.splice(0, keepFrom);
      count = this.particleMaxCapacity;
    }

    const positionData = new Uint8Array(positionPacked);
    const kinematicData = new Uint8Array(kinematicPacked);
    const styleData = new Uint8Array(stylePacked);
    const colorData = new Uint8Array(colorPacked);
    const startId = this.spawnHead;
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
      writeRange(positionData, this.spawnTexture, startId, count, 0, false);
      writeRange(kinematicData, this.spawnKinematic, startId, count, 0, false);
      writeRange(styleData, this.spawnStyle, startId, count, 0, true);
      writeRange(colorData, this.spawnColor, startId, count, 0, false);
    } else {
      const first = this.particleMaxCapacity - startId;
      writeRange(positionData, this.spawnTexture, startId, first, 0, false);
      writeRange(positionData, this.spawnTexture, 0, count - first, first * 4, false);

      writeRange(kinematicData, this.spawnKinematic, startId, first, 0, false);
      writeRange(kinematicData, this.spawnKinematic, 0, count - first, first * 4, false);

      writeRange(styleData, this.spawnStyle, startId, first, 0, true);
      writeRange(styleData, this.spawnStyle, 0, count - first, first * 4, true);

      writeRange(colorData, this.spawnColor, startId, first, 0, false);
      writeRange(colorData, this.spawnColor, 0, count - first, first * 4, false);
    }

    this.spawnHead = (startId + count) % this.particleMaxCapacity;
    this.pendingSpawns.length = 0;
  }

  disarmSpawnStyleRects(): void {
    if (!this.lastSpawnRects.length) {
      return;
    }

    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_STYLE);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnStyle);

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

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_STYLE);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnStyle);
    gl.uniform1i(
      gl.getUniformLocation(this.simulationProgram, "u_spawnStyle"),
      ParticleRenderer.TEX_UNIT_SPAWN_STYLE,
    );

    gl.uniform1f(gl.getUniformLocation(this.simulationProgram, "u_deltaTime"), deltaTime);
    gl.uniform1f(gl.getUniformLocation(this.simulationProgram, "u_maxLife"), this.maxLife);

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
    gl.bindTexture(gl.TEXTURE_2D, this.spawnTexture);
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

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_STYLE);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnStyle);
    gl.uniform1i(
      gl.getUniformLocation(this.particleRenderProgram, "u_spawnStyle"),
      ParticleRenderer.TEX_UNIT_SPAWN_STYLE,
    );

    gl.activeTexture(gl.TEXTURE0 + ParticleRenderer.TEX_UNIT_SPAWN_COLOR);
    gl.bindTexture(gl.TEXTURE_2D, this.spawnColor);
    gl.uniform1i(
      gl.getUniformLocation(this.particleRenderProgram, "u_spawnColor"),
      ParticleRenderer.TEX_UNIT_SPAWN_COLOR,
    );

    gl.uniform1f(gl.getUniformLocation(this.particleRenderProgram, "u_maxLife"), this.maxLife);
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

  private compileSimulationProgram(): WebGLProgram {
    const vertexShader = `
      attribute vec2 a_position;
      varying vec2 v_uv;

      void main(){
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 v_uv;

      uniform sampler2D u_stateRead;
      uniform sampler2D u_spawnStyle;
      uniform float u_deltaTime;
      uniform float u_maxLife;

      void main() {
        vec4 sr = texture2D(u_stateRead, v_uv);
        vec4 ss = texture2D(u_spawnStyle, v_uv);

        float lifeDec = max(sr.r - (u_deltaTime / u_maxLife), 0.0);
        float wasAlive = step(0.001, sr.r);
        float wasDead  = 1.0 - wasAlive;
        float hasInit  = step(0.001, ss.r);
        float doSpawn  = wasDead * hasInit;

        float lifeRem   = mix(lifeDec, ss.r, doSpawn);
        float lifeInitL = mix(sr.g, ss.r, doSpawn);
        float type      = mix(sr.b, ss.b, doSpawn);
        float sizeNorm  = mix(sr.a, ss.g, doSpawn);

        gl_FragColor = vec4(lifeRem, lifeInitL, type, sizeNorm);
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
      uniform vec2 u_texSize;

      uniform float u_maxLife;
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

      vec2 idToUV(float id){
        float x = mod(id, u_texSize.x);
        float y = floor(id / u_texSize.x);
        return (vec2(x,y) + 0.5) / u_texSize;
      }

      float decodeSigned(float x01, float vmax){
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

      void main(){
        vec2 uv = idToUV(a_particleID);
        vec4 st = texture2D(u_stateRead, uv);
        vec4 sp = texture2D(u_spawnPosition, uv);
        vec4 sk = texture2D(u_spawnKinematic, uv);
        vec4 sc = texture2D(u_spawnColor, uv);

        float lifeRem   = st.r;
        float lifeInitL = st.g;
        float type      = st.b;
        float sizeNorm  = st.a;
        float particleType = decodeParticleType(sc.a);
        float actualLifetime = max(lifeInitL * u_maxLife, 1e-5);
        float lifeFrac = saturate(lifeRem / max(lifeInitL, 1e-5));
        float life01 = 1.0 - lifeFrac;
        float age = life01 * actualLifetime;

        v_alive = step(0.001, lifeRem) * step(0.001, lifeInitL);

        vec2 world0 = vec2(
          decodeUnorm16(sp.rg) * u_worldSize.x,
          decodeUnorm16(sp.ba) * u_worldSize.y
        );
        vec2 v0 = vec2(
          decodeSigned(sk.r, u_vmax) * u_viewportSize.x,
          decodeSigned(sk.g, u_vmax) * u_viewportSize.y
        );

        vec2 accel = mix(vec2(0.0), u_gravity, step(0.5, type));
        vec2 s_lin = world0 + v0 * age;
        vec2 s_par = world0 + v0 * age + 0.5 * accel * (age * age);
        vec2 s = mix(s_lin, s_par, step(0.5, type));

        vec2 screenPos = s - u_viewportOrigin;
        vec2 posClip = vec2(
          (screenPos.x / u_viewportSize.x) * 2.0 - 1.0,
          1.0 - (screenPos.y / u_viewportSize.y) * 2.0
        );
        posClip = mix(vec2(2.0, 2.0), posClip, v_alive);

        float seed = hash12((uv * u_texSize) + (sc.rb * 255.0));
        float fade = computeFade(life01, particleType);
        float sizeScale = computeSizeScale(life01, particleType, seed);

        v_alpha = v_alive * fade;
        v_color = computeColor(sc.rgb, life01, particleType);
        v_particleType = particleType;
        v_seed = seed;

        gl_Position = vec4(posClip, 0.0, 1.0);
        gl_PointSize = max(1.0, sizeNorm * u_maxSizePx * sizeScale * v_alive);
      }
    `;

    const fragmentShader = `
      precision mediump float;

      varying float v_alive;
      varying float v_alpha;
      varying vec3  v_color;
      varying float v_particleType;
      varying float v_seed;

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

      void main(){
        if (v_alive < 0.5) discard;
        vec2 point = (gl_PointCoord * 2.0) - 1.0;
        float mask = particleMask(point, v_particleType, v_seed);
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
    this.attachStateReadToFBO();
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

  private attachStateReadToFBO(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboStateRead);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.stateRead, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Particle read FBO incomplete: 0x${status.toString(16)}`);
    }
  }

  private swapParticleStates(): void {
    const nextRead = this.stateWrite;
    this.stateWrite = this.stateRead;
    this.stateRead = nextRead;
  }
}
