import { OrderDebuggerOrchestrator } from "../../ecs/debugger-orders/order-debugger-orchestrator.js";
import { DebuggerPaintOrder } from "../../ecs/debugger-orders/types/debugger.js";
import { RenderObject } from "./types/render-objects.js";

export type TrajectoryType = 0 | 1; // 0 = linear, 1 = parabólico
export type RGB = [number, number, number]; // 0..255
export type ParticleType = 0 | 1 | 2 | 3; // 0 = generic, 1 = blood, 2 = dust, 3 = spark

export const PARTICLE_TYPE_GENERIC: ParticleType = 0;
export const PARTICLE_TYPE_BLOOD: ParticleType = 1;
export const PARTICLE_TYPE_DUST: ParticleType = 2;
export const PARTICLE_TYPE_SPARK: ParticleType = 3;

export type SpawnEvent = {
  position: { x: number; y: number };   // world-space pixels
  velocity: { x: number; y: number };   // unidades/seg (interpretação fica no renderer)
  life: number;                          // em segundos (ex.: 1.0)
  size: number;                          // em pixels (ex.: 20)
  color: RGB;                            // [R,G,B] 0..255
  trajectoryType: TrajectoryType;        // 0 linear, 1 parabólico
  particleType?: ParticleType;
};

export class RendererEngine {
  private _debugBorderSprites: boolean = false;
  private _isLoaded: boolean = false;
  private _program: WebGLProgram | undefined;
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;
  private _debugProgram: WebGLProgram | undefined;
  private _debugBuffer!: WebGLBuffer;
  private _debugVAO!: WebGLVertexArrayObject;
  private _simulationProgram: WebGLProgram | undefined;
  private _spawnTexture!: WebGLTexture;
  private _spawnKinematic!: WebGLTexture;
  private _spawnStyle!: WebGLTexture;
  private _stateTextureA!: WebGLTexture;
  private _stateTextureB!: WebGLTexture;
  private _stateRead!: WebGLTexture;
  private _stateWrite!: WebGLTexture;
  private _spawnColor!: WebGLTexture;

  private _simulationFBO!: WebGLFramebuffer;
  private _fboStateRead!: WebGLFramebuffer;

  private _simulationVAO!: WebGLVertexArrayObject;
  private _simulationVBO!: WebGLBuffer;

  private _particleTextureWidth: number = 0;
  private _particleTextureHeight: number = 0;
  private _particleMaxCapacity: number = 0;

  private _particleRenderProgram: WebGLProgram | undefined;

  private _particleRenderVAO!: WebGLVertexArrayObject;
  private _particleRenderVBO!: WebGLBuffer;
  private _spriteVAO!: WebGLVertexArrayObject;
  private _spritePositionBuffer!: WebGLBuffer;
  private _spriteUvBuffer!: WebGLBuffer;
  private _spriteLocalUvBuffer!: WebGLBuffer;

  private static readonly TEX_UNIT_STATE_READ = 1;
  private static readonly TEX_UNIT_SPAWN_KIN = 2;
  private static readonly TEX_UNIT_SPAWN_STYLE = 3;
  private static readonly TEX_UNIT_SPAWN_COLOR = 4;
  private static readonly TEX_UNIT_SPAWN_POSITION = 5;

  // TEXTURE0 = TERRAIN AND OBJECTS
  // TEXTURE1 = PARTICLE STATE READ
  // TEXTURE2 = PARTICLE KINECTICS
  // TEXTURE3 = PARTICLE SPAWN STYLE
  // TEXTURE4 = SPAWN COLOR

  private _spawnHead: number = 0;
  private _pendingSpawns: SpawnEvent[] = [];
  private _lastSpawnRects: { x: number, y: number, width: number, height: number }[] = [];
  private _particleViewportLeft: number = 0;
  private _particleViewportTop: number = 0;
  private _particleWorldWidth: number = 1;
  private _particleWorldHeight: number = 1;

  private _vmax = 1;
  private _maxLife = 6;
  private _maxSize = 20;
  private _yGravity = -9.81;

  constructor() {
    this._canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
    this._gl = this._canvas?.getContext("webgl2") as WebGL2RenderingContext;
    if (!this._gl) {
      alert("WebGL is not available");
      return;
    }
  }

