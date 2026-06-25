import { CombatStimActiveComponent } from "../components/combat-stim-active-component.js";
import { DeathIntentComponent, DeathIntentReason } from "../components/death-intent.component.js";
import { EpipenActiveComponent } from "../components/epipen-active-component.js";
import { HealBleedIntentComponent } from "../components/heal-bleed-intent.component.js";
import { HealthComponent } from "../components/health.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { MedicalItemUseComponent } from "../components/medical-item-use.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { MEDICAL_ITEM_CONFIG, type MedicalItemType } from "../components/types/medical-items-config.js";
import { MedicalShopUpgradeItemType } from "../components/types/medical-shop-upgrade-item-config.js";
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
        private deathIntentComponentStore: ComponentStore<DeathIntentComponent>,
        private isUseBlocked: () => boolean = () => false,
    ) {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }
    update(deltaTime: number): void {
        this.handleMedicalItemInput();

        this.syncInputFrame();
        this.updateItemUse(deltaTime);
        this.updateActiveItems(deltaTime);
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

    public tryStartMedicalItemUse(itemApplied: MedicalItemType, consumeInventory: boolean = true): boolean {
        if (this.isUseBlocked()) {
            return false;
        }

        const playerEntity = this.getPlayerEntity();

        if (playerEntity == null) {
            return false;
        }

        if (this.medicalItemUseComponentStore.has(playerEntity)) {
            return false;
        }

        const inventory = this.inventoryComponent.getOrNull(playerEntity);
        const velocity = this.velocityComponentStore.getOrNull(playerEntity);
        if (!inventory || !velocity) {
            return false;
        }

        if (itemApplied === InventoryResourceType.Healpack) {
            const health = this.healthComponentStore.getOrNull(playerEntity);

            if (!health || health.hp === health.maxHp) {
                return false;
            }
        }

        if (consumeInventory && this.inventoryManager.getResourceAmount(inventory, itemApplied) <= 0) {
            return false;
        }

        const useEfficiencyUpgrade = this.inventoryManager.getMedicalUpgradeValueOrDefault(inventory, MedicalShopUpgradeItemType.USE_EFFICIENCY);
        const applyTime = MEDICAL_ITEM_CONFIG[itemApplied].useTime * useEfficiencyUpgrade;
        this.medicalItemUseComponentStore.add(
            playerEntity,
            new MedicalItemUseComponent(itemApplied, applyTime, consumeInventory),
        );
        this.applyUsageSlow(velocity);
        return true;
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

        const activeEpipen = this.epipenActiveComponentStore.getOrNull(playerEntity);
        const velocityFactor = activeEpipen?.velocityIncreaseFactor ?? 1;

        velocity.currentVelocityX = velocity.baseVelocityX * velocityFactor;
        velocity.currentVelocityY = velocity.baseVelocityY * velocityFactor;
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
            this.applyItem(medicalItemUse.itemApplied, medicalItemUse.consumeInventory);
            this.restorePlayerVelocity(playerEntity);
        }
    }

    private updateActiveItems(deltaTime: number) {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];

        if (this.epipenActiveComponentStore.has(playerEntity)) {
            const activeEpipen = this.epipenActiveComponentStore.get(playerEntity);
            activeEpipen.time += deltaTime;
            if (activeEpipen.time >= activeEpipen.maxDuration) {
                this.epipenActiveComponentStore.remove(playerEntity);
                this.restorePlayerVelocity(playerEntity);
            }
        }
        if (this.combatStimActiveComponentStore.has(playerEntity)) {
            const activeCombatStim = this.combatStimActiveComponentStore.get(playerEntity);
            activeCombatStim.time += deltaTime;
            if (activeCombatStim.time >= activeCombatStim.maxDuration) {
                this.combatStimActiveComponentStore.remove(playerEntity);
            }
        }
    }

    private applyItem(item: InventoryResourceType, consumeInventory: boolean) {
        const playerEntity = this.getPlayerEntity();

        if (playerEntity == null) {
            return;
        }

        const inventory = this.inventoryComponent.get(playerEntity);
        if (consumeInventory) {
            this.inventoryManager.removeResource(inventory, item, 1);
        }
        const stimDurationUpgrade = this.inventoryManager.getMedicalUpgradeValueOrDefault(inventory, MedicalShopUpgradeItemType.STIM_DURATION);
        const medicalEfficiencyUpgrade = this.inventoryManager.getMedicalUpgradeValueOrDefault(inventory, MedicalShopUpgradeItemType.USE_EFFICIENCY);

        switch (item) {
            case InventoryResourceType.Healpack:
                const health = this.healthComponentStore.get(playerEntity);
                health.hp += MEDICAL_ITEM_CONFIG[item].healingQuantity * medicalEfficiencyUpgrade;
                if (health.hp > health.maxHp) {
                    health.hp = health.maxHp;
                }
                break;

            case InventoryResourceType.Bandage:
                this.healBleedIntentComponentStore.add(playerEntity, new HealBleedIntentComponent())
                break;

            case InventoryResourceType.CombatStim:
                if (this.combatStimActiveComponentStore.has(playerEntity)) {
                    const activeCombatStims = this.combatStimActiveComponentStore.get(playerEntity);
                    activeCombatStims.maxDuration = this.getUpgradedActiveItemDuration(item, stimDurationUpgrade);
                    if (activeCombatStims.activeSimultaneous <= MEDICAL_ITEM_CONFIG[item].maxSimultaneous) {
                        activeCombatStims.activeSimultaneous++;
                    }
                    if (activeCombatStims.activeSimultaneous > 1 && activeCombatStims.activeSimultaneous < MEDICAL_ITEM_CONFIG[item].maxSimultaneous) {
                        const combatStimEffect = MEDICAL_ITEM_CONFIG[item].effect;
                        activeCombatStims.runnningPrecision = combatStimEffect?.runnningPrecision ?? activeCombatStims.runnningPrecision;
                        activeCombatStims.runAndGunCrosshairFollowFactor = combatStimEffect?.runAndGunCrosshairFollowFactor ?? activeCombatStims.runAndGunCrosshairFollowFactor;
                        activeCombatStims.runAndGunCameraLeadFactor = combatStimEffect?.runAndGunCameraLeadFactor ?? activeCombatStims.runAndGunCameraLeadFactor;
                        activeCombatStims.focusFireImprovement = ((1 - MEDICAL_ITEM_CONFIG[item].focusTimeReduceFactor) * medicalEfficiencyUpgrade) ** activeCombatStims.activeSimultaneous;
                        activeCombatStims.time = 0;
                    }
                    if (activeCombatStims.activeSimultaneous === 3) {
                        this.deathIntentComponentStore.add(playerEntity, new DeathIntentComponent(playerEntity, DeathIntentReason.MedicalOverdose))
                    }
                } else {
                    this.combatStimActiveComponentStore.add(
                        playerEntity,
                        new CombatStimActiveComponent(1, {
                            maxDuration: this.getUpgradedActiveItemDuration(item, stimDurationUpgrade),
                        }),
                    );
                }
                break;

            case InventoryResourceType.Epipen:
                const velocity = this.velocityComponentStore.get(playerEntity);
                if (this.epipenActiveComponentStore.has(playerEntity)) {
                    const activeEpipen = this.epipenActiveComponentStore.get(playerEntity);
                    activeEpipen.maxDuration = this.getUpgradedActiveItemDuration(item, stimDurationUpgrade);
                    if (activeEpipen.activeSimultaneous <= MEDICAL_ITEM_CONFIG[item].maxSimultaneous) {
                        activeEpipen.activeSimultaneous++;
                    }
                    if (activeEpipen.activeSimultaneous > 1 && activeEpipen.activeSimultaneous < MEDICAL_ITEM_CONFIG[item].maxSimultaneous) {
                        activeEpipen.undyingEffect = true;
                        activeEpipen.velocityIncreaseFactor = (MEDICAL_ITEM_CONFIG[item].velocityIncreaseFactor * medicalEfficiencyUpgrade) ** activeEpipen.activeSimultaneous;
                        this.applyVelocityBuff(velocity, activeEpipen.velocityIncreaseFactor);
                        activeEpipen.time = 0;
                    }
                    if (activeEpipen.activeSimultaneous === MEDICAL_ITEM_CONFIG[item].maxSimultaneous) {
                        activeEpipen.undyingEffect = false;
                        this.deathIntentComponentStore.add(playerEntity, new DeathIntentComponent(playerEntity, DeathIntentReason.MedicalOverdose))
                    }
                } else {
                    this.epipenActiveComponentStore.add(
                        playerEntity,
                        new EpipenActiveComponent(1, {
                            maxDuration: this.getUpgradedActiveItemDuration(item, stimDurationUpgrade),
                        }),
                    );
                    const activeEpipen = this.epipenActiveComponentStore.get(playerEntity);
                    this.applyVelocityBuff(velocity, activeEpipen.velocityIncreaseFactor);
                    //note: restore base velocity when epipen wears off
                }
                break;
        }
    }

    private getUpgradedActiveItemDuration(item: MedicalItemType, durationFactor: number): number {
        return MEDICAL_ITEM_CONFIG[item].duration * durationFactor;
    }

    private applyVelocityBuff(velocity: VelocityComponent, velocityFactor: number) {
        velocity.currentVelocityX = velocity.baseVelocityX * velocityFactor;
        velocity.currentVelocityY = velocity.baseVelocityY * velocityFactor;
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
