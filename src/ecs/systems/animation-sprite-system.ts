
import { AnimationComponent } from "../components/animation.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class AnimationSpriteSystem implements ISystem {
    constructor(
        private animationComponentStore: ComponentStore<AnimationComponent>,
    ) { }

    update(deltaTime: number): void {
        const entitiesWithAnim = this.animationComponentStore.getAllEntities();
        for (const entityWithAnim of entitiesWithAnim) {
            const anim = this.animationComponentStore.get(entityWithAnim);
            
        }
    }
}