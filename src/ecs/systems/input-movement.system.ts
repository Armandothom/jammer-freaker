import { MovementInputComponent } from "../components/movement-input.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

const keys: Record<string, boolean> = {};

export class InputMovementSystem implements ISystem {
    constructor(
        private movementInputComponentStore: ComponentStore<MovementInputComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
    ) { }

    update(deltaTime: number): void {
        const playerIds = this.playerComponentStore.getAllEntities();
        const activePlayerIds = new Set(playerIds);

        for (const playerId of playerIds) {
            const input = getInputForEntity(); // Definido abaixo
            if (!input) {
                this.movementInputComponentStore.remove(playerId);
                continue;
            }

            this.movementInputComponentStore.add(playerId, new MovementInputComponent(input.dx, input.dy));
        }

        for (const inputEntity of this.movementInputComponentStore.getAllEntities()) {
            if (!activePlayerIds.has(inputEntity)) {
                this.movementInputComponentStore.remove(inputEntity);
            }
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
