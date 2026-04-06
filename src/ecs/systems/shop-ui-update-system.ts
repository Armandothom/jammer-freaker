import { ShopManager } from "../core/shop-manager.js";
import { ISystem } from "./system.interface.js";

export class ShopUIUpdateSystem implements ISystem {
    private isUIInitialized = false;

    constructor(
        private shopManager: ShopManager,
    ) { }

    public update(deltaTime: number): void {
        if (!this.isUIInitialized) {
            this.shopManager.createInitialUI();
            this.isUIInitialized = true;
        }
    }

    public reset(): void {
        this.isUIInitialized = false;
    }
}
