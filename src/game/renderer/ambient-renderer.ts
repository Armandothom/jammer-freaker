import type { CameraViewport } from "../world/types/camera-viewport.js";
import type { ResolvedAmbientEffectConfig } from "../weather/weather-types.js";
import { createProgram } from "./renderer-shared.js";

export class AmbientRenderer {
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly positionBuffer: WebGLBuffer;
  private readonly uvBuffer: WebGLBuffer;
  private readonly instanceBuffer: WebGLBuffer;
  private readonly maxSupportedInstances = 512;

  constructor(
    private gl: WebGL2RenderingContext,
    private canvas: HTMLCanvasElement,
  ) {
    const vertexShaderSource = `
      attribute vec2 a_localPosition;
      attribute vec2 a_localUv;
      attribute float a_instanceIndex;

      uniform sampler2D u_texture;
      uniform float u_time;
      uniform vec2 u_viewportOrigin;
      uniform vec2 u_viewportSize;
      uniform vec2 u_worldSize;
      uniform vec2 u_baseSpriteSize;
      uniform vec4 u_uvRect;
      uniform float u_speed;
      uniform float u_speedVariation;
      uniform float u_drift;
      uniform float u_scale;
      uniform float u_scaleVariation;
      uniform float u_alpha;
      uniform float u_seed;
      uniform float u_motionMode;
      uniform float u_rotationEnabled;
      uniform float u_rotationSpeed;

      varying vec2 v_uv;
      varying float v_alpha;

      float hash11(float p) {
        return fract(sin(p * 91.3458 + 15.713) * 47453.5453);
      }

      mat2 buildRotation(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat2(c, -s, s, c);
      }

      void main() {
        float instanceSeedA = hash11(a_instanceIndex + (u_seed * 13.0));
        float instanceSeedB = hash11(a_instanceIndex + (u_seed * 29.0) + 4.17);
        float instanceSeedC = hash11(a_instanceIndex + (u_seed * 47.0) + 8.91);
        float instanceSeedD = hash11(a_instanceIndex + (u_seed * 61.0) + 13.37);

        float speed = max(10.0, u_speed + ((instanceSeedA * 2.0 - 1.0) * u_speedVariation));
        float scale = max(0.1, u_scale + ((instanceSeedB * 2.0 - 1.0) * u_scaleVariation));
        vec2 spriteSize = u_baseSpriteSize * scale;
        float rotationDirection = mix(-1.0, 1.0, instanceSeedC);
        float rotationAngle = u_rotationEnabled * ((u_time * u_rotationSpeed * rotationDirection) + (instanceSeedD * 6.2831853));
        vec2 localPixel = buildRotation(rotationAngle) * (a_localPosition * spriteSize);

        float verticalSpan = u_worldSize.y + (spriteSize.y * 2.0);
        float horizontalSpan = u_worldSize.x + (spriteSize.x * 2.0);

        vec2 verticalCenter = vec2(
          instanceSeedC * u_worldSize.x,
          mod((instanceSeedA * verticalSpan) + (u_time * speed), verticalSpan) - spriteSize.y
        );
        verticalCenter.x += sin((u_time * 0.75) + (instanceSeedD * 6.2831853)) * u_drift;

        vec2 horizontalCenter = vec2(
          mod((instanceSeedB * horizontalSpan) + (u_time * speed), horizontalSpan) - spriteSize.x,
          instanceSeedD * u_worldSize.y
        );
        horizontalCenter.y += sin((u_time * 0.85) + (instanceSeedA * 6.2831853)) * u_drift;

        vec2 worldCenter = mix(verticalCenter, horizontalCenter, u_motionMode);
        vec2 screenPosition = (worldCenter - u_viewportOrigin) + localPixel;

        gl_Position = vec4(
          (screenPosition.x / u_viewportSize.x) * 2.0 - 1.0,
          1.0 - (screenPosition.y / u_viewportSize.y) * 2.0,
          0.0,
          1.0
        );

        float mappedU = mix(u_uvRect.x, u_uvRect.y, a_localUv.x);
        float mappedV = mix(u_uvRect.z, u_uvRect.w, a_localUv.y);
        v_uv = vec2(mappedU, mappedV);
        v_alpha = u_alpha * mix(0.8, 1.12, instanceSeedB);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;

      uniform sampler2D u_texture;

      varying vec2 v_uv;
      varying float v_alpha;

      void main() {
        vec4 textureColor = texture2D(u_texture, v_uv);
        float alpha = textureColor.a * v_alpha;
        if (alpha <= 0.001) {
          discard;
        }

        gl_FragColor = vec4(textureColor.rgb, alpha);
      }
    `;

    this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource, "AmbientShader");

