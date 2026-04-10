import { ButtonClickIntentComponent } from "../components/button-click-intent.component.js";
import { GunDealerComponent } from "../components/gun-dealer-component.js";
import { ParentEntityComponent } from "../components/parent-entity-component.js";
import { ResourceShopItemComponent } from "../components/resource-shop-item.component.js";
import { ShopButtonComponent } from "../components/shop-button-component.js";
import { ShopDialogIntentComponent } from "../components/shop-dialog-intent.component.js";
import { ShopTabButtonComponent } from "../components/shop-tab-button.component.js";
import { ShopUIComponent } from "../components/shop-ui-component.js";
import { ShopUpgradeTabButtonComponent } from "../components/shop-upgrade-tab-button-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { ShopUpgradeTabState } from "../components/states/shop-upgrade-tab-state.js";
import { SHOP_BUTTON_CONFIG, ShopButtonState, ShopButtonType } from "../components/types/shop-button-config.js";
import { ShopDialogEvent } from "../components/types/shop-dialog-event.enum.js";
import { ShopTabType } from "../components/types/shop-tab-config.js";
import { ShopUIType } from "../components/types/shop-ui-type.js";
import { SHOP_UPGRADE_TAB_CONFIG, ShopUpgradeTabType } from "../components/types/shop-upgrade-tab-config.js";
import { UpgradeShopItemComponent } from "../components/upgrade-shop-item-component.js";
import { WeaponShopItemComponent } from "../components/weapon-shop-item.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ShopManager } from "../core/shop-manager.js";
import { ShopEntityFactory } from "../entities/shop-entity-factory.js";
import { ISystem } from "./system.interface.js";

export class ButtonClickProcessingSystem implements ISystem {
    constructor(
        private shopManager: ShopManager,
        private shopEntityFactory: ShopEntityFactory,
        private shopInventoryState: ShopInventoryState,
        private shopTabState: ShopTabState,
        private shopUpgradeTabState: ShopUpgradeTabState,
        private buttonClickIntentComponentStore: ComponentStore<ButtonClickIntentComponent>,
        private shopUIComponentStore: ComponentStore<ShopUIComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private shopButtonComponentStore: ComponentStore<ShopButtonComponent>,
        private weaponShopItemComponentStore: ComponentStore<WeaponShopItemComponent>,
        private resourceShopItemComponentStore: ComponentStore<ResourceShopItemComponent>,
        private shopTabButtonComponentStore: ComponentStore<ShopTabButtonComponent>,
        private parentEntityComponentStore: ComponentStore<ParentEntityComponent>,
        private gunDealerComponentStore: ComponentStore<GunDealerComponent>,
        private shopDialogIntentComponentStore: ComponentStore<ShopDialogIntentComponent>,
        private upgradeShopItemComponentStore: ComponentStore<UpgradeShopItemComponent>,
        private shopUpgradeTabButtonComponentStore: ComponentStore<ShopUpgradeTabButtonComponent>,
        private requestGameplayState: () => void,
    ) { }

    public update(deltaTime: number): void {
        let shouldReturnToGameplay = false;

        for (const intent of this.buttonClickIntentComponentStore.getAllEntities()) {
            const uiType = this.findButtonType(intent);

            if (uiType === ShopUIType.TAB_BUTTON) {
                const activeTab = this.shopTabState.getActiveTabType();
                if (this.shopTabButtonComponentStore.get(intent).tabType === activeTab) {
                    this.buttonClickIntentComponentStore.remove(intent);
                    continue;
                }
                const newTab = this.shopTabButtonComponentStore.get(intent).tabType
                this.resetTabButtons(intent);
                this.setButtonState(intent, ShopButtonType.TAB, ShopButtonState.SELECTED);
                this.setTabState(intent, newTab);
                this.changeShopTab(activeTab, newTab)
                this.buttonClickIntentComponentStore.remove(intent);
                continue;
            }

            if (uiType === ShopUIType.BUY_BUTTON) {
                this.processBuyButtonClick(intent);
                this.buttonClickIntentComponentStore.remove(intent);
                continue;
            }

            if (uiType === ShopUIType.UPGRADE_TAB_BUTTON) {
                const newTab = this.shopUpgradeTabButtonComponentStore.get(intent).tabType
                if (newTab === this.shopUpgradeTabState.getActiveTabType()) {
                    this.buttonClickIntentComponentStore.remove(intent);
                    continue;
                }
                this.resetUpgradeTabButtons(intent);
                this.setButtonState(intent, ShopButtonType.UPGRADE_TAB, ShopButtonState.SELECTED);
                this.changeUpgradeTab(newTab);
                this.buttonClickIntentComponentStore.remove(intent);
                continue;
            }

            if (uiType === ShopUIType.UPGRADE_TAB_NAV_LEFT_BUTTON) {
                const activeTabChanged = this.shopManager.navigateUpgradeTabWindow(-1);
                this.refreshUpgradeTabControls();

                if (activeTabChanged) {
                    this.refreshUpgradeItems();
                }

                this.buttonClickIntentComponentStore.remove(intent);
                continue;
            }

            if (uiType === ShopUIType.UPGRADE_TAB_NAV_RIGHT_BUTTON) {
                const activeTabChanged = this.shopManager.navigateUpgradeTabWindow(1);
                this.refreshUpgradeTabControls();

                if (activeTabChanged) {
                    this.refreshUpgradeItems();
                }

                this.buttonClickIntentComponentStore.remove(intent);
                continue;
            }

            if (uiType === ShopUIType.RETURN_BUTTON) {
                this.setButtonState(intent, ShopButtonType.RETURN, ShopButtonState.SELECTED);
                this.buttonClickIntentComponentStore.remove(intent);
                shouldReturnToGameplay = true;
                continue;
            }

            this.buttonClickIntentComponentStore.remove(intent);
        }

        if (shouldReturnToGameplay) {
            this.requestGameplayState();
        }
    }

