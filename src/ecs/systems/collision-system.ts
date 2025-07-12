import { PositionComponent } from "../components/position.component.js";
import { CollisionComponent } from "../components/collision-component.js";
import { ComponentStore } from "../core/component-store.js";
import { Rect } from "./types/rect.type.js";
import { ISystem } from "./system.interface.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";

export class CollisionSystem implements ISystem {
    constructor(
        private spriteComponentStore : ComponentStore<SpriteComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private collisionComponentStore: ComponentStore<CollisionComponent>,
        private movimentIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private spriteManager : SpriteManager
    ) {

    }
    
    update(deltaTime: number): void {
        for (const entity of this.movimentIntentComponentStore.getAllEntities()) {
            const intent = this.movimentIntentComponentStore.get(entity);
            if (!intent) {
                continue;
            };

            const spriteComponent = this.spriteComponentStore.get(entity);

            if(!spriteComponent) {
                console.error(`No sprite found for entity ${spriteComponent}`);
            }

            const spriteSheetOriginProperties = this.spriteManager.getSpriteSheetProperties(spriteComponent.spriteSheet);
            
            if (this.wouldCollideAABB(intent, entity, spriteSheetOriginProperties.afterRenderSpriteSize)) {
                this.movimentIntentComponentStore.remove(entity); // Cancelamento do intent
            }

        }
    }

    private wouldCollideAABB(
        intent: MovementIntentComponent,
        self: number,
        tileSize: number
    ): boolean {
        const intendedMovement = {
            left: intent.x * tileSize,
            right: (intent.x + 1) * tileSize,
            top: intent.y * tileSize,
            bottom: (intent.y + 1) * tileSize,
        };

        for (const other of this.collisionComponentStore.getAllEntities()) {
            if (other === self) continue;

            const collision = this.collisionComponentStore.get(other);
            if (!collision || !collision.collides) continue;

            const pos = this.positionComponentStore.get(other);
            if (!pos) continue;

            const current = {
                left: pos.x * tileSize,
                right: (pos.x + 1) * tileSize,
                top: pos.y * tileSize,
                bottom: (pos.y + 1) * tileSize
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
        const movIntent = this.movimentIntentComponentStore.get(entity);
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