    const vao = gl.createVertexArray();
    const positionBuffer = gl.createBuffer();
    const uvBuffer = gl.createBuffer();
    const instanceBuffer = gl.createBuffer();

    if (!vao || !positionBuffer || !uvBuffer || !instanceBuffer) {
      throw new Error("Unable to allocate ambient renderer buffers.");
    }

    this.vao = vao;
    this.positionBuffer = positionBuffer;
    this.uvBuffer = uvBuffer;
    this.instanceBuffer = instanceBuffer;

    const quadPositions = new Float32Array([
      -0.5, -0.5,
      -0.5, 0.5,
      0.5, -0.5,
      0.5, 0.5,
      0.5, -0.5,
      -0.5, 0.5,
    ]);
    const quadUvs = new Float32Array([
      0, 0,
      0, 1,
      1, 0,
      1, 1,
      1, 0,
      0, 1,
    ]);
    const instanceIndices = new Float32Array(this.maxSupportedInstances);
    for (let index = 0; index < instanceIndices.length; index += 1) {
      instanceIndices[index] = index;
    }

    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadPositions, gl.STATIC_DRAW);
    const localPositionLocation = gl.getAttribLocation(this.program, "a_localPosition");
    gl.enableVertexAttribArray(localPositionLocation);
    gl.vertexAttribPointer(localPositionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadUvs, gl.STATIC_DRAW);
    const localUvLocation = gl.getAttribLocation(this.program, "a_localUv");
    gl.enableVertexAttribArray(localUvLocation);
    gl.vertexAttribPointer(localUvLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceIndices, gl.STATIC_DRAW);
    const instanceLocation = gl.getAttribLocation(this.program, "a_instanceIndex");
    gl.enableVertexAttribArray(instanceLocation);
    gl.vertexAttribPointer(instanceLocation, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instanceLocation, 1);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  render(
    effects: ResolvedAmbientEffectConfig[],
    viewport: CameraViewport,
    worldWidth: number,
    worldHeight: number,
    globalTime: number,
  ): void {
    if (effects.length === 0) {
      return;
    }

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(gl.getUniformLocation(this.program, "u_texture"), 0);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_time"), globalTime);
    gl.uniform2f(gl.getUniformLocation(this.program, "u_viewportOrigin"), viewport.left, viewport.top);
    gl.uniform2f(gl.getUniformLocation(this.program, "u_viewportSize"), this.canvas.width, this.canvas.height);
    gl.uniform2f(gl.getUniformLocation(this.program, "u_worldSize"), Math.max(worldWidth, 1), Math.max(worldHeight, 1));
    gl.bindVertexArray(this.vao);

    for (const effect of effects) {
      const activeCount = Math.min(
        this.maxSupportedInstances,
        Math.max(0, Math.round(effect.count * effect.intensity)),
      );

      if (!effect.enabled || activeCount === 0 || effect.alpha <= 0) {
        continue;
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, effect.spriteSheetTexture);
      gl.uniform2f(gl.getUniformLocation(this.program, "u_baseSpriteSize"), effect.spriteWidth, effect.spriteHeight);
      gl.uniform4f(
        gl.getUniformLocation(this.program, "u_uvRect"),
        effect.uvBounds.minU,
        effect.uvBounds.maxU,
        effect.uvBounds.maxV,
        effect.uvBounds.minV,
      );
      gl.uniform1f(gl.getUniformLocation(this.program, "u_speed"), effect.speed);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_speedVariation"), effect.speedVariation);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_drift"), effect.drift);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_scale"), effect.scale);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_scaleVariation"), effect.scaleVariation);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_alpha"), effect.alpha);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_seed"), effect.seed);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_motionMode"), effect.motionMode === "horizontal-drift" ? 1 : 0);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_rotationEnabled"), effect.rotationEnabled ? 1 : 0);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_rotationSpeed"), effect.rotationSpeed);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, activeCount);
    }

    gl.bindVertexArray(null);
  }
}
