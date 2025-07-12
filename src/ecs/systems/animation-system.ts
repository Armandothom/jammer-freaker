
import { ClickIntentComponent } from "../components/click-intent.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class AnimationSystem implements ISystem {
    constructor(
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private clickIntentComponentStore: ComponentStore<ClickIntentComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private directionAnimComponent: ComponentStore<DirectionAnimComponent>,
    ) { }

    update(deltaTime: number): void {
        const entitiesMoving = this.movementIntentComponentStore.getAllEntities();
        for (const entityMoving of entitiesMoving) {
            const intentPosition = this.movementIntentComponentStore.get(entityMoving);
            const initialPosition = this.positionComponentStore.get(entityMoving);
            const deltaPos = intentPosition.x - initialPosition.x;
            if (deltaPos != 0) {
                const directionAnim = deltaPos > 0 ? AnimDirection.RIGHT : AnimDirection.LEFT;
                this.directionAnimComponent.add(entityMoving, new DirectionAnimComponent(directionAnim))
            }
        }

    }
}