
import { SOUND_KEYS, SOUND_VOLUME } from "../../game/asset-manager/consts/sound-mapped.values.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { ReloadIntentComponent } from "../components/reload-intent.component.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-config.js";
import { WeaponStatsComponent } from "../components/weapon-stats.component.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { ISystem } from "./system.interface.js";

const keys: Record<string, boolean> = {};

export class ReloadSystem implements ISystem {
    private reloadElapsedTime = 0;
    private wasReloadKeyDownLastFrame = false;

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
        const isReloadKeyDown = keys["r"] || keys["R"];
        const reloadPressedThisFrame = isReloadKeyDown && !this.wasReloadKeyDownLastFrame;

        if (!this.reloadIntentComponentStore.has(playerEntity)) {
            this.resetReloadTimer();
            if (reloadPressedThisFrame) {
                this.tryStartManualReload(playerEntity, inventory);
            }
        }

        if (this.reloadIntentComponentStore.has(playerEntity)) {
            const reloadIntent = this.reloadIntentComponentStore.get(playerEntity);
            const reloadedWeapon = reloadIntent.reloadedWeapon;
            if (!this.canContinueReload(playerEntity, inventory, reloadedWeapon)) {
                this.finishReload(playerEntity);
                this.wasReloadKeyDownLastFrame = isReloadKeyDown;
                return;
            }

            const endReloadTime = reloadIntent.endReloadTime;
            if (!reloadIntent.hasPlayedReloadSound) {
                this.emitReloadSound(reloadedWeapon);
                reloadIntent.hasPlayedReloadSound = true;
            }

            this.reloadElapsedTime += deltaTime;
            const previousTime = this.reloadElapsedTime - deltaTime
            if (previousTime < endReloadTime && this.reloadElapsedTime >= endReloadTime) {
                this.completeReloadStep(playerEntity, inventory, reloadIntent);
            }
        }

        this.wasReloadKeyDownLastFrame = isReloadKeyDown;
    }

    private tryStartManualReload(playerEntity: number, inventory: InventoryComponent) {
        const weaponWielded = this.inventoryComponentStore.get(playerEntity).equippedWeaponType;
        if (weaponWielded == null) return;
        const maxBullets = this.weaponStatsComponentStore.has(playerEntity)
            ? this.weaponStatsComponentStore.get(playerEntity).maxBullets
            : WeaponConfig[weaponWielded].maxBullets;
        const currentRoundsInMag = this.inventoryManager.getRoundsInMag(inventory, weaponWielded);
        if (currentRoundsInMag >= maxBullets) {
            return;
        }
        const ammoResourceType = this.inventoryManager.getAmmoResourceTypeForWeapon(weaponWielded);
        if (this.inventoryManager.getResourceAmount(inventory, ammoResourceType) <= 0) {
            return;
        }
        const reloadTime = this.weaponStatsComponentStore.has(playerEntity)
            ? this.weaponStatsComponentStore.get(playerEntity).reloadTime
            : WeaponConfig[weaponWielded].reloadTime;
        this.reloadIntentComponentStore.add(playerEntity, new ReloadIntentComponent(reloadTime, weaponWielded));
    }

    private canContinueReload(
        playerEntity: number,
        inventory: InventoryComponent,
        reloadedWeapon: WeaponType,
    ): boolean {
        const ammoResourceType = this.inventoryManager.getAmmoResourceTypeForWeapon(reloadedWeapon);
        if (this.inventoryManager.getResourceAmount(inventory, ammoResourceType) <= 0) {
            return false;
        }

        return this.inventoryManager.getRoundsInMag(inventory, reloadedWeapon) < this.getMaxBullets(playerEntity, reloadedWeapon);
    }

    private completeReloadStep(
        playerEntity: number,
        inventory: InventoryComponent,
        reloadIntent: ReloadIntentComponent,
    ): void {
        const reloadedWeapon = reloadIntent.reloadedWeapon;
        const ammoResourceType = this.inventoryManager.getAmmoResourceTypeForWeapon(reloadedWeapon);
        const consumedAmmo = this.inventoryManager.removeResource(inventory, ammoResourceType, 1);

        if (!consumedAmmo) {
            this.finishReload(playerEntity);
            return;
        }

        if (reloadedWeapon === WeaponType.SHOTGUN) {
            this.soundEventBus.emitSound({
                key: SOUND_KEYS.SHOTGUN_SHELL_RELOAD,
                volume: SOUND_VOLUME.SHOTGUN_SHELL_RELOAD,
            }
            )
            this.inventoryManager.addRoundsInMag(inventory, reloadedWeapon, 1);

            if (this.canContinueReload(playerEntity, inventory, reloadedWeapon)) {
                reloadIntent.hasPlayedReloadSound = false;
                this.resetReloadTimer();
                return;
            }

            this.finishReload(playerEntity);
            return;
        }

        const roundsToAdd = this.getMaxBullets(playerEntity, reloadedWeapon)
            - this.inventoryManager.getRoundsInMag(inventory, reloadedWeapon);
        this.inventoryManager.addRoundsInMag(inventory, reloadedWeapon, roundsToAdd);
        this.finishReload(playerEntity);
    }

    private finishReload(playerEntity: number): void {
        this.reloadIntentComponentStore.remove(playerEntity);
        this.resetReloadTimer();
    }

    private getMaxBullets(playerEntity: number, weaponType: WeaponType): number {
        return this.weaponStatsComponentStore.has(playerEntity)
            ? this.weaponStatsComponentStore.get(playerEntity).maxBullets
            : WeaponConfig[weaponType].maxBullets;
    }

    private resetReloadTimer(): void {
        this.reloadElapsedTime = 0;
    }

    private emitReloadSound(reloadedWeapon: WeaponType): void {
        if (reloadedWeapon === WeaponType.PISTOL) {
            this.soundEventBus.emitSound({
                key: SOUND_KEYS.PISTOL_RELOAD,
                volume: SOUND_VOLUME.PISTOL_RELOAD,
            });
        }
        if (reloadedWeapon === WeaponType.RIFLE) {
            this.soundEventBus.emitSound({
                key: SOUND_KEYS.RIFLE_RELOAD,
                volume: SOUND_VOLUME.RIFLE_RELOAD,
            });
        }
        if (reloadedWeapon === WeaponType.SMG) {
            this.soundEventBus.emitSound({
                key: SOUND_KEYS.SMG_RELOAD,
                volume: SOUND_VOLUME.SMG_RELOAD,
            });
        }
        if (reloadedWeapon === WeaponType.SNIPER) {
            this.soundEventBus.emitSound({
                key: SOUND_KEYS.SNIPER_RELOAD,
                volume: SOUND_VOLUME.SNIPER_RELOAD,
            });
        }
    }
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