  public init() {
    const vertexShaderSource = `
      attribute vec3 a_position;
      attribute vec2 a_uv;
      attribute vec2 a_local_uv;
      varying vec2 v_uv;
      varying vec2 v_local_uv;

      void main() {
        gl_Position = vec4(a_position, 1.0);
        v_uv = a_uv;
        v_local_uv = a_local_uv;
      }
    `;
    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_uv;
      varying vec2 v_local_uv;
      uniform sampler2D u_texture;
      uniform bool debug_mode;

      void main() {
        float border = 0.02;
        bool isBorder = v_local_uv.x < border ||
                        v_local_uv.y < border ||
                        v_local_uv.x > (1.0 - border) ||
                        v_local_uv.y > (1.0 - border);
        if(isBorder && debug_mode) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          } else {
            vec4 texColor = texture2D(u_texture, v_uv);
            if (texColor.a == 0.00) {
              discard; 
            }
            gl_FragColor = texColor;
        }
      }
    `;
    const vertexShader = this.createShader(this._gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this._gl.FRAGMENT_SHADER, fragmentShaderSource);
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.depthMask(true);
    this._gl.depthFunc(this._gl.LEQUAL);
    this._gl.clearDepth(1.0);
    this._gl.enable(this._gl.BLEND);
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    this.createProgram(vertexShader, fragmentShader);
    this.initSpriteRenderer();
    this.setDebugMode();

    const textureLocation = this._gl.getUniformLocation(this.program, "u_texture");
    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.uniform1i(textureLocation, 0);
    this.initParticles();
    this.initDebugger();
  }

  public enqueueSpawns(events: SpawnEvent[]) {
    this._pendingSpawns.push(...events);
  }

  public uploadSpawnBatch(): void {
    this._lastSpawnRects.length = 0;
    const gl = this._gl;
    if (!this._pendingSpawns.length) return;

    // --- parâmetros de normalização (defina no RendererEngine) ---
    // this._vmax: velocidade máxima esperada (px/s) para mapear v -> [0..1]
    // this._maxLife: vida máxima em segundos
    // this._maxSize: tamanho máximo em pixels (se size for absoluto)
    const VMAX = this._vmax;
    const MAX_LIFE = this._maxLife;
    const MAX_SIZE = this._maxSize;
    const WORLD_WIDTH = Math.max(this._particleWorldWidth, 1);
    const WORLD_HEIGHT = Math.max(this._particleWorldHeight, 1);

    const enc8 = (v: number) => Math.min(255, Math.max(0, Math.floor(v)));
    const clamp01s = (x: number) => {
      const eps = 1.0 / 1024.0;
      return Math.min(1.0 - eps, Math.max(eps, x));
    };
    const packUnorm16 = (value01: number): [number, number] => {
      const clamped = Math.min(1.0, Math.max(0.0, value01));
      const quantized = Math.min(65535, Math.max(0, Math.round(clamped * 65535.0)));
      return [
        (quantized >> 8) & 255,
        quantized & 255,
      ];
    };
    const encVel01 = (v: number) => (v / VMAX) * 0.5 + 0.5; // [-VMAX,VMAX] -> [0..1]

    const posPacked: number[] = []; // RGBA: worldX hi/lo, worldY hi/lo
    const kinPacked: number[] = []; // RGBA: v0.x(enc), v0.y(enc), free, free
    const styPacked: number[] = []; // RGBA: lifeNorm, sizeNorm, type(0/1), livre
    const colPacked: number[] = []; // R, G, B, particleType

    for (const ev of this._pendingSpawns) {
      const x01 = Math.min(1.0, Math.max(0.0, ev.position.x / WORLD_WIDTH));
      const y01 = Math.min(1.0, Math.max(0.0, ev.position.y / WORLD_HEIGHT));
      const [xHi, xLo] = packUnorm16(x01);
      const [yHi, yLo] = packUnorm16(y01);

      const vxNorm = ev.velocity.x / this._canvas.width;    // px/s -> (0..1)/s
      const vyNorm = ev.velocity.y / this._canvas.height;   // world Y down

      const vx01 = clamp01s(encVel01(vxNorm));
      const vy01 = clamp01s(encVel01(vyNorm));

      const lifeNorm = Math.min(1, Math.max(0, ev.life / MAX_LIFE));
      const sizeNorm = Math.min(1, Math.max(0, ev.size / MAX_SIZE));
      const typeByte = ev.trajectoryType === 1 ? 255 : 0;
      const particleTypeByte = ev.particleType === PARTICLE_TYPE_SPARK
        ? 255
        : ev.particleType === PARTICLE_TYPE_DUST
          ? 170
          : ev.particleType === PARTICLE_TYPE_BLOOD
            ? 85
            : 0;

      posPacked.push(
        xHi,
        xLo,
        yHi,
        yLo
      );

      // spawnKinematic
      kinPacked.push(
        enc8(vx01 * 255),
        enc8(vy01 * 255),
        0,
        0
      );

      // spawnStyle
      styPacked.push(
        enc8(lifeNorm * 255),
        enc8(sizeNorm * 255),
        typeByte,
        0 // livre - virar color index depois
      );

      colPacked.push(
        ev.color[0],
        ev.color[1],
        ev.color[2],
        particleTypeByte
      );
    }

    let count = posPacked.length / 4;
    if (count === 0) { this._pendingSpawns.length = 0; return; }

    // Keeps the freshest spawns when a single frame produces more particles than the ring can hold.
    if (count > this._particleMaxCapacity) {
      const keepFrom = (count - this._particleMaxCapacity) * 4;
      posPacked.splice(0, keepFrom);
      kinPacked.splice(0, keepFrom);
      styPacked.splice(0, keepFrom);
      colPacked.splice(0, keepFrom);
      count = this._particleMaxCapacity;
    }

    const pos = new Uint8Array(posPacked);
    const kin = new Uint8Array(kinPacked);
    const sty = new Uint8Array(styPacked);
    const col = new Uint8Array(colPacked);

    const width = this._particleTextureWidth;
    const startId = this._spawnHead;

    const writeRange = (
      data: Uint8Array,
      tex: WebGLTexture,
      start: number,
      len: number,
      srcOffsetBytes: number,
      trackClearRect: boolean,
    ) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      let remaining = len;
      let cursor = start;
      let byteOffset = srcOffsetBytes;

      while (remaining > 0) {
        const sx = cursor % width;
        const sy = Math.floor(cursor / width);
        const run = Math.min(remaining, width - sx);
        const slice = data.subarray(byteOffset, byteOffset + (run * 4));

        gl.texSubImage2D(gl.TEXTURE_2D, 0, sx, sy, run, 1, gl.RGBA, gl.UNSIGNED_BYTE, slice);
        if (trackClearRect) {
          this._lastSpawnRects.push({ x: sx, y: sy, width: run, height: 1 });
        }

        remaining -= run;
        cursor += run;
        byteOffset += run * 4;
      }
    };

    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_POSITION);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnTexture);

    if (startId + count <= this._particleMaxCapacity) {
      writeRange(pos, this._spawnTexture, startId, count, 0, false);
    } else {
      const first = this._particleMaxCapacity - startId;
      writeRange(pos, this._spawnTexture, startId, first, 0, false);
      writeRange(pos, this._spawnTexture, 0, count - first, first * 4, false);
    }

    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_KIN);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnKinematic);

    if (startId + count <= this._particleMaxCapacity) {
      writeRange(kin, this._spawnKinematic, startId, count, 0, false);
    } else {
      const first = this._particleMaxCapacity - startId;
      writeRange(kin, this._spawnKinematic, startId, first, 0, false);
      writeRange(kin, this._spawnKinematic, 0, count - first, first * 4, false);
    }

    // 3) subir spawnStyle (mesmo mapeamento de IDs)
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_STYLE);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnStyle);

    if (startId + count <= this._particleMaxCapacity) {
      writeRange(sty, this._spawnStyle, startId, count, 0, true);
    } else {
      const first = this._particleMaxCapacity - startId;
      writeRange(sty, this._spawnStyle, startId, first, 0, true);
      writeRange(sty, this._spawnStyle, 0, count - first, first * 4, true);
    }

    // 4) subir spawnColor
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_COLOR);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnColor);

    if (startId + count <= this._particleMaxCapacity) {
      writeRange(col, this._spawnColor, startId, count, 0, false);
    } else {
      const first = this._particleMaxCapacity - startId;
      writeRange(col, this._spawnColor, startId, first, 0, false);
      writeRange(col, this._spawnColor, 0, count - first, first * 4, false);
    }

    // 4) avança o ring
    this._spawnHead = (startId + count) % this._particleMaxCapacity;

    // 5) limpa fila CPU
    this._pendingSpawns.length = 0;
  }

  private initParticles() {
    this.compileSimulationProgram();
    this.initParticleSimulation(512); // capacidade arbitrária
    this.compileParticleRenderProgram();
    this.initParticleRender();
  }

  private initSpriteRenderer() {
    const gl = this._gl;
    this._spriteVAO = gl.createVertexArray()!;
    this._spritePositionBuffer = gl.createBuffer()!;
    this._spriteUvBuffer = gl.createBuffer()!;
    this._spriteLocalUvBuffer = gl.createBuffer()!;

    const positionAttribLocation = gl.getAttribLocation(this.program, "a_position");
    const uvAttributeLocation = gl.getAttribLocation(this.program, "a_uv");
    const uvLocalAttributeLocation = gl.getAttribLocation(this.program, "a_local_uv");

    gl.bindVertexArray(this._spriteVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._spritePositionBuffer);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._spriteUvBuffer);
    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._spriteLocalUvBuffer);
    gl.enableVertexAttribArray(uvLocalAttributeLocation);
    gl.vertexAttribPointer(uvLocalAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  private initDebugger() {
    const debugVertexShaderSource = `
      attribute vec3 a_position;

