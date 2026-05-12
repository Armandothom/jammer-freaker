import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

const keys: Record<string, boolean> = {};

export class InputMovementSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
    ) { }

    update(deltaTime: number): void {
        for (const playerId of this.playerComponentStore.getAllEntities()) {
            const velocity = this.velocityComponentStore.get(playerId);

            const input = getInputForEntity(); // Definido abaixo
            if (!input) continue;

            const pos = this.positionComponentStore.get(playerId);
            if (!pos) continue;

            const intent = new MovementIntentComponent(
                pos.x + input.dx * velocity.currentVelocityX,
                pos.y + input.dy * velocity.currentVelocityY
            );
            this.movementIntentComponentStore.add(playerId, intent);
        }
    }
}

function getInputForEntity(): { dx: number, dy: number } | null {
    let dx = 0, dy = 0;
    const axisStep = 1;
    if (keys["arrowup"] || keys["w"] || keys["W"]) dy -= axisStep;
    if (keys["arrowdown"] || keys["s"] || keys["S"]) dy += axisStep;
    if (keys["arrowleft"] || keys["a"] || keys["A"]) dx -= axisStep;
    if (keys["arrowright"] || keys["d"] || keys["D"]) dx += axisStep;

    if (dx === 0 && dy === 0) return null;

    const vectorLength = Math.hypot(dx, dy);
    if (vectorLength > 0) {
        dx = (dx / vectorLength);
        dy = (dy / vectorLength);
    }
    return { dx, dy };

}

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});
