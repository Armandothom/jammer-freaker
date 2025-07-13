
import { randomNumberWithSeedInfluence } from "../../utils/get-random-with-seed.js";
import { AIAttackOrderComponent } from "../components/ai-attack-order.component.js";
import { AIComponent } from "../components/ai.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { AiAttackOrder } from "../components/types/ai-attack-order.js";
import { ComponentStore } from "../core/component-store.js";
import { CoreManager } from "../core/core-manager.js";
import { ISystem } from "./system.interface.js";


export class AiAttackBehaviorSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private intentShotComponent: ComponentStore<IntentShotComponent>,
        private aiComponentStore: ComponentStore<AIComponent>,
        private aiAttackOrderComponentStore: ComponentStore<AIAttackOrderComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
    ) { }

    update(deltaTime: number): void {
        const playerEntityId = this.playerComponentStore.getAllEntities()[0];
        const aiEntities = this.aiComponentStore.getAllEntities();
        for (const aiEntityId of aiEntities) {
            const aiHasAttackOrder = this.aiAttackOrderComponentStore.has(aiEntityId);
            if (!aiHasAttackOrder) {
                const randomNumber = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 10);
                const durationOrder = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 3);
                if (randomNumber < 8) {
                    this.aiAttackOrderComponentStore.add(aiEntityId, new AIAttackOrderComponent(AiAttackOrder.SHOOT, durationOrder))
                } else {
                    this.aiAttackOrderComponentStore.add(aiEntityId, new AIAttackOrderComponent(AiAttackOrder.STAND_STILL, durationOrder))
                }
            } else {
                const attackOrder = this.aiAttackOrderComponentStore.get(aiEntityId);
                switch (attackOrder.attackOrder) {
                    case AiAttackOrder.SHOOT:
                        const playerPos = this.positionComponentStore.get(playerEntityId);
                        const offsetXShooting = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 10)
                        const offsetYShooting = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 10);
                        this.intentShotComponent.add(aiEntityId, new IntentShotComponent(playerPos.x + offsetXShooting, playerPos.y + offsetYShooting))
                        break;
                    default:
                        break;
                }
            if(attackOrder.endOrderSeconds < CoreManager.timeGlobalSinceStart) {
                this.aiAttackOrderComponentStore.remove(aiEntityId);
            }
            }


        }
    }





}