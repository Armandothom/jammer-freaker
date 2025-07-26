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
        private velocityComponentStore: ComponentStore<VelocityComponent>
    ) { }

    update(deltaTime: number): void {
        for (const playerId of this.playerComponentStore.getAllEntities()) {
            const velocity = this.velocityComponentStore.get(playerId);

            const input = getInputForEntity(playerId); // Definido abaixo
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

function getInputForEntity(entityId: number): { dx: number, dy: number } | null {
    let dx = 0, dy = 0;
    const speed = 1;
    if (keys["arrowup"] || keys["w"]) dy -= speed;
    if (keys["arrowdown"] || keys["s"]) dy += speed;
    if (keys["arrowleft"] || keys["a"]) dx -= speed;
    if (keys["arrowright"] || keys["d"]) dx += speed;

    if (dx === 0 && dy === 0) return null;

    const vectorLength = Math.hypot(dx, dy);
    if (vectorLength > 0) {
        dx = (dx / vectorLength);
        dy = (dy / vectorLength);
    }
    return { dx, dy };

}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
