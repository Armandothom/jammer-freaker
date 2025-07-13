import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

const keys: Record<string, boolean> = {};

export class InputMovementSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>
    ) { }

    update(deltaTime: number): void {
        for (const entity of this.playerComponentStore.getAllEntities()) {

            const input = getInputForEntity(entity); // Definido abaixo
            if (!input) continue;

            const pos = this.positionComponentStore.get(entity);
            if (!pos) continue;

            const intent = new MovementIntentComponent(pos.x + input.dx, pos.y + input.dy);
            this.movementIntentComponentStore.add(entity, intent);
        }
    }
}

function getInputForEntity(entityId: number): { dx: number, dy: number } | null {

    let dx = 0, dy = 0;
    const speed = 1;
    if (keys["arrowup"] || keys["w"]) dy -= speed;
    if (keys["arrowdown"] || keys["s"]) dy += speed;
    if (keys["arrowleft"] || keys["a"]) dx -= speed;
    if (keys["arrowright"] || keys["d"]) dx += speed;

    if (dx !== 0 || dy !== 0) {
        return { dx, dy };
    }

    return null;
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
