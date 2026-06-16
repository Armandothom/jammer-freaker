import { InventoryComponent } from "../components/inventory-component.js";
import { MovementImprecisionIntentComponent } from "../components/movement-imprecision-intent.component.js";
import { WorldTilemapManager } from "../../game/world-map/world-tilemap-manager.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { WeaponConfig } from "../components/types/weapon-config.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";


export class MovementSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private movementImprecisionIntentComponent: ComponentStore<MovementImprecisionIntentComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
    ) { }

    update(deltaTime: number): void {
        const entities = this.movementIntentComponentStore.getAllEntities();
        const playerEntity = this.playerComponentStore.getAllEntities()[0];


        for (const entity of entities) {

            const intent = this.movementIntentComponentStore.getOrNull(entity);
            //console.log("entity, intent", entity, intent);

            if (!intent) continue;

            this.positionComponentStore.add(entity, new PositionComponent(intent.x, intent.y));

            if (entity === playerEntity) {
                const equippedWeapon = this.inventoryComponentStore.get(entity).equippedWeaponType;
                if (equippedWeapon === null) continue;
                const movementImprecision = WeaponConfig[equippedWeapon].walkingRecoil
                this.movementImprecisionIntentComponent.add(entity, new MovementImprecisionIntentComponent(movementImprecision!));
            }

            //We remove the intent after moving the entity.
            this.movementIntentComponentStore.remove(entity);
        }
    }
}
