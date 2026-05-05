import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { PARTICLE_TYPE_BLOOD, PARTICLE_TYPE_DUST } from "../../game/renderer/renderer-engine.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { CorpseComponent } from "../components/corpse.component.js";
import { DamageDealtComponent } from "../components/damage-dealt.component.js";
import { DamageTakenIntentComponent } from "../components/damage-taken-intent.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionHitBoxComponent } from "../components/grenade-explosion-hitbox.component.js";
import { HitBoxComponent } from "../components/hit-box-component.js";
import { ItemBoxComponent } from "../components/item-box.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { ParticlesComponent } from "../components/particles.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ShapeHitMemoryComponent } from "../components/shape-hitmemory-component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import type { EnemyType } from "../components/types/enemy-type.js";
import { WeaponType } from "../components/types/weapon-config.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";
import { Rect } from "./types/rect.type.js";

type DamageSource = EnemyType | WeaponType;

export class HitDetectionSystem implements ISystem {
    constructor(
        private spriteManager: SpriteManager,
        private entityFactory: EntityFactory,
        private hitBoxComponentStore: ComponentStore<HitBoxComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
        private damageDealtComponentStore: ComponentStore<DamageDealtComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private damageTakenIntentComponentStore: ComponentStore<DamageTakenIntentComponent>,
        private itemBoxComponentStore: ComponentStore<ItemBoxComponent>,
        private corpseComponentStore: ComponentStore<CorpseComponent>,
        private grenadeExplosionHitBoxComponentStore: ComponentStore<GrenadeExplosionHitBoxComponent>,
        private shapeHitMemoryComponentStore: ComponentStore<ShapeHitMemoryComponent>,
        private particlesComponentStore: ComponentStore<ParticlesComponent>,
    ) { }

    private queueDamageTakenIntent(targetEntity: number, damagingEntity: number, damageSource: DamageSource, damage: number) {
        const existingDamageIntent = this.damageTakenIntentComponentStore.getOrNull(targetEntity);
        if (existingDamageIntent) {
            existingDamageIntent.accumulate(damagingEntity, damageSource, damage);
            return;
        }

        this.damageTakenIntentComponentStore.add(
            targetEntity,
            new DamageTakenIntentComponent(damagingEntity, damageSource, damage),
        );
    }

    private resolveDamageSource(damagingEntity: number, fallback: DamageSource = WeaponType.PISTOL): DamageSource {
        const enemy = this.enemyComponentStore.getOrNull(damagingEntity);

        if (enemy) {
            return enemy.enemyType;
        }

        return fallback;
    }

    update(deltaTime: number): void {
        for (const entity of this.movementIntentComponentStore.getAllEntities()) {
            const intent = this.movementIntentComponentStore.getOrNull(entity);

            if (!intent) continue;
            if (!this.hitBoxComponentStore.has(entity)) {
                continue;
            }
            if (!this.hitBoxComponentStore.get(entity).hitboxOn) {
                continue;
            }

            const intendedRect = this.buildEntityRectFromIntent(entity, intent);
            const hitEntities = this.getHittingEntities(entity, intendedRect);

            if (hitEntities.length === 0) {
                continue;
            }

            this.handleEntityHits(entity, hitEntities);
        }
    }

    private buildEntityRectFromIntent(
        entity: number,
        intent: MovementIntentComponent,
    ): Rect {
        return this.buildEntityRect(entity, intent.x, intent.y);
    }

    private buildEntityRectFromPosition(entity: number): Rect {
        const position = this.positionComponentStore.get(entity);
        return this.buildEntityRect(entity, position.x, position.y);
    }

