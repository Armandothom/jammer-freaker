import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { AwaitingAnimationEndComponent } from "../components/awaiting-animation-end.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { IntentMeleeComponent } from "../components/intent-melee.component.js";
import { MeleeIntentProcessedComponent } from "../components/melee-intent-processed.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

const MELEE_HITBOX_WIDTH = 34;
const MELEE_HITBOX_HEIGHT = 57;
const MELEE_PIVOT_POINT = Math.round(MELEE_HITBOX_HEIGHT / 2);
const MELEE_ANIMATION_DURATION_SECONDS = 1;

export class MeleeAttackSystem implements ISystem {
    constructor(
        private entityFactory: EntityFactory,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private intentMeleeComponentStore: ComponentStore<IntentMeleeComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
        private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
        private renderableComponentStore: ComponentStore<RenderableComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private zLayerComponentStore: ComponentStore<ZLayerComponent>,
        private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
        private awaitingAnimationEndComponentStore: ComponentStore<AwaitingAnimationEndComponent>,
        private meleeIntentProcessedComponentStore: ComponentStore<MeleeIntentProcessedComponent>,
    ) { }

    update(deltaTime: number): void {
        this.processMeleeIntent();
        this.updateMeleeAttack();
    }

    private processMeleeIntent() {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        if (!this.intentMeleeComponentStore.has(playerEntity)) return;
        if (this.shootingCooldownComponentStore.has(playerEntity)) return;
        if (this.hasActiveMeleeHitBox(playerEntity)) return;

        const intent = this.intentMeleeComponentStore.get(playerEntity);
        const aimAngle = this.resolveAimAngle(playerEntity, intent);
        const meleePose = this.buildMeleePose(playerEntity);
        const attachedWeaponEntity = this.getAttachedWeaponEntity(playerEntity);
        const hiddenAttachmentEntityId = this.hideAttachmentRenderable(attachedWeaponEntity);
        const meleeEntity = this.entityFactory.createMeleeHitBox(
            playerEntity,
            meleePose.x,
            meleePose.y,
            MELEE_HITBOX_WIDTH,
            MELEE_HITBOX_HEIGHT,
            aimAngle,
            meleePose.pivotPointSprite,
            hiddenAttachmentEntityId,
        );

        this.directionAnimComponentStore.add(meleeEntity, this.buildMeleeDirectionAnimation(aimAngle));
        this.awaitingAnimationEndComponentStore.add(meleeEntity, new AwaitingAnimationEndComponent(AnimationName.MELEE_ATTACK));
        this.shootingCooldownComponentStore.add(playerEntity, new ShootingCooldownComponent(MELEE_ANIMATION_DURATION_SECONDS));
    }

    private updateMeleeAttack() {
        for (const meleeAttack of this.meleeIntentProcessedComponentStore.getAllEntities()) {
            const meleeData = this.meleeIntentProcessedComponentStore.get(meleeAttack);
            const parentEntityId = meleeData.parentEntityId;

            if (!this.positionComponentStore.has(parentEntityId) || !this.spriteComponentStore.has(parentEntityId)) {
                this.restoreAttachmentRenderable(meleeData.hiddenAttachmentEntityId);
                this.awaitingAnimationEndComponentStore.remove(meleeAttack);
                this.entityFactory.destroyMeleeHitBox(meleeAttack);
                // sound
                continue;
            }

            const awaitingAnimation = this.awaitingAnimationEndComponentStore.getOrNull(meleeAttack);
            if (!awaitingAnimation) {
                this.awaitingAnimationEndComponentStore.add(meleeAttack, new AwaitingAnimationEndComponent(AnimationName.MELEE_ATTACK));
                continue;
            }

            if (this.awaitingAnimationEndComponentStore.get(meleeAttack).resolved === true) {
                this.restoreAttachmentRenderable(meleeData.hiddenAttachmentEntityId);
                this.awaitingAnimationEndComponentStore.remove(meleeAttack);
                this.entityFactory.destroyMeleeHitBox(meleeAttack);
                continue;
            }

            const currentAimAngle = this.resolveAimAngle(
                parentEntityId,
                this.intentMeleeComponentStore.getOrNull(parentEntityId),
                this.aimShootingComponentStore.getOrNull(meleeAttack)?.aimAngle ?? 0,
            );
            const meleePose = this.buildMeleePose(parentEntityId);

            this.positionComponentStore.add(meleeAttack, new PositionComponent(meleePose.x, meleePose.y));
            this.movementIntentComponentStore.add(meleeAttack, new MovementIntentComponent(meleePose.x, meleePose.y));
            this.aimShootingComponentStore.add(
                meleeAttack,
                new AimRotationShootingComponent(currentAimAngle, meleePose.pivotPointSprite),
            );
            this.directionAnimComponentStore.add(
                meleeAttack,
                this.buildMeleeDirectionAnimation(currentAimAngle),
            );
        }
    }

