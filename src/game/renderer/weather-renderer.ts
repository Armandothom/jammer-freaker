import type { CameraViewport } from "../world/types/camera-viewport.js";
import type { RainConfig } from "../weather/weather-types.js";
import { createProgram } from "./renderer-shared.js";

export class WeatherRenderer {
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly quadBuffer: WebGLBuffer;
  private readonly instanceBuffer: WebGLBuffer;
  private readonly maxSupportedDrops = 512;

  constructor(
    private gl: WebGL2RenderingContext,
    private canvas: HTMLCanvasElement,
  ) {
    const vertexShaderSource = `
      attribute vec2 a_localPosition;
      attribute float a_instanceIndex;

      uniform float u_time;
      uniform vec2 u_viewportOrigin;
      uniform vec2 u_viewportSize;
      uniform vec2 u_worldSize;
      uniform float u_speed;
      uniform float u_angle;
      uniform float u_opacity;
      uniform float u_dropLength;
      uniform float u_dropWidth;
      uniform float u_variation;
      uniform float u_seed;
      uniform float u_splashDuration;
      uniform float u_splashOpacity;
      uniform float u_minRingRadiusX;
      uniform float u_maxRingRadiusX;
      uniform float u_minRingRadiusY;
      uniform float u_maxRingRadiusY;
      uniform vec4 u_dropColor;
      uniform vec4 u_splashColor;
      uniform float u_viewportCoverageScale;

      varying vec2 v_localPixel;
      varying vec2 v_direction;
      varying float v_flightMask;
      varying float v_ringProgress;
      varying float v_dropLength;
      varying float v_dropWidth;
      varying float v_dropOpacity;
      varying float v_splashOpacity;
      varying float v_minRingRadiusX;
      varying float v_maxRingRadiusX;
      varying float v_minRingRadiusY;
      varying float v_maxRingRadiusY;
      varying vec4 v_dropColor;
      varying vec4 v_splashColor;

      float hash11(float p) {
        return fract(sin(p * 91.3458 + 15.713) * 47453.5453);
      }

      vec2 repeatWorldPositionNearViewport(vec2 basePosition, vec2 repeatSpan, vec2 viewportCenter) {
        return basePosition + (floor(((viewportCenter - basePosition) / repeatSpan) + 0.5) * repeatSpan);
      }

      void main() {
        float instanceSeedA = hash11(a_instanceIndex + (u_seed * 13.0));
        float instanceSeedB = hash11(a_instanceIndex + (u_seed * 29.0) + 4.17);
        float instanceSeedC = hash11(a_instanceIndex + (u_seed * 47.0) + 8.91);
        float instanceSeedD = hash11(a_instanceIndex + (u_seed * 61.0) + 13.37);
        float instanceSeedE = hash11(a_instanceIndex + (u_seed * 79.0) + 19.91);

        vec2 direction = normalize(vec2(sin(u_angle), cos(u_angle)));
        float speedScale = mix(1.0 - (u_variation * 0.35), 1.0 + (u_variation * 0.55), instanceSeedA);
        float speed = max(30.0, u_speed * speedScale);
        float dropLength = u_dropLength * mix(0.82, 1.24, instanceSeedB);
        float dropWidth = max(0.7, u_dropWidth * mix(0.85, 1.25, instanceSeedC));
        float dropOpacity = u_opacity * mix(0.8, 1.1, instanceSeedD);
        float splashOpacity = u_splashOpacity * mix(0.85, 1.12, instanceSeedA);

        float fallHeightMin = max(dropLength * 10.0, u_viewportSize.y * 0.30);
        float fallHeightMax = max(fallHeightMin + (dropLength * 10.0), u_viewportSize.y * (0.85 + (u_variation * 0.30)));
        float fallHeight = mix(fallHeightMin, fallHeightMax, instanceSeedA);
        float flightDistance = fallHeight / max(direction.y, 0.2);
        float splashDistance = max(speed * u_splashDuration, 1.0);
        float cycleDistance = flightDistance + splashDistance;
        float cycleOffset = instanceSeedB * cycleDistance;
        float phaseDistance = mod(cycleOffset + (u_time * speed), cycleDistance);
        float flightMask = 1.0 - step(flightDistance, phaseDistance);
        float splashMask = 1.0 - flightMask;
        float ringProgress = clamp((phaseDistance - flightDistance) / splashDistance, 0.0, 1.0);

        float coverageScale = max(1.0, u_viewportCoverageScale);
        vec2 coveragePadding = (u_viewportSize * (coverageScale - 1.0)) * 0.5;
        float driftToImpactX = abs(direction.x) * flightDistance;
        float impactMarginX = max(u_maxRingRadiusX + 8.0, driftToImpactX * 0.15);
        float impactMarginY = u_maxRingRadiusY + 8.0;
        vec2 impactRepeatSpan = vec2(
          u_viewportSize.x + ((impactMarginX + coveragePadding.x) * 2.0),
          u_viewportSize.y + ((impactMarginY + coveragePadding.y) * 2.0)
        );
        vec2 impactBasePosition = vec2(
          instanceSeedC * impactRepeatSpan.x,
          instanceSeedE * impactRepeatSpan.y
        );
        vec2 viewportCenter = u_viewportOrigin + (u_viewportSize * 0.5);
        vec2 impactPosition = repeatWorldPositionNearViewport(
          impactBasePosition,
          impactRepeatSpan,
          viewportCenter
        );
        vec2 startPosition = impactPosition - (direction * flightDistance);
        vec2 flightPosition = startPosition + (direction * phaseDistance);

        vec2 anchorWorld = mix(flightPosition, impactPosition, splashMask);
        vec2 anchorScreen = anchorWorld - u_viewportOrigin;

        float halfExtentX = max((dropLength * 0.55) + 6.0, u_maxRingRadiusX + 6.0);
        float halfExtentY = max((dropLength * 0.55) + 6.0, u_maxRingRadiusY + 6.0);
        vec2 localPixel = a_localPosition * vec2(halfExtentX, halfExtentY);
        vec2 screenVertex = anchorScreen + localPixel;

        gl_Position = vec4(
          (screenVertex.x / u_viewportSize.x) * 2.0 - 1.0,
          1.0 - (screenVertex.y / u_viewportSize.y) * 2.0,
          0.0,
          1.0
        );

        v_localPixel = localPixel;
        v_direction = direction;
        v_flightMask = flightMask;
        v_ringProgress = ringProgress;
        v_dropLength = dropLength;
        v_dropWidth = dropWidth;
        v_dropOpacity = dropOpacity;
        v_splashOpacity = splashOpacity;
        v_minRingRadiusX = u_minRingRadiusX * mix(0.9, 1.18, instanceSeedD);
        v_maxRingRadiusX = u_maxRingRadiusX * mix(0.92, 1.16, instanceSeedB);
        v_minRingRadiusY = u_minRingRadiusY * mix(0.9, 1.12, instanceSeedA);
        v_maxRingRadiusY = u_maxRingRadiusY * mix(0.92, 1.14, instanceSeedC);
        float colorShift = mix(0.92, 1.08, instanceSeedD);
        v_dropColor = vec4(u_dropColor.rgb * colorShift, u_dropColor.a);
        v_splashColor = vec4(u_splashColor.rgb * colorShift, u_splashColor.a);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;

      varying vec2 v_localPixel;
      varying vec2 v_direction;
      varying float v_flightMask;
      varying float v_ringProgress;
      varying float v_dropLength;
      varying float v_dropWidth;
      varying float v_dropOpacity;
      varying float v_splashOpacity;
      varying float v_minRingRadiusX;
      varying float v_maxRingRadiusX;
      varying float v_minRingRadiusY;
      varying float v_maxRingRadiusY;
      varying vec4 v_dropColor;
      varying vec4 v_splashColor;

      void main() {
        vec2 tangent = normalize(v_direction);
        vec2 normal = vec2(tangent.y, -tangent.x);
        vec2 rainSpace = vec2(
          dot(v_localPixel, normal),
          dot(v_localPixel, tangent)
        );

        float lineMaskX = 1.0 - smoothstep(v_dropWidth * 0.42, v_dropWidth * 0.5 + 0.9, abs(rainSpace.x));
        float lineMaskY = 1.0 - smoothstep(v_dropLength * 0.44, v_dropLength * 0.52 + 1.5, abs(rainSpace.y));
        float lineMask = lineMaskX * lineMaskY * v_flightMask;

        float radiusX = mix(v_minRingRadiusX, v_maxRingRadiusX, v_ringProgress);
        float radiusY = mix(v_minRingRadiusY, v_maxRingRadiusY, v_ringProgress);
        vec2 ellipse = vec2(
          v_localPixel.x / max(radiusX, 0.001),
          v_localPixel.y / max(radiusY, 0.001)
        );
        float ellipseDistance = abs(length(ellipse) - 1.0);
        float ringThickness = mix(0.28, 0.12, v_ringProgress);
        float ringMask = 1.0 - smoothstep(ringThickness, ringThickness + 0.18, ellipseDistance);
        float dropAlpha = lineMask * v_dropOpacity * v_dropColor.a;
        float ringAlpha = (1.0 - v_flightMask) * (1.0 - v_ringProgress) * v_splashOpacity * v_splashColor.a * ringMask;

        float alpha = min(dropAlpha + ringAlpha, 1.0);
        if (alpha <= 0.001) {
          discard;
        }

        vec3 rainColor = ((v_dropColor.rgb * dropAlpha) + (v_splashColor.rgb * ringAlpha)) / max(alpha, 0.0001);
        gl_FragColor = vec4(rainColor, alpha);
      }
    `;

    this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource, "WeatherShader");

