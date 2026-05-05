import { CombatStimActiveComponent } from "../components/combat-stim-active-component.js";
import { EpipenActiveComponent } from "../components/epipen-active-component.js";
import { HealBleedIntentComponent } from "../components/heal-bleed-intent.component.js";
import { HealthComponent } from "../components/health.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { MedicalItemUseComponent } from "../components/medical-item-use.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { MEDICAL_ITEM_CONFIG, type MedicalItemType } from "../components/types/medical-items-config.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { ISystem } from "./system.interface.js";

export class MedicalItemsSystem implements ISystem {
    private medicalItemMovementSpeedSlow = 0.75
    private pressedKeys = new Set<string>();
    private previousPressedKeys = new Set<string>();
    private readonly medicalItemKeyBindings = [
        { code: "KeyT", use: () => this.useHealpack() },
        { code: "KeyV", use: () => this.useBandage() },
        { code: "KeyC", use: () => this.useEpipen() },
        { code: "KeyX", use: () => this.useCombatStim() },
    ];

    constructor(
        private inventoryManager: InventoryManager,
        private inventoryComponent: ComponentStore<InventoryComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private medicalItemUseComponentStore: ComponentStore<MedicalItemUseComponent>,
        private healBleedIntentComponentStore: ComponentStore<HealBleedIntentComponent>,
        private combatStimActiveComponentStore: ComponentStore<CombatStimActiveComponent>,
        private epipenActiveComponentStore: ComponentStore<EpipenActiveComponent>,
    ) {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }
    update(deltaTime: number): void {
        this.handleMedicalItemInput();

        this.syncInputFrame();
        this.updateItemUse(deltaTime);
        this.updateActiveItems();
    }

    private handleMedicalItemInput(): void {
        for (const { code, use } of this.medicalItemKeyBindings) {
            if (this.wasKeyPressedThisFrame(code)) {
                use();
            }
        }
    }

    private useHealpack(): void {
        const playerEntity = this.getPlayerEntity();
        const health = this.healthComponentStore.get(playerEntity!);
        if (health.hp === health.maxHp) return;
        this.tryStartMedicalItemUse(InventoryResourceType.Healpack);
    }

    private useBandage(): void {
        this.tryStartMedicalItemUse(InventoryResourceType.Bandage);
    }

    private useEpipen(): void {
        this.tryStartMedicalItemUse(InventoryResourceType.Epipen);
    }

    private useCombatStim(): void {
        this.tryStartMedicalItemUse(InventoryResourceType.CombatStim);
    }

    private tryStartMedicalItemUse(itemApplied: MedicalItemType): void {
        const playerEntity = this.getPlayerEntity();
        if (playerEntity == null) {
            return;
        }

        if (this.medicalItemUseComponentStore.has(playerEntity)) {
            return;
        }

        const inventory = this.inventoryComponent.getOrNull(playerEntity);
        const velocity = this.velocityComponentStore.getOrNull(playerEntity);
        if (!inventory || !velocity) {
            return;
        }

        if (this.inventoryManager.getResourceAmount(inventory, itemApplied) <= 0) {
            return;
        }

        const applyTime = MEDICAL_ITEM_CONFIG[itemApplied].useTime;
        this.medicalItemUseComponentStore.add(playerEntity, new MedicalItemUseComponent(itemApplied, applyTime));
        this.applyUsageSlow(velocity);
    }

    private getPlayerEntity(): number | null {
        return this.playerComponentStore.getAllEntities()[0] ?? null;
    }

    private wasKeyPressedThisFrame(code: string): boolean {
        return this.pressedKeys.has(code) && !this.previousPressedKeys.has(code);
    }

    private syncInputFrame(): void {
        this.previousPressedKeys = new Set(this.pressedKeys);
    }

    private applyUsageSlow(velocity: VelocityComponent): void {
        velocity.currentVelocityX = velocity.baseVelocityX * this.medicalItemMovementSpeedSlow;
        velocity.currentVelocityY = velocity.baseVelocityY * this.medicalItemMovementSpeedSlow;
    }

    private restorePlayerVelocity(playerEntity: number): void {
        const velocity = this.velocityComponentStore.getOrNull(playerEntity);
        if (!velocity) {
            return;
        }

        velocity.currentVelocityX = velocity.baseVelocityX;
        velocity.currentVelocityY = velocity.baseVelocityY;
    }

    private useCancelConditions(playerEntity: number): boolean {
        if (!this.intentShotComponentStore.has(playerEntity)) {
            return false;
        }

        this.restorePlayerVelocity(playerEntity);
        return true;
    }

    private updateItemUse(deltaTime: number) {
        const playerEntity = this.getPlayerEntity();
        if (playerEntity == null) {
            return;
        }
        if (!this.medicalItemUseComponentStore.has(playerEntity)) return;

        const medicalItemUse = this.medicalItemUseComponentStore.get(playerEntity);

        medicalItemUse.timer += deltaTime;
        if (this.useCancelConditions(playerEntity)) {
            this.medicalItemUseComponentStore.remove(playerEntity);
            return;
        }
        if (medicalItemUse.timer >= medicalItemUse.applyTime) {
            this.medicalItemUseComponentStore.remove(playerEntity);
            this.applyItem(medicalItemUse.itemApplied);
            this.restorePlayerVelocity(playerEntity);
        }
    }

    private updateActiveItems() {

    }

    private applyItem(item: InventoryResourceType) {
        const playerEntity = this.getPlayerEntity();

        if (playerEntity == null) {
            return;
        }
        const inventory = this.inventoryComponent.get(playerEntity);
        this.inventoryManager.removeResource(inventory, item, 1);
        if (item === InventoryResourceType.Healpack) {
            const health = this.healthComponentStore.get(playerEntity);
            health.hp += MEDICAL_ITEM_CONFIG[item].healingQuantity;
            if (health.hp > health.maxHp) {
                health.hp = health.maxHp;
            }
        }
        if (item === InventoryResourceType.Bandage) {
            this.healBleedIntentComponentStore.add(playerEntity, new HealBleedIntentComponent())
        }
        if (item === InventoryResourceType.CombatStim) {
            if (this.combatStimActiveComponentStore.has(playerEntity)) {

            } else {
                this.combatStimActiveComponentStore.add(playerEntity, new CombatStimActiveComponent());
            }

        }
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
