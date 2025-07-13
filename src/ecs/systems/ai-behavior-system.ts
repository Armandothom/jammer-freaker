
import { PathFindingManager } from "../../game/world/pathfinding-manager.js";
import { randomWithSeedInfluence } from "../../utils/get-random-with-seed.js";
import { lerpPosition } from "../../utils/lerp-position.js";
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { AIComponent } from "../components/ai.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { AiMovementOrder } from "../components/types/ai-movement-order.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class AiBehaviorSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private aiComponentStore: ComponentStore<AIComponent>,
        private aiMovementOrderComponentStore: ComponentStore<AIMovementOrderComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private pathFindingManager : PathFindingManager
    ) { }

    update(deltaTime: number): void {
        const playerEntityId = this.playerComponentStore.getAllEntities()[0];
        const aiEntities = this.aiComponentStore.getAllEntities();
        for (const aiEntityId of aiEntities) {
            const aiHasMovementOrder = this.aiMovementOrderComponentStore.has(aiEntityId);
            if(!aiHasMovementOrder) {
                this.setNewMovement(aiEntityId, playerEntityId)
                continue;
            }
            const aiMovementOrder = this.aiMovementOrderComponentStore.get(aiEntityId);
            const aiPosition = this.positionComponentStore.get(aiEntityId);
            const aiVelocity = this.velocityComponentStore.get(aiEntityId);
            if(aiMovementOrder.pathList[0].x == aiPosition.x && aiMovementOrder.pathList[0].y == aiPosition.y) {
                aiMovementOrder.pathList.pop();
            }
            if(aiMovementOrder.pathList.length > 0) {
                //Math.sign to get the sign if we should increment or subtract axis
                const nextMoveX = Math.sign(aiMovementOrder.pathList[0].x - aiPosition.x); 
                const nextMoveY = Math.sign(aiMovementOrder.pathList[0].y - aiPosition.y);
                this.movementIntentComponentStore.add(aiEntityId, new MovementIntentComponent(nextMoveX + aiVelocity.velX, nextMoveY + aiVelocity.velY))
            }
        }
    }

    private setNewMovement(aiEntityId : number, playerEntityId : number) {
        const playerPosition = this.positionComponentStore.get(playerEntityId);
        const aiPosition = this.positionComponentStore.get(aiEntityId);
        const randomNumber = randomWithSeedInfluence(aiEntityId.toString(), 0, 10);
        const playerAproximity = randomWithSeedInfluence(aiEntityId.toString(), 20, 70);
        const goalPath = lerpPosition(
            {
                x : playerPosition.x,
                y : playerPosition.y
            },
            {
                x : aiPosition.x,
                y : aiPosition.y
            },
            playerAproximity);
        const pathList = this.pathFindingManager.computePath(aiPosition.x, aiPosition.y, goalPath.x, goalPath.y);
        this.aiMovementOrderComponentStore.add(aiEntityId, new AIMovementOrderComponent(AiMovementOrder.MOVE_TO_PLAYER, pathList))
    }



}