import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { CoreManager } from "../core/core-manager.js";

export class AnimationComponent {
  public startAnimationTime : number;
  public animationName : AnimationName;
  public loop: boolean = true;
  constructor(animationName : AnimationName, loop: boolean = true) {
    this.startAnimationTime = CoreManager.timeGlobalSinceStart;
    this.animationName = animationName;
    this.loop = loop;
  }
}