    private buildEntityRect(entity: number, baseX: number, baseY: number): Rect {
        const spriteComponent = this.spriteComponentStore.get(entity);
        const hitBox = this.hitBoxComponentStore.get(entity);
        const spriteProps = this.spriteManager.getSpriteProperties(
            spriteComponent.spriteName,
            spriteComponent.spriteSheetName,
        );

        const width = hitBox.width
            ?? (spriteComponent.hasExplicitWidth ? spriteComponent.width : spriteProps.sprite.originalRenderSpriteWidth);
        const height = hitBox.height
            ?? (spriteComponent.hasExplicitHeight ? spriteComponent.height : spriteProps.sprite.originalRenderSpriteHeight);
        const aimComponent = this.aimShootingComponentStore.getOrNull(entity);

        if (!aimComponent) {
            return {
                left: baseX,
                right: baseX + width,
                top: baseY,
                bottom: baseY + height,
            };
        }

        const angle = aimComponent.aimAngle;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const isMirrored = cos < 0;
        const pivot = {
            x: 0,
            y: isMirrored ? height - aimComponent.pivotPointSprite : aimComponent.pivotPointSprite,
        };
        const localQuad = [
            { x: 0, y: 0 },
            { x: 0, y: height },
            { x: width, y: 0 },
            { x: width, y: height },
        ];
        const worldPoints = localQuad.map((point) => {
            const dx = point.x - pivot.x;
            const dy = point.y - pivot.y;
            return {
                x: baseX + (dx * cos - dy * sin),
                y: baseY + (dx * sin + dy * cos),
            };
        });

        return {
            left: Math.min(...worldPoints.map((point) => point.x)),
            right: Math.max(...worldPoints.map((point) => point.x)),
            top: Math.min(...worldPoints.map((point) => point.y)),
            bottom: Math.max(...worldPoints.map((point) => point.y)),
        };
    }

