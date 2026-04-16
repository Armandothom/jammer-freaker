import type { DebuggerPaintOrder } from "../../ecs/debugger-orders/types/debugger.js";

export interface UvBounds {
  minU: number;
  maxU: number;
  minV: number;
  maxV: number;
}

export function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  label: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error(`Unable to create shader for ${label}.`);
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const infoLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed for ${label}: ${infoLog ?? "unknown error"}`);
  }

  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  label: string,
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource, `${label} vertex shader`);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource, `${label} fragment shader`);
  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error(`Unable to create shader program for ${label}.`);
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const infoLog = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed for ${label}: ${infoLog ?? "unknown error"}`);
  }

  return program;
}

export function toClipSpace(
  px: number,
  py: number,
  zLevel: number,
  canvas: HTMLCanvasElement,
): [number, number, number] {
  const clipX = (px / canvas.width) * 2 - 1;
  const clipY = 1 - (py / canvas.height) * 2;
  const clipZ = 1.0 - (zLevel / 1000) * 2.0;
  return [clipX, clipY, clipZ];
}

export function extractUvBounds(uvCoordinates: number[]): UvBounds {
  let minU = Number.POSITIVE_INFINITY;
  let maxU = Number.NEGATIVE_INFINITY;
  let minV = Number.POSITIVE_INFINITY;
  let maxV = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < uvCoordinates.length; index += 2) {
    const u = uvCoordinates[index];
    const v = uvCoordinates[index + 1];
    minU = Math.min(minU, u);
    maxU = Math.max(maxU, u);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  }

  return { minU, maxU, minV, maxV };
}

export function parseColorToRgba(color: string): [number, number, number, number] {
  let sanitizedColor = color.replace("#", "");

  if (sanitizedColor.length === 3 || sanitizedColor.length === 4) {
    sanitizedColor = sanitizedColor
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (sanitizedColor.length !== 6 && sanitizedColor.length !== 8) {
    throw new Error(`Unsupported color format: ${color}`);
  }

  const normalizedColor = sanitizedColor.length === 6
    ? `${sanitizedColor}FF`
    : sanitizedColor;

  const red = parseInt(normalizedColor.slice(0, 2), 16) / 255;
  const green = parseInt(normalizedColor.slice(2, 4), 16) / 255;
  const blue = parseInt(normalizedColor.slice(4, 6), 16) / 255;
  const alpha = parseInt(normalizedColor.slice(6, 8), 16) / 255;

  return [red, green, blue, alpha];
}

export function buildDebugVertices(
  draw: DebuggerPaintOrder,
  canvas: HTMLCanvasElement,
): number[] {
  if (draw.type === "fill") {
    const width = draw.width ?? 4;
    const height = draw.height ?? 4;
    const x1 = draw.x;
    const y1 = draw.y;
    const x2 = draw.x + width;
    const y2 = draw.y + height;

    const [cx1, cy1, cz1] = toClipSpace(x1, y1, 0, canvas);
    const [cx2, cy2, cz2] = toClipSpace(x2, y1, 0, canvas);
    const [cx3, cy3, cz3] = toClipSpace(x1, y2, 0, canvas);
    const [cx4, cy4, cz4] = toClipSpace(x2, y2, 0, canvas);

    return [
      cx1, cy1, cz1,
      cx3, cy3, cz3,
      cx2, cy2, cz2,

      cx2, cy2, cz2,
      cx3, cy3, cz3,
      cx4, cy4, cz4,
    ];
  }

  const vertices: number[] = [];
  const radius = draw.width / 2;
  const segments = 16;

  for (let segmentIndex = 0; segmentIndex < segments; segmentIndex += 1) {
    const currentAngle = (segmentIndex / segments) * Math.PI * 2;
    const nextAngle = ((segmentIndex + 1) / segments) * Math.PI * 2;
    const x1 = draw.centroidX + Math.cos(currentAngle) * radius;
    const y1 = draw.centroidY + Math.sin(currentAngle) * radius;
    const x2 = draw.centroidX + Math.cos(nextAngle) * radius;
    const y2 = draw.centroidY + Math.sin(nextAngle) * radius;

    const [cx1, cy1, cz1] = toClipSpace(x1, y1, 0, canvas);
    const [cx2, cy2, cz2] = toClipSpace(x2, y2, 0, canvas);
    const [cx3, cy3, cz3] = toClipSpace(draw.centroidX, draw.centroidY, 0, canvas);

    vertices.push(
      cx1, cy1, cz1,
      cx2, cy2, cz2,
      cx3, cy3, cz3,
    );
  }

  return vertices;
}
