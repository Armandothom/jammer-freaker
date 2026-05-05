import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { DisableAttachmentComponent } from "../components/disable-attachment.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { TransformComponent } from "../components/transform-component.js";
import { WeaponType } from "../components/types/weapon-config.js";
import { VisualRecoilComponent } from "../components/visual-recoil.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { resolveWeaponAttachmentBaseAnchor, resolveWeaponAttachmentPose } from "../core/weapon-attachment-pose-resolver.js";
import { VISUAL_RECOIL_TIMELINES, VisualRecoilTimeline } from "./configs/visual-recoil-timeline.js";
import { ISystem } from "./system.interface.js";

export class CoreographerSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private visualRecoilComponentStore: ComponentStore<VisualRecoilComponent>,
        private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
        private disableAttachmentComponentStore: ComponentStore<DisableAttachmentComponent>,
        private transformComponentStore: ComponentStore<TransformComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.processVisualWeaponRecoil(deltaTime);
    }

    private processVisualWeaponRecoil(deltaTime: number) {
        const weaponEntities = this.visualRecoilComponentStore.getAllEntities();
        if (weaponEntities.length === 0) {
            return;
        }

        for (const weaponEntity of weaponEntities) {
            this.processWeaponVisualRecoil(weaponEntity, deltaTime);
        }
    }

    private processWeaponVisualRecoil(weaponEntity: number, deltaTime: number) {
        const visualRecoilComponent = this.visualRecoilComponentStore.getOrNull(weaponEntity);
        const attachedWeapon = this.weaponSpriteAttachmentComponentStore.getOrNull(weaponEntity);
        const aimComponent = this.aimShootingComponentStore.getOrNull(weaponEntity);
        const weaponPosition = this.positionComponentStore.getOrNull(weaponEntity);
        const weaponSprite = this.spriteComponentStore.getOrNull(weaponEntity);

        if (!visualRecoilComponent || !attachedWeapon || !aimComponent || !weaponPosition || !weaponSprite) {
            this.clearVisualOverride(weaponEntity);
            return;
        }

        const parentEntityPosition = this.positionComponentStore.getOrNull(attachedWeapon.parentEntityId);
        const parentEntitySprite = this.spriteComponentStore.getOrNull(attachedWeapon.parentEntityId);
        if (!parentEntityPosition || !parentEntitySprite || visualRecoilComponent.weaponType === null) {
            this.restoreBaseAttachmentPose(
                weaponEntity,
                attachedWeapon,
                aimComponent.aimAngle,
                weaponSprite,
                parentEntityPosition,
                parentEntitySprite,
            );
            this.clearVisualOverride(weaponEntity);
            return;
        }

        const weaponVisualRecoilTimeline = this.weaponVisualRecoilResolver(visualRecoilComponent.weaponType);
        this.updateVisualRecoil(visualRecoilComponent, weaponVisualRecoilTimeline, deltaTime);

        if (!visualRecoilComponent.isPlaying) {
            this.restoreBaseAttachmentPose(
                weaponEntity,
                attachedWeapon,
                aimComponent.aimAngle,
                weaponSprite,
                parentEntityPosition,
                parentEntitySprite,
            );
            this.clearVisualOverride(weaponEntity);
            return;
        }

        if (!this.disableAttachmentComponentStore.has(weaponEntity)) {
            this.disableAttachmentComponentStore.add(weaponEntity, new DisableAttachmentComponent());
        }

        const visualRecoilSample = this.sampleVisualRecoil(visualRecoilComponent, weaponVisualRecoilTimeline);
        const baseAnchor = resolveWeaponAttachmentBaseAnchor(
            parentEntityPosition,
            parentEntitySprite,
            attachedWeapon,
        );
        const attachmentPose = resolveWeaponAttachmentPose(baseAnchor, weaponSprite, aimComponent.aimAngle, {
            back: visualRecoilSample.back,
            lift: visualRecoilSample.lift,
            angleOffset: visualRecoilSample.angle,
        });

        weaponPosition.x = attachmentPose.x;
        weaponPosition.y = attachmentPose.y;
        attachedWeapon.barrelX = attachmentPose.barrelX;
        attachedWeapon.barrelY = attachmentPose.barrelY;
        this.transformComponentStore.add(weaponEntity, new TransformComponent(0, 0, visualRecoilSample.angle));
    }

    private weaponVisualRecoilResolver(weaponType: WeaponType) {
        switch (weaponType) {
            case (WeaponType.PISTOL):
                return VISUAL_RECOIL_TIMELINES.PISTOL;
            case (WeaponType.SMG):
                return VISUAL_RECOIL_TIMELINES.SMG;
            case (WeaponType.RIFLE):
                return VISUAL_RECOIL_TIMELINES.RIFLE;
            case (WeaponType.SHOTGUN):
                return VISUAL_RECOIL_TIMELINES.SHOTGUN;
            case (WeaponType.SNIPER):
                return VISUAL_RECOIL_TIMELINES.SNIPER;

            default: throw new Error("Weapon doesn't have a visualRecoil");
        }
    }

    private restoreBaseAttachmentPose(
        weaponEntity: number,
        attachedWeapon: WeaponSpriteAttachmentComponent,
        aimAngle: number,
        weaponSprite: SpriteComponent,
        parentEntityPosition: PositionComponent | null,
        parentEntitySprite: SpriteComponent | null,
    ) {
        if (!parentEntityPosition || !parentEntitySprite) {
            return;
        }

        const weaponPosition = this.positionComponentStore.getOrNull(weaponEntity);
        if (!weaponPosition) {
            return;
        }

        const baseAnchor = resolveWeaponAttachmentBaseAnchor(
            parentEntityPosition,
            parentEntitySprite,
            attachedWeapon,
        );
        const attachmentPose = resolveWeaponAttachmentPose(baseAnchor, weaponSprite, aimAngle);

        weaponPosition.x = attachmentPose.x;
        weaponPosition.y = attachmentPose.y;
        attachedWeapon.barrelX = attachmentPose.barrelX;
        attachedWeapon.barrelY = attachmentPose.barrelY;
    }

    private clearVisualOverride(weaponEntity: number) {
        if (this.disableAttachmentComponentStore.has(weaponEntity)) {
            this.disableAttachmentComponentStore.remove(weaponEntity);
        }

        if (this.transformComponentStore.has(weaponEntity)) {
            this.transformComponentStore.remove(weaponEntity);
        }

        if (this.visualRecoilComponentStore.has(weaponEntity)) {
            this.visualRecoilComponentStore.remove(weaponEntity);
        }
    }

    private updateVisualRecoil(
        visualRecoilComponent: VisualRecoilComponent,
        timeline: VisualRecoilTimeline,
        deltaTimeSeconds: number
    ) {
        if (!visualRecoilComponent.isPlaying) return;

        const deltaTimeMs = deltaTimeSeconds * 1000;
        visualRecoilComponent.elapsedMs += deltaTimeMs;

        if (visualRecoilComponent.elapsedMs >= timeline.durationMs) {
            visualRecoilComponent.elapsedMs = timeline.durationMs;
            visualRecoilComponent.isPlaying = false;
        }
    }

    private sampleVisualRecoil(
        visualRecoilComponent: VisualRecoilComponent,
        timeline: VisualRecoilTimeline
    ) {
        const progress = visualRecoilComponent.elapsedMs / timeline.durationMs;

        return {
            back: timeline.getBack(progress),
            lift: timeline.getLift(progress),
            angle: timeline.getAngle(progress),
        };
    }
}
