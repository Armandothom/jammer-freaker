
import { CollisionManager } from "../../game/world/collision-manager.js";
import { PathFindingManager } from "../../game/world/pathfinding-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AiMovementRetryBackoff } from "../components/ai-movement-retry-backoff.component.js";
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { CollisionLastFrameComponent } from "../components/collision-last-frame.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PathFindingObstacleComponent } from "../components/pathfinding-obstacle.component.js";
import { PositionComponent } from "../components/position.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { DebugManager } from "../core/debug-manager.js";
import { DebugSettingKey } from "../core/types/debug-manager-settings.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { ISystem } from "./system.interface.js";
import { CoreManager } from "../core/core-manager.js";


export class AiMovementBehaviorSystem implements ISystem {
    private _mappedEntityObstaclesCoordinates = new Map<number, Set<string>>();
    private _secondsMultiplier = 0.3;
    constructor(
        private positionComponent: ComponentStore<PositionComponent>,
        private pathFindingObstacleComponent : ComponentStore<PathFindingObstacleComponent>,
        private velocityComponent: ComponentStore<VelocityComponent>,
        private aiMovementOrderComponent: ComponentStore<AIMovementOrderComponent>,
        private aiMovementRetryBackoffComponent: ComponentStore<AiMovementRetryBackoff>,
        private movementIntentComponent: ComponentStore<MovementIntentComponent>,
        private collisionLastFrameComponent: ComponentStore<CollisionLastFrameComponent>,
        private debugAiInput : DebugManager,
        private worldTilemapManager : WorldTilemapManager,
        private pathFindingManager : PathFindingManager,
        private collisionManager : CollisionManager
    ) { }

    update(deltaTime: number): void {
        this.mapEntityObstacleCoordinates();
        for (const [entityId, value] of this.aiMovementOrderComponent.getValuesAndEntityId()) {
            if(this.isMovementPaused(entityId)) {
                continue;
            }
            const position = this.positionComponent.get(entityId);
            const pathTarget = value.pathList[0];
            const velocity = this.velocityComponent.get(entityId);
            const dx = pathTarget.x - position.x;
            const dy = pathTarget.y - position.y;
            const magnitudeOriginToTarget = this.getMagnitudeBetweenPoints(dx, dy);
            let xIntentPosition = position.x + ((dx / magnitudeOriginToTarget) * velocity.currentVelocityX);
            let yIntentPosition = position.y + ((dy / magnitudeOriginToTarget) * velocity.currentVelocityY);
            const collisionLastFrame = this.collisionLastFrameComponent.getOrNull(entityId);
            if(this.hasSurroundingEntityObstacles(value, entityId) || (collisionLastFrame && collisionLastFrame.entityCollision)) {
                if(this.isMovementPauseExpired(entityId)) {
                    this.aiMovementOrderComponent.remove(entityId);
                    this.aiMovementRetryBackoffComponent.remove(entityId);
                    continue;
                }
                const finalPathTarget = value.pathList[value.pathList.length - 1];
                const surroundingObstacles = this.getSurroundingEntityObstacles(xIntentPosition, yIntentPosition, entityId);
                const newPathList = this.pathFindingManager.computePath(position.x, position.y, finalPathTarget.x, finalPathTarget.y, surroundingObstacles);
                if(newPathList) {
                    this.aiMovementOrderComponent.add(entityId, new AIMovementOrderComponent(newPathList));
                }
                this.upsertMovementPause(entityId)
                continue;
            }
            const remainingPathDxPos = position.x - pathTarget.x;
            const remainingPathDyPos = position.y - pathTarget.y;
            const dxIntentPosition = position.x - xIntentPosition;
            const dyIntentPosition = position.y - yIntentPosition;
            if(Math.abs(remainingPathDxPos) < Math.abs(dxIntentPosition)) {
                xIntentPosition = pathTarget.x;
            }
            if(Math.abs(remainingPathDyPos) < Math.abs(dyIntentPosition)) {
                yIntentPosition = pathTarget.y;
            }
            const magnitudeOriginToNewPos = this.getMagnitudeBetweenPoints(dxIntentPosition, dyIntentPosition);
            if(magnitudeOriginToNewPos >= magnitudeOriginToTarget) {
                value.pathList.shift();
                if(value.pathList.length == 0) {
                    this.aiMovementOrderComponent.remove(entityId);
                }
            }
            this.movementIntentComponent.add(entityId, new MovementIntentComponent(xIntentPosition, yIntentPosition));
            this.aiMovementRetryBackoffComponent.remove(entityId);
            this.paintAiPath(value);
        };
    }

