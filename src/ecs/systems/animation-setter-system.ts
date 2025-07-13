
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { AnimationComponent } from "../components/animation.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileShooterComponent } from "../components/projectile-shooter.component.js";
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
        private projectileShooterComponentStore: ComponentStore<ProjectileShooterComponent>,
        private soldierComponentStore : ComponentStore<SoldierComponent>
    ) { }

    update(deltaTime: number): void {
        const entitiesWithAnim = this.animationComponentStore.getAllEntities();
        const entitiesShooting = new Set(this.projectileShooterComponentStore.getAllValues().map((projectileShooterValue) => projectileShooterValue.shooterEntityId));
        for (const entityWithAnim of entitiesWithAnim) {
            let animToUse : AnimationName | undefined;
            const currentAnim = this.animationComponentStore.get(entityWithAnim).animationName;
            const isSoldier = this.soldierComponentStore.has(entityWithAnim);
            let isMoving = false;
            let isShooting = entitiesShooting.has(entityWithAnim);
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
            if(isSoldier) {
                if(isMoving) {
                    animToUse = AnimationName.SOLDIER_RUN
                } else if(isShooting) {
                    animToUse = AnimationName.SOLDIER_SHOOT
                } else {
                    animToUse = AnimationName.SOLDIER_STILL
                }
            }

            if(animToUse && currentAnim != animToUse) {
                this.animationComponentStore.add(entityWithAnim, new AnimationComponent(animToUse))
            }
        }
    }
}