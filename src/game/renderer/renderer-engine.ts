import { RenderObject } from "./types/render-objects.js";

export class RendererEngine {
  private _isLoaded: boolean = false;
  private _debugMode: boolean = true;
  private _program: WebGLProgram | undefined;
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;

  constructor() {
    this._canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
    this._gl = this._canvas?.getContext("webgl2")!;
    if (!this._gl) {
      alert("WebGL is not available");
      return;
    }
  }

  public init() {
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_uv;
      attribute vec2 a_local_uv;
      varying vec2 v_uv;
      varying vec2 v_local_uv;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
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
            gl_FragColor = texColor;
        }
      }
    `;
    const vertexShader = this.createShader(this._gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this._gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.createProgram(vertexShader, fragmentShader);
    this.setDebugMode();

    const textureLocation = this._gl.getUniformLocation(this.program, "u_texture");
    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.uniform1i(textureLocation, 0);
  }

  public render(terrainObjects: Array<RenderObject>, overTerrainObjects: Array<RenderObject>) {
    const uvBorderPattern = [
      0.0, 0.0,  // top left
      0.0, 1.0,  // bottom left
      1.0, 0.0,  // top right

      1.0, 1.0,  // bottom right
      1.0, 0.0,  // top right
      0.0, 1.0   // bottom left
    ];
    const allObjects = [...terrainObjects, ...overTerrainObjects];

    // Group based on texture
    const groups = new Map<WebGLTexture, RenderObject[]>();
    for (const obj of allObjects) {
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
        const { xWorldPosition, yWorldPosition, width, height, uvCoordinates } = obj;
        const topLeft = this.toClipSpace(xWorldPosition, yWorldPosition, this._canvas);
        const bottomLeft = this.toClipSpace(xWorldPosition, yWorldPosition + height, this._canvas);
        const topRight = this.toClipSpace(xWorldPosition + width, yWorldPosition, this._canvas);
        const bottomRight = this.toClipSpace(xWorldPosition + width, yWorldPosition + height, this._canvas);

        vertices.push(
          ...topLeft,
          ...bottomLeft,
          ...topRight,
          ...bottomRight,
          ...topRight,
          ...bottomLeft
        );

        uvTextures.push(...uvCoordinates);
        uvLocal.push(...uvBorderPattern);
      }

      // Bind with the current texture
      this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

      // Send position of vertices
      const positionAttribLocation = this._gl.getAttribLocation(this.program, "a_position");
      const bufferLocation = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, bufferLocation);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
      this._gl.enableVertexAttribArray(positionAttribLocation);
      this._gl.vertexAttribPointer(positionAttribLocation, 2, this._gl.FLOAT, false, 0, 0);

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
      this._gl.drawArrays(this._gl.TRIANGLES, 0, vertices.length / 2);
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


  private toClipSpace(px: number, py: number, canvas: HTMLCanvasElement): [number, number] {
    const clipX = (px / canvas.width) * 2 - 1;
    const clipY = 1 - (py / canvas.height) * 2;
    return [clipX, clipY];
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
}