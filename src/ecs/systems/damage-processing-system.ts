import { BleedDamageComponent } from "../components/bleed-damage.component.js";
import { BleedIntentComponent } from "../components/bleed-intent.component.js";
import { DamageTakenIntentComponent } from "../components/damage-taken-intent.component.js";
import { DeathIntentComponent } from "../components/death-intent.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { HealthComponent } from "../components/health.component.js";
import { EnemyConfig, type EnemyType } from "../components/types/enemy-type.js";
import { WeaponConfig, type WeaponType } from "../components/types/weapon-config.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class DamageProcessingSystem implements ISystem {
    constructor(
        private damageTakenIntentComponentStore: ComponentStore<DamageTakenIntentComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private deathIntentComponentStore: ComponentStore<DeathIntentComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private bleedIntentComponentStore: ComponentStore<BleedIntentComponent>,
        private bleedDamageComponentStore: ComponentStore<BleedDamageComponent>,
    ) { }

    update(deltaTime: number): void {
        for (const entity of this.damageTakenIntentComponentStore.getAllEntities()) {
            const damageTakenIntent = this.damageTakenIntentComponentStore.get(entity);
            const health = this.healthComponentStore.get(entity);
            const { damagingEntity, damageSource, damage } = damageTakenIntent;
            //console.log(damage);

            // fix grenade required

            if (health.hp > 0) {
                health.hp -= damage;
                const bleedChance = this.fetchBleedChance(damagingEntity, damageSource);
                this.bleedIntentComponentStore.add(entity, new BleedIntentComponent(bleedChance));
                if (this.bleedDamageComponentStore.has(entity)) {
                    const bleedDamage = this.bleedProcess(deltaTime, this.bleedDamageComponentStore.get(entity));
                    health.hp -= bleedDamage;
                }
                if (health.hp <= 0) {
                    if (!this.deathIntentComponentStore.has(entity)) {
                        this.deathIntentComponentStore.add(entity, new DeathIntentComponent(damagingEntity));
                    }
                }
            }

            this.damageTakenIntentComponentStore.remove(entity);
        }
    }

    fetchBleedChance(damagingEntity: number, damageSource: EnemyType | WeaponType): number {
        const enemy = this.enemyComponentStore.getOrNull(damagingEntity);
        if (enemy) {
            return EnemyConfig[enemy.enemyType].bleedChance;
        }

        return WeaponConfig[damageSource as WeaponType]?.bleedingChance ?? 0;
    }

    bleedProcess(deltaTime: number, bleed: BleedDamageComponent) {
        bleed.timer += deltaTime;
        if (bleed.timer >= 1) {
            bleed.timer = 0;
            return bleed.bleedDPS * bleed.bleedStacks
        }
        return 0;
    }
}
