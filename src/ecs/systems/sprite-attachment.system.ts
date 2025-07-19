import { PositionComponent } from "../components/position.component.js";
import { SpriteAttachmentComponent } from "../components/sprite-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class SpriteAttachmentSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteAttachmentComponentStore: ComponentStore<SpriteAttachmentComponent>,
    ) { }

    update(deltaTime: number): void {
        const attachedEntityIds = this.spriteAttachmentComponentStore.getAllEntities();
        for (const attachedEntityId of attachedEntityIds) {
            const attachedEntityAttachment = this.spriteAttachmentComponentStore.get(attachedEntityId);
            const attachedEntityPosition = this.positionComponentStore.get(attachedEntityId);
            const parentEntityPosition = this.positionComponentStore.get(attachedEntityAttachment.parentEntityId);
            attachedEntityPosition.x = parentEntityPosition.x + attachedEntityAttachment.offsetX;
            attachedEntityPosition.y = parentEntityPosition.y + attachedEntityAttachment.offsetY;
        }
    }

}