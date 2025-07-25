
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { AIComponent } from "../components/ai.component.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
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
import { LevelManager } from "../core/level-manager.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { OffsetAppliedComponent } from "../components/offset-applied.component.js";


export class AnimationSetterSystem implements ISystem {
    constructor(
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private aiComponentStore: ComponentStore<AIComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private aimShootingComponent: ComponentStore<AimShootingComponent>,
        private weaponSpriteAttachmentComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private wallHitComponentStore: ComponentStore<WallHitComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private offsetAppliedComponentStore: ComponentStore<OffsetAppliedComponent>,
    ) { }

    update(deltaTime: number): void {
        const entitiesWithAnim = this.animationComponentStore.getAllEntities();
        for (const entityWithAnim of entitiesWithAnim) {
            let animToUse: AnimationName | undefined;
            const currentAnim = this.animationComponentStore.get(entityWithAnim).animationName;
            const isPlayer = this.playerComponentStore.has(entityWithAnim);
            const isNpc = this.aiComponentStore.has(entityWithAnim);
            const isProjectile = this.projectileComponentStore.has(entityWithAnim);
            const isAttachedWeapon = this.weaponSpriteAttachmentComponent.has(entityWithAnim);
            let isMoving = false;
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
                //segregate here is the hit is of wall, player
                if (this.wallHitComponentStore.has(entityWithAnim)) {
                    console.log("animset");
                    animToUse = AnimationName.BULLET_WALL_HIT;
                    if (!this.offsetAppliedComponentStore.has(entityWithAnim)) {
                        let initialPosition = this.positionComponentStore.get(entityWithAnim);
                        const offsetX = this.spriteComponentStore.get(entityWithAnim).width / 4;
                        const offsetY = this.spriteComponentStore.get(entityWithAnim).height / 4;
                        initialPosition.x -= offsetX;
                        console.log("offsetY", offsetY);
                        initialPosition.y -= offsetY;
                        this.offsetAppliedComponentStore.add(entityWithAnim, new OffsetAppliedComponent());
                    }
                } else {
                    animToUse = AnimationName.BULLET_FIRED
                }
            }

            if (animToUse && currentAnim != animToUse) {
                this.animationComponentStore.add(entityWithAnim, new AnimationComponent(animToUse));
            }
        }
    }
}