    const vao = gl.createVertexArray();
    const quadBuffer = gl.createBuffer();
    const instanceBuffer = gl.createBuffer();

    if (!vao || !quadBuffer || !instanceBuffer) {
      throw new Error("Unable to allocate weather renderer buffers.");
    }

    this.vao = vao;
    this.quadBuffer = quadBuffer;
    this.instanceBuffer = instanceBuffer;

    const quadVertices = new Float32Array([
      -1, -1,
      -1, 1,
      1, -1,
      1, 1,
      1, -1,
      -1, 1,
    ]);
    const instanceIndices = new Float32Array(this.maxSupportedDrops);
    for (let index = 0; index < instanceIndices.length; index += 1) {
      instanceIndices[index] = index;
    }

    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
    const localPositionLocation = gl.getAttribLocation(this.program, "a_localPosition");
    gl.enableVertexAttribArray(localPositionLocation);
    gl.vertexAttribPointer(localPositionLocation, 2, gl.FLOAT, false, 0, 0);

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
    config: RainConfig,
    viewport: CameraViewport,
    worldWidth: number,
    worldHeight: number,
    globalTime: number,
  ): void {
    const activeDropCount = Math.min(
      this.maxSupportedDrops,
      Math.max(0, Math.round(config.maxDrops * config.intensity)),
    );

    if (!config.enabled || activeDropCount === 0 || config.opacity <= 0) {
      return;
    }

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniform1f(gl.getUniformLocation(this.program, "u_time"), globalTime);
    gl.uniform2f(gl.getUniformLocation(this.program, "u_viewportOrigin"), viewport.left, viewport.top);
    gl.uniform2f(gl.getUniformLocation(this.program, "u_viewportSize"), this.canvas.width, this.canvas.height);
    gl.uniform2f(gl.getUniformLocation(this.program, "u_worldSize"), Math.max(worldWidth, 1), Math.max(worldHeight, 1));
    gl.uniform1f(gl.getUniformLocation(this.program, "u_speed"), config.speed);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_angle"), config.angle);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_opacity"), config.opacity);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_dropLength"), config.dropLength);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_dropWidth"), config.dropWidth);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_variation"), config.variation);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_seed"), config.seed);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_splashDuration"), config.splashDuration);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_splashOpacity"), config.splashOpacity);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_minRingRadiusX"), config.minRingRadiusX);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_maxRingRadiusX"), config.maxRingRadiusX);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_minRingRadiusY"), config.minRingRadiusY);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_maxRingRadiusY"), config.maxRingRadiusY);
    gl.uniform4f(
      gl.getUniformLocation(this.program, "u_dropColor"),
      config.dropColor.r,
      config.dropColor.g,
      config.dropColor.b,
      config.dropColor.a,
    );
    gl.uniform4f(
      gl.getUniformLocation(this.program, "u_splashColor"),
      config.splashColor.r,
      config.splashColor.g,
      config.splashColor.b,
      config.splashColor.a,
    );
    gl.uniform1f(
      gl.getUniformLocation(this.program, "u_viewportCoverageScale"),
      config.viewportCoverageScale,
    );

    gl.bindVertexArray(this.vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, activeDropCount);
    gl.bindVertexArray(null);
  }
}
