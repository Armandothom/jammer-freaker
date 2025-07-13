import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { CoreManager } from "../core/core-manager.js";

export class AnimationComponent {
  public startAnimationMs : number;
  public animationName : AnimationName;
  constructor(animationName : AnimationName) {
    this.startAnimationMs = CoreManager.timeSinceLastRender;
    this.animationName = animationName;
  }
}