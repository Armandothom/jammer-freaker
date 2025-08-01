import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { PlayerComponent } from "../components/player.component.js";
import { ReloadIntentComponent } from "../components/reload-intent.component.js";
import { WeaponMagazineComponent } from "../components/weapon-magazine.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

const keys: Record<string, boolean> = {};

export class ReloadSystem implements ISystem {
    private reloadElapsedTime = 0;
    private soundFlag = false

    constructor(
        private soundManager: SoundManager,
        private reloadIntentComponentStore: ComponentStore<ReloadIntentComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private weaponMagazineComponentStore: ComponentStore<WeaponMagazineComponent>
    ) {
    }

    update(deltaTime: number): void {
        const playerId = this.playerComponentStore.getAllEntities()[0];

        if (!this.reloadIntentComponentStore.has(playerId)) {
            this.getInputForReload();
        }

        if (this.reloadIntentComponentStore.has(playerId) && this.weaponMagazineComponentStore.get(playerId).magazineInventory >= 0) {
            if (!this.soundFlag) {
                this.soundFlag = true;
                this.soundManager.playSound("RIFLE_RELOAD");
            }
            const endReloadTime = this.reloadIntentComponentStore.get(playerId).endReloadTime;
            this.reloadElapsedTime += deltaTime;
            const previousTime = this.reloadElapsedTime - deltaTime
            if (previousTime < endReloadTime && this.reloadElapsedTime >= endReloadTime) {
                this.reloadIntentComponentStore.remove(playerId);
                this.weaponMagazineComponentStore.get(playerId).isReloading = false;
                this.weaponMagazineComponentStore.get(playerId).currentAmmo = this.weaponMagazineComponentStore.get(playerId).maxAmmo;
                this.reloadElapsedTime = 0;
                this.soundFlag = false;
            }
        }
    }

    private getInputForReload() {
        const playerId = this.playerComponentStore.getAllEntities()[0];
        if (keys["r"]) {
            this.reloadIntentComponentStore.add(playerId, new ReloadIntentComponent(this.weaponMagazineComponentStore.get(playerId).reloadTime));
            this.weaponMagazineComponentStore.get(playerId).magazineInventory--;
        }
    }
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

