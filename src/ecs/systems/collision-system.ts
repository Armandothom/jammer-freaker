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
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { LevelManager } from "../core/level-manager.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { DamageTakenComponent } from "../components/damage-taken.component.js";
import { AnimTimerComponent } from "../components/anim-timer.component.js";
import { ShapePositionComponent } from "../components/shape-position.component.js";
import { ShapeDimensionComponent } from "../components/shape-dimension.component.js";
import { ShapeComponent } from "../components/shape-component.js";

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
        private wallHitComponentStore: ComponentStore<WallHitComponent>,
        private worldTilemapManager: WorldTilemapManager,
        private levelManager: LevelManager,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private damageTakenComponentStore: ComponentStore<DamageTakenComponent>,
        private animTimerComponentStore: ComponentStore<AnimTimerComponent>,
        private shapeComponentStore: ComponentStore<ShapeComponent>,
        private shapePositionComponent: ComponentStore<ShapePositionComponent>,
        private shapeDimensionComponent: ComponentStore<ShapeDimensionComponent>,
    ) {

    }

    update(deltaTime: number): void {
        const playerId = this.playerComponentStore.getAllEntities()[0];
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

            const spriteOriginProperties = this.spriteManager.getSpriteProperties(spriteComponent.spriteName, spriteComponent.spriteSheetName);
            const wouldCollideCheckEntity = this.wouldCollideAABB(intent, entity, spriteOriginProperties.sprite.originalRenderSpriteHeight); // Entity - Entity check
            const wallCollisionCheck = this.wallCollision(intent, entity, spriteOriginProperties.sprite.originalRenderSpriteHeight); // Entity - wall check
            const shapeCollisionCheck = this.shapeCollision(intent, entity, spriteOriginProperties.sprite.originalRenderSpriteHeight); // Entity - shape check


            if (wouldCollideCheckEntity.wouldCollide) {
                this.movementIntentComponentStore.remove(entity); // Cancelamento do intent pra questões de movimento            
                if (this.projectileComponentStore.has(entity)) {
                    const shotOrigin = this.shotOriginComponentStore.get(entity);
                    const shooterId = shotOrigin.shooterEntity;
                    const target = wouldCollideCheckEntity.collidingEntity;

                    if (shooterId == null || target == null) return;
                    if (target === shooterId) return; // Ignores collision with self

                    const targetPlayer = this.playerComponentStore.has(target);
                    const targetEnemy = this.enemyComponentStore.has(target);

                    const projectileFromPlayer = this.playerComponentStore.has(shooterId);
                    const projectileFromEnemy = this.enemyComponentStore.has(shooterId);

                    const validTarget = (projectileFromPlayer && targetEnemy) ||
                        (projectileFromEnemy && targetPlayer);

                    if (validTarget) {
                        this.damageTakenComponentStore.add(target, new DamageTakenComponent(shooterId, 0));
                    }

                    this.entityFactory.destroyProjectile(entity);
                }
            }

            const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
            const zoomProgressionFactor = this.levelManager.zoomProgressionFactor;

            if (wallCollisionCheck && this.wallHitComponentStore.has(entity) == false) {
                this.movementIntentComponentStore.remove(entity);
                if (this.projectileComponentStore.has(entity)) {
                    this.animTimerComponentStore.add(entity, new AnimTimerComponent(AnimationName.BULLET_WALL_HIT, 0.8))
                    this.wallHitComponentStore.add(entity, new WallHitComponent());
                    this.velocityComponentStore.add(entity, new VelocityComponent(0, 0, 0, 0));
                    this.collisionComponentStore.add(entity, new CollisionComponent(false));
                }
            }

            if (wallCollisionCheck && this.wallHitComponentStore.has(entity) == true) {
                this.movementIntentComponentStore.remove(entity);
                if (this.projectileComponentStore.has(entity)) {
                    this.animTimerComponentStore.get(entity).animTime += deltaTime;
                    if (this.animTimerComponentStore.get(entity).animTime >= this.animTimerComponentStore.get(entity).animDuration) {
                        this.entityFactory.destroyProjectile(entity);
                        this.wallHitComponentStore.remove(entity);
                        this.animationComponentStore.remove(entity);
                    }
                }
            }

            if (shapeCollisionCheck.wouldCollide) {
                if (this.projectileComponentStore.has(entity)) {
                    this.movementIntentComponentStore.remove(entity);
                    // Collision between the knife and a projectile, Insert anim component for the anim setter
                    console.log("projectile shape collision");
                    this.entityFactory.destroyProjectile(entity);
                };
                if (this.enemyComponentStore.has(entity) && shapeCollisionCheck.shapeSource != entity) {
                    // Damage dealing to the enemy
                    console.log("enemy shape collision");
                    this.damageTakenComponentStore.add(entity, new DamageTakenComponent(shapeCollisionCheck.shapeSource!, 0));
                };
                if(this.playerComponentStore.has(entity) && shapeCollisionCheck.shapeSource != entity){
                    // Damage dealing to the player
                    console.log("player shape collision");
                    this.damageTakenComponentStore.add(entity, new DamageTakenComponent(shapeCollisionCheck.shapeSource!, 0));
                };
            }

            // Out of bounds:
            if (
                intent.x > canvas.width - spriteOriginProperties.sprite.originalRenderSpriteWidth * zoomProgressionFactor ||
                intent.y > canvas.height - spriteOriginProperties.sprite.originalRenderSpriteHeight * zoomProgressionFactor ||
                intent.x <= 0 || intent.y <= 0
            ) {
                this.movementIntentComponentStore.remove(entity);
            };

        }

    }

    private wouldCollideAABB(
        intent: MovementIntentComponent,
        self: number,
        tileSize: number
    ) {
        const zoomProgressionFactor = this.levelManager.zoomProgressionFactor;

        const intendedMovement = {
            left: intent.x,
            right: intent.x + tileSize * zoomProgressionFactor,
            top: intent.y,
            bottom: intent.y + tileSize * zoomProgressionFactor,
        };

        const shotOrigin = this.shotOriginComponentStore.getOrNull(self);
        const shooterId = shotOrigin?.shooterEntity;


        for (const other of this.collisionComponentStore.getAllEntities()) {
            if (other === self) continue;
            if (other === shooterId) continue; // Ignores who made the shot
            if (this.shapeComponentStore.has(other)) continue; // Ignores shapes, treated by its own method

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
                ? this.spriteManager.getSpriteProperties(otherSprite.spriteName, otherSprite.spriteSheetName)?.sprite.originalRenderSpriteHeight ?? tileSize
                : tileSize;

            const current = {
                left: pos.x,
                right: pos.x + otherTileSize * zoomProgressionFactor,
                top: pos.y,
                bottom: pos.y + otherTileSize * zoomProgressionFactor,
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
        const zoomProgressionFactor = this.levelManager.zoomProgressionFactor;
        const intendedMovement = {
            left: Math.floor(intent.x),
            right: Math.floor(intent.x + tileSize * zoomProgressionFactor),
            top: Math.floor(intent.y),
            bottom: Math.floor(intent.y + tileSize * zoomProgressionFactor),
        };

        const wallPosition = this.worldTilemapManager.generatedWalls;
        const tilemapProperties = this.spriteManager.getSpriteProperties(SpriteName.WALL_1, SpriteSheetName.TERRAIN);

        for (const { x, y } of wallPosition) {
            const tileWidth = tilemapProperties.sprite.originalRenderSpriteWidth * zoomProgressionFactor;
            const tileHeight = tilemapProperties.sprite.originalRenderSpriteHeight * zoomProgressionFactor;
            const wallRect = {
                left: (x * tileWidth),
                right: ((x + 1) * tileWidth),
                top: (y * tileHeight),
                bottom: ((y + 1) * tileHeight)
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

    private shapeCollision(
        intent: MovementIntentComponent,
        self: number,
        tileSize: number
    ) {
        const zoomProgressionFactor = this.levelManager.zoomProgressionFactor;

        const intendedMovement = {
            left: intent.x,
            right: intent.x + tileSize * zoomProgressionFactor,
            top: intent.y,
            bottom: intent.y + tileSize * zoomProgressionFactor,
        };

        for (const shape of this.shapeComponentStore.getAllEntities()) {
            const shapeRect = {
                left: this.shapePositionComponent.get(shape).x,
                right: this.shapePositionComponent.get(shape).x + this.shapeDimensionComponent.get(shape).width,
                top: this.shapePositionComponent.get(shape).y,
                bottom: this.shapePositionComponent.get(shape).y - this.shapeDimensionComponent.get(shape).height,
            }
            console.log("Shape sucessefully created", shape);

            const intersect =
                intendedMovement.left < shapeRect.right &&
                intendedMovement.right > shapeRect.left &&
                intendedMovement.top < shapeRect.bottom &&
                intendedMovement.bottom > shapeRect.top;

            return {
                wouldCollide: true,
                shapeSource: this.shapeComponentStore.get(shape).shapeSource,
            };
        }

        return {
            wouldCollide: false,
            shapeSource: null,
        };
    }
}