      void main() {
        gl_Position = vec4(a_position, 1.0);
      }
    `;

    const debugFragmentShaderSource = `
      precision mediump float;

      uniform vec4 u_color;

      void main() {
        gl_FragColor = u_color;
      }
    `;

    const vertexShader = this.createShader(this._gl.VERTEX_SHADER, debugVertexShaderSource);
    const fragmentShader = this.createShader(this._gl.FRAGMENT_SHADER, debugFragmentShaderSource);

    this._debugProgram = this.createProgramRet(vertexShader, fragmentShader);

    const gl = this._gl;
    this._debugVAO = gl.createVertexArray()!;
    this._debugBuffer = gl.createBuffer()!;

    gl.bindVertexArray(this._debugVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._debugBuffer);

    const positionLocation = gl.getAttribLocation(this._debugProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  private compileSimulationProgram() {
    const simulationVertexShader = `
      attribute vec2 a_position;
      varying vec2 v_uv;

      void main(){
          v_uv = a_position * 0.5 + 0.5; // converte [-1,1] → [0,1]
          gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const simulationFragmentShader = `
      precision highp float;
      varying vec2 v_uv;

      uniform sampler2D u_stateRead;   // RGBA: lifeRem, lifeInitLatched, type, sizeNorm
      uniform sampler2D u_spawnStyle;  // RGBA: lifeInit, sizeNorm, type, _
      uniform float u_deltaTime;       // s
      uniform float u_maxLife;         // s

      void main() {
          vec4 sr = texture2D(u_stateRead, v_uv); // lifeRem, lifeInitLatched, type, sizeNorm
          vec4 ss = texture2D(u_spawnStyle, v_uv); // lifeInit, sizeNorm, type, _

          // 1) decr vida do estado anterior
          float lifeDec = max(sr.r - (u_deltaTime / u_maxLife), 0.0);

          // 2) decide spawn (só se estava morto)
          float wasAlive = step(0.001, sr.r);
          float wasDead  = 1.0 - wasAlive;
          float hasInit  = step(0.001, ss.r);
          float doSpawn  = wasDead * hasInit;

          // 3) grava novo estado
          float lifeRem   = mix(lifeDec, ss.r, doSpawn);  // R
          float lifeInitL = mix(sr.g,   ss.r, doSpawn);   // G (latched no spawn)
          float type      = mix(sr.b,   ss.b, doSpawn);   // B
          float sizeNorm  = mix(sr.a,   ss.g, doSpawn);   // A (latched no spawn tb)

          gl_FragColor = vec4(lifeRem, lifeInitL, type, sizeNorm);
      }

    `;

    const vertex = this.createShader(this._gl.VERTEX_SHADER, simulationVertexShader);
    const frag = this.createShader(this._gl.FRAGMENT_SHADER, simulationFragmentShader);
    this._simulationProgram = this.createProgramRet(vertex, frag); // não mexe no this._program
  }

