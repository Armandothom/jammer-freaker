import type { RenderObject } from "./types/render-objects.js";
import { toClipSpace } from "./renderer-shared.js";

export interface SpriteBatchDrawOptions {
  debugBorderSprites: boolean;
  depthTestEnabled: boolean;
  depthWriteEnabled: boolean;
  overrideZLevel?: number;
}

export class SpriteBatchRenderer {
  private readonly vao: WebGLVertexArrayObject;
  private readonly positionBuffer: WebGLBuffer;
  private readonly uvBuffer: WebGLBuffer;
  private readonly localUvBuffer: WebGLBuffer;
  private readonly alphaBuffer: WebGLBuffer;
  private readonly textureLocation: WebGLUniformLocation | null;
  private readonly debugModeLocation: WebGLUniformLocation | null;

  constructor(
    private gl: WebGL2RenderingContext,
    private canvas: HTMLCanvasElement,
    private program: WebGLProgram,
  ) {
    const vao = gl.createVertexArray();
    const positionBuffer = gl.createBuffer();
    const uvBuffer = gl.createBuffer();
    const localUvBuffer = gl.createBuffer();
    const alphaBuffer = gl.createBuffer();

    if (!vao || !positionBuffer || !uvBuffer || !localUvBuffer || !alphaBuffer) {
      throw new Error("Unable to allocate sprite batch buffers.");
    }

    this.vao = vao;
    this.positionBuffer = positionBuffer;
    this.uvBuffer = uvBuffer;
    this.localUvBuffer = localUvBuffer;
    this.alphaBuffer = alphaBuffer;
    this.textureLocation = gl.getUniformLocation(program, "u_texture");
    this.debugModeLocation = gl.getUniformLocation(program, "debug_mode");

    const positionAttribLocation = gl.getAttribLocation(program, "a_position");
    const uvAttribLocation = gl.getAttribLocation(program, "a_uv");
    const localUvAttribLocation = gl.getAttribLocation(program, "a_local_uv");
    const alphaAttribLocation = gl.getAttribLocation(program, "a_alpha");

    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.enableVertexAttribArray(uvAttribLocation);
    gl.vertexAttribPointer(uvAttribLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.localUvBuffer);
    gl.enableVertexAttribArray(localUvAttribLocation);
    gl.vertexAttribPointer(localUvAttribLocation, 2, gl.FLOAT, false, 0, 0);

    if (alphaAttribLocation >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.alphaBuffer);
      gl.enableVertexAttribArray(alphaAttribLocation);
      gl.vertexAttribPointer(alphaAttribLocation, 1, gl.FLOAT, false, 0, 0);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  draw(renderObjects: RenderObject[], options: SpriteBatchDrawOptions): void {
    if (renderObjects.length === 0) {
      return;
    }

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    if (options.depthTestEnabled) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    gl.depthMask(options.depthWriteEnabled);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.colorMask(true, true, true, true);
    gl.activeTexture(gl.TEXTURE0);

    if (this.textureLocation) {
      gl.uniform1i(this.textureLocation, 0);
    }

    if (this.debugModeLocation) {
      gl.uniform1i(this.debugModeLocation, Number(options.debugBorderSprites));
    }

    const groups = new Map<WebGLTexture, RenderObject[]>();
    for (const renderObject of renderObjects) {
      const group = groups.get(renderObject.spriteSheetTexture) ?? [];
      group.push(renderObject);
      groups.set(renderObject.spriteSheetTexture, group);
    }

    const uvBorderPattern = [
      0.0, 0.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0,
      1.0, 0.0,
      0.0, 1.0,
    ];

    gl.bindVertexArray(this.vao);

    for (const [texture, groupedRenderObjects] of groups) {
      const vertices: number[] = [];
      const textureUvs: number[] = [];
      const localUvs: number[] = [];
      const alphas: number[] = [];

      for (const renderObject of groupedRenderObjects) {
        const zLevel = options.overrideZLevel ?? renderObject.zLevel;
        const alpha = this.clampOpacity(renderObject.opacity ?? 1);
        const angle = renderObject.angleRotation ?? 0;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const mirrored = cosine < 0;

        const localQuad = [
          { x: 0, y: 0 },
          { x: 0, y: renderObject.height },
          { x: renderObject.width, y: 0 },
          { x: renderObject.width, y: renderObject.height },
          { x: renderObject.width, y: 0 },
          { x: 0, y: renderObject.height },
        ];

        const pivot = {
          x: 0,
          y: mirrored
            ? renderObject.height - renderObject.offsetRotation
            : renderObject.offsetRotation,
        };

        for (const point of localQuad) {
          const deltaX = point.x - pivot.x;
          const deltaY = point.y - pivot.y;
          const worldX = renderObject.angleRotation !== null
            ? renderObject.xWorldPosition + (deltaX * cosine) - (deltaY * sine)
            : renderObject.xWorldPosition + deltaX;
          const worldY = renderObject.angleRotation !== null
            ? renderObject.yWorldPosition + (deltaX * sine) + (deltaY * cosine)
            : renderObject.yWorldPosition + deltaY;
          const [clipX, clipY, clipZ] = toClipSpace(worldX, worldY, zLevel, this.canvas);
          vertices.push(clipX, clipY, clipZ);
        }

        textureUvs.push(...renderObject.uvCoordinates);
        localUvs.push(...uvBorderPattern);
        alphas.push(alpha, alpha, alpha, alpha, alpha, alpha);
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureUvs), gl.DYNAMIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.localUvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(localUvs), gl.DYNAMIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.alphaBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(alphas), gl.DYNAMIC_DRAW);

      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  private clampOpacity(opacity: number): number {
    if (!Number.isFinite(opacity)) {
      return 1;
    }

    return Math.max(0, Math.min(opacity, 1));
  }
}