    private resetTabButtons(selfEntityId: number): void {
        for (const entityId of this.shopButtonComponentStore.getAllEntities()) {
            if (entityId === selfEntityId) continue;
            if (!this.shopUIComponentStore.has(entityId)) continue;


            const uiType = this.shopUIComponentStore.get(entityId).shopUiType;

            if (uiType !== ShopUIType.TAB_BUTTON) continue;

            this.setButtonState(entityId, ShopButtonType.TAB, ShopButtonState.NORMAL);
        }
    }

    private resetUpgradeTabButtons(selfEntityId: number): void {
        for (const entityId of this.shopUpgradeTabButtonComponentStore.getAllEntities()) {
            if (entityId === selfEntityId) continue;
            this.setButtonState(entityId, ShopButtonType.UPGRADE_TAB, ShopButtonState.NORMAL);
        }
    }

    private setButtonState(
        entityId: number,
        buttonType: ShopButtonType,
        buttonState: ShopButtonState,
    ): void {
        if (!this.shopButtonComponentStore.has(entityId)) return;

        this.shopButtonComponentStore.get(entityId).state = buttonState;
        this.spriteComponentStore.get(entityId).spriteName = SHOP_BUTTON_CONFIG[buttonType].states[buttonState].spriteName;
    }

    private setTabState(
        entityId: number,
        tabType: ShopTabType,
    ): void {
        if (!this.shopTabButtonComponentStore.has(entityId)) return;

        this.shopTabState.setActiveTabType(tabType);
    }

    private findButtonType(entityId: number): ShopUIType | undefined {
        if (!this.shopUIComponentStore.has(entityId)) {
            return undefined;
        }

        return this.shopUIComponentStore.get(entityId).shopUiType;
    }

    private changeShopTab(activeTab: ShopTabType, newTab: ShopTabType) {
        const shopItemEntitiesToDestroy = new Set<number>();
        this.destroyUpgradeTabControls();

        for (const button of this.shopButtonComponentStore.getAllEntities()) {
            const buttonTabSource = this.shopButtonComponentStore.get(button).shopTabType;
            if (!this.parentEntityComponentStore.has(button)) continue;
            const parentEntityId = this.parentEntityComponentStore.get(button).parentEntityId;

            if (buttonTabSource === activeTab) {
                shopItemEntitiesToDestroy.add(parentEntityId);
            }
        }

        for (const shopItemEntityId of shopItemEntitiesToDestroy) {
            this.shopEntityFactory.destroyShopItemAndAssociates(shopItemEntityId);
        }

        switch (newTab) {
            case ShopTabType.WEAPONS:
                this.shopManager.createWeaponItems();
                break;

            case ShopTabType.RESOURCES:
                this.shopManager.createResourceItems();
                break;

            case ShopTabType.UPGRADES:
                this.shopManager.createUpgradeTabButtons();
                this.shopManager.createUpgrades();
                break;

            default:
                // fallback
                break;
        }
    }

    private changeUpgradeTab(newUpgradeTab: ShopUpgradeTabType): void {
        const activeUpgradeTab = this.shopUpgradeTabState.getActiveTabType();
        if (activeUpgradeTab === newUpgradeTab) return;

        this.shopUpgradeTabState.setActiveTabType(newUpgradeTab);
        this.refreshUpgradeItems();
    }

