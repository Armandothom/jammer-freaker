import { AnimationComponent } from "../components/animation.component.js";
import { DamageTakenIntentComponent } from "../components/damage-taken-intent.component.js";
import { DelayedDestructionComponent } from "../components/delayed-destruction.component.js";
import { DirectionComponent } from "../components/direction-component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { FuseTimerComponent } from "../components/fuse-timer.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { TravelTimeComponent } from "../components/travel-time.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

type ExplosionProfile = {
    damage: number;
    radius: number;
    targetEntities: number[];
};

export class GrenadeUpdateSystem implements ISystem {
    constructor(
        private entityFactory: EntityFactory,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private directionComponentStore: ComponentStore<DirectionComponent>,
        private travelTimeComponentStore: ComponentStore<TravelTimeComponent>,
        private fuseTimerComponentStore: ComponentStore<FuseTimerComponent>,
        private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private damageTakenIntentComponentStore: ComponentStore<DamageTakenIntentComponent>,
        private grenadeExplosionComponentStore: ComponentStore<GrenadeExplosionComponent>,
        private delayedDestructionComponentStore: ComponentStore<DelayedDestructionComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
    ) {
    }

    update(deltaTime: number): void {
        for (const grenadeEntity of this.grenadeComponentStore.getAllEntities()) {
            if (this.grenadeExplosionComponentStore.has(grenadeEntity)) {
                this.updateExplosionLifetime(deltaTime, grenadeEntity);
                continue;
            }

            this.updateGrenadeMovement(deltaTime, grenadeEntity);
            this.updateGrenadeFuse(deltaTime, grenadeEntity);
        }
    }

    private updateGrenadeMovement(deltaTime: number, grenadeEntity: number): void {
        const velocity = this.velocityComponentStore.get(grenadeEntity);

        if (
            velocity.currentVelocityX === 0 &&
            velocity.currentVelocityY === 0 &&
            velocity.baseVelocityX === 0 &&
            velocity.baseVelocityY === 0
        ) {
            this.movementIntentComponentStore.remove(grenadeEntity);
            return;
        }

        const travelTime = this.travelTimeComponentStore.get(grenadeEntity);
        travelTime.travelTime += deltaTime;

        if (travelTime.travelTime >= travelTime.totalTravelTime) {
            this.movementIntentComponentStore.remove(grenadeEntity);
            return;
        }

        const position = this.positionComponentStore.get(grenadeEntity);
        const direction = this.directionComponentStore.get(grenadeEntity);
        let dirX = direction.dirX;
        let dirY = direction.dirY;
        const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);

        if (magnitude > 0) {
            dirX = dirX / magnitude;
            dirY = dirY / magnitude;
        }

        this.movementIntentComponentStore.add(
            grenadeEntity,
            new MovementIntentComponent(
                position.x + dirX * velocity.currentVelocityX * deltaTime,
                position.y + dirY * velocity.currentVelocityY * deltaTime,
            ),
        );
    }

    private updateGrenadeFuse(deltaTime: number, grenadeEntity: number): void {
        const fuseTimer = this.fuseTimerComponentStore.get(grenadeEntity);
        fuseTimer.fuseTime += deltaTime;

        if (fuseTimer.fuseTime < fuseTimer.totalFuseTimer) {
            return;
        }

        this.triggerExplosion(grenadeEntity);
    }

    private triggerExplosion(grenadeEntity: number): void {
        if (this.grenadeExplosionComponentStore.has(grenadeEntity)) {
            return;
        }

        this.grenadeExplosionComponentStore.add(grenadeEntity, new GrenadeExplosionComponent());
        this.delayedDestructionComponentStore.add(grenadeEntity, new DelayedDestructionComponent(0.6));
        this.movementIntentComponentStore.remove(grenadeEntity);

        const shooterId = this.shotOriginComponentStore.getOrNull(grenadeEntity)?.shooterEntity;
        const grenadePosition = this.positionComponentStore.getOrNull(grenadeEntity);

        if (shooterId == null || !grenadePosition) {
            return;
        }

        const explosionProfile = this.getExplosionProfile(grenadeEntity);

        for (const targetEntity of explosionProfile.targetEntities) {
            const targetPosition = this.positionComponentStore.getOrNull(targetEntity);
            if (!targetPosition) continue;

            const distance = Math.hypot(grenadePosition.x - targetPosition.x, grenadePosition.y - targetPosition.y);
            if (distance > explosionProfile.radius) continue;

            const damage =
                explosionProfile.damage -
                (explosionProfile.damage / explosionProfile.radius) * distance;

            this.damageTakenIntentComponentStore.add(
                targetEntity,
                new DamageTakenIntentComponent(shooterId, damage),
            );
        }
    }

    private getExplosionProfile(grenadeEntity: number): ExplosionProfile {
        const grenade = this.grenadeComponentStore.get(grenadeEntity);
        return {
            damage: grenade.damage,
            radius: grenade.explosionRadius,
            targetEntities: grenade.firedByPlayer
                ? this.enemyComponentStore
                    .getAllEntities()
                    .filter((enemyEntity) => !this.enemyDeadComponentStore.has(enemyEntity))
                : this.playerComponentStore.getAllEntities(),
        };
    }

    private updateExplosionLifetime(deltaTime: number, grenadeEntity: number): void {
        const delayedDestruction = this.delayedDestructionComponentStore.getOrNull(grenadeEntity);
        if (!delayedDestruction) {
            return;
        }

        delayedDestruction.destructionTime += deltaTime;
        const previousTime = delayedDestruction.destructionTime - deltaTime;
        const destroyCondition =
            previousTime < delayedDestruction.totalDestructionTimer &&
            delayedDestruction.destructionTime >= delayedDestruction.totalDestructionTimer;

        if (!destroyCondition) {
            return;
        }

        this.animationComponentStore.remove(grenadeEntity);
        this.grenadeExplosionComponentStore.remove(grenadeEntity);
        this.delayedDestructionComponentStore.remove(grenadeEntity);
        this.entityFactory.destroyGrenade(grenadeEntity);
    }
}