    private hasSurroundingEntityObstacles(aiMovementOrder : AIMovementOrderComponent, entityTargetId : number) : boolean {
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

    private isMovementPaused(entityId : number) {
        const pauseMovement = this.aiMovementRetryBackoffComponent.getOrNull(entityId);
        if(pauseMovement && pauseMovement.retryAfterTimestamp > CoreManager.timeGlobalSinceStart) {
            return true;
        }
        return false;
    }

    private isMovementPauseExpired(entityId : number) {
        const pauseMovement = this.aiMovementRetryBackoffComponent.getOrNull(entityId);
        if(pauseMovement && pauseMovement.backoffStep > 3) {
            return true;
        }
        return false;
    }

    private upsertMovementPause(entityId : number) {
        let pauseMovement = this.aiMovementRetryBackoffComponent.getOrNull(entityId);
        if(!pauseMovement) {
            this.aiMovementRetryBackoffComponent.add(entityId, new AiMovementRetryBackoff());
        } else {
            pauseMovement.backoffStep = pauseMovement.backoffStep + 1;
            console.log({backoffStep : pauseMovement.backoffStep})
            pauseMovement.retryAfterTimestamp = CoreManager.timeGlobalSinceStart + (this._secondsMultiplier * pauseMovement.backoffStep);
        }
    }


    private getSurroundingEntityObstacles(x: number, y: number, entityTargetId: number): Set<string> {
        const obstacles = new Set<string>();
        for (const [entityId, entityObstacles] of this._mappedEntityObstaclesCoordinates) {
            if (entityId == entityTargetId) {
                continue;
            }
            for (const obstacle of Array.from(entityObstacles.values())) {
                obstacles.add(obstacle);
            }
        }
        const movingEntityOccupyingTiles = this.collisionManager.detectEntityOccupiedTiles(entityTargetId);
        const surroundingObstacles = new Set<string>();
        for (const movingEntityOccupyingTileKey of movingEntityOccupyingTiles) {
            const tile = this.worldTilemapManager.getTileFromKey(movingEntityOccupyingTileKey);
            if (!tile) {
                continue;
            }
            const { tileX, tileY } = tile;
            const surroundingTiles = new Set<string>([
                this.worldTilemapManager.setTilemapKey(tileX, tileY), //own position
                this.worldTilemapManager.setTilemapKey(tileX + 0, tileY + -1), // top
                this.worldTilemapManager.setTilemapKey(tileX + 1, tileY + 0),  // right
                this.worldTilemapManager.setTilemapKey(tileX + 0, tileY + 1),  // bottom
                this.worldTilemapManager.setTilemapKey(tileX + -1, tileY + 0), // left
                this.worldTilemapManager.setTilemapKey(tileX + 1, tileY + -1), // diagonal top-right
                this.worldTilemapManager.setTilemapKey(tileX + 1, tileY + 1),  // diagonal bottom-right
                this.worldTilemapManager.setTilemapKey(tileX + -1, tileY + 1), // diagonal bottom-left
                this.worldTilemapManager.setTilemapKey(tileX + -1, tileY + -1) // diagonal top-left
            ]);
            for (const surroundingTile of Array.from(surroundingTiles.values())) {
                if (obstacles.has(surroundingTile)) {
                    surroundingObstacles.add(surroundingTile);
                }
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
