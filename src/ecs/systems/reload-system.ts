
import { SOUND_KEYS } from "../../game/asset-manager/consts/sound-mapped.values.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { ReloadIntentComponent } from "../components/reload-intent.component.js";
import { WeaponConfig } from "../components/types/weapon-config.js";
import { WeaponStatsComponent } from "../components/weapon-stats.component.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { ISystem } from "./system.interface.js";

const keys: Record<string, boolean> = {};

export class ReloadSystem implements ISystem {
    private reloadElapsedTime = 0;

    constructor(
        private soundEventBus: SoundEventBus,
        private inventoryManager: InventoryManager,
        private reloadIntentComponentStore: ComponentStore<ReloadIntentComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private weaponStatsComponentStore: ComponentStore<WeaponStatsComponent>,
    ) {
    }

    update(deltaTime: number): void {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        const inventory = this.inventoryComponentStore.get(playerEntity);

        if (!this.reloadIntentComponentStore.has(playerEntity)) {
            this.resetReloadTimer();
            this.getInputForReload();
        }

        if (this.reloadIntentComponentStore.has(playerEntity)) {
            const reloadedWeapon = this.reloadIntentComponentStore.get(playerEntity).reloadedWeapon;
            const magConsumed = this.inventoryManager.getAmmoResourceTypeForWeapon(reloadedWeapon);
            if (this.inventoryManager.getResourceAmount(inventory, magConsumed) == 0) {
                console.log("No more mags for this weapon");
                this.reloadIntentComponentStore.remove(playerEntity);
                this.resetReloadTimer();
                return;
            }

            const endReloadTime = this.reloadIntentComponentStore.get(playerEntity).endReloadTime;
            this.soundEventBus.emitSound({
                key: SOUND_KEYS.RIFLE_RELOAD,
                requestId: `reload:${playerEntity}`,
                mode: "cooldown",
                cooldownMs: endReloadTime * 1000,
            });

            this.reloadElapsedTime += deltaTime;
            const previousTime = this.reloadElapsedTime - deltaTime
            if (previousTime < endReloadTime && this.reloadElapsedTime >= endReloadTime) {
                this.reloadIntentComponentStore.remove(playerEntity);
                this.inventoryManager.removeResource(inventory, magConsumed, 1);
                const maxBullets = this.weaponStatsComponentStore.has(playerEntity)
                    ? this.weaponStatsComponentStore.get(playerEntity).maxBullets
                    : WeaponConfig[reloadedWeapon].maxBullets;
                const roundsToAdd = maxBullets - this.inventoryManager.getRoundsInMag(inventory, reloadedWeapon);
                this.inventoryManager.addRoundsInMag(inventory, reloadedWeapon, roundsToAdd);
                this.resetReloadTimer();
            }
        }
    }

    private getInputForReload() {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        const weaponWielded = this.inventoryComponentStore.get(playerEntity).equippedWeaponType;
        if (weaponWielded == null) return;
        const reloadTime = this.weaponStatsComponentStore.has(playerEntity)
            ? this.weaponStatsComponentStore.get(playerEntity).reloadTime
            : WeaponConfig[weaponWielded].reloadTime;
        if (keys["r"] || keys["R"]) {
            this.reloadIntentComponentStore.add(playerEntity, new ReloadIntentComponent(reloadTime, weaponWielded));
        }
    }

    private resetReloadTimer(): void {
        this.reloadElapsedTime = 0;
    }
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

