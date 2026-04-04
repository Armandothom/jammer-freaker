
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
        
    }



}