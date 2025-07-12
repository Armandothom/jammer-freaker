
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class MovementSystem implements ISystem{
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
    ) {}
    update(deltaTime: number): void {
        for (const entity of this.movementIntentComponentStore.getAllEntities()){
            const intent = this.movementIntentComponentStore.get(entity);
            if (!intent) continue;

            this.positionComponentStore.add(entity, new PositionComponent(intent.x, intent.y));

            //remover o intent após aplicar movimento
            this.movementIntentComponentStore.remove(entity);
        }
    }
}