    private processBuyButtonClick(buttonEntityId: number): void {
        const button = this.shopButtonComponentStore.get(buttonEntityId);
        if (!this.parentEntityComponentStore.has(buttonEntityId)) return;

        const parentEntityId = this.parentEntityComponentStore.get(buttonEntityId).parentEntityId;
        if (button.state === ShopButtonState.DISABLED) return;

        const gunDealerId = this.gunDealerComponentStore.getAllEntities()[0];

        if (this.weaponShopItemComponentStore.has(parentEntityId)) {
            const itemType = this.weaponShopItemComponentStore.get(parentEntityId).itemType;
            const didPurchase = this.shopInventoryState.tryPurchaseWeaponItem(itemType);

            if (!didPurchase) {
                if (!this.shopDialogIntentComponentStore.has(gunDealerId)) {
                    if (this.randomRoll(0.5)) {
                        this.shopDialogIntentComponentStore.add(gunDealerId, new ShopDialogIntentComponent(ShopDialogEvent.CANT_BUY));
                    }
                }
                return;
            }
            this.setButtonState(buttonEntityId, ShopButtonType.BUY, ShopButtonState.DISABLED);
            this.shopManager.updateMoneyText();
            return;
        }

        if (this.resourceShopItemComponentStore.has(parentEntityId)) {
            const resourceShopItem = this.resourceShopItemComponentStore.get(parentEntityId);
            const itemType = resourceShopItem.itemType;
            const didPurchase = this.shopInventoryState.tryPurchaseResourceItem(itemType);

            if (!didPurchase) {
                if (!this.shopDialogIntentComponentStore.has(gunDealerId)) {
                    if (this.randomRoll(0.5)) {
                        this.shopDialogIntentComponentStore.add(gunDealerId, new ShopDialogIntentComponent(ShopDialogEvent.CANT_BUY));
                    }
                }
                return;
            }

            const remainingStock = this.shopInventoryState.getAvailableResourceItemStock(itemType);

            if (resourceShopItem.quantityTextEntityId != null) {
                this.shopManager.updateAssociatedText(
                    resourceShopItem.quantityTextEntityId,
                    `x${remainingStock}`,
                );
            }

            if (remainingStock <= 0) {
                this.setButtonState(buttonEntityId, ShopButtonType.BUY, ShopButtonState.DISABLED);
            }

            this.shopManager.updateMoneyText();
            return;
        }

        if (this.upgradeShopItemComponentStore.has(parentEntityId)) {
            const upgradeShopItem = this.upgradeShopItemComponentStore.get(parentEntityId);
            const weaponType = SHOP_UPGRADE_TAB_CONFIG[upgradeShopItem.shopUpgradeTab].weaponType;
            const didPurchase = this.shopInventoryState.tryPurchaseWeaponUpgrade(
                weaponType,
                upgradeShopItem.weaponUpgradeType,
            );

            if (!didPurchase) {
                if (!this.shopDialogIntentComponentStore.has(gunDealerId)) {
                    if (this.randomRoll(0.5)) {
                        this.shopDialogIntentComponentStore.add(gunDealerId, new ShopDialogIntentComponent(ShopDialogEvent.CANT_BUY));
                    }
                }
                return;
            }

            this.refreshUpgradeItems();
            this.shopManager.updateMoneyText();
        }
    }

    private refreshUpgradeItems(): void {
        const upgradeItemEntitiesToDestroy = [
            ...this.upgradeShopItemComponentStore.getAllEntities(),
        ];

        for (const upgradeItemEntityId of upgradeItemEntitiesToDestroy) {
            this.shopEntityFactory.destroyUpgradeItemAndAssociates(upgradeItemEntityId);
        }

        this.shopManager.createUpgrades();
    }

    private refreshUpgradeTabControls(): void {
        this.destroyUpgradeTabControls();
        this.shopManager.createUpgradeTabButtons();
    }

    private destroyUpgradeTabControls(): void {
        const upgradeTabControlEntityIds = this.shopUIComponentStore
            .getAllEntities()
            .filter((entityId) => {
                const uiType = this.shopUIComponentStore.get(entityId).shopUiType;
                return uiType === ShopUIType.UPGRADE_TAB_BUTTON
                    || uiType === ShopUIType.UPGRADE_TAB_NAV_LEFT_BUTTON
                    || uiType === ShopUIType.UPGRADE_TAB_NAV_RIGHT_BUTTON;
            });

        for (const entityId of upgradeTabControlEntityIds) {
            const uiType = this.shopUIComponentStore.get(entityId).shopUiType;

            if (uiType === ShopUIType.UPGRADE_TAB_BUTTON) {
                this.shopEntityFactory.destroyUpgradeTabButtonAndAssociates(entityId);
                continue;
            }

            this.shopEntityFactory.destroyStandaloneButton(entityId);
        }
    }

    private randomRoll(threshold: number): boolean {
        return Math.random() > threshold;
    }
}
