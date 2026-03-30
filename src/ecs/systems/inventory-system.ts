import { BulletFiredComponent } from "../components/bullet-fired.component.js";
import { GrenadeFiredComponent } from "../components/grenade-fired.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { ISystem } from "./system.interface.js";

export class InventorySystem implements ISystem {
    private isNPressed = false;
    private wasNPressedLastFrame = false;

    constructor(
        private inventoryManager: InventoryManager,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private bulletFiredComponentStore: ComponentStore<BulletFiredComponent>,
        private grenadeFiredComponentStore: ComponentStore<GrenadeFiredComponent>,
    ) {
    }

    update(deltaTime: number): void {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        if (playerEntity == null) {
            return;
        }

        const inventory = this.inventoryComponentStore.get(playerEntity);
        if (inventory == null) {
            return;
        }

        if (this.bulletFiredComponentStore.has(playerEntity)) {
            this.removeBulletFromMag(inventory);
            this.bulletFiredComponentStore.remove(playerEntity);
        }

        if (this.grenadeFiredComponentStore.has(playerEntity)) {
            this.removeGrenadeFromInventory(inventory);
            this.grenadeFiredComponentStore.remove(playerEntity);
        }
    }


    private removeBulletFromMag(inventory: InventoryComponent): void {
        const weaponFired = inventory.equippedWeaponType;
        if (weaponFired == null) {
            return;
        }

        this.inventoryManager.consumeRoundInMag(inventory, weaponFired);
    }

    private removeGrenadeFromInventory(inventory: InventoryComponent): void {
        this.inventoryManager.removeResource(inventory, InventoryResourceType.Grenade, 1);
    }
}