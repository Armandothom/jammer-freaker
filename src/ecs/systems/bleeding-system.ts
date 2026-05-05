import { BleedDamageComponent } from "../components/bleed-damage.component.js";
import { BleedIntentComponent } from "../components/bleed-intent.component.js";
import { HealBleedIntentComponent } from "../components/heal-bleed-intent.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class BleedingSystem implements ISystem {
    private bleedDPS: number = 10;
    private maxBleedStacks: number = 2;

    constructor(
        private bleedIntentComponentStore: ComponentStore<BleedIntentComponent>,
        private bleedDamageComponentStore: ComponentStore<BleedDamageComponent>,
        private healBleedIntentComponentStore: ComponentStore<HealBleedIntentComponent>,
    ) {

    }
    update(deltaTime: number): void {
        this.processBleedIntent();
        this.tryHealBleeding();
    }

    private processBleedIntent() {
        for (const entity of this.bleedIntentComponentStore.getAllEntities()) {
            const bleedIntent = this.bleedIntentComponentStore.get(entity);
            if (this.bleedingSucess(bleedIntent.bleedChance) === true) {
                if (!this.bleedDamageComponentStore.has(entity)) {
                    this.bleedDamageComponentStore.add(entity, new BleedDamageComponent(this.bleedDPS, 1));
                }
                if (this.bleedDamageComponentStore.has(entity) && this.bleedDamageComponentStore.get(entity).bleedStacks < this.maxBleedStacks) {
                    this.bleedDamageComponentStore.get(entity).bleedStacks++;
                }

            }
            this.bleedIntentComponentStore.remove(entity);
        }
    }

    private tryHealBleeding(): void {
        for (const entity of this.healBleedIntentComponentStore.getAllEntities()) {
            this.bleedDamageComponentStore.remove(entity);
            this.healBleedIntentComponentStore.remove(entity);
        }
    }

    private bleedingSucess(bleedChance: number): boolean {
        const roll = Math.random();
        if (roll <= bleedChance) return true;
        return false;
    }
}
