import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class MovementSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>
    ) { }

    update(deltaTime: number): void {
        const entities = this.movementIntentComponentStore.getAllEntities();


        for (const entity of entities) {
            
            const intent = this.movementIntentComponentStore.getOrNull(entity); 

            if (!intent) continue;
            this.positionComponentStore.add(entity, new PositionComponent(intent.x, intent.y));

            //We remove the intent after moving the entity.
            this.movementIntentComponentStore.remove(entity);
        }
    }
}