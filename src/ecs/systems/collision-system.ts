import { PositionComponent } from "../components/position.component.js";
import { CollisionComponent } from "../components/collision-component.js";
import { world } from "../core/ecs";

type Rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

export function checkAABBCollision(a: Rect, b: Rect): boolean {
    return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
    );
}

export function getEntityAABB(entity: number, tileSize: number): Rect | null {
    const pos = PositionComponent.get(entity);
    if (!pos) return null;

    const left = pos.x * tileSize;
    const top = pos.y * tileSize;

    return {
        left,
        top,
        right: left + tileSize,
        bottom: top + tileSize
    };
}

export function collisionSystem(
    targetEntity: number,
    tileSize: number
): number[] {
    const hits: number[] = [];
    const a = getEntityAABB(targetEntity, tileSize);
    if (!a) return [];

    const entities = world.getEntitiesWithComponents("Position", "Collision");

    for (const other of entities) {
        if (other === targetEntity) continue;

        if (!CollisionComponent.has(other)) continue;

        const b = getEntityAABB(other, tileSize);
        if (!b) continue;

        if (checkAABBCollision(a, b)) {
            hits.push(other);
        }
    }

    return hits;
}

export function wouldCollideAABB(
    futurePos: { x: number; y: number },
    tileSize: number,
    selfEntity: number
): boolean {
    const a = {
        left: futurePos.x * tileSize,
        right: (futurePos.x + 1) * tileSize,
        top: futurePos.y * tileSize,
        bottom: (futurePos.y + 1) * tileSize,
    };

    const entities = world.getEntitiesWithComponents("Position", "Collision");

    for (const other of entities) {
        if (other === selfEntity) continue;

        if (!CollisionComponent.has(other)) continue;

        const b = getEntityAABB(other, tileSize);
        if (!b) continue;

        if (checkAABBCollision(a, b)) {
            return true;
        }
    }

    return false;
}