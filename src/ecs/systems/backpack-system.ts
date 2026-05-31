import { BackpackUpgradeIntentComponent } from "../components/backpack-upgrade-intent.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PlayerOccupiedComponent, PlayerOccupiedKind } from "../components/player-occupied.component.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { INVENTORY_OVERLAY_SCREEN_ID } from "../../ui/screens/node-ids/inventory-overlay-node-ids.js";
import { ISystem } from "./system.interface.js";

export class BackpackSystem implements ISystem {
    private isInventoryOverlayOpen = false;
    private pressedKeys = new Set<string>();
    private previousPressedKeys = new Set<string>();

    constructor(
        private inventoryManager: InventoryManager,
        private backpackUpgradeIntentComponentStore: ComponentStore<BackpackUpgradeIntentComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private playerOccupiedComponentStore: ComponentStore<PlayerOccupiedComponent>,
        private uiRuntime: UIRuntime,
    ) {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    update(deltaTime: number): void {
        if (this.wasKeyPressedThisFrame("KeyI")) {
            this.toggleInventoryOverlay();
        }

        for (const entity of this.backpackUpgradeIntentComponentStore.getAllEntities()) {
            const upgradeIntent = this.backpackUpgradeIntentComponentStore.get(entity);
            const inventory = this.inventoryComponentStore.getOrNull(entity);

            if (inventory) {
                this.inventoryManager.upgradeBackpack(
                    inventory,
                    upgradeIntent.nextBackpackType,
                );
            }

            this.backpackUpgradeIntentComponentStore.remove(entity);
        }

        this.syncInventoryOccupation();
        this.syncInputFrame();
    }

    public closeInventoryOverlay(): void {
        if (!this.isInventoryOverlayOpen) {
            return;
        }

        this.uiRuntime.popOverlay(INVENTORY_OVERLAY_SCREEN_ID);
        this.isInventoryOverlayOpen = false;
        this.clearInventoryOccupation();
    }

    public openInventoryOverlay(): boolean {
        if (this.isInventoryOverlayOpen) {
            return true;
        }

        if (!this.canOpenInventoryOverlay()) {
            return false;
        }

        this.uiRuntime.pushOverlay(INVENTORY_OVERLAY_SCREEN_ID);
        this.isInventoryOverlayOpen = true;
        this.syncInventoryOccupation();
        return true;
    }

    public isInventoryOverlayVisible(): boolean {
        return this.isInventoryOverlayOpen;
    }

    public destroy(): void {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
    }

    private canOpenInventoryOverlay(): boolean {
        const playerEntity = this.getPlayerEntity();

        return playerEntity != null
            && this.inventoryComponentStore.getOrNull(playerEntity) !== null;
    }

    private clearInventoryOccupation(): void {
        const playerEntity = this.getPlayerEntity();

        if (playerEntity == null) {
            return;
        }

        const occupied = this.playerOccupiedComponentStore.getOrNull(playerEntity);

        if (occupied?.kind === PlayerOccupiedKind.INVENTORY) {
            this.playerOccupiedComponentStore.remove(playerEntity);
        }
    }

    private getPlayerEntity(): number | null {
        return this.playerComponentStore.getAllEntities()[0] ?? null;
    }

    private syncInventoryOccupation(): void {
        if (!this.isInventoryOverlayOpen) {
            this.clearInventoryOccupation();
            return;
        }

        const playerEntity = this.getPlayerEntity();

        if (playerEntity == null) {
            return;
        }

        if (this.playerOccupiedComponentStore.has(playerEntity)) {
            return;
        }

        this.playerOccupiedComponentStore.add(
            playerEntity,
            new PlayerOccupiedComponent(PlayerOccupiedKind.INVENTORY),
        );
    }

    private toggleInventoryOverlay(): void {
        if (this.isInventoryOverlayOpen) {
            this.closeInventoryOverlay();
            return;
        }

        this.openInventoryOverlay();
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
}
