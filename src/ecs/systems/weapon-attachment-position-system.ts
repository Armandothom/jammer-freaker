import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
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
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private aimShootingComponentStore: ComponentStore<AimShootingComponent>,
    ) { }

    update(deltaTime: number): void {
        const attachedEntityIds = this.weaponSpriteAttachmentComponentStore.getAllEntities();
        for (const attachedEntityId of attachedEntityIds) {
            const sprite = this.spriteComponentStore.get(attachedEntityId);
            const attachedWeapon = this.weaponSpriteAttachmentComponentStore.get(attachedEntityId);
            const attachedWeaponPosition = this.positionComponentStore.get(attachedEntityId);
            const parentEntityPosition = this.positionComponentStore.get(attachedWeapon.parentEntityId);
            const aimShooting = this.aimShootingComponentStore.get(attachedEntityId);
            const isAimingLeft = Math.cos(aimShooting.aimAngle) < 0 ? true : false;
            const radiusWeapon = Math.sqrt((sprite.height * sprite.height) + (sprite.width * sprite.width)) / 2;
            const offsetX = isAimingLeft ? attachedWeapon.offsetXAimLeft : attachedWeapon.offsetXAimRight;
            const offsetY = isAimingLeft ? attachedWeapon.offsetYAimLeft : attachedWeapon.offsetYAimRight;
            attachedWeaponPosition.x = parentEntityPosition.x + offsetX;
            attachedWeaponPosition.y = parentEntityPosition.y + offsetY;
            attachedWeapon.barrelX = attachedWeaponPosition.x + (radiusWeapon * Math.cos(aimShooting.aimAngle));
            attachedWeapon.barrelY = attachedWeaponPosition.y + (radiusWeapon * Math.sin(aimShooting.aimAngle));
        }
    }

}