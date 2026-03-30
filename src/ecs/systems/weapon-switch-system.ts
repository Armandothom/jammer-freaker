import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class WeaponSwitchSystem implements ISystem {
    private pressedKeys = new Set<string>();
    private previousPressedKeys = new Set<string>();

    constructor(
        private inventoryManager: InventoryManager,
        private entityFactory: EntityFactory,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
    ) {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    update(_: number): void {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        if (playerEntity == null) {
            this.syncInputFrame();
            return;
        }

        const inventory = this.inventoryComponentStore.get(playerEntity);
        if (inventory == null) {
            this.syncInputFrame();
            return;
        }

        if (this.wasKeyPressedThisFrame("Digit1")) {
            this.trySwitchWeapon(playerEntity, inventory, WeaponType.PISTOL);
        }

        if (this.wasKeyPressedThisFrame("Digit2")) {
            this.trySwitchWeapon(playerEntity, inventory, WeaponType.SMG);
        }

        if (this.wasKeyPressedThisFrame("Digit3")) {
            this.trySwitchWeapon(playerEntity, inventory, WeaponType.RIFLE);
        }

        if (this.wasKeyPressedThisFrame("Digit4")) {
            this.trySwitchWeapon(playerEntity, inventory, WeaponType.AWP);
        }

        this.syncInputFrame();
    }

    private trySwitchWeapon(
        playerEntity: number,
        inventory: InventoryComponent,
        nextWeapon: WeaponType
    ): void {
        const currentWeapon = inventory.equippedWeaponType;

        if (currentWeapon === nextWeapon) {
            return;
        }

        const weaponState = this.inventoryManager.getWeaponState(inventory, nextWeapon);
        if (!weaponState || !weaponState.owned) {
            return;
        }

        // troca lógica
        inventory.equippedWeaponType = nextWeapon;

        // troca física (entidade)
        this.entityFactory.destroyPlayerWeapon(playerEntity);
        this.entityFactory.createPlayerWeapon(playerEntity, nextWeapon, WeaponConfig[nextWeapon]);
    }

    private wasKeyPressedThisFrame(code: string): boolean {
        return this.pressedKeys.has(code) && !this.previousPressedKeys.has(code);
    }

    private syncInputFrame(): void {
        this.previousPressedKeys = new Set(this.pressedKeys);
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        this.pressedKeys.add(event.code);
    };

    private onKeyUp = (event: KeyboardEvent): void => {
        this.pressedKeys.delete(event.code);
    };

    destroy(): void {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
    }

}