    private resolveAimAngle(
        playerEntity: number,
        intent: IntentMeleeComponent | null,
        fallbackAngle: number = 0,
    ) {
        const attachedWeaponEntity = this.getAttachedWeaponEntity(playerEntity);
        if (attachedWeaponEntity !== null) {
            const weaponAim = this.aimShootingComponentStore.getOrNull(attachedWeaponEntity);
            if (weaponAim) {
                return weaponAim.aimAngle;
            }
        }

        if (!intent) {
            return fallbackAngle;
        }

        const playerPosition = this.positionComponentStore.get(playerEntity);
        const playerSprite = this.spriteComponentStore.get(playerEntity);
        const playerCenterX = playerPosition.x + playerSprite.width / 2;
        const playerCenterY = playerPosition.y + playerSprite.height / 2;
        return Math.atan2(intent.y - playerCenterY, intent.x - playerCenterX);
    }

    private buildMeleePose(playerEntity: number) {
        const playerPosition = this.positionComponentStore.get(playerEntity);
        const playerSprite = this.spriteComponentStore.get(playerEntity);
        const playerCenterX = playerPosition.x + playerSprite.width / 2;
        const playerCenterY = playerPosition.y + playerSprite.height / 2;

        return {
            x: playerCenterX,
            y: playerCenterY,
            pivotPointSprite: MELEE_PIVOT_POINT,
        };
    }

    private buildMeleeDirectionAnimation(aimAngle: number) {
        const shouldFlipVertically = Math.cos(aimAngle) < 0;
        return new DirectionAnimComponent(
            AnimDirection.RIGHT,
            shouldFlipVertically ? AnimDirection.BOTTOM : AnimDirection.TOP,
        );
    }

    private getAttachedWeaponEntity(parentEntityId: number): number | null {
        const weaponAttachment = this.weaponSpriteAttachmentComponentStore
            .getValuesAndEntityId()
            .find((entry) => entry[1].parentEntityId === parentEntityId);

        return weaponAttachment?.[0] ?? null;
    }

    private hideAttachmentRenderable(attachmentEntityId: number | null) {
        if (attachmentEntityId === null) {
            return null;
        }

        if (!this.renderableComponentStore.has(attachmentEntityId)) {
            return null;
        }

        this.renderableComponentStore.remove(attachmentEntityId);
        return attachmentEntityId;
    }

    private restoreAttachmentRenderable(attachmentEntityId: number | null) {
        if (attachmentEntityId === null) {
            return;
        }
        if (!this.weaponSpriteAttachmentComponentStore.has(attachmentEntityId)) {
            return;
        }
        if (!this.positionComponentStore.has(attachmentEntityId) || !this.spriteComponentStore.has(attachmentEntityId)) {
            return;
        }
        if (!this.zLayerComponentStore.has(attachmentEntityId)) {
            return;
        }
        if (this.renderableComponentStore.has(attachmentEntityId)) {
            return;
        }

        this.renderableComponentStore.add(attachmentEntityId, new RenderableComponent());
    }

    private hasActiveMeleeHitBox(parentEntityId: number) {
        return this.meleeIntentProcessedComponentStore
            .getAllEntities()
            .some((entityId) => this.meleeIntentProcessedComponentStore.get(entityId).parentEntityId === parentEntityId);
    }
}
