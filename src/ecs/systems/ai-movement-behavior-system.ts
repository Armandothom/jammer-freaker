
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
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
        private velocityComponent: ComponentStore<VelocityComponent>,
        private aiMovementOrderComponent: ComponentStore<AIMovementOrderComponent>,
        private movimentIntentComponent: ComponentStore<MovementIntentComponent>,
        private debugAiInput : DebugManager
    ) { }

    update(deltaTime: number): void {
        for (const [entityId, value] of this.aiMovementOrderComponent.getValuesAndEntityId()) {
            const position = this.positionComponent.get(entityId);
            const pathTarget = value.pathList[0];
            const velocity = this.velocityComponent.get(entityId);
            const dx = pathTarget.x - position.x;
            const dy = pathTarget.y - position.y;
            const magnitudeOriginToTarget = this.getMagnitudeBetweenPoints(dx, dy);
            const xNewPosition = position.x + ((dx / magnitudeOriginToTarget) * velocity.currentVelocityX);
            const yNewPosition = position.y + ((dy / magnitudeOriginToTarget) * velocity.currentVelocityY);
            const dxNewPos = position.x - xNewPosition;
            const dYNewPos = position.y - yNewPosition;
            const magnitudeOriginToNewPos = this.getMagnitudeBetweenPoints(dxNewPos, dYNewPos);
            if(magnitudeOriginToNewPos > magnitudeOriginToTarget) {
                value.pathList.shift();
                if(value.pathList.length == 0) {
                    this.aiMovementOrderComponent.remove(entityId);
                }
            }
            this.movimentIntentComponent.add(entityId, new MovementIntentComponent(xNewPosition, yNewPosition));
            this.paintAiPath(value);
        };
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