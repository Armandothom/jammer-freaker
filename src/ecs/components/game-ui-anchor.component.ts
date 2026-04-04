import { UIAnchor } from "./types/ui-anchor.js";

export class GameUIAnchorComponent {
    constructor(
        public anchor: UIAnchor,
        public offsetX: number,
        public offsetY: number,
    ) { }
}
