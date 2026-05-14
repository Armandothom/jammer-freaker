import { MathUtils } from "../../utils/shared/math-utils.js";
import { AngleFovRange } from "./types/player-fov.type.js";

export class PlayerFovComponent {
  private readonly fovOffset = Math.PI * 0.5;
  public angle: number;
  public readonly angleRad : number;
  public readonly angleRange : AngleFovRange;
  constructor(angleRad : number) {
    const plusOffset = MathUtils.radToDegreeNormalized(angleRad + this.fovOffset);
    const minusOffset = MathUtils.radToDegreeNormalized(angleRad - this.fovOffset);
    this.angleRad = angleRad;
    this.angle = MathUtils.radToDegreeNormalized(angleRad);
    this.angleRange = {
      start : minusOffset,
      end : plusOffset
    }
  }
}
