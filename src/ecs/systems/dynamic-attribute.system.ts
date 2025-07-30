import { LevelManager } from "../core/level-manager.js";
import { ISystem } from "./system.interface.js";
import { EnemyType } from "../components/types/enemy-type.js";
import { ComponentStore } from "../core/component-store.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { DamageTakenComponent } from "../components/damage-taken.component.js";
import { HealthComponent } from "../components/health.component.js";
import { DamageComponent } from "../components/damage.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { EnemiesKilledComponent } from "../components/enemies-killed.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { WeaponMagazineComponent } from "../components/weapon-magazine.component.js";
import { ReloadIntentComponent } from "../components/reload-intent.component.js";
import { BulletFiredComponent } from "../components/bullet-fired.component.js";

export class DynamicAttributeSystem implements ISystem {
    private lastLevelApplied = -1;
    constructor(
        private levelManager: LevelManager,
        private entityFactory: EntityFactory,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private damageTakenComponentStore: ComponentStore<DamageTakenComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private damageComponentStore: ComponentStore<DamageComponent>,
        private enemiesKilledComponentStore: ComponentStore<EnemiesKilledComponent>,
        private weaponMagazineComponentStore: ComponentStore<WeaponMagazineComponent>,
        private reloadIntentComponentStore: ComponentStore<ReloadIntentComponent>,
        private bulletFiredComponentStore: ComponentStore<BulletFiredComponent>,
    ) {

    }
    update(deltaTime: number): void {
        const currentLevel = this.levelManager.levelNumber;

        for (const entity of this.velocityComponentStore.getAllEntities()) {
            const velocity = this.velocityComponentStore.get(entity);

            if (velocity.scaledAtLevel != currentLevel && !this.projectileComponentStore.has(entity)) {
                // the factor below is defined empirically
                // the velocity this way is ratio by the tileSize of de terrain, it isn't fixed by pixel walking

                const velocityScaled = (-0.133) * (currentLevel - 8) + 1.6;
                velocity.currentVelocityX = velocityScaled;
                velocity.currentVelocityY = velocityScaled;
                velocity.scaledAtLevel = currentLevel;
            }
        }

        for (const entity of this.damageTakenComponentStore.getAllEntities()) {
            const damageSource = this.damageTakenComponentStore.get(entity).damageSource;
            const damage = this.damageComponentStore.get(damageSource).damage;

            this.healthComponentStore.get(entity).takeDamage(damage);

            if (this.healthComponentStore.get(entity).hp <= 0) {
                if (this.playerComponentStore.has(entity)) {
                    // player dead, game over
                }
                if (this.enemyComponentStore.has(entity)) {
                    this.enemiesKilledComponentStore.add(entity, new EnemiesKilledComponent());
                    this.entityFactory.destroyEnemy(entity);
                }
            }
        }

        for (const shootingEntity of this.bulletFiredComponentStore.getAllEntities()){
            if(this.playerComponentStore.has(shootingEntity)){
                console.log(this.weaponMagazineComponentStore.get(shootingEntity).currentAmmo);
                this.weaponMagazineComponentStore.get(shootingEntity).consumeAmmo();
                this.bulletFiredComponentStore.remove(shootingEntity);

                if(this.weaponMagazineComponentStore.get(shootingEntity).currentAmmo === 0){
                    this.weaponMagazineComponentStore.get(shootingEntity).consumeMagazine();
                    this.weaponMagazineComponentStore.get(shootingEntity).isReloading = true;
                    this.reloadIntentComponentStore.add(shootingEntity, new ReloadIntentComponent(
                        this.weaponMagazineComponentStore.get(shootingEntity).reloadTime
                    ));
                }
            }
        }
    }

}