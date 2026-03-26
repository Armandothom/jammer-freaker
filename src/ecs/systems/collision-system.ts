import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { CollisionBoxComponent } from "../components/collision-box-component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

type Rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

export class CollisionSystem implements ISystem {
    constructor(
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private collisionBoxComponentStore: ComponentStore<CollisionBoxComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private grenadeComponentStore: ComponentStore<GrenadeComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private spriteManager: SpriteManager,
        private worldTilemapManager: WorldTilemapManager,
        private entityFactory: EntityFactory,
    ) { }

    update(_: number): void {
        for (const entity of this.movementIntentComponentStore.getAllEntities()) {
            const intent = this.movementIntentComponentStore.getOrNull(entity);
            if (!intent) continue;

            if (!this.positionComponentStore.has(entity)) {
                this.movementIntentComponentStore.remove(entity);
                continue;
            }

            if (!this.spriteComponentStore.has(entity)) {
                this.movementIntentComponentStore.remove(entity);
                continue;
            }

            if (!this.collisionBoxComponentStore.has(entity)) {
                continue;
            }

            const intendedRect = this.buildEntityRectFromIntent(entity, intent);
            const collidedEntity = this.getCollidingEntity(entity, intendedRect);
            if (collidedEntity !== null) {
                if (this.grenadeComponentStore.has(entity)) {
                    this.stopGrenade(entity);
                } else {
                    this.movementIntentComponentStore.remove(entity);
                }
                continue;
            }

            if (this.wouldCollideWithWall(intendedRect)) {
                this.handleWallCollision(entity);
            }
        }
    }

    private buildEntityRectFromIntent(
        entity: number,
        intent: MovementIntentComponent,
    ): Rect {
        const spriteComponent = this.spriteComponentStore.get(entity);
        const collisionBox = this.collisionBoxComponentStore.get(entity);

        const spriteProps = this.spriteManager.getSpriteProperties(
            spriteComponent.spriteName,
            spriteComponent.spriteSheetName,
        );

        const spriteWidth = spriteProps.sprite.originalRenderSpriteWidth;
        const spriteHeight = spriteProps.sprite.originalRenderSpriteHeight;

        const width = spriteWidth * collisionBox.widthFactor;
        const height = spriteHeight * collisionBox.heightFactor;

        const offsetX = spriteWidth * collisionBox.offsetX;
        const offsetY = spriteHeight * collisionBox.offsetY;

        return {
            left: intent.x + offsetX,
            right: intent.x + offsetX + width,
            top: intent.y + offsetY,
            bottom: intent.y + offsetY + height,
        };
    }

    private buildEntityRectFromPosition(entity: number): Rect {
        const position = this.positionComponentStore.get(entity);
        const spriteComponent = this.spriteComponentStore.get(entity);
        const collisionBox = this.collisionBoxComponentStore.get(entity);

        const spriteProps = this.spriteManager.getSpriteProperties(
            spriteComponent.spriteName,
            spriteComponent.spriteSheetName,
        );

        const spriteWidth = spriteProps.sprite.originalRenderSpriteWidth;
        const spriteHeight = spriteProps.sprite.originalRenderSpriteHeight;

        const width = spriteWidth * collisionBox.widthFactor;
        const height = spriteHeight * collisionBox.heightFactor;

        const offsetX = spriteWidth * collisionBox.offsetX;
        const offsetY = spriteHeight * collisionBox.offsetY;

        return {
            left: position.x + offsetX,
            right: position.x + offsetX + width,
            top: position.y + offsetY,
            bottom: position.y + offsetY + height,
        };
    }

    private getCollidingEntity(self: number, intendedRect: Rect): number | null {
        const isProjectile = this.projectileComponentStore.has(self);
        const isGrenade = this.grenadeComponentStore.has(self);
        const shooterId = (isProjectile || isGrenade)
            ? this.shotOriginComponentStore.getOrNull(self)?.shooterEntity ?? null
            : null;

        for (const other of this.collisionBoxComponentStore.getAllEntities()) {
            if (other === self) continue;
            if (!this.positionComponentStore.has(other)) continue;
            if (!this.spriteComponentStore.has(other)) continue;

            if (isProjectile) {
                if (other === shooterId) continue;
                if (this.projectileComponentStore.has(other) || this.grenadeComponentStore.has(other)) continue;
            } else if (isGrenade) {
                if (other === shooterId) continue;
                if (this.projectileComponentStore.has(other) || this.grenadeComponentStore.has(other)) continue;
            } else if (this.projectileComponentStore.has(other) || this.grenadeComponentStore.has(other)) {
                continue;
            }

            const otherCollision = this.collisionBoxComponentStore.get(other);
            if (!otherCollision.collides) continue;

            const otherRect = this.buildEntityRectFromPosition(other);

            if (this.intersects(intendedRect, otherRect)) {
                return other;
            }
        }

        return null;
    }

    private wouldCollideWithWall(intendedRect: Rect): boolean {
        const tileSize = this.worldTilemapManager.tileSize;

        const startTileX = Math.floor(intendedRect.left / tileSize);
        const endTileX = Math.floor((intendedRect.right - 1) / tileSize);
        const startTileY = Math.floor(intendedRect.top / tileSize);
        const endTileY = Math.floor((intendedRect.bottom - 1) / tileSize);


        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                if (this.isOutOfTileBounds(tileX, tileY)) {
                    return true;
                }

                if (!this.worldTilemapManager.isWallSolid(tileX, tileY)) {
                    continue;
                }

                const wallRect = this.buildWallRect(tileX, tileY, tileSize);

                if (this.intersects(intendedRect, wallRect)) {
                    return true;
                }
            }
        }

        return false;
    }

    private buildWallRect(tileX: number, tileY: number, tileSize: number): Rect {
        const { worldX, worldY } = this.worldTilemapManager.tileToWorld(tileX, tileY);

        return {
            left: worldX,
            right: worldX + tileSize,
            top: worldY,
            bottom: worldY + tileSize,
        };
    }

    private isOutOfTileBounds(tileX: number, tileY: number): boolean {
        const bounds = this.worldTilemapManager.worldMaxBoundsTiles;

        return (
            tileX < bounds.left ||
            tileY < bounds.top ||
            tileX >= bounds.right ||
            tileY >= bounds.bottom
        );
    }

    private intersects(a: Rect, b: Rect): boolean {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

    private handleWallCollision(entity: number): void {
        if (this.grenadeComponentStore.has(entity)) {
            this.stopGrenade(entity);
            return;
        }

        if (!this.projectileComponentStore.has(entity)) {
            this.movementIntentComponentStore.remove(entity);
            return;
        }

        this.entityFactory.destroyProjectile(entity);
        // projectile destroyed at wall anim
    }

    private stopGrenade(entity: number): void {
        this.movementIntentComponentStore.remove(entity);

        if (this.velocityComponentStore.has(entity)) {
            const velocity = this.velocityComponentStore.get(entity);
            velocity.baseVelocityX = 0;
            velocity.baseVelocityY = 0;
            velocity.currentVelocityX = 0;
            velocity.currentVelocityY = 0;
        }

        if (this.collisionBoxComponentStore.has(entity)) {
            this.collisionBoxComponentStore.get(entity).collides = false;
        }
    }
}
