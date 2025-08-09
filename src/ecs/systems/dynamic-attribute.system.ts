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
import { GrenadeBeltComponent } from "../components/grenade-belt.component.js";
import { GrenadeFiredComponent } from "../components/grenade-fired.component.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";

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
        private grenadeBeltComponentStore: ComponentStore<GrenadeBeltComponent>,
        private grenadeFiredComponentStore: ComponentStore<GrenadeFiredComponent>,
        private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
    ) {

    }
    update(deltaTime: number): void {
        const currentLevel = this.levelManager.levelNumber;

        // Scales velocity of entities once per level
        for (const entity of this.velocityComponentStore.getAllEntities()) {
            const velocity = this.velocityComponentStore.get(entity);

            if (velocity.scaledAtLevel != currentLevel && !this.projectileComponentStore.has(entity)) {
                // the factor below is defined empirically
                // the velocity this way is ratio by the tileSize of the terrain, it isn't fixed by pixel walking

                const velocityScaled = (-0.133) * (currentLevel - 8) + 1.6;
                velocity.currentVelocityX = velocityScaled;
                velocity.currentVelocityY = velocityScaled;
                velocity.scaledAtLevel = currentLevel;
            }
        }

        //Processses damageTaken by the entity
        for (const entity of this.damageTakenComponentStore.getAllEntities()) {
            const damageSourceId = this.damageTakenComponentStore.get(entity).damageSource;
            const grenadeDamage = this.damageTakenComponentStore.get(entity).grenadeDamage;
            let damage = this.damageComponentStore.get(damageSourceId).damage;
            const isEnemy = this.enemyComponentStore.has(entity);
            const isPlayer = this.playerComponentStore.has(entity);

            if (grenadeDamage != 0) {
                damage = grenadeDamage
            }


            this.healthComponentStore.get(entity).takeDamage(damage);

            //console.log(`Damage ${damage} causado a ${isEnemy ? 'Enemy' : isPlayer ? 'Player' : 'Unknown'} (entity ${entity})`);
            this.damageTakenComponentStore.remove(entity);

            if (this.healthComponentStore.get(entity).hp <= 0) {
                if (this.playerComponentStore.has(entity)) {
                    // player dead, game over
                }
                if (isEnemy && !this.enemyDeadComponentStore.has(entity)) {
                    this.enemiesKilledComponentStore.add(entity, new EnemiesKilledComponent());
                    this.entityFactory.destroyEnemy(entity);
                }
            }
        }

        //Consumes ammo of the shooting entity
        for (const shootingEntity of this.bulletFiredComponentStore.getAllEntities()) {
            if (this.playerComponentStore.has(shootingEntity)) {
                this.weaponMagazineComponentStore.get(shootingEntity).consumeAmmo();
                this.bulletFiredComponentStore.remove(shootingEntity);

                if (this.weaponMagazineComponentStore.get(shootingEntity).currentAmmo === 0) {
                    this.weaponMagazineComponentStore.get(shootingEntity).consumeMagazine();
                    this.weaponMagazineComponentStore.get(shootingEntity).isReloading = true;
                    this.reloadIntentComponentStore.add(shootingEntity, new ReloadIntentComponent(
                        this.weaponMagazineComponentStore.get(shootingEntity).reloadTime
                    ));
                }
            }
        }

        //Consume grenades from the player
        for (const shootingEntity of this.grenadeFiredComponentStore.getAllEntities()) {
            if (this.playerComponentStore.has(shootingEntity)) {
                this.grenadeBeltComponentStore.get(shootingEntity).consumeGrenade();
                this.grenadeFiredComponentStore.remove(shootingEntity);
            }
        }
    }
}