    private intersects(a: Rect, b: Rect): boolean {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

    private getHittingEntities(self: number, intendedRect: Rect): number[] {
        const isProjectile = this.projectileComponentStore.has(self);
        const isGrenade = this.grenadeComponentStore.has(self);
        const shooterId = this.shotOriginComponentStore.getOrNull(self)?.shooterEntity ?? null;
        const hitEntities: number[] = [];

        if (isGrenade) {
            return hitEntities;
        }

        for (const other of this.hitBoxComponentStore.getAllEntities()) {
            if (other === self) continue;
            if (!this.positionComponentStore.has(other)) continue;
            if (!this.spriteComponentStore.has(other)) continue;

            if (isProjectile) {
                if (other === shooterId) continue;
                if (this.projectileComponentStore.has(other) || this.grenadeComponentStore.has(other)) continue;
            } else if (
                this.projectileComponentStore.has(other) ||
                this.grenadeComponentStore.has(other)
            ) {
                continue;
            }

            const otherIsPlayer = this.playerComponentStore.has(other);
            const otherIsEnemy = this.enemyComponentStore.has(other);
            const otherIsItemBox = this.itemBoxComponentStore.has(other);
            const otherIsCorpse = this.corpseComponentStore.has(other);
            if (!otherIsPlayer && !otherIsEnemy && !otherIsItemBox && !otherIsCorpse) continue;
            if (!this.isValidDamageTarget(self, other)) continue;

            const otherCollision = this.hitBoxComponentStore.get(other);
            if (!otherCollision.hitboxOn) continue;

            const otherRect = this.buildEntityRectFromPosition(other);

            if (this.intersects(intendedRect, otherRect)) {
                hitEntities.push(other);
            }
        }

        return hitEntities;
    }

    private handleEntityHits(entity: number, hitEntities: number[]): boolean {
        const shotOrigin = this.shotOriginComponentStore.getOrNull(entity);
        const shooterId = shotOrigin?.shooterEntity;

        if (this.projectileComponentStore.has(entity)) {
            const hitEntity = hitEntities[0];
            if (shooterId !== undefined) {
                const projectile = this.projectileComponentStore.get(entity);
                const projectileDamage = projectile.damage;
                const damageSource = shotOrigin?.damageSource ?? this.resolveDamageSource(shooterId);
                this.queueDamageTakenIntent(hitEntity, shooterId, damageSource, projectileDamage);
            }
            const isEnemy = this.enemyComponentStore.has(hitEntity);
            const isPlayer = this.playerComponentStore.has(hitEntity);
            const isBox = this.itemBoxComponentStore.has(hitEntity);
            if (isEnemy || isPlayer) {
                const projectileLastPosition = this.positionComponentStore.get(entity);
                const projectileOrigin = this.shotOriginComponentStore.get(entity);
                const directionX = projectileOrigin.shotStartX - projectileLastPosition.x;
                const directionY = projectileOrigin.shotStartY - projectileLastPosition.y;
                const directionMagnitude = Math.hypot(directionX, directionY);
                const emissionDirection = directionMagnitude > 0.0001
                    ? {
                        x: directionX / directionMagnitude,
                        y: directionY / directionMagnitude,
                    }
                    : { x: 1, y: 0 };

                this.particlesComponentStore.add(entity, new ParticlesComponent(projectileLastPosition.x, projectileLastPosition.y, emissionDirection, PARTICLE_TYPE_BLOOD, 9));
            }
            if (isBox) {
                const projectileLastPosition = this.positionComponentStore.get(entity);
                const projectileOrigin = this.shotOriginComponentStore.get(entity);
                const directionX = projectileOrigin.shotStartX - projectileLastPosition.x;
                const directionY = projectileOrigin.shotStartY - projectileLastPosition.y;
                const directionMagnitude = Math.hypot(directionX, directionY);
                const emissionDirection = directionMagnitude > 0.0001
                    ? {
                        x: directionX / directionMagnitude,
                        y: directionY / directionMagnitude,
                    }
                    : { x: 1, y: 0 };

                this.particlesComponentStore.add(entity, new ParticlesComponent(projectileLastPosition.x, projectileLastPosition.y, emissionDirection, PARTICLE_TYPE_DUST, 9));
            }

            this.entityFactory.destroyProjectile(entity);
            return true;
        }

        if (shooterId === undefined || !this.damageDealtComponentStore.has(entity)) {
            return false;
        }

        const damage = this.damageDealtComponentStore.get(entity).damage;
        const damageSource = shotOrigin?.damageSource ?? this.resolveDamageSource(shooterId);
        const canHitMultipleTargets = this.grenadeExplosionHitBoxComponentStore.has(entity);
        const hitMemory = this.shapeHitMemoryComponentStore.getOrNull(entity);
        let appliedDamage = false;

        for (const hitEntity of hitEntities) {

            if (!this.isValidDamageTarget(entity, hitEntity)) {
                continue;
            }

            if (hitMemory?.alreadyHit.has(hitEntity)) {
                continue;
            }

            this.queueDamageTakenIntent(hitEntity, shooterId, damageSource, damage);
            hitMemory?.alreadyHit.add(hitEntity);
            appliedDamage = true;

            if (!canHitMultipleTargets) {
                break;
            }
        }

        if (!appliedDamage || canHitMultipleTargets) {
            return appliedDamage;
        }

        const hitbox = this.hitBoxComponentStore.get(entity);
        hitbox.hitboxOn = false;
        return true;
    }

    private isValidDamageTarget(entity: number, targetEntity: number) {
        const targetIsPlayer = this.playerComponentStore.has(targetEntity);
        const targetIsEnemy = this.enemyComponentStore.has(targetEntity);
        const targetIsItemBox = this.itemBoxComponentStore.has(targetEntity);
        const targetIsCorpse = this.corpseComponentStore.has(targetEntity);

        if (this.grenadeExplosionHitBoxComponentStore.has(entity)) {
            return targetIsPlayer || targetIsEnemy || targetIsItemBox || targetIsCorpse;
        }

        if (this.projectileComponentStore.has(entity)) {
            const projectile = this.projectileComponentStore.get(entity);
            return (
                (projectile.firedByPlayer && targetIsEnemy) ||
                (projectile.firedByPlayer && targetIsItemBox) ||
                (!projectile.firedByPlayer && targetIsPlayer)
            );
        }

        const shooterId = this.shotOriginComponentStore.getOrNull(entity)?.shooterEntity;
        if (shooterId == null) {
            return false;
        }

        const attackerIsPlayer = this.playerComponentStore.has(shooterId);
        return attackerIsPlayer
            ? (targetIsEnemy || targetIsItemBox)
            : targetIsPlayer;
    }
}
