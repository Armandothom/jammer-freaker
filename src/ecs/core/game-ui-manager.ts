
import { CameraManager } from "../../game/world/camera-manager.js";
import { UIAnchor } from "../components/types/ui-anchor.js";


export class GameUIManager {
    constructor(
        private cameraManager: CameraManager,
    ) {
    }

    public resolveScreenPosition(
        anchor: UIAnchor,
        offsetX: number,
        offsetY: number,
    ): { x: number; y: number } {
        const { width, height } = this.cameraManager.getViewportSize();

        let x = 0;
        let y = 0;

        switch (anchor) {
            case UIAnchor.TOP_LEFT:
                x = offsetX;
                y = offsetY;
                break;

            case UIAnchor.TOP_RIGHT:
                x = width - offsetX;
                y = offsetY;
                break;

            case UIAnchor.BOTTOM_LEFT:
                x = offsetX;
                y = height - offsetY;
                break;

            case UIAnchor.BOTTOM_RIGHT:
                x = width - offsetX;
                y = height - offsetY;
                break;

            case UIAnchor.CENTER:
                x = width / 2 + offsetX;
                y = height / 2 + offsetY;
                break;
        }

        return { x, y };
    }
}
