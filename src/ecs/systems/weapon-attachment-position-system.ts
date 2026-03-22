import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { DisableAttachmentComponent } from "../components/disable-attachment.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { DebuggerPainter } from "../debugger/painter.debugger.js";
import { ISystem } from "./system.interface.js";

export class WeaponSpriteAttachmenPositiontSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private zLayerComponentStore: ComponentStore<ZLayerComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private aimShootingComponentStore: ComponentStore<AimShootingComponent>,
        private disableAttachmentComponentStore: ComponentStore<DisableAttachmentComponent>,
        private spriteManager: SpriteManager
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
            const isAimingUp = sin < 0.45 ? true : false;
            const attachedWeaponOffsetX = attachedWeapon.offsetXAim;
            const attachedWeaponOffsetY = attachedWeapon.offsetYAim;
            attachedWeaponPosition.x = parentEntityPosition.x + attachedWeaponOffsetX * parentEntitySprite.width / 32;
            attachedWeaponPosition.y = parentEntityPosition.y + attachedWeaponOffsetY * parentEntitySprite.height / 32;
            attachedWeapon.barrelX = attachedWeaponPosition.x + (weaponSprite.width * (cos));
            attachedWeapon.barrelY = attachedWeaponPosition.y + (weaponSprite.width * (sin));
            if (weaponSprite.spriteName === SpriteName.SHIELD) {
                this.zLayerComponentStore.add(attachedEntityId, new ZLayerComponent(4));
            } else {
                this.zLayerComponentStore.add(attachedEntityId, new ZLayerComponent(isAimingUp ? 2 : 4));
            }
        }
    }

}