import { RenderObject } from "./types/render-objects.js";

export type TrajectoryType = 0 | 1; // 0 = linear, 1 = parabólico
export type RGB = [number, number, number]; // 0..255

export type SpawnEvent = {
  position: { x: number; y: number };   // pixels no mesmo espaço do worldToState01
  velocity: { x: number; y: number };   // unidades/seg (interpretação fica no renderer)
  life: number;                          // em segundos (ex.: 1.0)
  size: number;                          // em pixels (ex.: 20)
  color: RGB;                            // [R,G,B] 0..255
  trajectoryType: TrajectoryType;        // 0 linear, 1 parabólico
};

export class RendererEngine {
  private _isLoaded: boolean = false;
  private _debugMode: boolean = true;
  private _program: WebGLProgram | undefined;
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;

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

  private static readonly TEX_UNIT_STATE_READ = 1;
  private static readonly TEX_UNIT_SPAWN_KIN = 2;
  private static readonly TEX_UNIT_SPAWN_STYLE = 3;
  private static readonly TEX_UNIT_SPAWN_COLOR = 4;

  // TEXTURE0 = TERRAIN AND OBJECTS
  // TEXTURE1 = PARTICLE STATE READ
  // TEXTURE2 = PARTICLE KINECTICS
  // TEXTURE3 = PARTICLE SPAWN STYLE
  // TEXTURE4 = SPAWN COLOR

  private _spawnHead: number = 0;
  private _pendingSpawns: SpawnEvent[] = [];
  private _lastSpawnRects: { x: number, y: number, width: number, height: number }[] = [];

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
    this.setDebugMode();

    const textureLocation = this._gl.getUniformLocation(this.program, "u_texture");
    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.uniform1i(textureLocation, 0);
    this.initParticles();
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

    const enc8 = (v: number) => Math.min(255, Math.max(0, Math.floor(v)));
    const clamp01s = (x: number) => {
      const eps = 1.0 / 1024.0;
      return Math.min(1.0 - eps, Math.max(eps, x));
    };
    const encVel01 = (v: number) => (v / VMAX) * 0.5 + 0.5; // [-VMAX,VMAX] -> [0..1]

    const kinPacked: number[] = []; // RGBA: s0.x, s0.y, v0.x(enc), v0.y(enc)
    const styPacked: number[] = []; // RGBA: lifeNorm, sizeNorm, type(0/1), livre
    const colPacked: number[] = []; // R, G, B, 255

    for (const ev of this._pendingSpawns) {
      let [x01, y01] = this.worldToState01(ev.position.x, ev.position.y);
      if (x01 <= 0 || x01 >= 1 || y01 <= 0 || y01 >= 1) continue; // fora da tela? ignora
      x01 = clamp01s(x01);
      y01 = clamp01s(y01);

      const vxNorm = ev.velocity.x / this._canvas.width;   // px/s -> (0..1)/s
      const vyNorm = ev.velocity.y / this._canvas.height;  // px/s -> (0..1)/s

      const vx01 = clamp01s(encVel01(vxNorm));
      const vy01 = clamp01s(encVel01(vyNorm));

      const lifeNorm = Math.min(1, Math.max(0, ev.life / MAX_LIFE));
      const sizeNorm = Math.min(1, Math.max(0, ev.size / MAX_SIZE));
      const typeByte = ev.trajectoryType === 1 ? 255 : 0;

      // spawnKinematic
      kinPacked.push(
        enc8(x01 * 255),
        enc8(y01 * 255),
        enc8(vx01 * 255),
        enc8(vy01 * 255)
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
        255
      );
    }

    const count = kinPacked.length / 4;
    if (count === 0) { this._pendingSpawns.length = 0; return; }

    const kin = new Uint8Array(kinPacked);
    const sty = new Uint8Array(styPacked);
    const col = new Uint8Array(colPacked);

    const width = this._particleTextureWidth;
    const startId = this._spawnHead;

    const writeRange = (data: Uint8Array, tex: WebGLTexture, start: number, len: number, srcOffsetBytes: number) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const sx = start % width;
      const sy = Math.floor(start / width);
      const run = Math.min(len, width - sx);

      gl.texSubImage2D(gl.TEXTURE_2D, 0, sx, sy, run, 1, gl.RGBA, gl.UNSIGNED_BYTE, data, srcOffsetBytes);
      this._lastSpawnRects.push({ x: sx, y: sy, width: run, height: 1 });

