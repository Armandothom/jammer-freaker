import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class WeaponSpriteAttachmenPositiontSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private animDirectionComponentStore: ComponentStore<DirectionAnimComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>
    ) { }

    update(deltaTime: number): void {
        const attachedEntityIds = this.weaponSpriteAttachmentComponentStore.getAllEntities();
        for (const attachedEntityId of attachedEntityIds) {
            const sprite = this.spriteComponentStore.get(attachedEntityId);
            const attachedWeapon = this.weaponSpriteAttachmentComponentStore.get(attachedEntityId);
            const attachedWeaponPosition = this.positionComponentStore.get(attachedEntityId);
            const parentEntityPosition = this.positionComponentStore.get(attachedWeapon.parentEntityId);
            const isMirrored = this.animDirectionComponentStore.get(attachedEntityId).direction == AnimDirection.LEFT;
            const mirroredVariable = isMirrored ? -1 : 1; 
            const offsetX = attachedWeapon.offsetX * mirroredVariable;
            const offsetY = attachedWeapon.offsetY;
            attachedWeaponPosition.x = parentEntityPosition.x + offsetX;
            attachedWeaponPosition.y = parentEntityPosition.y + offsetY;
            attachedWeapon.barrelX = attachedWeaponPosition.x + (isMirrored ? 0 : sprite.width) + (mirroredVariable * 3);
            console.log(`attachedWeapon.barrelX`, attachedWeapon.barrelX)
            console.log(`sprite.width`, sprite.width)
            attachedWeapon.barrelY = attachedWeaponPosition.y;
        }
    }

}