import { DirectionComponent } from "../components/direction-component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { TravelTimeComponent } from "../components/travel-time.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

/*
É basicamente um movementSystem, mas que difere do player pois em colisão pode ser que
queiramos adicionar alguma interação especifica no futuro (ex: entidade desaparece ao colidir, ao contrário de player)
**/
export class ProjectileUpdateSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private directionComponentStore: ComponentStore<DirectionComponent>,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private travelTimeComponentStore: ComponentStore<TravelTimeComponent>,
    ) {
    }

    canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;

    update(deltaTime: number): void {
        const projectileEntities = this.projectileComponentStore.getAllEntities();

        for (const entity of projectileEntities) {
            const position = this.positionComponentStore.get(entity);
            const velocity = this.velocityComponentStore.get(entity);
            const direction = this.directionComponentStore.get(entity);
            let dirX = direction.dirX;
            let dirY = direction.dirY;
            const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);

            if (magnitude > 0) {
                dirX = dirX / magnitude;
                dirY = dirY / magnitude;
            }

            const intent = {
                x: position.x + dirX * velocity.currentVelocityX * deltaTime,
                y: position.y + dirY * velocity.currentVelocityY * deltaTime
            };

            this.movementIntentComponentStore.add(entity, intent);
            if (intent.x > this.canvas.width || intent.y > this.canvas.height || intent.x < 0 || intent.y < 0) {
                this.projectileComponentStore.remove(entity);
            }

            if (this.grenadeComponentStore.has(entity)) {
                this.travelTimeComponentStore.get(entity).travelTime += deltaTime

                const travelCheck =
                    this.travelTimeComponentStore.get(entity).travelTime > this.travelTimeComponentStore.get(entity).totalTravelTime;

                if (travelCheck) {
                    this.movementIntentComponentStore.remove(entity);
                } else {
                    this.positionComponentStore.add(entity, intent);
                }
            } else {
                this.positionComponentStore.add(entity, intent);
            }

        }
    }
}