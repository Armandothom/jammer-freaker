
import { PathFindingManager } from "../../game/world/pathfinding-manager.js";
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { PositionComponent } from "../components/position.component.js";
import { AiMovementOrder } from "../components/types/ai-movement-order.js";
import { ComponentStore } from "../core/component-store.js";
import { DebugManager } from "../core/debug-manager.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { DebuggerSpawnerOrder } from "../debugger-orders/types/debugger.js";
import { ISystem } from "./system.interface.js";


export class AiIntentProcessorSystem implements ISystem {
    constructor(
        private positionComponent: ComponentStore<PositionComponent>,
        private aiMovementOrder: ComponentStore<AIMovementOrderComponent>,
        private pathFindingManager : PathFindingManager
    ) { }

    update(deltaTime: number): void {
        this.processDebugSpawn();
        //this.aiMovementOrderComponentStore.add(new AIMovementOrderComponent())
        
    }


    private processDebugSpawn() {
        const orders = OrderDebuggerOrchestrator.retrieveModeOrder();
        if(orders.length == 0) {
            return;
        }
        for (const order of orders) {
            const origin = this.positionComponent.get(order.entityId);
            const path = this.pathFindingManager.computePath(origin.x, origin.y, order.x, order.y);
            if(!path) {
                return;
            }
            this.aiMovementOrder.add(order.entityId, new AIMovementOrderComponent(path));
        }
    }

}