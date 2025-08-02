import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { CoreManager } from "../core/core-manager.js";

export class AnimTimerComponent {
  public animationName: AnimationName;
  public animDuration: number;
  public animTime: number = 0;
  constructor(animationName: AnimationName, animDuration: number) {
    this.animDuration = animDuration;
    this.animationName = animationName;
  }
}