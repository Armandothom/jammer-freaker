import { UIAnchor } from "./types/ui-anchor.js";

export class UIAnchorComponent {
    constructor(
        public anchor: UIAnchor,
        public offsetX: number,
        public offsetY: number,
    ) { }
}
