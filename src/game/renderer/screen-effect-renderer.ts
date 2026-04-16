import type { ScreenEffectTint } from "../weather/weather-types.js";
import { createProgram } from "./renderer-shared.js";

export class ScreenEffectRenderer {
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly buffer: WebGLBuffer;

  constructor(
    private gl: WebGL2RenderingContext,
    private canvas: HTMLCanvasElement,
  ) {
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_uv = a_position * 0.5 + 0.5;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;

      uniform vec4 u_tint;

      void main() {
        gl_FragColor = u_tint;
      }
    `;

    this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource, "ScreenEffectShader");

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();

    if (!vao || !buffer) {
      throw new Error("Unable to allocate screen effect renderer buffers.");
    }

    this.vao = vao;
    this.buffer = buffer;

    const vertices = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  render(tint: ScreenEffectTint): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform4f(gl.getUniformLocation(this.program, "u_tint"), tint.r, tint.g, tint.b, tint.a);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }
}
