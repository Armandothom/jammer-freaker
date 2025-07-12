import { EntityNameComponent } from "../components/entity-name.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

/*
É basicamente um movementSystem, mas que difere do player pois em colisão pode ser que
queiramos adicionar alguma interação especifica no futuro (ex: entidade desaparece ao colidir, ao contrário de player)
**/
export class ProjectileUpdateSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private entityNameComponentStore: ComponentStore<EntityNameComponent>
    ) { }

    update(deltaTime: number): void {
        const projectileEntities = this.entityNameComponentStore.getAllEntities().filter(id => {
            const nameComp = this.entityNameComponentStore.get(id);
            return nameComp.name === "projectile" &&
                this.positionComponentStore.has(id) &&
                this.movementIntentComponentStore.has(id);
        });


        for (const entity of projectileEntities) {
            const position = this.positionComponentStore.get(entity);
            const movement = this.movementIntentComponentStore.get(entity);

            position.x += movement.x * deltaTime;
            position.y += movement.y * deltaTime;

            this.positionComponentStore.add(entity, position); // atualiza posição
        }

    }

}