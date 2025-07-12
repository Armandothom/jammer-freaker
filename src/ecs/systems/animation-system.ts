
import { ClickIntentComponent } from "../components/click-intent.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class AnimationSystem implements ISystem{
    constructor(
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private clickIntentComponentStore: ComponentStore<ClickIntentComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>
    ) {}
    
    update(deltaTime: number): void {
        
    }
}