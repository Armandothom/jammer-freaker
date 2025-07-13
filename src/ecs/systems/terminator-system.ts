
import { IntentClickComponent } from "../components/intent-click.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { ProjectileShooterIntentComponent } from "../components/projectile-shooter-intent.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


//Hasta la vista, baby
export class TerminatorSystem implements ISystem {
    constructor(
        private clickIntentComponentStore: ComponentStore<IntentClickComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private projectileShooterComponentStore: ComponentStore<ProjectileShooterIntentComponent>,
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

        const projectileShooterComponentEntities = this.projectileShooterComponentStore.getAllEntities();
        for (const projectileShooterComponentEntity of projectileShooterComponentEntities) {
            this.projectileShooterComponentStore.remove(projectileShooterComponentEntity);
        }
    }
}