  private initParticleSimulation(capacity: number) {
    const gl = this._gl;
    this._particleMaxCapacity = capacity;

    // Square atlas
    this._particleTextureWidth = Math.ceil(Math.sqrt(capacity));
    this._particleTextureHeight = Math.ceil(capacity / this._particleTextureWidth);

    // Creates state A and B
    this._stateTextureA = this.createStateTexture(this._particleTextureWidth, this._particleTextureHeight);
    this._stateTextureB = this.createStateTexture(this._particleTextureWidth, this._particleTextureHeight);
    this._stateRead = this._stateTextureA;
    this._stateWrite = this._stateTextureB;

    // creates Textures
    this._spawnTexture = this.createStateTexture(this._particleTextureWidth, this._particleTextureHeight);
    this._spawnKinematic = this.createStateTexture(this._particleTextureWidth, this._particleTextureHeight);
    this._spawnStyle = this.createStateTexture(this._particleTextureWidth, this._particleTextureHeight);
    this._spawnColor = this.createStateTexture(this._particleTextureWidth, this._particleTextureHeight);

    // FBO
    this._simulationFBO = gl.createFramebuffer()!;
    this._fboStateRead = gl.createFramebuffer()!;
    this.attachStateWriteToFBO();
    this.attachStateReadToFBO();

    // Quad fullscreen for simulation
    this.initSimulationQuad();

    // Texture cleaning
    gl.bindTexture(gl.TEXTURE_2D, this._stateTextureA);
    const zero = new Uint8Array(this._particleTextureWidth * this._particleTextureHeight * 4);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._particleTextureWidth, this._particleTextureHeight, gl.RGBA, gl.UNSIGNED_BYTE, zero);
    gl.bindTexture(gl.TEXTURE_2D, this._stateTextureB);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._particleTextureWidth, this._particleTextureHeight, gl.RGBA, gl.UNSIGNED_BYTE, zero);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._particleTextureWidth, this._particleTextureHeight, gl.RGBA, gl.UNSIGNED_BYTE, zero);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnKinematic);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._particleTextureWidth, this._particleTextureHeight, gl.RGBA, gl.UNSIGNED_BYTE, zero);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnStyle);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._particleTextureWidth, this._particleTextureHeight, gl.RGBA, gl.UNSIGNED_BYTE, zero);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnColor);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._particleTextureWidth, this._particleTextureHeight, gl.RGBA, gl.UNSIGNED_BYTE, zero);
  }

  private initSimulationQuad() {
    const gl = this._gl;
    this._simulationVAO = gl.createVertexArray()!;
    this._simulationVBO = gl.createBuffer()!;

    const verts = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);

    gl.bindVertexArray(this._simulationVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._simulationVBO);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const loc = this._gl.getAttribLocation(this._simulationProgram!, "a_position");; // a_position
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  private runSimulation(deltaTime: number) {
    const gl = this._gl;
    if (!this._simulationProgram) return;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._simulationFBO);
    this.attachStateWriteToFBO();

    gl.viewport(0, 0, this._particleTextureWidth, this._particleTextureHeight);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, true);

    gl.useProgram(this._simulationProgram);

    // stateRead (ping)
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_STATE_READ);
    gl.bindTexture(gl.TEXTURE_2D, this._stateRead);
    gl.uniform1i(gl.getUniformLocation(this._simulationProgram, "u_stateRead"),
      RendererEngine.TEX_UNIT_STATE_READ);

    // spawnStyle (persistente)
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_STYLE);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnStyle);
    gl.uniform1i(gl.getUniformLocation(this._simulationProgram, "u_spawnStyle"), RendererEngine.TEX_UNIT_SPAWN_STYLE);

    // dt e parâmetros
    gl.uniform1f(gl.getUniformLocation(this._simulationProgram, "u_deltaTime"), deltaTime);
    gl.uniform1f(gl.getUniformLocation(this._simulationProgram, "u_maxLife"), this._maxLife);

    gl.bindVertexArray(this._simulationVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private compileParticleRenderProgram() {
    const vertexShader = `
      attribute float a_particleID;

      uniform sampler2D u_stateRead;      // RGBA: lifeRem, lifeInitLatched, type, sizeNorm
      uniform sampler2D u_spawnPosition;  // RGBA: worldX hi/lo, worldY hi/lo
      uniform sampler2D u_spawnKinematic; // RGBA: v0.x(enc), v0.y(enc), free, free
      uniform sampler2D u_spawnColor;     // RGBA: color.rgb, particleType
      uniform vec2 u_texSize;

      uniform float u_maxLife;   // s
      uniform float u_vmax;      // telas/seg correspondente ao encode
      uniform vec2  u_gravity;   // world px/seg^2
      uniform vec2  u_worldSize;
      uniform vec2  u_viewportOrigin;
      uniform vec2  u_viewportSize;
      uniform float u_maxSizePx; // pixels

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
        vec4 st = texture2D(u_stateRead, uv);      // lifeRem, lifeInitL, type, sizeNorm
        vec4 sp = texture2D(u_spawnPosition, uv);  // world start packed in 16 bits
        vec4 sk = texture2D(u_spawnKinematic, uv); // v0.xy(enc)
        vec4 sc = texture2D(u_spawnColor, uv);     // color.rgb, particleType

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

        // trajetórias
        vec2 accel = mix(vec2(0.0), u_gravity, step(0.5, type));
        vec2 s_lin = world0 + v0 * age;
        vec2 s_par = world0 + v0 * age + 0.5 * accel * (age * age);
        vec2 s = mix(s_lin, s_par, step(0.5, type)); // 0=linear,1=parabólico

        vec2 screenPos = s - u_viewportOrigin;
        vec2 posClip = vec2(
          (screenPos.x / u_viewportSize.x) * 2.0 - 1.0,
          1.0 - (screenPos.y / u_viewportSize.y) * 2.0
        );
        posClip = mix(vec2(2.0, 2.0), posClip, v_alive); // empurra mortos p/ fora

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

        gl_FragColor = vec4(v_color * alpha, alpha); // premultiplied
      }
    `;

    const vs = this.createShader(this._gl.VERTEX_SHADER, vertexShader);
    const fs = this.createShader(this._gl.FRAGMENT_SHADER, fragmentShader);
    this._particleRenderProgram = this.createProgramRet(vs, fs);
  }

  private debugReadStateWrite() {
    const gl = this._gl;
    const readData = new Uint8Array(this._particleTextureWidth * this._particleTextureHeight * 4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._simulationFBO);
    this.attachStateWriteToFBO();

    gl.readPixels(0, 0, this._particleTextureWidth, this._particleTextureHeight, gl.RGBA, gl.UNSIGNED_BYTE, readData);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //console.log("First 5 texels from stateWrite:");
    for (let i = 0; i < 5; i++) {
      const idx = i * 4;
      //console.log(`[${i}]`, readData[idx], readData[idx + 1], readData[idx + 2], readData[idx + 3]);
    }
  }

  public disarmSpawnStyleRects(): void {
    if (!this._lastSpawnRects.length) return;
    const gl = this._gl;
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_STYLE);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnStyle);

    for (const r of this._lastSpawnRects) {
      const zeros = new Uint8Array(r.width * r.height * 4); // zera RGBA
      gl.texSubImage2D(gl.TEXTURE_2D, 0, r.x, r.y, r.width, r.height, gl.RGBA, gl.UNSIGNED_BYTE, zeros);
    }
    this._lastSpawnRects.length = 0;
  }

  private initParticleRender() {
    const gl = this._gl;
    this._particleRenderVAO = gl.createVertexArray()!;
    this._particleRenderVBO = gl.createBuffer()!;

    const ids = new Float32Array(this._particleMaxCapacity);
    for (let i = 0; i < ids.length; i++) ids[i] = i;

    gl.bindVertexArray(this._particleRenderVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._particleRenderVBO);
    gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);

    const loc = this._gl.getAttribLocation(this._particleRenderProgram!, "a_particleID");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  public updateParticles(deltaTime: number) {
    this.runSimulation(deltaTime);
    this.swapParticleStates();
  }

  public renderParticles() {
    this.beginParticleRenderPass();
    this.renderParticlesDraw();
    this.endParticleRenderPass();
  }

  private beginParticleRenderPass() {
    const gl = this._gl;
    gl.viewport(0, 0, this._canvas.width, this._canvas.height)
    gl.useProgram(this._particleRenderProgram!);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied-friendly
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    // bind stateRead na textura correta
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_STATE_READ);
    gl.bindTexture(gl.TEXTURE_2D, this._stateRead);
    gl.uniform1i(gl.getUniformLocation(this._particleRenderProgram!, "u_stateRead"), RendererEngine.TEX_UNIT_STATE_READ);
    gl.uniform2f(gl.getUniformLocation(this._particleRenderProgram!, "u_texSize"), this._particleTextureWidth, this._particleTextureHeight);

    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_POSITION);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnTexture);
    gl.uniform1i(gl.getUniformLocation(this._particleRenderProgram!, "u_spawnPosition"), RendererEngine.TEX_UNIT_SPAWN_POSITION);

    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_KIN);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnKinematic);
    gl.uniform1i(gl.getUniformLocation(this._particleRenderProgram!, "u_spawnKinematic"), RendererEngine.TEX_UNIT_SPAWN_KIN);

    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_STYLE);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnStyle);
    gl.uniform1i(gl.getUniformLocation(this._particleRenderProgram!, "u_spawnStyle"), RendererEngine.TEX_UNIT_SPAWN_STYLE);

    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_COLOR);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnColor);
    gl.uniform1i(gl.getUniformLocation(this._particleRenderProgram!, "u_spawnColor"), RendererEngine.TEX_UNIT_SPAWN_COLOR);

    gl.uniform1f(gl.getUniformLocation(this._particleRenderProgram!, "u_maxLife"), this._maxLife);
    gl.uniform1f(gl.getUniformLocation(this._particleRenderProgram!, "u_vmax"), this._vmax);
    gl.uniform2f(gl.getUniformLocation(this._particleRenderProgram!, "u_gravity"), 0.0, -this._yGravity);
    gl.uniform2f(gl.getUniformLocation(this._particleRenderProgram!, "u_worldSize"), this._particleWorldWidth, this._particleWorldHeight);
    gl.uniform2f(gl.getUniformLocation(this._particleRenderProgram!, "u_viewportOrigin"), this._particleViewportLeft, this._particleViewportTop);
    gl.uniform2f(gl.getUniformLocation(this._particleRenderProgram!, "u_viewportSize"), this._canvas.width, this._canvas.height);
    gl.uniform1f(gl.getUniformLocation(this._particleRenderProgram!, "u_maxSizePx"), this._maxSize);
  }

  private renderParticlesDraw() {
    const gl = this._gl;
    gl.bindVertexArray(this._particleRenderVAO);
    gl.drawArrays(gl.POINTS, 0, this._particleMaxCapacity);
    gl.bindVertexArray(null);
  }

  private endParticleRenderPass() {
    const gl = this._gl;
    gl.depthMask(true);
  }

  private buildDebugVertices(draw: DebuggerPaintOrder): number[] {

    if (draw.type == 'fill') {
      const width = draw.width ?? 4;
      const height = draw.height ?? 4;
      const x1 = draw.x;
      const y1 = draw.y;
      const x2 = draw.x + width;
      const y2 = draw.y + height;

      const [cx1, cy1, cz1] = this.toClipSpace(x1, y1, 0, this._canvas);
      const [cx2, cy2, cz2] = this.toClipSpace(x2, y1, 0, this._canvas);
      const [cx3, cy3, cz3] = this.toClipSpace(x1, y2, 0, this._canvas);
      const [cx4, cy4, cz4] = this.toClipSpace(x2, y2, 0, this._canvas);

      return [
        cx1, cy1, cz1,
        cx3, cy3, cz3,
        cx2, cy2, cz2,

        cx4, cy4, cz4,
        cx2, cy2, cz2,
        cx3, cy3, cz3,
      ];
    } else if (draw.type == 'circle') {
      const segments = 12;
      const circleTriangleSegmentDiff = (Math.PI * 2) / segments;
      const circleTriangleVertices: number[] = [];
      const radius = draw.width / 2;
      for (let i = 1; i <= segments; i++) {
        const angleStart = (i - 1) * circleTriangleSegmentDiff;
        const angleEnd = i * circleTriangleSegmentDiff;
        const x1 = Math.cos(angleStart) * radius + draw.centroidX;
        const x2 = Math.cos(angleEnd) * radius + draw.centroidX;
        const y1 = Math.sin(angleStart) * radius + draw.centroidY;
        const y2 = Math.sin(angleEnd) * radius + draw.centroidY;
        const [cx1, cy1, cz1] = this.toClipSpace(x1, y1, 0, this._canvas);
        const [cx2, cy2, cz2] = this.toClipSpace(x2, y2, 0, this._canvas);
        const [cx3, cy3, cz3] = this.toClipSpace(draw.centroidX, draw.centroidY, 0, this._canvas);
        circleTriangleVertices.push(...[
          cx1, cy1, cz1,
          cx3, cy3, cz3,
          cx2, cy2, cz2,
        ])
      }
      return circleTriangleVertices;
    }
    return [];
  }

  private parseColorToRgba(color: string): [number, number, number, number] {
    const value = color.trim().toLowerCase();

    if (value.startsWith("#")) {
      const hex = value.slice(1);

      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16) / 255;
        const g = parseInt(hex[1] + hex[1], 16) / 255;
        const b = parseInt(hex[2] + hex[2], 16) / 255;
        return [r, g, b, 1];
      }

      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        return [r, g, b, 1];
      }

      if (hex.length === 8) {
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        const a = parseInt(hex.slice(6, 8), 16) / 255;
        return [r, g, b, a];
      }
    }

    const rgbaMatch = value.match(/^rgba?\(([^)]+)\)$/);
    if (rgbaMatch) {
      const parts = rgbaMatch[1].split(",").map((p) => p.trim());

      const r = Math.max(0, Math.min(255, Number(parts[0]))) / 255;
      const g = Math.max(0, Math.min(255, Number(parts[1]))) / 255;
      const b = Math.max(0, Math.min(255, Number(parts[2]))) / 255;
      const a = parts[3] !== undefined ? Math.max(0, Math.min(1, Number(parts[3]))) : 1;

      return [r, g, b, a];
    }

    return [1, 0, 1, 1];
  }


  public renderDebugPaint(paintOrder: DebuggerPaintOrder) {
    const gl = this._gl;
    if (!this._debugProgram) {
      return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);

    gl.useProgram(this._debugProgram);

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.bindVertexArray(this._debugVAO);

    const colorLocation = gl.getUniformLocation(this._debugProgram, "u_color");

    const vertices = this.buildDebugVertices(paintOrder);
    const [r, g, b, a] = this.parseColorToRgba(paintOrder.color);

    gl.uniform4f(colorLocation, r, g, b, a);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._debugBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

    gl.bindVertexArray(null);

    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
  }

  public renderSprites(renderObjects: Array<RenderObject>) {
    this.restoreGLForObjects();
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

    const uvBorderPattern = [
      0.0, 0.0,  // top left
      0.0, 1.0,  // bottom left
      1.0, 0.0,  // top right

      1.0, 1.0,  // bottom right
      1.0, 0.0,  // top right
      0.0, 1.0   // bottom left
    ];

    // Group based on texture
    const groups = new Map<WebGLTexture, RenderObject[]>();
    for (const obj of renderObjects) {
      if (!groups.has(obj.spriteSheetTexture)) {
        groups.set(obj.spriteSheetTexture, []);
      }
      groups.get(obj.spriteSheetTexture)!.push(obj);
    }

    this._gl.bindVertexArray(this._spriteVAO);

    for (const [texture, renderObjects] of groups) {
      const vertices: number[] = [];
      const uvTextures: number[] = [];
      const uvLocal: number[] = [];

      for (const obj of renderObjects) {
        const { xWorldPosition, yWorldPosition, zLevel, width, height, uvCoordinates, offsetRotation } = obj;
        const angle = obj.angleRotation || 0;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const isMirrored = cos < 0 ? true : false;

        const localQuad = [
          { x: 0, y: 0 },             // top-left
          { x: 0, y: height },        // bottom-left
          { x: width, y: 0 },         // top-right
          { x: width, y: height },    // bottom-right
          { x: width, y: 0 },         // top-right
          { x: 0, y: height }         // bottom-left
        ];

        const pivot = { x: 0, y: isMirrored ? height - offsetRotation : offsetRotation };
        for (const point of localQuad) {
          const dx = point.x - pivot.x;
          const dy = point.y - pivot.y;
          let worldX: number;
          let worldY: number;

          if (obj.angleRotation !== null) {
            const rotatedX = dx * cos - dy * sin;
            const rotatedY = dx * sin + dy * cos;
            worldX = xWorldPosition + rotatedX;
            worldY = yWorldPosition + rotatedY;
          } else {
            worldX = xWorldPosition + dx;
            worldY = yWorldPosition + dy;
          }

          const [clipX, clipY, clipZ] = this.toClipSpace(worldX, worldY, zLevel, this._canvas);
          vertices.push(clipX, clipY, clipZ);
        }

        uvTextures.push(...uvCoordinates);
        uvLocal.push(...uvBorderPattern);
      }

      // Bind with the current texture
      this._gl.activeTexture(this._gl.TEXTURE0);
      this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._spritePositionBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.DYNAMIC_DRAW);

      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._spriteUvBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(uvTextures), this._gl.DYNAMIC_DRAW);

      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._spriteLocalUvBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(uvLocal), this._gl.DYNAMIC_DRAW);

      // Final call to render everything
      this._gl.drawArrays(this._gl.TRIANGLES, 0, vertices.length / 3);
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }

    this._gl.bindVertexArray(null);
  }

  private createShader(type: number, source: string) {
    const shader = this._gl.createShader(type)!;
    this._gl.shaderSource(shader, source);
    this._gl.compileShader(shader);
    if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
      const infoLog = this._gl.getShaderInfoLog(shader);
      console.error(infoLog);
      throw new Error("An error occurred while trying to compile shader. Check the logs." + type);
    }
    return shader;
  }

  private toClipSpace(px: number, py: number, zLevel: number, canvas: HTMLCanvasElement): [number, number, number] {
    const clipX = (px / canvas.width) * 2 - 1;
    const clipY = 1 - (py / canvas.height) * 2;
    const clipZ = 1.0 - (zLevel / 1000) * 2.0;
    return [clipX, clipY, clipZ];
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = this._gl.createProgram();
    if (!program) {
      throw new Error("An error occurred while trying to create shader program.");
    }
    this._program = program;
    this._gl.attachShader(program, vertexShader);
    this._gl.attachShader(program, fragmentShader);
    this._gl.linkProgram(program);
    if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
      const infoLog = this._gl.getProgramInfoLog(this._program);
      console.error(infoLog);
      throw new Error("An error occurred while trying to link program. Check the logs.");
    }
    this._gl.useProgram(this._program);
  }

  private createProgramRet(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const prog = this._gl.createProgram()!;
    this._gl.attachShader(prog, vertexShader);
    this._gl.attachShader(prog, fragmentShader);
    this._gl.linkProgram(prog);
    if (!this._gl.getProgramParameter(prog, this._gl.LINK_STATUS)) {
      const infoLog = this._gl.getProgramInfoLog(prog);
      console.error(infoLog);
      throw new Error("Program link error (particles).");
    }
    // libera shaders após link
    this._gl.deleteShader(vertexShader);
    this._gl.deleteShader(fragmentShader);
    return prog;
  }

  private createStateTexture(width: number, height: number) {
    const gl = this._gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  private attachStateWriteToFBO() {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._simulationFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateWrite, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Particle FBO incomplete: 0x${status.toString(16)}`);
    }
  }

  private attachStateReadToFBO() {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._fboStateRead);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateRead, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Particle FBO incomplete: 0x${status.toString(16)}`);
    }
  }

  private swapParticleStates() {
    const tmp = this._stateRead;
    this._stateRead = this._stateWrite;
    this._stateWrite = tmp;
  }

  private setDebugMode() {
    this._gl.uniform1f(this._gl.getUniformLocation(this.program, "debug_mode"), Number(this._debugBorderSprites));
  }

  private get program() {
    if (!this._program) {
      throw new Error("Program is not loaded!")
    }
    return this._program;
  }

  public get isLoaded() {
    return this._isLoaded;
  }

  private restoreGLForObjects() {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);

    gl.useProgram(this._program!);          // garante o program correto

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.colorMask(true, true, true, true);
    gl.disable(gl.SCISSOR_TEST);

    gl.activeTexture(gl.TEXTURE0);          // TEXTURE0 reservado aos objetos
  }

  public clear() {
    this.restoreGLForObjects();
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    this._gl.clearColor(0, 0, 0, 1);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
  }

  public setParticleViewport(left: number, top: number) {
    this._particleViewportLeft = left;
    this._particleViewportTop = top;
  }

  public setParticleWorldBounds(width: number, height: number) {
    this._particleWorldWidth = Math.max(width, 1);
    this._particleWorldHeight = Math.max(height, 1);
  }
  
  public toggleDebugBorderSprite(status : boolean) {
    if (this._debugBorderSprites === status) {
      return;
    }

    this._debugBorderSprites = status;
    this._gl.useProgram(this.program);
    this.setDebugMode();
  }
}
