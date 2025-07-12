
import { PositionComponent } from "../components/position.component.js";
import { wouldCollideAABB } from "./collision-system.js"


export function movementSystem(playerEntity: number, keys: Set<string>, dt: number) {
    const speed = 2; // tiles por segundo
    console.log(keys);

    const pos = PositionComponent.get(playerEntity);
    if (!pos) return;

    let dx = 0;
    let dy = 0;

    if (keys.has("arrowup")) dy -= 1;
    if (keys.has("arrowdown")) dy += 1;
    if (keys.has("arrowleft")) dx -= 1;
    if (keys.has("arrowright")) dx += 1;

    if (dx !== 0 && dy !== 0) {
        const norm = Math.SQRT1_2; // √(1/2)
        dx *= norm;
        dy *= norm;
    }

    const futurePos = {
        x: pos.x + dx * speed * dt,
        y: pos.y + dy * speed * dt
    }

    //40 = tileSize, ver como passar na entrada dessa função
    if (!wouldCollideAABB(futurePos, 40, playerEntity)) {
        pos.x = futurePos.x;
        pos.y = futurePos.y;
        PositionComponent.set(playerEntity, pos);
    }
}