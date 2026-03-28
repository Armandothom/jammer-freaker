import { DamageTakenIntentComponent } from "../components/damage-taken-intent.component.js";
import { DeathIntentComponent } from "../components/death-intent.component.js";
import { HealthComponent } from "../components/health.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class DamageProcessingSystem implements ISystem {
    constructor(
        private damageTakenIntentComponentStore: ComponentStore<DamageTakenIntentComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private deathIntentComponentStore: ComponentStore<DeathIntentComponent>,
    ) { }

    update(deltaTime: number): void {
        for (const entity of this.damageTakenIntentComponentStore.getAllEntities()) {
            const damageTakenIntent = this.damageTakenIntentComponentStore.get(entity);
            const health = this.healthComponentStore.get(entity);
            const { damageSource, damage } = damageTakenIntent;
            //console.log(damage);

            // fix grenade required

            if (health.hp > 0) {
                health.hp -= damage;
                if (health.hp <= 0) {
                    //this.deathIntentComponentStore.add(entity, new DeathIntentComponent(damageSource));
                }
            }
            this.damageTakenIntentComponentStore.remove(entity);
        }
    }
}
