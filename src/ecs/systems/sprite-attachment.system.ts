import { PositionComponent } from "../components/position.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class SpriteAttachmentSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
    ) { }

    update(deltaTime: number): void {
        const attachedEntityIds = this.weaponSpriteAttachmentComponentStore.getAllEntities();
        for (const attachedEntityId of attachedEntityIds) {
            const attachedEntityAttachment = this.weaponSpriteAttachmentComponentStore.get(attachedEntityId);
            const attachedEntityPosition = this.positionComponentStore.get(attachedEntityId);
            const parentEntityPosition = this.positionComponentStore.get(attachedEntityAttachment.parentEntityId);
            attachedEntityPosition.x = parentEntityPosition.x + attachedEntityAttachment.offsetX;
            attachedEntityPosition.y = parentEntityPosition.y + attachedEntityAttachment.offsetY;
        }
    }

}