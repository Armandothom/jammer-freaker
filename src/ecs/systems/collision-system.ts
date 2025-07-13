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

export class CollisionSystem implements ISystem {
    constructor(
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private collisionComponentStore: ComponentStore<CollisionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private spriteManager: SpriteManager,
        private entityFactory: EntityFactory
    ) {

    }

    update(deltaTime: number): void {
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

            if (this.wouldCollideAABB(intent, entity, spriteSheetOriginProperties.afterRenderSpriteCellSize)) {
                this.movementIntentComponentStore.remove(entity); // Cancelamento do intent
                if (this.projectileComponentStore.has(entity)) {
                    this.entityFactory.destroyProjectile(entity);
                }
            }

        }
    }

    private wouldCollideAABB(
        intent: MovementIntentComponent,
        self: number,
        tileSize: number
    ): boolean {
        const intendedMovement = {
            left: intent.x,
            right: intent.x + tileSize,
            top: intent.y,
            bottom: intent.y + tileSize,
        };

        for (const other of this.collisionComponentStore.getAllEntities()) {
            if (other === self) continue;

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

            if (intersect) return true;
        }

        return false;
    }


    // métodos inutilizados por enquanto
    private checkAABBCollision(a: Rect, b: Rect): boolean {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

    private getEntityAABB(entity: number, tileSize: number): Rect | null {
        const movIntent = this.movementIntentComponentStore.get(entity);
        if (!movIntent) return null;

        const left = movIntent.x * tileSize;
        const top = movIntent.y * tileSize;

        return {
            left,
            top,
            right: left + tileSize,
            bottom: top + tileSize
        };
    }
}