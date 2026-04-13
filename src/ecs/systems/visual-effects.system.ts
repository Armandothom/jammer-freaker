import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { AwaitingAnimationEndComponent } from "../components/awaiting-animation-end.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { ParentEntityComponent } from "../components/parent-entity-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { VFXType } from "../components/types/vfx-type.js";
import { WeaponType } from "../components/types/weapon-config.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";
import { VFXComponent } from "./vfx-component.js";

export class VisualEffectsSystem implements ISystem {
    constructor(
        private entityFactory: EntityFactory,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private attachedSpriteComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private parentEntityComponentStore: ComponentStore<ParentEntityComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private awaitAnimationEndComponentStore: ComponentStore<AwaitingAnimationEndComponent>,
        private vfxComponentStore: ComponentStore<VFXComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.muzzleFlashEmission();
        this.muzzleFlashUpdate();
    }

    private muzzleFlashEmission() {
        if (this.intentShotComponentStore.getAllEntities() === null) return;
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();

        for (const intent of this.intentShotComponentStore.getAllEntities()) {
            if (this.playerComponentStore.has(intent)) {
                const intentInfo = this.intentShotComponentStore.get(intent);
                const playerEntity = this.playerComponentStore.getAllEntities()[0];
                const weaponWielded = intentInfo.weaponWielded;
                const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == playerEntity);
                if (!attachedWeaponEntry) {
                    throw new Error("No weapon entry found");
                }
                const attachedWeapon = attachedWeaponEntry[1];
                const attachedWeaponEntityId = attachedWeaponEntry[0];
                const aimAngle = this.aimShootingComponentStore.get(attachedWeaponEntityId).aimAngle;

                if (weaponWielded === WeaponType.PISTOL) {
                    const spriteName = SpriteName.MUZZLE_FLASH_PISTOL;
                    const anchor = this.getMuzzleFlashAnchor(spriteName);
                    const muzzleSpawnPosition = this.buildMuzzleFlashSpawnPosition(attachedWeapon.barrelX, attachedWeapon.barrelY, aimAngle, spriteName)
                    const muzzleEntityId = this.entityFactory.createMuzzleFlash(
                        attachedWeaponEntityId,
                        spriteName,
                        SpriteSheetName.MUZZLE_FLASH,
                        AnimationName.MUZZLE_FLASH_PISTOL,
                        VFXType.MUZZLE_FLASH,
                        muzzleSpawnPosition.x,
                        muzzleSpawnPosition.y,
                        aimAngle,
                        anchor.y,
                    )
                    this.awaitAnimationEndComponentStore.add(muzzleEntityId, new AwaitingAnimationEndComponent(AnimationName.MUZZLE_FLASH_PISTOL));
                }
                if (weaponWielded === WeaponType.SHOTGUN) {
                    const spriteName = SpriteName.MUZZLE_FLASH_SHOTGUN;
                    const anchor = this.getMuzzleFlashAnchor(spriteName);
                    const muzzleSpawnPosition = this.buildMuzzleFlashSpawnPosition(attachedWeapon.barrelX, attachedWeapon.barrelY, aimAngle, spriteName)
                    const muzzleEntityId = this.entityFactory.createMuzzleFlash(
                        attachedWeaponEntityId,
                        spriteName,
                        SpriteSheetName.MUZZLE_FLASH,
                        AnimationName.MUZZLE_FLASH_SHOTGUN,
                        VFXType.MUZZLE_FLASH,
                        muzzleSpawnPosition.x,
                        muzzleSpawnPosition.y,
                        aimAngle,
                        anchor.y,
                    )
                    this.awaitAnimationEndComponentStore.add(muzzleEntityId, new AwaitingAnimationEndComponent(AnimationName.MUZZLE_FLASH_SHOTGUN));
                }
            }
        }
    }

    private buildMuzzleFlashSpawnPosition(
        barrelX: number,
        barrelY: number,
        aimAngle: number,
        spriteName: SpriteName,
    ): { x: number; y: number } {
        const flashForwardOffset = 0;
        const cos = Math.cos(aimAngle);
        const sin = Math.sin(aimAngle);

        const muzzleOriginX = barrelX + cos * flashForwardOffset;
        const muzzleOriginY = barrelY + sin * flashForwardOffset;

        const anchor = this.getMuzzleFlashAnchor(spriteName);

        return {
            x: muzzleOriginX - cos * anchor.x,
            y: muzzleOriginY - sin * anchor.x,
        };
    }

    private getMuzzleFlashAnchor(spriteName: SpriteName): { x: number; y: number } {
        switch (spriteName) {
            case SpriteName.MUZZLE_FLASH_PISTOL:
                return { x: 10, y: 8 };

            case SpriteName.MUZZLE_FLASH_SHOTGUN:
                return { x: 0, y: 10 };

            default:
                return { x: 0, y: 0 };
        }
    }

    private muzzleFlashUpdate() {
        for (const vfxEffectEntity of this.vfxComponentStore.getAllEntities()) {
            if (this.vfxComponentStore.get(vfxEffectEntity).vfxType !== VFXType.MUZZLE_FLASH) continue;
            const awaitingAnimationEnd = this.awaitAnimationEndComponentStore.getOrNull(vfxEffectEntity);
            if (awaitingAnimationEnd?.resolved === true) {
                this.entityFactory.destroyMuzzleFlash(vfxEffectEntity);
                this.awaitAnimationEndComponentStore.remove(vfxEffectEntity);
                continue;
            }

            const parentWeaponEntityId = this.parentEntityComponentStore.getOrNull(vfxEffectEntity)?.parentEntityId;
            if (parentWeaponEntityId == null || !this.attachedSpriteComponent.has(parentWeaponEntityId)) {
                this.entityFactory.destroyMuzzleFlash(vfxEffectEntity);
                this.awaitAnimationEndComponentStore.remove(vfxEffectEntity);
                continue;
            }

            if (!this.aimShootingComponentStore.has(parentWeaponEntityId) || !this.spriteComponentStore.has(vfxEffectEntity)) {
                continue;
            }

            const attachedWeapon = this.attachedSpriteComponent.get(parentWeaponEntityId);
            const aimAngle = this.aimShootingComponentStore.get(parentWeaponEntityId).aimAngle;
            const spriteName = this.spriteComponentStore.get(vfxEffectEntity).spriteName;
            const muzzleSpawnPosition = this.buildMuzzleFlashSpawnPosition(
                attachedWeapon.barrelX,
                attachedWeapon.barrelY,
                aimAngle,
                spriteName,
            );

            const muzzlePosition = this.positionComponentStore.get(vfxEffectEntity);
            muzzlePosition.x = muzzleSpawnPosition.x;
            muzzlePosition.y = muzzleSpawnPosition.y;

            const muzzleAim = this.aimShootingComponentStore.getOrNull(vfxEffectEntity);
            if (muzzleAim) {
                muzzleAim.aimAngle = aimAngle;
            }
        }
    }
}
