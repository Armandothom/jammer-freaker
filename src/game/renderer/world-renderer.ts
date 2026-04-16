import type { RenderObject } from "./types/render-objects.js";
import { createProgram } from "./renderer-shared.js";
import { SpriteBatchRenderer } from "./sprite-batch-renderer.js";

export class WorldRenderer {
  private readonly program: WebGLProgram;
  private readonly spriteBatchRenderer: SpriteBatchRenderer;

  constructor(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
  ) {
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

        if (isBorder && debug_mode) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          return;
        }

        vec4 texColor = texture2D(u_texture, v_uv);
        if (texColor.a == 0.0) {
          discard;
        }

        gl_FragColor = texColor;
      }
    `;

    this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource, "WorldRenderShader");
    this.spriteBatchRenderer = new SpriteBatchRenderer(gl, canvas, this.program);
  }

  render(renderObjects: RenderObject[], debugBorderSprites: boolean): void {
    this.spriteBatchRenderer.draw(renderObjects, {
      debugBorderSprites,
      depthTestEnabled: true,
      depthWriteEnabled: true,
    });
  }
}
