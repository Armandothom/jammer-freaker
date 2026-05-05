import { SOUND_KEYS, SOUND_VOLUME } from "../../game/asset-manager/consts/sound-mapped.values.js";
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AwaitingAnimationEndComponent } from "../components/awaiting-animation-end.component.js";
import { FuseTimerComponent } from "../components/fuse-timer.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionHitBoxComponent } from "../components/grenade-explosion-hitbox.component.js";
import { GrenadeTravelComponent } from "../components/grenade-travel.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

const GRENADE_FALL_RENDER_SPEED = 240;

export class GrenadeUpdateSystem implements ISystem {
    constructor(
        private entityFactory: EntityFactory,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private fuseTimerComponentStore: ComponentStore<FuseTimerComponent>,
        private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
        private grenadeExplosionHitBoxComponentStore: ComponentStore<GrenadeExplosionHitBoxComponent>,
        private awaitingAnimationEndComponentStore: ComponentStore<AwaitingAnimationEndComponent>,
        private grenadeTravelComponent: ComponentStore<GrenadeTravelComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private soundEventBus: SoundEventBus,
    ) {
    }

    update(deltaTime: number): void {
        for (const grenadeEntity of this.grenadeComponentStore.getAllEntities()) {
            this.updateGrenadeMovement(deltaTime, grenadeEntity);
            this.updateGrenadeFuse(deltaTime, grenadeEntity);
        }

        this.updateExplosionHitBoxes();
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
            const groundedTarget = this.toSpriteTopLeft(
                grenadeEntity,
                grenadeTravel.targetX,
                grenadeTravel.targetY,
            );
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
        const groundedPosition = this.toSpriteTopLeft(grenadeEntity, groundX, groundY);

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
        this.projectGrenadeToVisiblePosition(grenadeEntity);

        const grenade = this.grenadeComponentStore.getOrNull(grenadeEntity);
        const grenadePosition = this.positionComponentStore.getOrNull(grenadeEntity);
        const grenadeSprite = this.spriteComponentStore.getOrNull(grenadeEntity);
        const shooterId = this.shotOriginComponentStore.getOrNull(grenadeEntity)?.shooterEntity;

        if (!grenade || !grenadePosition || !grenadeSprite || shooterId == null) {
            this.entityFactory.destroyGrenade(grenadeEntity);
            return;
        }

        const explosionX = grenadePosition.x + (grenadeSprite.width - grenade.explosionRadius) / 2;
        const explosionY = grenadePosition.y + (grenadeSprite.height - grenade.explosionRadius) / 2;

        this.soundEventBus.emitSound({
            key: SOUND_KEYS.GRENADE_EXPLOSION,
            volume: SOUND_VOLUME.GRENADE_EXPLOSION,
        })
        this.entityFactory.createHitBox(
            explosionX,
            explosionY,
            grenade.explosionRadius,
            grenade.explosionRadius,
            {
                animationName: AnimationName.GRENADE_EXPLOSION,
                spriteName: SpriteName.GRENADE_EXPLOSION_1,
                spriteSheetName: SpriteSheetName.GRENADE_EXPLOSION,
                shooterEntityId: shooterId,
                damage: grenade.damage,
                zLayer: 4,
                loop: false,
                awaitAnimationEnd: AnimationName.GRENADE_EXPLOSION,
                trackHits: true,
                markAsGrenadeExplosion: true,
            },
        );

        this.entityFactory.destroyGrenade(grenadeEntity);
    }

    private updateExplosionHitBoxes(): void {
        for (const explosionHitBoxEntity of this.grenadeExplosionHitBoxComponentStore.getAllEntities()) {
            const awaitingAnimation = this.awaitingAnimationEndComponentStore.getOrNull(explosionHitBoxEntity);

            if (!awaitingAnimation || awaitingAnimation.resolved) {
                this.entityFactory.destroyHitBox(explosionHitBoxEntity);
            }
        }
    }

    private toSpriteTopLeft(grenadeEntity: number, centerX: number, centerY: number): { x: number; y: number } {
        const sprite = this.spriteComponentStore.get(grenadeEntity);
        return {
            x: centerX - (sprite.width / 2),
            y: centerY - (sprite.height / 2),
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
            grenadeEntity,
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
