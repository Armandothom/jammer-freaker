
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { AIComponent } from "../components/ai.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { IntentShotComponent } from "../components/intentShotComponentStore.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { SoldierComponent } from "../components/soldier.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class AnimationSetterSystem implements ISystem {
    constructor(
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private aiComponentStore : ComponentStore<AIComponent>,
        private playerComponentStore : ComponentStore<PlayerComponent>,
    ) { }

    update(deltaTime: number): void {
        const entitiesWithAnim = this.animationComponentStore.getAllEntities();
        const entitiesShooting = new Set(this.intentShotComponentStore.getAllEntities());
        for (const entityWithAnim of entitiesWithAnim) {
            let animToUse : AnimationName | undefined;
            const currentAnim = this.animationComponentStore.get(entityWithAnim).animationName;
            const isPlayer = this.playerComponentStore.has(entityWithAnim);
            const isNpc = this.aiComponentStore.has(entityWithAnim);
            let isMoving = false;
            const entityMovementIntent = this.movementIntentComponentStore.getOrNull(entityWithAnim);

            //Check anim direction + movement
            if(entityMovementIntent) {
                const initialPosition = this.positionComponentStore.get(entityWithAnim);
                const deltaPosX = entityMovementIntent.x - initialPosition.x;
                const deltaPosY = entityMovementIntent.y - initialPosition.y;
                isMoving = (deltaPosX != 0 || deltaPosY != 0) ? true : false;
                //Entity is not moving horizontally
                if (deltaPosX != 0) {
                    const directionAnim = deltaPosX > 0 ? AnimDirection.RIGHT : AnimDirection.LEFT;
                    this.directionAnimComponentStore.add(entityWithAnim, new DirectionAnimComponent(directionAnim))
                }
            }

            //Decide the anim
            if(isPlayer) {
                if(isMoving) {
                    animToUse = AnimationName.PLAYER_RUN
                } else {
                    animToUse = AnimationName.PLAYER_STILL
                }
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