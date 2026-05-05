import { WeatherManager } from "../../game/weather/weather-manager.js";
import { DamageTakenIntentComponent } from "../components/damage-taken-intent.component.js";
import { HealthComponent } from "../components/health.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-config.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { ISystem } from "./system.interface.js";

export class InventoryDebugSystem implements ISystem {
    private isNPressed = false;
    private wasNPressedLastFrame = false;

    private pressedKeys = new Set<string>();
    private previousPressedKeys = new Set<string>();

    private readonly debugWeaponToAdd: WeaponType = WeaponType.RIFLE;
    private readonly debugMoneyToAdd = 1000;

    constructor(
        private inventoryManager: InventoryManager,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private damageTakenIntentComponentStore: ComponentStore<DamageTakenIntentComponent>,
        private weatherManager: WeatherManager,
    ) {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    private queueDamageTakenIntent(targetEntity: number, damageSource: number, damage: number) {
        const existingDamageIntent = this.damageTakenIntentComponentStore.getOrNull(targetEntity);
        if (existingDamageIntent) {
            existingDamageIntent.accumulate(damageSource, damage);
            return;
        }

        this.damageTakenIntentComponentStore.add(
            targetEntity,
            new DamageTakenIntentComponent(damageSource, damage),
        );
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

        if (this.wasKeyPressedThisFrame("KeyJ")) {
            this.addWeapon(inventory, this.debugWeaponToAdd);
        }

        if (this.wasKeyPressedThisFrame("KeyI")) {
            this.inventoryManager.addDebugResourceBundle(inventory);
            console.log("[InventoryDebug] Added debug resource bundle: +99 all resources, +99999 money.");
        }

        if (this.wasKeyPressedThisFrame("KeyU")) {
            this.weatherManager.cycleRainPreset();
        }

        if (this.wasKeyPressedThisFrame("KeyY")) {
            this.weatherManager.toggleScreenEffectTint();
        }

        if (this.wasKeyPressedThisFrame("KeyK")) {
            const health = this.healthComponentStore.getOrNull(playerEntity);
            if (health) {
                this.queueDamageTakenIntent(playerEntity, playerEntity, 20);
                console.log(`[InventoryDebug] Queued 20 damage for player. HP: ${health.hp}/${health.maxHp}`);
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
