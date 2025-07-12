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
        private velocityComponentStore: ComponentStore<VelocityComponent>
    ) { }

    update(deltaTime: number): void {
        const projectileEntities = this.projectileComponentStore.getAllEntities();
        //console.log("projectileEntities", projectileEntities);

        for (const entity of projectileEntities) {
            //console.log(entity);
            const position = this.positionComponentStore.get(entity);
            const velocity = this.velocityComponentStore.get(entity);
            const intent = {
                x: position.x + velocity.velX * deltaTime * 120,
                y: position.y + velocity.velY * deltaTime * 120
            }
            //console.log(position, velocity);

            this.positionComponentStore.add(entity, intent); // atualiza posição
        }

    }

}