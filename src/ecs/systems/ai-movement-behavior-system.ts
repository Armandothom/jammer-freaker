
import { CollisionManager } from "../../game/world/collision-manager.js";
import { PathFindingManager } from "../../game/world/pathfinding-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PathFindingObstacleComponent } from "../components/pathfinding-obstacle.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { DebugManager } from "../core/debug-manager.js";
import { DebugSettingKey } from "../core/types/debug-manager-settings.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { ISystem } from "./system.interface.js";


export class AiMovementBehaviorSystem implements ISystem {
    private _mappedEntityObstaclesCoordinates = new Map<number, Set<string>>();
    constructor(
        private positionComponent: ComponentStore<PositionComponent>,
        private pathFindingObstacleComponent : ComponentStore<PathFindingObstacleComponent>,
        private velocityComponent: ComponentStore<VelocityComponent>,
        private aiMovementOrderComponent: ComponentStore<AIMovementOrderComponent>,
        private movementIntentComponent: ComponentStore<MovementIntentComponent>,
        private debugAiInput : DebugManager,
        private worldTilemapManager : WorldTilemapManager,
        private pathFindingManager : PathFindingManager,
        private collisionManager : CollisionManager
    ) { }

    update(deltaTime: number): void {
        this.mapEntityObstacleCoordinates();
        for (const [entityId, value] of this.aiMovementOrderComponent.getValuesAndEntityId()) {
            const position = this.positionComponent.get(entityId);
            const pathTarget = value.pathList[0];
            const velocity = this.velocityComponent.get(entityId);
            const dx = pathTarget.x - position.x;
            const dy = pathTarget.y - position.y;
            const magnitudeOriginToTarget = this.getMagnitudeBetweenPoints(dx, dy);
            const xNewPosition = position.x + ((dx / magnitudeOriginToTarget) * velocity.currentVelocityX);
            const yNewPosition = position.y + ((dy / magnitudeOriginToTarget) * velocity.currentVelocityY);
            if(this.hasSurroundingEntityObstacles(xNewPosition, yNewPosition, value, entityId)) {
                const finalPathTarget = value.pathList[value.pathList.length - 1];
                const surroundingObstacles = this.getSurroundingEntityObstacles(xNewPosition, yNewPosition, entityId);
                const newPathList = this.pathFindingManager.computePath(position.x, position.y, finalPathTarget.x, finalPathTarget.y, surroundingObstacles);
                if(newPathList) {
                    this.aiMovementOrderComponent.add(entityId, new AIMovementOrderComponent(newPathList));
                }
                continue;
            }
            const dxNewPos = position.x - xNewPosition;
            const dYNewPos = position.y - yNewPosition;
            const magnitudeOriginToNewPos = this.getMagnitudeBetweenPoints(dxNewPos, dYNewPos);
            if(magnitudeOriginToNewPos > magnitudeOriginToTarget) {
                value.pathList.shift();
                if(value.pathList.length == 0) {
                    this.aiMovementOrderComponent.remove(entityId);
                }
            }
            this.movementIntentComponent.add(entityId, new MovementIntentComponent(xNewPosition, yNewPosition));
            this.paintAiPath(value);
        };
    }

    private hasSurroundingEntityObstacles(x : number, y : number, aiMovementOrder : AIMovementOrderComponent, entityTargetId : number) : boolean {
        const nextPathTile = this.worldTilemapManager.worldToTile(aiMovementOrder.pathList[0].x, aiMovementOrder.pathList[0].y)
        const nextPathKey = this.worldTilemapManager.setTilemapKey(nextPathTile.tileX, nextPathTile.tileY);
        for (const [entityId, entityObstacles] of this._mappedEntityObstaclesCoordinates) {
            if(entityId == entityTargetId) {
                continue;
            }
            if(entityObstacles.has(nextPathKey)) {
                return true;
            }

        }
        return false;
    }


    private getSurroundingEntityObstacles(x : number, y : number, entityTargetId : number) : Set<string> {
        const obstacles = new Set<string>();
        for (const [entityId, entityObstacles] of this._mappedEntityObstaclesCoordinates) {
            if(entityId == entityTargetId) {
                continue;
            }
            for (const obstacle of Array.from(entityObstacles.values())) {
                obstacles.add(obstacle);
            }
        }
        const positionTile = this.worldTilemapManager.worldToTile(x, y);
        const tileX = positionTile.tileX;
        const tileY = positionTile.tileY;
        const surroundingTiles = new Set<string>([
            this.worldTilemapManager.setTilemapKey(tileX + 0, tileY + -1), // top
            this.worldTilemapManager.setTilemapKey(tileX + 1, tileY + 0),  // right
            this.worldTilemapManager.setTilemapKey(tileX + 0, tileY + 1),  // bottom
            this.worldTilemapManager.setTilemapKey(tileX + -1, tileY + 0), // left
            this.worldTilemapManager.setTilemapKey(tileX + 1, tileY + -1), // diagonal top-right
            this.worldTilemapManager.setTilemapKey(tileX + 1, tileY + 1),  // diagonal bottom-right
            this.worldTilemapManager.setTilemapKey(tileX + -1, tileY + 1), // diagonal bottom-left
            this.worldTilemapManager.setTilemapKey(tileX + -1, tileY + -1) // diagonal top-left
        ]);
        const surroundingObstacles = new Set<string>();
        for (const surroundingTile of Array.from(surroundingTiles.values())) {
            if(obstacles.has(surroundingTile)) {
                surroundingObstacles.add(surroundingTile);
            }
        }
        return surroundingObstacles;
    }

    private mapEntityObstacleCoordinates() {
        this._mappedEntityObstaclesCoordinates.clear();
        //logic to get whole sprite
        for (const entityId of this.pathFindingObstacleComponent.getAllEntities()) {
            const tiles = this.collisionManager.detectEntityOccupiedTiles(entityId);
            this._mappedEntityObstaclesCoordinates.set(entityId, new Set<string>(tiles))
        }
    }

    private getMagnitudeBetweenPoints(dx : number, dy : number) {
        return Math.sqrt(dx * dx + dy * dy);
    }

    private paintAiPath(movementOrder: AIMovementOrderComponent) {
        if (this.debugAiInput.getDebugSetting(DebugSettingKey.AI_PATH)) {
            const color = movementOrder.debugColor;
            OrderDebuggerOrchestrator.insertPaintOrder(
                movementOrder.pathList.map((pathItem) => {
                    return {
                        centroidX : pathItem.x,
                        centroidY : pathItem.y,
                        type : "circle",
                        width : 8,
                        height : 8,
                        color
                    }
                })
            )
        }
    }



}
