
import { IntentClickComponent } from "../components/intent-click.component.js";
import { IntentShootingComponent } from "../components/intentShootingComponentStore.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { ComponentStore } from "../core/component-store.js";
import { CoreManager } from "../core/core-manager.js";
import { ISystem } from "./system.interface.js";


//Hasta la vista, baby
export class TerminatorSystem implements ISystem {
    constructor(
        private clickIntentComponentStore: ComponentStore<IntentClickComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
        private shootingIntentComponentStore: ComponentStore<IntentShootingComponent>,

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

        const shootingIntentComponentEntities = this.shootingIntentComponentStore.getAllEntities();
        for (const shootingIntentComponentEntity of shootingIntentComponentEntities) {
            this.shootingIntentComponentStore.remove(shootingIntentComponentEntity);
        }

        const shootingCooldownComponentEntities = this.shootingCooldownComponentStore.getAllEntities();
        for (const shootingCooldownComponentEntity of shootingCooldownComponentEntities) {

            const cooldown = this.shootingCooldownComponentStore.get(shootingCooldownComponentEntity);
            if (cooldown.endCooldown < CoreManager.timeGlobalSinceStart) {
                this.shootingCooldownComponentStore.remove(shootingCooldownComponentEntity);
            }
        }
    }
}