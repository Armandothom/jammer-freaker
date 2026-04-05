
import { PathFindingManager } from "../../game/world/pathfinding-manager.js";
import { randomNumberWithSeedInfluence } from "../../utils/get-random-with-seed.js";
import { detectByRadius, lerpPosition } from "../../utils/lerp-position.js";
import { Position } from "../../utils/types/position.js";
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { AIComponent } from "../components/ai.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { DebugManager } from "../core/debug-manager.js";
import { DebugSettingKey } from "../core/types/debug-manager-settings.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { ISystem } from "./system.interface.js";


export class AiMovementBehaviorSystem implements ISystem {
    constructor(
        private positionComponent: ComponentStore<PositionComponent>,
        private aiMovementOrderComponentStore: ComponentStore<AIMovementOrderComponent>,
        private debugAiInput : DebugManager
    ) { }

    update(deltaTime: number): void {
        for (const [entity, value] of this.aiMovementOrderComponentStore.getValuesAndEntityId()) {
            this.paintAiPath(value);
        };
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