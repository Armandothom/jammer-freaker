import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { DamageTakenIntentComponent } from "../components/damage-taken-intent.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { HitBoxComponent } from "../components/hit-box-component.js";
import { ItemBoxComponent } from "../components/item-box.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";
import { Rect } from "./types/rect.type.js";

export class HitDetectionSystem implements ISystem {
    constructor(
        private spriteManager: SpriteManager,
        private entityFactory: EntityFactory,
        private hitBoxComponentStore: ComponentStore<HitBoxComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private damageTakenIntentComponentStore: ComponentStore<DamageTakenIntentComponent>,
        private itemBoxComponentStore: ComponentStore<ItemBoxComponent>,

    ) { }
    update(deltaTime: number): void {
        for (const entity of this.movementIntentComponentStore.getAllEntities()) {
            const intent = this.movementIntentComponentStore.getOrNull(entity);

            if (!intent) continue;
            if (!this.hitBoxComponentStore.has(entity)) {
                continue;
            }

            const intendedRect = this.buildEntityRectFromIntent(entity, intent);
            const hitEntity = this.getHittingEntity(entity, intendedRect);

            if (hitEntity != null) {
                if (this.handleProjectileEntityHit(entity, hitEntity)) {
                    continue;
                }
            }
        }
    }

    private buildEntityRectFromIntent(
        entity: number,
        intent: MovementIntentComponent,
    ): Rect {
        const spriteComponent = this.spriteComponentStore.get(entity);
        const hitBox = this.hitBoxComponentStore.get(entity);

        const spriteProps = this.spriteManager.getSpriteProperties(
            spriteComponent.spriteName,
            spriteComponent.spriteSheetName,
        );

        const spriteWidth = spriteProps.sprite.originalRenderSpriteWidth;
        const spriteHeight = spriteProps.sprite.originalRenderSpriteHeight;

        return {
            left: intent.x,
            right: intent.x + spriteWidth,
            top: intent.y,
            bottom: intent.y + spriteHeight,
        };
    }

    private buildEntityRectFromPosition(entity: number): Rect {
        const position = this.positionComponentStore.get(entity);
        const spriteComponent = this.spriteComponentStore.get(entity);
        const hitBox = this.hitBoxComponentStore.get(entity);

        const spriteProps = this.spriteManager.getSpriteProperties(
            spriteComponent.spriteName,
            spriteComponent.spriteSheetName,
        );

        const spriteWidth = spriteProps.sprite.originalRenderSpriteWidth;
        const spriteHeight = spriteProps.sprite.originalRenderSpriteHeight;

        const width = spriteWidth;
        const height = spriteHeight;

        return {
            left: position.x,
            right: position.x + width,
            top: position.y,
            bottom: position.y + height,
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

    private getHittingEntity(self: number, intendedRect: Rect): number | null {
        const isProjectile = this.projectileComponentStore.has(self);
        const isGrenade = this.grenadeComponentStore.has(self);
        const shooterId = (isProjectile || isGrenade)
            ? this.shotOriginComponentStore.getOrNull(self)?.shooterEntity ?? null
            : null;

        if (isGrenade) {
            return null;
        }

        for (const other of this.hitBoxComponentStore.getAllEntities()) {
            if (other === self) continue;
            if (!this.positionComponentStore.has(other)) continue;
            if (!this.spriteComponentStore.has(other)) continue;

            if (isProjectile) {
                if (other === shooterId) continue;
                if (this.projectileComponentStore.has(other) || this.grenadeComponentStore.has(other)) continue;
            } else if (this.projectileComponentStore.has(other) || this.grenadeComponentStore.has(other)) {
                continue;
            }

            const otherCollision = this.hitBoxComponentStore.get(other);
            if (!otherCollision.hitboxOn) continue;

            const otherRect = this.buildEntityRectFromPosition(other);

            if (this.intersects(intendedRect, otherRect)) {
                return other;
            }
        }

        return null;
    }

    private handleProjectileEntityHit(entity: number, hitEntity: number): boolean {
        if (!this.projectileComponentStore.has(entity)) {
            return false;
        }

        const shooterId = this.shotOriginComponentStore.getOrNull(entity)?.shooterEntity;
        if (shooterId !== undefined) {
            const projectile = this.projectileComponentStore.get(entity);
            const projectileDamage = projectile.damage;
            const targetIsPlayer = this.playerComponentStore.has(hitEntity);
            const targetIsEnemy = this.enemyComponentStore.has(hitEntity);
            const targetIsItemBox = this.itemBoxComponentStore.has(hitEntity);
            const validTarget =
                (projectile.firedByPlayer && targetIsEnemy) ||
                (projectile.firedByPlayer && targetIsItemBox) ||
                (!projectile.firedByPlayer && targetIsPlayer);

            if (validTarget && !this.damageTakenIntentComponentStore.has(hitEntity)) {
                this.damageTakenIntentComponentStore.add(hitEntity, new DamageTakenIntentComponent(shooterId, projectileDamage));
            }
        }

        this.entityFactory.destroyProjectile(entity);
        // destroy projectile anim after
        return true;
    }
}
