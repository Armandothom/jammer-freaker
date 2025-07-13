import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
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
    ) { }

    canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;

    update(deltaTime: number): void {
        const projectileEntities = this.projectileComponentStore.getAllEntities();

        for (const entity of projectileEntities) {
            const position = this.positionComponentStore.get(entity);
            const velocity = this.velocityComponentStore.get(entity);
            const intent = {
                x: position.x + velocity.velX * deltaTime,
                y: position.y + velocity.velY * deltaTime
            }
            this.movementIntentComponentStore.add(entity,intent);
            if (intent.x > this.canvas.width || intent.y > this.canvas.height || intent.x < 0 || intent.y < 0){
                this.projectileComponentStore.remove(entity);   
          
            }
            this.positionComponentStore.add(entity, intent); // atualiza posição
        }
    }

}