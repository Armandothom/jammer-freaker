import { CameraManager } from "../../game/world/camera-manager.js";
import { CameraComponent } from "../components/camera-component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class CameraFollowSystem implements ISystem {
    constructor(
        private cameraComponentStore: ComponentStore<CameraComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private cameraManager: CameraManager,
    ) { }

    update(): void {
        const cameraEntities = this.cameraComponentStore.getAllEntities();

        if (cameraEntities.length === 0) return;

        const entity = cameraEntities[0];
        const position = this.positionComponentStore.get(entity);

        this.cameraManager.follow(position.x, position.y);
    }
}