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
  }

  public render(renderObjects: Array<RenderObject>) {
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