import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { DisableAttachmentComponent } from "../components/disable-attachment.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { resolveWeaponAttachmentBaseAnchor, resolveWeaponAttachmentPose } from "../core/weapon-attachment-pose-resolver.js";
import { ISystem } from "./system.interface.js";

export class WeaponSpriteAttachmenPositiontSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private zLayerComponentStore: ComponentStore<ZLayerComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
        private disableAttachmentComponentStore: ComponentStore<DisableAttachmentComponent>
    ) {
    }

    update(deltaTime: number): void {
        const attachedEntityIds = this.weaponSpriteAttachmentComponentStore.getAllEntities();
        for (const attachedEntityId of attachedEntityIds) {
            if (this.disableAttachmentComponentStore.has(attachedEntityId)) continue;
            const weaponSprite = this.spriteComponentStore.get(attachedEntityId);
            const attachedWeapon = this.weaponSpriteAttachmentComponentStore.get(attachedEntityId);
            const attachedWeaponPosition = this.positionComponentStore.get(attachedEntityId);
            const parentEntityPosition = this.positionComponentStore.get(attachedWeapon.parentEntityId);
            const parentEntitySprite = this.spriteComponentStore.get(attachedWeapon.parentEntityId);
            const aimShooting = this.aimShootingComponentStore.get(attachedEntityId);
            const aimAngle = aimShooting.aimAngle;
            const cos = Math.cos(aimAngle);
            const sin = Math.sin(aimAngle);
            const isAimingUp = sin < -0.2 ? true : false;
            const baseAnchor = resolveWeaponAttachmentBaseAnchor(
                parentEntityPosition,
                parentEntitySprite,
                attachedWeapon,
            );
            const attachmentPose = resolveWeaponAttachmentPose(baseAnchor, weaponSprite, aimAngle);
            attachedWeaponPosition.x = attachmentPose.x;
            attachedWeaponPosition.y = attachmentPose.y;
            attachedWeapon.barrelX = attachmentPose.barrelX;
            attachedWeapon.barrelY = attachmentPose.barrelY;
            if (weaponSprite.spriteName === SpriteName.SHIELD) {
                this.zLayerComponentStore.add(attachedEntityId, new ZLayerComponent(4));
            } else {
                this.zLayerComponentStore.add(attachedEntityId, new ZLayerComponent(isAimingUp ? 2 : 4));
            }
        }
    }

}
