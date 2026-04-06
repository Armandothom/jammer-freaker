import { HealthComponent } from "../components/health.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { ISystem } from "./system.interface.js";

export class InventoryDebugSystem implements ISystem {
    private isNPressed = false;
    private wasNPressedLastFrame = false;

    private pressedKeys = new Set<string>();
    private previousPressedKeys = new Set<string>();

    // decide aqui qual arma o "*" do numpad adiciona
    private readonly debugWeaponToAdd: WeaponType = WeaponType.SMG;
    private readonly debugMoneyToAdd = 1000;

    constructor(
        private inventoryManager: InventoryManager,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
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

        if (this.wasKeyPressedThisFrame("KeyN")) {
            this.inventoryManager.debugPrintInventory(inventory);
        }

        if (this.wasMoneyDebugPressedThisFrame()) {
            this.inventoryManager.addResource(inventory, InventoryResourceType.Money, this.debugMoneyToAdd);
            console.log(`[InventoryDebug] Money added: ${this.debugMoneyToAdd}`);
        }

        if (this.wasKeyPressedThisFrame("NumpadMultiply")) {
            this.addWeapon(inventory, this.debugWeaponToAdd);
        }

        if (this.wasKeyPressedThisFrame("Numpad0")) {
            this.inventoryManager.addResource(inventory, InventoryResourceType.PistolMag, 1);
        }

        if (this.wasKeyPressedThisFrame("Numpad1")) {
            this.inventoryManager.addResource(inventory, InventoryResourceType.SmgMag, 1);
        }

        if (this.wasKeyPressedThisFrame("Numpad2")) {
            this.inventoryManager.addResource(inventory, InventoryResourceType.RifleMag, 1);
        }

        if (this.wasKeyPressedThisFrame("Numpad3")) {
            this.inventoryManager.addResource(inventory, InventoryResourceType.Grenade, 1);
        }

        if (this.wasKeyPressedThisFrame("Numpad4")) {
            this.inventoryManager.addResource(inventory, InventoryResourceType.Money, 1000);
        }

        if (this.wasKeyPressedThisFrame("Numpad5")) {
            this.inventoryManager.removeResource(inventory, InventoryResourceType.PistolMag, 1);
        }

        if (this.wasKeyPressedThisFrame("Numpad6")) {
            this.inventoryManager.removeResource(inventory, InventoryResourceType.SmgMag, 1);
        }

        if (this.wasKeyPressedThisFrame("Numpad7")) {
            this.inventoryManager.removeResource(inventory, InventoryResourceType.RifleMag, 1);
        }

        if (this.wasKeyPressedThisFrame("Numpad8")) {
            this.inventoryManager.removeResource(inventory, InventoryResourceType.Grenade, 1);
        }

        if (this.wasKeyPressedThisFrame("Numpad9")) {
            this.inventoryManager.removeResource(inventory, InventoryResourceType.Money, 1000);
        }

        if (this.wasKeyPressedThisFrame("KeyK")) {
            const health = this.healthComponentStore.getOrNull(playerEntity);
            if (health) {
                health.takeDamage(20);
                console.log(`[InventoryDebug] Player took 20 damage. HP: ${health.hp}/${health.maxHp}`);
            }
        }

        this.syncInputFrame();
    }

    private addWeapon(inventory: InventoryComponent, weaponType: WeaponType): void {
        const weaponState = this.inventoryManager.getOrCreateWeaponState(inventory, weaponType);
        weaponState.owned = true;

        if (weaponState.roundsInMag <= 0) {
            weaponState.roundsInMag = WeaponConfig[weaponType].maxBullets;
        }

        console.log(`[InventoryDebug] Weapon added: ${weaponType}`);
    }

    private wasKeyPressedThisFrame(code: string): boolean {
        return this.pressedKeys.has(code) && !this.previousPressedKeys.has(code);
    }

    private wasMoneyDebugPressedThisFrame(): boolean {
        return this.wasKeyPressedThisFrame("NumpadAdd") || this.wasKeyPressedThisFrame("Plus");
    }

    private syncInputFrame(): void {
        this.previousPressedKeys = new Set(this.pressedKeys);
        this.wasNPressedLastFrame = this.isNPressed;
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        this.pressedKeys.add(event.code);
        if (event.key === "+") {
            this.pressedKeys.add("Plus");
        }

        if (event.code === "KeyN") {
            this.isNPressed = true;
        }
    };

    private onKeyUp = (event: KeyboardEvent): void => {
        this.pressedKeys.delete(event.code);
        if (event.key === "+") {
            this.pressedKeys.delete("Plus");
        }

        if (event.code === "KeyN") {
            this.isNPressed = false;
        }
    };

    destroy(): void {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
    }
}
