export class SceneRenderTarget {
  private framebuffer!: WebGLFramebuffer;
  private colorTexture!: WebGLTexture;
  private depthRenderbuffer!: WebGLRenderbuffer;
  private width = 0;
  private height = 0;

  constructor(private gl: WebGL2RenderingContext) {
    this.framebuffer = this.requireFramebuffer(gl.createFramebuffer());
    this.colorTexture = this.requireTexture(gl.createTexture());
    this.depthRenderbuffer = this.requireRenderbuffer(gl.createRenderbuffer());
  }

  resize(width: number, height: number): void {
    const nextWidth = Math.max(1, Math.floor(width));
    const nextHeight = Math.max(1, Math.floor(height));

    if (this.width === nextWidth && this.height === nextHeight) {
      return;
    }

    this.width = nextWidth;
    this.height = nextHeight;

    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, nextWidth, nextHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, nextWidth, nextHeight);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthRenderbuffer);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Scene framebuffer incomplete: 0x${status.toString(16)}`);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  bind(): void {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.viewport(0, 0, this.width, this.height);
  }

  get texture(): WebGLTexture {
    return this.colorTexture;
  }

  private requireFramebuffer(framebuffer: WebGLFramebuffer | null): WebGLFramebuffer {
    if (!framebuffer) {
      throw new Error("Unable to allocate scene framebuffer.");
    }
    return framebuffer;
  }

  private requireTexture(texture: WebGLTexture | null): WebGLTexture {
    if (!texture) {
      throw new Error("Unable to allocate scene color texture.");
    }
    return texture;
  }

  private requireRenderbuffer(renderbuffer: WebGLRenderbuffer | null): WebGLRenderbuffer {
    if (!renderbuffer) {
      throw new Error("Unable to allocate scene depth renderbuffer.");
    }
    return renderbuffer;
  }
}
