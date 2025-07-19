
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { AIComponent } from "../components/ai.component.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class AnimationSetterSystem implements ISystem {
    constructor(
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private aiComponentStore : ComponentStore<AIComponent>,
        private playerComponentStore : ComponentStore<PlayerComponent>,
        private aimShootingComponent : ComponentStore<AimShootingComponent>,
        private weaponSpriteAttachmentComponent : ComponentStore<WeaponSpriteAttachmentComponent>,
    ) { }

    update(deltaTime: number): void {
        const entitiesWithAnim = this.animationComponentStore.getAllEntities();
        for (const entityWithAnim of entitiesWithAnim) {
            let animToUse : AnimationName | undefined;
            const currentAnim = this.animationComponentStore.get(entityWithAnim).animationName;
            const isPlayer = this.playerComponentStore.has(entityWithAnim);
            const isNpc = this.aiComponentStore.has(entityWithAnim);
            const isAttachedWeapon = this.weaponSpriteAttachmentComponent.has(entityWithAnim);
            let isMoving = false;
            const entityMovementIntent = this.movementIntentComponentStore.getOrNull(entityWithAnim);

            //Check anim direction + movement
            if(entityMovementIntent) {
                const initialPosition = this.positionComponentStore.get(entityWithAnim);
                const deltaPosX = entityMovementIntent.x - initialPosition.x;
                const deltaPosY = entityMovementIntent.y - initialPosition.y;
                isMoving = (deltaPosX != 0 || deltaPosY != 0) ? true : false;
                //Entity is not moving horizontally
            }

            //Decide the anim
            if(isPlayer) {
                const aimShootingComponent = this.aimShootingComponent.get(entityWithAnim);
                const directionAnim = Math.cos(aimShootingComponent.aimAngle) > 0 ? AnimDirection.RIGHT : AnimDirection.LEFT;
                this.directionAnimComponentStore.add(entityWithAnim, new DirectionAnimComponent(directionAnim));
                if(isMoving) {
                    animToUse = AnimationName.PLAYER_RUN
                } else {
                    animToUse = AnimationName.PLAYER_STILL
                }
            }

            if(isAttachedWeapon) {
                const attachedWeapon = this.weaponSpriteAttachmentComponent.get(entityWithAnim);
                const aimShootingComponent = this.aimShootingComponent.get(attachedWeapon.parentEntityId);;
                const directionAnim = Math.cos(aimShootingComponent.aimAngle) > 0 ? AnimDirection.RIGHT : AnimDirection.LEFT;
                this.directionAnimComponentStore.add(entityWithAnim, new DirectionAnimComponent(directionAnim));
            }

            if(isNpc) {
                if(isMoving) {
                    animToUse = AnimationName.ENEMY_RUN
                } else {
                    animToUse = AnimationName.ENEMY_STILL
                }
            }

            if(animToUse && currentAnim != animToUse) {
                this.animationComponentStore.add(entityWithAnim, new AnimationComponent(animToUse))
            }
        }
    }
}