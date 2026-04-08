import { AnimationComponent } from "../components/animation.component.js";
import { DamageTakenIntentComponent } from "../components/damage-taken-intent.component.js";
import { DelayedDestructionComponent } from "../components/delayed-destruction.component.js";
import { DirectionComponent } from "../components/direction-component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { FuseTimerComponent } from "../components/fuse-timer.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { GrenadeTravelComponent } from "../components/grenade-travel.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

type ExplosionProfile = {
    damage: number;
    radius: number;
    targetEntities: number[];
};

const GRENADE_SPRITE_WIDTH = 14;
const GRENADE_SPRITE_HEIGHT = 16;
const GRENADE_FALL_RENDER_SPEED = 240;

export class GrenadeUpdateSystem implements ISystem {
    constructor(
        private entityFactory: EntityFactory,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private directionComponentStore: ComponentStore<DirectionComponent>,
        private fuseTimerComponentStore: ComponentStore<FuseTimerComponent>,
        private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private damageTakenIntentComponentStore: ComponentStore<DamageTakenIntentComponent>,
        private grenadeExplosionComponentStore: ComponentStore<GrenadeExplosionComponent>,
        private delayedDestructionComponentStore: ComponentStore<DelayedDestructionComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
        private grenadeTravelComponent: ComponentStore<GrenadeTravelComponent>,
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
        const grenadeTravel = this.grenadeTravelComponent.get(grenadeEntity);
        const velocity = this.velocityComponentStore.get(grenadeEntity);
        if (this.isGrenadeStopped(velocity)) {
            grenadeTravel.currentRenderOffsetY = Math.max(
                0,
                grenadeTravel.currentRenderOffsetY - GRENADE_FALL_RENDER_SPEED * deltaTime,
            );
            this.movementIntentComponentStore.remove(grenadeEntity);
            return;
        }

        grenadeTravel.travelTime = Math.min(
            grenadeTravel.travelTime + deltaTime,
            grenadeTravel.totalTravelTime,
        );

        if (grenadeTravel.totalTravelTime <= 0 || grenadeTravel.travelTime >= grenadeTravel.totalTravelTime) {
            grenadeTravel.currentRenderOffsetY = 0;
            const groundedTarget = this.toSpriteTopLeft(grenadeTravel.targetX, grenadeTravel.targetY);
            this.movementIntentComponentStore.add(
                grenadeEntity,
                new MovementIntentComponent(groundedTarget.x, groundedTarget.y),
            );
            this.stopGrenadeTravel(velocity);
            return;
        }

        const progress = grenadeTravel.travelTime / grenadeTravel.totalTravelTime;

        const groundX = grenadeTravel.originX + (grenadeTravel.targetX - grenadeTravel.originX) * progress;
        const groundY = grenadeTravel.originY + (grenadeTravel.targetY - grenadeTravel.originY) * progress;
        grenadeTravel.currentRenderOffsetY = this.calculateRenderOffsetY(grenadeTravel);
        const groundedPosition = this.toSpriteTopLeft(groundX, groundY);

        this.movementIntentComponentStore.add(
            grenadeEntity,
            new MovementIntentComponent(groundedPosition.x, groundedPosition.y),
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

        this.projectGrenadeToVisiblePosition(grenadeEntity);
        this.entityFactory.destroyShadow(grenadeEntity);
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

    private toSpriteTopLeft(centerX: number, centerY: number): { x: number; y: number } {
        return {
            x: centerX - (GRENADE_SPRITE_WIDTH / 2),
            y: centerY - (GRENADE_SPRITE_HEIGHT / 2),
        };
    }

    private isGrenadeStopped(velocity: VelocityComponent): boolean {
        return velocity.currentVelocityX === 0
            && velocity.currentVelocityY === 0
            && velocity.baseVelocityX === 0
            && velocity.baseVelocityY === 0;
    }

    private stopGrenadeTravel(velocity: VelocityComponent): void {
        velocity.baseVelocityX = 0;
        velocity.baseVelocityY = 0;
        velocity.currentVelocityX = 0;
        velocity.currentVelocityY = 0;
    }

    private projectGrenadeToVisiblePosition(grenadeEntity: number): void {
        const grenadeTravel = this.grenadeTravelComponent.getOrNull(grenadeEntity);
        const grenadePosition = this.positionComponentStore.getOrNull(grenadeEntity);
        const velocity = this.velocityComponentStore.getOrNull(grenadeEntity);

        if (!grenadeTravel || !grenadePosition) {
            return;
        }

        if (velocity && this.isGrenadeStopped(velocity)) {
            grenadePosition.y -= grenadeTravel.currentRenderOffsetY;
            return;
        }

        if (grenadeTravel.totalTravelTime <= 0) {
            return;
        }

        const progress = Math.min(1, grenadeTravel.travelTime / grenadeTravel.totalTravelTime);
        const groundX = grenadeTravel.originX + (grenadeTravel.targetX - grenadeTravel.originX) * progress;
        const groundY = grenadeTravel.originY + (grenadeTravel.targetY - grenadeTravel.originY) * progress;
        const visiblePosition = this.toSpriteTopLeft(
            groundX,
            groundY - grenadeTravel.currentRenderOffsetY,
        );

        grenadePosition.x = visiblePosition.x;
        grenadePosition.y = visiblePosition.y;
    }

    private calculateRenderOffsetY(grenadeTravel: GrenadeTravelComponent): number {
        if (grenadeTravel.totalTravelTime <= 0) {
            return 0;
        }

        const progress = Math.min(1, grenadeTravel.travelTime / grenadeTravel.totalTravelTime);
        return 4 * grenadeTravel.maxHeight * progress * (1 - progress);
    }
}
