
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { AIComponent } from "../components/ai.component.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { OffsetAppliedComponent } from "../components/offset-applied.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";


export class AnimationSetterSystem implements ISystem {
    constructor(
        private spriteManager: SpriteManager,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private aiComponentStore: ComponentStore<AIComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private aimShootingComponent: ComponentStore<AimRotationShootingComponent>,
        private weaponSpriteAttachmentComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private wallHitComponentStore: ComponentStore<WallHitComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private offsetAppliedComponentStore: ComponentStore<OffsetAppliedComponent>,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private grenadeExplosionComponentStore: ComponentStore<GrenadeExplosionComponent>,
    ) { }

    update(deltaTime: number): void {
        const entitiesWithAnim = this.animationComponentStore.getAllEntities();
        for (const entityWithAnim of entitiesWithAnim) {
            let animToUse: AnimationName | undefined;
            const currentAnim = this.animationComponentStore.get(entityWithAnim).animationName;
            const isPlayer = this.playerComponentStore.has(entityWithAnim);
            const isNpc = this.aiComponentStore.has(entityWithAnim);
            const isProjectile = this.projectileComponentStore.has(entityWithAnim);
            const isGrenade = this.grenadeComponentStore.has(entityWithAnim);
            const isExplodedGrenade = this.grenadeExplosionComponentStore.has(entityWithAnim);
            const isAttachedWeapon = this.weaponSpriteAttachmentComponent.has(entityWithAnim);
            let isMoving = false;
            let loop = true;
            const entityMovementIntent = this.movementIntentComponentStore.getOrNull(entityWithAnim);

            //Check anim direction + movement
            if (entityMovementIntent) {
                const initialPosition = this.positionComponentStore.get(entityWithAnim);
                const deltaPosX = entityMovementIntent.x - initialPosition.x;
                const deltaPosY = entityMovementIntent.y - initialPosition.y;
                isMoving = (deltaPosX != 0 || deltaPosY != 0) ? true : false;
                //Entity is not moving horizontally
            }

            //Decide the anim
            if (isPlayer) {
                if (isMoving) {
                    animToUse = AnimationName.PLAYER_RUN
                } else {
                    animToUse = AnimationName.PLAYER_STILL
                }
            }

            if (isAttachedWeapon) {
                const attachedWeapon = this.weaponSpriteAttachmentComponent.get(entityWithAnim);
                const aimShootingComponent = this.aimShootingComponent.get(entityWithAnim);
                const directionAnimActor = Math.cos(aimShootingComponent.aimAngle) > 0 ? AnimDirection.RIGHT : AnimDirection.LEFT;
                const directionAnimWeapon = Math.cos(aimShootingComponent.aimAngle) > 0 ? AnimDirection.TOP : AnimDirection.BOTTOM;
                this.directionAnimComponentStore.add(attachedWeapon.parentEntityId, new DirectionAnimComponent(directionAnimActor));
                this.directionAnimComponentStore.add(entityWithAnim, new DirectionAnimComponent(AnimDirection.RIGHT, directionAnimWeapon));
            }

            if (isNpc) {
                if (isMoving) {
                    animToUse = AnimationName.ENEMY_RUN
                } else {
                    animToUse = AnimationName.ENEMY_STILL
                }   
            }

            if (isProjectile) {
                if (this.wallHitComponentStore.has(entityWithAnim)) {
                    animToUse = AnimationName.BULLET_WALL_HIT;
                    loop = false;
                    this.applyWallHitOffset(entityWithAnim);
                }
                else {
                    animToUse = AnimationName.BULLET_FIRED
                }
            }

            if (isGrenade) {
                if (isExplodedGrenade) {
                    animToUse = AnimationName.GRENADE_EXPLOSION;
                    loop = false;
                    this.applyGrenadeExplosionOffset(entityWithAnim);
                }
                else {
                    animToUse = AnimationName.GRENADE_FIRED
                }
            }

            if (animToUse && currentAnim != animToUse) {
                this.animationComponentStore.add(entityWithAnim, new AnimationComponent(animToUse, loop));
            }
        }
    }

    private applyWallHitOffset(entityWithAnim: number) {
        if (this.offsetAppliedComponentStore.has(entityWithAnim)) return;
        this.applyCenteredSpriteOffset(
            entityWithAnim,
            SpriteName.BULLET_WALL_HIT_1,
            SpriteSheetName.BULLET_WALL_HIT,
        );
    }

    private applyGrenadeExplosionOffset(entityWithAnim: number) {
        if (this.offsetAppliedComponentStore.has(entityWithAnim)) return;
        this.applyCenteredSpriteOffset(
            entityWithAnim,
            SpriteName.GRENADE_EXPLOSION_1,
            SpriteSheetName.GRENADE_EXPLOSION,
        );
    }

    private applyCenteredSpriteOffset(
        entityWithAnim: number,
        nextSpriteName: SpriteName,
        nextSpriteSheetName: SpriteSheetName,
    ) {
        const initialPosition = this.positionComponentStore.get(entityWithAnim);
        const currentSprite = this.spriteComponentStore.get(entityWithAnim);
        const nextSpriteProperties = this.spriteManager.getSpriteProperties(nextSpriteName, nextSpriteSheetName);

        const currentCenterX = initialPosition.x + currentSprite.width / 2;
        const currentCenterY = initialPosition.y + currentSprite.height / 2;

        initialPosition.x = currentCenterX - nextSpriteProperties.sprite.originalRenderSpriteWidth / 2;
        initialPosition.y = currentCenterY - nextSpriteProperties.sprite.originalRenderSpriteHeight / 2;
        this.offsetAppliedComponentStore.add(entityWithAnim, new OffsetAppliedComponent());
    }
}
