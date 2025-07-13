import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { CoreManager } from "../core/core-manager.js";

export class AnimationComponent {
  public startAnimationTime : number;
  public animationName : AnimationName;
  constructor(animationName : AnimationName) {
    this.startAnimationTime = CoreManager.timeGlobalSinceStart;
    this.animationName = animationName;
  }
}