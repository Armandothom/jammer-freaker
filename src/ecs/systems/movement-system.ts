
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class MovementSystem implements ISystem{
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>
    ) {}
    
    update(deltaTime: number): void {
        for (const entity of this.movementIntentComponentStore.getAllEntities()){
            const intentPosition = this.movementIntentComponentStore.get(entity);
            this.positionComponentStore.add(entity, new PositionComponent(intentPosition.x, intentPosition.y));
            //We remove the intent after moving the entity.
            this.movementIntentComponentStore.remove(entity);
        }
    }
}