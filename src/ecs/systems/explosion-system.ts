import { AnimationComponent } from "../components/animation.component.js";
import { DamageTakenComponent } from "../components/damage-taken.component.js";
import { DelayedDestructionComponent } from "../components/delayed-destruction.component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { FuseTimerComponent } from "../components/fuse-timer.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { EnemyConfig, EnemyType } from "../components/types/enemy-type.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class ExplosionSystem implements ISystem {

    constructor(
        private entityFactory: EntityFactory,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private fuseTimerComponentStore: ComponentStore<FuseTimerComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private damageTakenComponentStore: ComponentStore<DamageTakenComponent>,
        private grenadeExplosionComponentStore: ComponentStore<GrenadeExplosionComponent>,
        private delayedDestructionComponentStore: ComponentStore<DelayedDestructionComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
    ) {
    }

    update(deltaTime: number): void {

        for (const shooter of this.shooterComponentStore.getAllEntities()) {
            if (this.enemyComponentStore.has(shooter)) {
                if (this.enemyComponentStore.get(shooter).enemyType === EnemyType.BOMBER) {
                    this.enemyExplosion(deltaTime, shooter)
                }
            }
            if (this.playerComponentStore.has(shooter)) {
                this.playerExplosion(deltaTime, shooter)
            }
        }
    }

    private enemyExplosion(deltaTime: number, damageSourceId: number): void {
        const playerId = this.playerComponentStore.getAllEntities()[0];
        const playerPos = this.positionComponentStore.get(playerId);

        for (const grenadeEntity of this.grenadeComponentStore.getAllEntities()) {

            this.fuseTimerComponentStore.get(grenadeEntity).fuseTime += deltaTime;
            const grenadePos = this.positionComponentStore.get(grenadeEntity);

            const explosionCheck =
                this.fuseTimerComponentStore.get(grenadeEntity).fuseTime > this.fuseTimerComponentStore.get(grenadeEntity).totalFuseTimer;

            if (explosionCheck && !this.grenadeExplosionComponentStore.has(grenadeEntity)) {
                this.entityFactory.destroyProjectile(grenadeEntity);
                const hypot = Math.hypot(grenadePos.x - playerPos.x, grenadePos.y - playerPos.y);

                if (hypot <= EnemyConfig[EnemyType.BOMBER].attackExplosionRadius) {
                    const damage = EnemyConfig[EnemyType.BOMBER].damage - (EnemyConfig[EnemyType.BOMBER].damage / EnemyConfig[EnemyType.BOMBER].attackExplosionRadius) * hypot
                    this.damageTakenComponentStore.add(playerId, new DamageTakenComponent(damageSourceId, damage))
                }
                this.delayedDestructionComponentStore.add(grenadeEntity, new DelayedDestructionComponent(0.6));
            }
            
            if (this.grenadeExplosionComponentStore.has(grenadeEntity)) {
                if (this.delayedDestructionComponentStore.has(grenadeEntity)) {
                    this.delayedDestructionComponentStore.get(grenadeEntity).destructionTime += deltaTime;
                    let previousTime = this.delayedDestructionComponentStore.get(grenadeEntity).destructionTime - deltaTime;

                    const destroyCondition =
                        previousTime < this.delayedDestructionComponentStore.get(grenadeEntity).totalDestructionTimer &&
                        this.delayedDestructionComponentStore.get(grenadeEntity).destructionTime >= this.delayedDestructionComponentStore.get(grenadeEntity).totalDestructionTimer

                    if (destroyCondition) {
                        console.log("grenadeDestroyed", grenadeEntity);
                        this.animationComponentStore.remove(grenadeEntity);
                        this.grenadeExplosionComponentStore.remove(grenadeEntity);
                        this.delayedDestructionComponentStore.remove(grenadeEntity);
                        this.entityFactory.destroyProjectile(grenadeEntity);
                    }
                }
            }
        }
    }

    private playerExplosion(deltaTime: number, playerId: number): void {
        const damageSourceId = playerId

        for (const grenadeEntity of this.grenadeComponentStore.getAllEntities()) {
            this.fuseTimerComponentStore.get(grenadeEntity).fuseTime += deltaTime;
            const grenadePos = this.positionComponentStore.get(grenadeEntity);
            const explosionCheck =
                this.fuseTimerComponentStore.get(grenadeEntity).fuseTime >= this.fuseTimerComponentStore.get(grenadeEntity).totalFuseTimer;

            if (explosionCheck && !this.grenadeExplosionComponentStore.has(grenadeEntity)) {
                console.log(this.grenadeExplosionComponentStore.has(grenadeEntity));
                this.grenadeExplosionComponentStore.add(grenadeEntity, new GrenadeExplosionComponent());

                for (const enemy of this.enemyComponentStore.getAllEntities()) {
                    if (!this.enemyDeadComponentStore.has(enemy)) {
                        const enemyPos = this.positionComponentStore.get(enemy);


                        const hypot = Math.hypot(grenadePos.x - enemyPos.x, grenadePos.y - enemyPos.y);

                        if (hypot <= WeaponConfig[WeaponType.GRENADE].explosionRadius) {
                            const damage = WeaponConfig[WeaponType.GRENADE].damage - (WeaponConfig[WeaponType.GRENADE].damage / WeaponConfig[WeaponType.GRENADE].explosionRadius) * hypot
                            this.damageTakenComponentStore.add(enemy, new DamageTakenComponent(damageSourceId, damage))
                        }
                    }
                }
                this.delayedDestructionComponentStore.add(grenadeEntity, new DelayedDestructionComponent(0.6));
            }


            if (this.grenadeExplosionComponentStore.has(grenadeEntity)) {
                if (this.delayedDestructionComponentStore.has(grenadeEntity)) {
                    this.delayedDestructionComponentStore.get(grenadeEntity).destructionTime += deltaTime;
                    let previousTime = this.delayedDestructionComponentStore.get(grenadeEntity).destructionTime - deltaTime;

                    const destroyCondition =
                        previousTime < this.delayedDestructionComponentStore.get(grenadeEntity).totalDestructionTimer &&
                        this.delayedDestructionComponentStore.get(grenadeEntity).destructionTime >= this.delayedDestructionComponentStore.get(grenadeEntity).totalDestructionTimer

                    if (destroyCondition) {
                        console.log("grenadeDestroyed", grenadeEntity);
                        this.animationComponentStore.remove(grenadeEntity);
                        this.grenadeExplosionComponentStore.remove(grenadeEntity);
                        this.delayedDestructionComponentStore.remove(grenadeEntity);
                        this.entityFactory.destroyProjectile(grenadeEntity);
                    }
                }
            }

        }
    }
}

