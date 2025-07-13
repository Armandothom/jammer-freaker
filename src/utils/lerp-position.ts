import { Position } from "./types/position.js";

export function lerpPosition(a: Position, b: Position, t: number): Position {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function detectByRadius(a: Position, b: Position, radius: number): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  console.log("distance", distance)
  return distance <= radius;
}


