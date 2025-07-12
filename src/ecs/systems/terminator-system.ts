
import { ClickIntentComponent } from "../components/click-intent.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


//Hasta la vista, baby
export class TerminatorSystem implements ISystem {
    constructor(
        private clickIntentComponentStore: ComponentStore<ClickIntentComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
    ) { }

    update(deltaTime: number): void {
        const clickIntentComponentEntities = this.clickIntentComponentStore.getAllEntities();
        for (const elemeclickIntentComponentEntity of clickIntentComponentEntities) {
            this.clickIntentComponentStore.remove(elemeclickIntentComponentEntity);
        }
        const movementIntentComponentEntities = this.movementIntentComponentStore.getAllEntities();
        for (const movementIntentComponentEntity of movementIntentComponentEntities) {
            this.movementIntentComponentStore.remove(movementIntentComponentEntity);
        }
    }
}