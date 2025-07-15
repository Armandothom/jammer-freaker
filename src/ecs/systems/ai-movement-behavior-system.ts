
import { PathFindingManager } from "../../game/world/pathfinding-manager.js";
import { randomNumberWithSeedInfluence } from "../../utils/get-random-with-seed.js";
import { detectByRadius, lerpPosition } from "../../utils/lerp-position.js";
import { Position } from "../../utils/types/position.js";
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { AIComponent } from "../components/ai.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { AiMovementOrder } from "../components/types/ai-movement-order.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { CoreManager } from "../core/core-manager.js";
import { ISystem } from "./system.interface.js";


export class AiMovementBehaviorSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private aiComponentStore: ComponentStore<AIComponent>,
        private aiMovementOrderComponentStore: ComponentStore<AIMovementOrderComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private pathFindingManager: PathFindingManager
    ) { }

    update(deltaTime: number): void {
        const playerEntityId = this.playerComponentStore.getAllEntities()[0];
        const aiEntities = this.aiComponentStore.getAllEntities();
        for (const aiEntityId of aiEntities) {
            const aiHasMovementOrder = this.aiMovementOrderComponentStore.has(aiEntityId);
            if (!aiHasMovementOrder) {
                
                this.setNewMovement(aiEntityId, playerEntityId)
                continue;
            }
            const aiMovementOrder = this.aiMovementOrderComponentStore.get(aiEntityId);
            //console.log("aimovementOrder", aiEntityId, aiMovementOrder.movementOrder, aiMovementOrder.pathList.length);
            switch (aiMovementOrder.movementOrder) {
                case AiMovementOrder.MOVE_TO_PLAYER:
                case AiMovementOrder.MOVE_AWAY_FROM_PLAYER:
                case AiMovementOrder.ESCAPE_FROM_BULLETS:
                    if (aiMovementOrder.pathList.length == 0) {
                        this.aiMovementOrderComponentStore.remove(aiEntityId);
                        return;
                    }
                    this.saveMoveIntent(aiMovementOrder, aiEntityId);
                    break;
                case AiMovementOrder.STAND_STILL:
                    if(aiMovementOrder.endMovementSeconds < CoreManager.timeGlobalSinceStart) {
                        this.aiMovementOrderComponentStore.remove(aiEntityId);
                    }
                default:
                    break;
            }
        }
    }

    private setNewMovement(aiEntityId: number, playerEntityId: number) {
        const playerPosition = this.positionComponentStore.get(playerEntityId);
        const aiPosition = this.positionComponentStore.get(aiEntityId);
        const randomNumber = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 10);
        playerPosition.x = Math.floor(playerPosition.x);
        playerPosition.y = Math.floor(playerPosition.y);

        aiPosition.x = Math.floor(aiPosition.x);
        aiPosition.y = Math.floor(aiPosition.y);

        if (randomNumber <= 4) {
            const isTooClose = detectByRadius({
                x : playerPosition.x,
                y : playerPosition.y
            }, {
                x : aiPosition.x,
                y : aiPosition.y
            }, 120)
            this.setMoveRelatedToPlayer(aiEntityId, playerPosition, aiPosition, isTooClose ? false : true);
        } else if (randomNumber > 4 && randomNumber <= 8) {
            this.setMoveRelatedToPlayer(aiEntityId, playerPosition, aiPosition, false);
        } else if (randomNumber > 8) {
            const durationStandStill = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 5);
            this.aiMovementOrderComponentStore.add(aiEntityId, new AIMovementOrderComponent(AiMovementOrder.STAND_STILL, [], durationStandStill))
        }
    }

    private setMoveRelatedToPlayer(aiEntityId: number, playerPosition: PositionComponent, aiPosition: PositionComponent, toPlayer: boolean) {
        const approximity = randomNumberWithSeedInfluence(aiEntityId.toString(), 20, 40) / 100;
        const referencePoint: Position = {
            x: toPlayer ? playerPosition.x : playerPosition.x + randomNumberWithSeedInfluence(aiEntityId.toString(), 100, 250),
            y: toPlayer ? playerPosition.y : playerPosition.y + randomNumberWithSeedInfluence(aiEntityId.toString(), 100, 250)
        }
        const goalPath = lerpPosition(
            {
                x: referencePoint.x,
                y: referencePoint.y
            },
            {
                x: aiPosition.x,
                y: aiPosition.y
            },
            approximity);
        const pathList = this.pathFindingManager.computePath(aiPosition.x, aiPosition.y, goalPath.x, goalPath.y);
        this.aiMovementOrderComponentStore.add(aiEntityId, new AIMovementOrderComponent(AiMovementOrder.MOVE_TO_PLAYER, pathList))
    }

    private saveMoveIntent(aiMovementOrder: AIMovementOrderComponent, aiEntityId: number) {
        const aiPosition = this.positionComponentStore.get(aiEntityId);
        const aiVelocity = this.velocityComponentStore.get(aiEntityId);
        //console.log(aiMovementOrder.pathList[0].x, aiPosition.x, aiMovementOrder.pathList[0].y, aiPosition.y);
        if (aiMovementOrder.pathList[0].x == aiPosition.x && aiMovementOrder.pathList[0].y == aiPosition.y) {
            aiMovementOrder.pathList.shift();
        }

        if (aiMovementOrder.pathList.length > 0) {
            //Math.sign to get the sign if we should increment or subtract axis
            const offsetX = Math.sign(aiMovementOrder.pathList[0].x - aiPosition.x);
            const offsetY = Math.sign(aiMovementOrder.pathList[0].y - aiPosition.y);
            this.movementIntentComponentStore.add(aiEntityId, new MovementIntentComponent(aiPosition.x + (aiVelocity.velX * offsetX), aiPosition.y + (aiVelocity.velY * offsetY)))
        }
    }



}