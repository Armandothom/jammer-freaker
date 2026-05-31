import type { RenderObject } from "./types/render-objects.js";

export interface SpriteBatchDrawOptions {
  debugBorderSprites: boolean;
  depthTestEnabled: boolean;
  depthWriteEnabled: boolean;
  overrideZLevel?: number;
}

export class SpriteBatchRenderer {
  private static readonly LOCAL_QUAD_X_FACTORS = [0, 0, 1, 1, 1, 0];
  private static readonly LOCAL_QUAD_Y_FACTORS = [0, 1, 0, 1, 0, 1];
  private static readonly UV_BORDER_PATTERN = [
    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 1.0,
  ];

  private readonly vao: WebGLVertexArrayObject;
  private readonly positionBuffer: WebGLBuffer;
  private readonly uvBuffer: WebGLBuffer;
  private readonly localUvBuffer: WebGLBuffer;
  private readonly alphaBuffer: WebGLBuffer;
  private readonly textureLocation: WebGLUniformLocation | null;
  private readonly debugModeLocation: WebGLUniformLocation | null;
  private readonly groupedRenderObjects = new Map<WebGLTexture, RenderObject[]>();
  private readonly activeTextures: WebGLTexture[] = [];
  private positionUploadBuffer = new Float32Array(0);
  private textureUvUploadBuffer = new Float32Array(0);
  private localUvUploadBuffer = new Float32Array(0);
  private alphaUploadBuffer = new Float32Array(0);

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

    this.groupRenderObjects(renderObjects);

    gl.bindVertexArray(this.vao);

    const clipXScale = 2 / this.canvas.width;
    const clipYScale = 2 / this.canvas.height;

    for (const texture of this.activeTextures) {
      const groupedRenderObjects = this.groupedRenderObjects.get(texture);

      if (!groupedRenderObjects || groupedRenderObjects.length === 0) {
        continue;
      }

      const spriteCount = groupedRenderObjects.length;
      const positionValueCount = spriteCount * 6 * 3;
      const uvValueCount = spriteCount * 6 * 2;
      const alphaValueCount = spriteCount * 6;

      this.positionUploadBuffer = this.ensureFloat32Capacity(
        this.positionUploadBuffer,
        positionValueCount,
      );
      this.textureUvUploadBuffer = this.ensureFloat32Capacity(
        this.textureUvUploadBuffer,
        uvValueCount,
      );
      this.localUvUploadBuffer = this.ensureFloat32Capacity(
        this.localUvUploadBuffer,
        uvValueCount,
      );
      this.alphaUploadBuffer = this.ensureFloat32Capacity(
        this.alphaUploadBuffer,
        alphaValueCount,
      );

      let positionOffset = 0;
      let textureUvOffset = 0;
      let localUvOffset = 0;
      let alphaOffset = 0;

      for (const renderObject of groupedRenderObjects) {
        const zLevel = options.overrideZLevel ?? renderObject.zLevel;
        const clipZ = 1.0 - (zLevel / 1000) * 2.0;
        const alpha = this.clampOpacity(renderObject.opacity ?? 1);
        const angle = renderObject.angleRotation ?? 0;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const mirrored = cosine < 0;

        const pivot = {
          x: renderObject.rotationPivotX ?? 0,
          y: renderObject.rotationPivotY ?? (mirrored
            ? renderObject.height - renderObject.offsetRotation
            : renderObject.offsetRotation),
        };

        for (let vertexIndex = 0; vertexIndex < 6; vertexIndex += 1) {
          const pointX = renderObject.width * SpriteBatchRenderer.LOCAL_QUAD_X_FACTORS[vertexIndex];
          const pointY = renderObject.height * SpriteBatchRenderer.LOCAL_QUAD_Y_FACTORS[vertexIndex];
          const deltaX = pointX - pivot.x;
          const deltaY = pointY - pivot.y;
          const worldX = renderObject.angleRotation !== null
            ? renderObject.xWorldPosition + (deltaX * cosine) - (deltaY * sine)
            : renderObject.xWorldPosition + deltaX;
          const worldY = renderObject.angleRotation !== null
            ? renderObject.yWorldPosition + (deltaX * sine) + (deltaY * cosine)
            : renderObject.yWorldPosition + deltaY;

          this.positionUploadBuffer[positionOffset++] = (worldX * clipXScale) - 1;
          this.positionUploadBuffer[positionOffset++] = 1 - (worldY * clipYScale);
          this.positionUploadBuffer[positionOffset++] = clipZ;
        }

        for (let uvIndex = 0; uvIndex < renderObject.uvCoordinates.length; uvIndex += 1) {
          this.textureUvUploadBuffer[textureUvOffset++] = renderObject.uvCoordinates[uvIndex];
        }

        for (let uvIndex = 0; uvIndex < SpriteBatchRenderer.UV_BORDER_PATTERN.length; uvIndex += 1) {
          this.localUvUploadBuffer[localUvOffset++] = SpriteBatchRenderer.UV_BORDER_PATTERN[uvIndex];
        }

        for (let alphaIndex = 0; alphaIndex < 6; alphaIndex += 1) {
          this.alphaUploadBuffer[alphaOffset++] = alpha;
        }
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        this.positionUploadBuffer.subarray(0, positionOffset),
        gl.DYNAMIC_DRAW,
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        this.textureUvUploadBuffer.subarray(0, textureUvOffset),
        gl.DYNAMIC_DRAW,
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, this.localUvBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        this.localUvUploadBuffer.subarray(0, localUvOffset),
        gl.DYNAMIC_DRAW,
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, this.alphaBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        this.alphaUploadBuffer.subarray(0, alphaOffset),
        gl.DYNAMIC_DRAW,
      );

      gl.drawArrays(gl.TRIANGLES, 0, positionOffset / 3);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    this.clearActiveRenderGroups();
  }

  private clampOpacity(opacity: number): number {
    if (!Number.isFinite(opacity)) {
      return 1;
    }

    return Math.max(0, Math.min(opacity, 1));
  }

  private groupRenderObjects(renderObjects: RenderObject[]): void {
    this.clearActiveRenderGroups();

    for (const renderObject of renderObjects) {
      let group = this.groupedRenderObjects.get(renderObject.spriteSheetTexture);

      if (!group) {
        group = [];
        this.groupedRenderObjects.set(renderObject.spriteSheetTexture, group);
      }

      if (group.length === 0) {
        this.activeTextures.push(renderObject.spriteSheetTexture);
      }

      group.push(renderObject);
    }
  }

  private clearActiveRenderGroups(): void {
    for (const texture of this.activeTextures) {
      const group = this.groupedRenderObjects.get(texture);

      if (group) {
        group.length = 0;
      }
    }

    this.activeTextures.length = 0;
  }

  private ensureFloat32Capacity(buffer: Float32Array, requiredLength: number): Float32Array {
    if (buffer.length >= requiredLength) {
      return buffer;
    }

    let nextLength = buffer.length || 1024;
    while (nextLength < requiredLength) {
      nextLength *= 2;
    }

    return new Float32Array(nextLength);
  }
}