      const remain = len - run;
      if (remain > 0) {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, sy + 1, remain, 1, gl.RGBA, gl.UNSIGNED_BYTE, data, srcOffsetBytes + run * 4);
        this._lastSpawnRects.push({ x: 0, y: sy + 1, width: remain, height: 1 });
      }
    };

    // 2) subir spawnKinematic
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_KIN);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnKinematic);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

    if (startId + count <= this._particleMaxCapacity) {
      writeRange(kin, this._spawnKinematic, startId, count, 0);
    } else {
      const first = this._particleMaxCapacity - startId;
      writeRange(kin, this._spawnKinematic, startId, first, 0);
      writeRange(kin, this._spawnKinematic, 0, count - first, first * 4);
    }

    // 3) subir spawnStyle (mesmo mapeamento de IDs)
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_STYLE);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnStyle);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

    if (startId + count <= this._particleMaxCapacity) {
      writeRange(sty, this._spawnStyle, startId, count, 0);
    } else {
      const first = this._particleMaxCapacity - startId;
      writeRange(sty, this._spawnStyle, startId, first, 0);
      writeRange(sty, this._spawnStyle, 0, count - first, first * 4);
    }

    // 4) subir spawnColor
    gl.activeTexture(gl.TEXTURE0 + RendererEngine.TEX_UNIT_SPAWN_COLOR);
    gl.bindTexture(gl.TEXTURE_2D, this._spawnColor);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

    if (startId + count <= this._particleMaxCapacity) {
      writeRange(col, this._spawnColor, startId, count, 0);
    } else {
      const first = this._particleMaxCapacity - startId;
      writeRange(col, this._spawnColor, startId, first, 0);
      writeRange(col, this._spawnColor, 0, count - first, first * 4);
    }

    // 4) avança o ring
    this._spawnHead = (startId + count) % this._particleMaxCapacity;

    // 5) limpa fila CPU
    this._pendingSpawns.length = 0;
  }

  private initParticles() {
    this.compileSimulationProgram();
    this.initParticleSimulation(512); // capacidade arbitrária
    //this.runSimulation(0);
    //this.debugReadStateWrite();
    //this.swapParticleStates();
    //this.debugReadStateRead();
    this.compileParticleRenderProgram();
    this.initParticleRender();
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
      uniform sampler2D u_spawnKinematic; // RGBA: s0.x, s0.y, v0.x(enc), v0.y(enc)
      uniform vec2 u_texSize;

      uniform float u_maxLife;   // s
      uniform float u_vmax;      // telas/seg correspondente ao encode
      uniform vec2  u_gravity;   // telas/seg^2
      uniform float u_maxSizePx; // pixels

      varying float v_alive;
      varying float v_alpha;
      varying vec2  v_uv; // UV para o FS pegar a cor

      vec2 idToUV(float id){
        float x = mod(id, u_texSize.x);
        float y = floor(id / u_texSize.x);
        return (vec2(x,y) + 0.5) / u_texSize;
      }

      float decodeSigned(float x01, float vmax){
        return (x01 * 2.0 - 1.0) * vmax;
      }

      void main(){
        vec2 uv = idToUV(a_particleID);
        v_uv = uv;

        vec4 st = texture2D(u_stateRead, uv);      // lifeRem, lifeInitL, type, sizeNorm
        vec4 sk = texture2D(u_spawnKinematic, uv); // s0.xy, v0.xy(enc)

        float lifeRem   = st.r;
        float lifeInitL = st.g;
        float type      = st.b;
        float sizeNorm  = st.a;

        v_alive = step(0.001, lifeRem);

        // idade em segundos: (lifeInit - lifeRem) * maxLife
        float t = (lifeInitL - lifeRem) * u_maxLife;

        vec2 s0 = sk.xy;
        vec2 v0 = vec2(decodeSigned(sk.z, u_vmax),
                      decodeSigned(sk.w, u_vmax));

        // trajetórias
        vec2 s_lin = s0 + v0 * t;
        vec2 s_par = s_lin + 0.5 * u_gravity * (t*t);
        vec2 s = mix(s_lin, s_par, step(0.5, type)); // 0=linear,1=parabólico

        vec2 posClip = s * 2.0 - 1.0;
        posClip = mix(vec2(2.0, 2.0), posClip, v_alive); // empurra mortos p/ fora

        float eps = 1e-5;
        v_alpha = v_alive * clamp(lifeRem / max(eps, lifeInitL), 0.0, 1.0);

        gl_Position = vec4(posClip, 0.0, 1.0);
        gl_PointSize = sizeNorm * u_maxSizePx * v_alive;
      }
    `;
    const fragmentShader = `
      precision mediump float;

      uniform sampler2D u_spawnColor; // RGBA: R,G,B,_ (0..1)

      varying float v_alive;
      varying float v_alpha;
      varying vec2  v_uv;

      void main(){
        if (v_alive < 0.5) discard;

        vec3 rgb = texture2D(u_spawnColor, v_uv).rgb;
        float a  = v_alpha;

        gl_FragColor = vec4(rgb * a, a); // premultiplied
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

    console.log("First 5 texels from stateWrite:");
    for (let i = 0; i < 5; i++) {
      const idx = i * 4;
      console.log(`[${i}]`, readData[idx], readData[idx + 1], readData[idx + 2], readData[idx + 3]);
    }
  }

  private debugReadStateRead() {
    const gl = this._gl;
    const readData = new Uint8Array(this._particleTextureWidth * this._particleTextureHeight * 4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._fboStateRead);
    this.attachStateReadToFBO();

    gl.readPixels(0, 0, this._particleTextureWidth, this._particleTextureHeight, gl.RGBA, gl.UNSIGNED_BYTE, readData);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    console.log("First 5 texels from stateRead:");
    for (let i = 0; i < 5; i++) {
      const idx = i * 4;
      console.log(`[${i}]`, readData[idx], readData[idx + 1], readData[idx + 2], readData[idx + 3]);
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
    const gNormY = this._yGravity / this._canvas.height;
    gl.uniform2f(gl.getUniformLocation(this._particleRenderProgram!, "u_gravity"), 0.0, gNormY);
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

  public render(renderObjects: Array<RenderObject>) {
    this.restoreGLForObjects();
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT);

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

      // Send position of vertices
      const positionAttribLocation = this._gl.getAttribLocation(this.program, "a_position");
      const bufferLocation = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, bufferLocation);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
      this._gl.enableVertexAttribArray(positionAttribLocation);
      this._gl.vertexAttribPointer(positionAttribLocation, 3, this._gl.FLOAT, false, 0, 0);

      // Send the UV vertices
      const uvAttributeLocation = this._gl.getAttribLocation(this.program, "a_uv");
      const uvBuffer = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, uvBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(uvTextures), this._gl.STATIC_DRAW);
      this._gl.enableVertexAttribArray(uvAttributeLocation);
      this._gl.vertexAttribPointer(uvAttributeLocation, 2, this._gl.FLOAT, false, 0, 0);

      // Local UV to debug border
      const uvLocalAttributeLocation = this._gl.getAttribLocation(this.program, "a_local_uv");
      const uLocalvBuffer = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, uLocalvBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(uvLocal), this._gl.STATIC_DRAW);
      this._gl.enableVertexAttribArray(uvLocalAttributeLocation);
      this._gl.vertexAttribPointer(uvLocalAttributeLocation, 2, this._gl.FLOAT, false, 0, 0);

      // Final call to render everything
      this._gl.drawArrays(this._gl.TRIANGLES, 0, vertices.length / 3);
    }
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
    this._program = this._gl.createProgram();
    this._gl.attachShader(this._program, vertexShader);
    this._gl.attachShader(this._program, fragmentShader);
    this._gl.linkProgram(this._program);
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
    this._gl.uniform1f(this._gl.getUniformLocation(this.program, "debug_mode"), Number(this._debugMode));
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

  private floatToByte(val: number): number {
    return Math.max(0, Math.min(255, Math.floor(val * 255)));
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
    this._gl.clearColor(0, 0, 0, 1); // se quiser limpar o fundo
    this._gl.clear(this._gl.COLOR_BUFFER_BIT);
  }

  private worldToState01(xWorld: number, yWorld: number): [number, number] {
    const [cx, cy] = this.worldToClipXY(xWorld, yWorld);
    // clip (-1..1) -> (0..1)
    return [(cx * 0.5) + 0.5, (cy * 0.5) + 0.5];
  }

  private worldToClipXY(xWorld: number, yWorld: number): [number, number] {
    const [cx, cy] = this.toClipSpace(xWorld, yWorld, 0, this._canvas);
    return [cx, cy];
  }
}