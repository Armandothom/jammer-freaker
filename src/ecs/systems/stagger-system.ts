import { EpipenActiveComponent } from "../components/epipen-active-component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { StaggerComponent } from "../components/stagger-component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class StaggerSystem implements ISystem {
    constructor(
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private staggerComponentStore: ComponentStore<StaggerComponent>,
        private epipenActiveComponentStore: ComponentStore<EpipenActiveComponent>,
    ) {

    }

    update(deltaTime: number): void {
        for (const staggerEntity of this.staggerComponentStore.getAllEntities()) {
            if (this.epipenActiveComponentStore.has(staggerEntity)) {
                this.staggerComponentStore.remove(staggerEntity);
                continue;
            }
            if (this.movementIntentComponentStore.has(staggerEntity)) {
                this.movementIntentComponentStore.remove(staggerEntity);
            }
            this.staggerUpdate(staggerEntity);
        }
    }

    staggerUpdate(entity: number) {
        const stagger = this.staggerComponentStore.get(entity);
        stagger.frame++;
        if (stagger.frame >= stagger.maxFrames) {
            this.staggerComponentStore.remove(entity);
        }
    }
}