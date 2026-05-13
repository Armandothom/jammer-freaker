import { BleedDamageComponent } from "../components/bleed-damage.component.js";
import { BleedIntentComponent } from "../components/bleed-intent.component.js";
import { HealBleedIntentComponent } from "../components/heal-bleed-intent.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class BleedingSystem implements ISystem {
    private bleedDPS: number = 2;
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
                this.applyBleedStack(entity, bleedIntent.bleedingStacks ?? 1);
            }
            this.bleedIntentComponentStore.remove(entity);
        }
    }

    private applyBleedStack(entity: number, stacksToApply: number): void {
        const normalizedStacksToApply = Math.max(1, stacksToApply);
        const bleedDamage = this.bleedDamageComponentStore.getOrNull(entity);

        if (!bleedDamage) {
            this.bleedDamageComponentStore.add(
                entity,
                new BleedDamageComponent(
                    this.bleedDPS,
                    Math.min(normalizedStacksToApply, this.maxBleedStacks),
                ),
            );
            return;
        }

        bleedDamage.bleedStacks = Math.min(
            bleedDamage.bleedStacks + normalizedStacksToApply,
            this.maxBleedStacks,
        );
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
