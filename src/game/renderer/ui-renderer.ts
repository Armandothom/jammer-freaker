import type { RenderObject } from "./types/render-objects.js";
import { createProgram } from "./renderer-shared.js";
import { SpriteBatchRenderer } from "./sprite-batch-renderer.js";

export class UIRenderer {
  private readonly program: WebGLProgram;
  private readonly spriteBatchRenderer: SpriteBatchRenderer;
  private readonly maxDepthLevel = 1000;

  constructor(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
  ) {
    const vertexShaderSource = `
      attribute vec3 a_position;
      attribute vec2 a_uv;
      attribute vec2 a_local_uv;
      attribute float a_alpha;
      varying vec2 v_uv;
      varying vec2 v_local_uv;
      varying float v_alpha;

      void main() {
        gl_Position = vec4(a_position, 1.0);
        v_uv = a_uv;
        v_local_uv = a_local_uv;
        v_alpha = a_alpha;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_uv;
      varying vec2 v_local_uv;
      varying float v_alpha;
      uniform sampler2D u_texture;
      uniform bool debug_mode;

      void main() {
        float border = 0.02;
        bool isBorder = v_local_uv.x < border ||
          v_local_uv.y < border ||
          v_local_uv.x > (1.0 - border) ||
          v_local_uv.y > (1.0 - border);

        if (isBorder && debug_mode) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, v_alpha);
          return;
        }

        vec4 texColor = texture2D(u_texture, v_uv);
        float alpha = texColor.a * v_alpha;
        if (alpha <= 0.0) {
          discard;
        }

        gl_FragColor = vec4(texColor.rgb, alpha);
      }
    `;

    this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource, "UIRenderShader");
    this.spriteBatchRenderer = new SpriteBatchRenderer(gl, canvas, this.program);
  }

  render(renderObjects: RenderObject[], debugBorderSprites: boolean): void {
    if (renderObjects.length === 0) {
      return;
    }

    const zLevels = [...new Set(renderObjects.map((renderObject) => renderObject.zLevel))]
      .sort((left, right) => left - right);

    for (const zLevel of zLevels) {
      const renderBatch = renderObjects.filter((renderObject) => renderObject.zLevel === zLevel);
      this.spriteBatchRenderer.draw(renderBatch, {
        debugBorderSprites,
        depthTestEnabled: false,
        depthWriteEnabled: false,
        overrideZLevel: this.maxDepthLevel,
      });
    }
  }
}
