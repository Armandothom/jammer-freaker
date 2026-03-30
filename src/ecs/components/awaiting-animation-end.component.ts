import { AnimationName } from "../../game/asset-manager/types/animation-map.js";

export class AwaitingAnimationEndComponent {
    constructor(
        public readonly animationName: AnimationName,
        public resolved: boolean = false,
    ) { }
}