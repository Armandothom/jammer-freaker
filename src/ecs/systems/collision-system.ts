import { PositionComponent } from "../components/position.component.js";
import { CollisionComponent } from "../components/collision-component.js";
import { ComponentStore } from "../core/component-store.js";
import { Rect } from "./types/rect.type.js";
import { ISystem } from "./system.interface.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { HealthComponent } from "../components/health.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { EnemiesKilledComponent } from "../components/enemies-killed.component.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { TilemapTile } from "../../game/world/types/tilemap-tile.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class CollisionSystem implements ISystem {
    constructor(
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private collisionComponentStore: ComponentStore<CollisionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private spriteManager: SpriteManager,
        private entityFactory: EntityFactory,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
        private enemiesKilledComponentStore: ComponentStore<EnemiesKilledComponent>,
        private worldTilemapManager: WorldTilemapManager,
    ) {

    }

    update(deltaTime: number): void {
        const playerEntityId = this.playerComponentStore.getAllEntities()[0];
        for (const entity of this.movementIntentComponentStore.getAllEntities()) {
            const intent = this.movementIntentComponentStore.getOrNull(entity);
            if (!intent) {
                continue;
            };

            const spriteComponent = this.spriteComponentStore.get(entity);

            if (!spriteComponent) {
                console.error(`No sprite found for entity ${entity}`);
                continue;
            }

            const spriteSheetOriginProperties = this.spriteManager.getSpriteSheetProperties(spriteComponent.spriteSheetName);
            const wouldCollideCheckEntity = this.wouldCollideAABB(intent, entity, spriteSheetOriginProperties.afterRenderSpriteCellSize);
            const wallCollisionCheck = this.wallCollision(intent, entity, spriteSheetOriginProperties.afterRenderSpriteCellSize);

            if (wouldCollideCheckEntity.wouldCollide) {
                this.movementIntentComponentStore.remove(entity); // Cancelamento do intent pra questões de movimento            
                if (this.projectileComponentStore.has(entity)) {
                    const shotOrigin = this.shotOriginComponentStore.get(entity);
                    const shooterId = shotOrigin.shooterEntity;
                    const target = wouldCollideCheckEntity.collidingEntity;

                    if (shooterId == null || target == null) return;
                    if (target === shooterId) {
                        return; // Ignora colisão com o próprio criador
                    }

                    const targetPlayer = this.playerComponentStore.has(target);
                    const targetEnemy = this.enemyComponentStore.has(target);

                    const projectileFromPlayer = this.playerComponentStore.has(shooterId);
                    const projectileFromEnemy = this.enemyComponentStore.has(shooterId);

                    const validTarget = (projectileFromPlayer && targetEnemy) ||
                        (projectileFromEnemy && targetPlayer);

                    if (validTarget) {
                        const targetDamage = this.healthComponentStore.get(target).takeDamage(20);
                        //console.log("target x HP:", target, this.healthComponentStore.get(target).hp);

                        if (this.healthComponentStore.get(target).hp <= 0) {

                            if (targetEnemy) {
                                this.enemiesKilledComponentStore.add(target, new EnemiesKilledComponent());
                                this.entityFactory.destroyEnemy(target);
                            } else if (targetPlayer) {
                                //console.log("Player dead - Game over");
                            }
                        }
                    }
                    this.entityFactory.destroyProjectile(entity);
                }
            }

            const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
            if (wallCollisionCheck) {
                this.movementIntentComponentStore.remove(entity);
                if (this.projectileComponentStore.has(entity)) {
                    this.entityFactory.destroyProjectile(entity);
                }
            }

            if (intent.x > canvas.width - spriteSheetOriginProperties.afterRenderSpriteCellSize  || intent.y > canvas.height - spriteSheetOriginProperties.afterRenderSpriteCellSize || intent.x < 0 || intent.y < 0) {
                this.movementIntentComponentStore.remove(entity);
            }

        }
    }

    private wouldCollideAABB(
        intent: MovementIntentComponent,
        self: number,
        tileSize: number
    ) {
        const intendedMovement = {
            left: intent.x,
            right: intent.x + tileSize,
            top: intent.y,
            bottom: intent.y + tileSize,
        };

        const shotOrigin = this.shotOriginComponentStore.getOrNull(self);
        const shooterId = shotOrigin?.shooterEntity;

        for (const other of this.collisionComponentStore.getAllEntities()) {
            if (other === self) continue;
            if (other === shooterId) continue; // Ignores who made the shot

            const otherShotOrigin = this.shotOriginComponentStore.getOrNull(other);

            if (
                (shooterId && otherShotOrigin?.shooterEntity === shooterId) ||
                (otherShotOrigin?.shooterEntity === self)
            ) {
                continue;
            } // Ignores self with shot

            const collision = this.collisionComponentStore.get(other);
            const pos = this.positionComponentStore.get(other);
            if (!collision || !collision.collides) continue;


            if (!pos) continue;

            const otherSprite = this.spriteComponentStore.getOrNull(other);
            const otherTileSize = otherSprite
                ? this.spriteManager.getSpriteSheetProperties(otherSprite.spriteSheetName)?.afterRenderSpriteCellSize ?? tileSize
                : tileSize;

            const current = {
                left: pos.x,
                right: pos.x + otherTileSize,
                top: pos.y,
                bottom: pos.y + otherTileSize,
            };

            const intersect =
                intendedMovement.left < current.right &&
                intendedMovement.right > current.left &&
                intendedMovement.top < current.bottom &&
                intendedMovement.bottom > current.top;

            if (intersect) {
                return {
                    wouldCollide: true,
                    collidingEntity: other
                }
            };
        }

        return {
            wouldCollide: false,
            collidingEntity: null
        };
    }

    private wallCollision(
        intent: MovementIntentComponent,
        self: number,
        tileSize: number,
    ) {

        const intendedMovement = {
            left: intent.x,
            right: intent.x + tileSize,
            top: intent.y,
            bottom: intent.y + tileSize,
        };

        const wallPosition = this.worldTilemapManager._generatedWalls;
        const tilemapProperties = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN);

        for (const { x, y } of wallPosition) {
            // const key = `${x * wallWidth}_${y * wallHeight}`;
            // coordWallMap.set(key, true);
            const wallRect = {
                left: (x * tilemapProperties.afterRenderSpriteCellSize + 6),
                right: (x * tilemapProperties.afterRenderSpriteCellSize + tilemapProperties.afterRenderSpriteCellSize - 6),
                top: (y * tilemapProperties.afterRenderSpriteCellSize + 6),
                bottom: (y * tilemapProperties.afterRenderSpriteCellSize + tilemapProperties.afterRenderSpriteCellSize - 6)
            }

            const intersect =
                intendedMovement.left < wallRect.right &&
                intendedMovement.right > wallRect.left &&
                intendedMovement.top < wallRect.bottom &&
                intendedMovement.bottom > wallRect.top;

            if (intersect) {
                return true;
            }
        }





    }
}