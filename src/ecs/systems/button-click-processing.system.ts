import { ButtonClickIntentComponent } from "../components/button-click-intent.component.js";
import { ParentEntityComponent } from "../components/parent-entity-component.js";
import { ResourceShopItemComponent } from "../components/resource-shop-item.component.js";
import { ShopButtonComponent } from "../components/shop-button-component.js";
import { ShopTabButtonComponent } from "../components/shop-tab-button.component.js";
import { ShopUIComponent } from "../components/shop-ui-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { SHOP_BUTTON_CONFIG, ShopButtonState, ShopButtonType } from "../components/types/shop-button-config.js";
import { ShopTabType } from "../components/types/shop-tab-config.js";
import { ShopUIType } from "../components/types/shop-ui-type.js";
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
        private buttonClickIntentComponentStore: ComponentStore<ButtonClickIntentComponent>,
        private shopUIComponentStore: ComponentStore<ShopUIComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private shopButtonComponentStore: ComponentStore<ShopButtonComponent>,
        private weaponShopItemComponentStore: ComponentStore<WeaponShopItemComponent>,
        private resourceShopItemComponentStore: ComponentStore<ResourceShopItemComponent>,
        private shopTabButtonComponentStore: ComponentStore<ShopTabButtonComponent>,
        private parentEntityComponentStore: ComponentStore<ParentEntityComponent>,
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
                // lógica para UPGRADES
                break;

            default:
                // fallback
                break;
        }
    }

    private processBuyButtonClick(buttonEntityId: number): void {
        const button = this.shopButtonComponentStore.get(buttonEntityId);
        if (!this.parentEntityComponentStore.has(buttonEntityId)) return;

        const parentEntityId = this.parentEntityComponentStore.get(buttonEntityId).parentEntityId;
        if (button.state === ShopButtonState.DISABLED) return;

        if (this.weaponShopItemComponentStore.has(parentEntityId)) {
            const itemType = this.weaponShopItemComponentStore.get(parentEntityId).itemType;
            const didPurchase = this.shopInventoryState.tryPurchaseWeaponItem(itemType);

            if (!didPurchase) return;

            this.setButtonState(buttonEntityId, ShopButtonType.BUY, ShopButtonState.DISABLED);
            this.shopManager.updateMoneyText();
            return;
        }

        if (this.resourceShopItemComponentStore.has(parentEntityId)) {
            const resourceShopItem = this.resourceShopItemComponentStore.get(parentEntityId);
            const itemType = resourceShopItem.itemType;
            const didPurchase = this.shopInventoryState.tryPurchaseResourceItem(itemType);

            if (!didPurchase) return;

            const remainingStock = this.shopInventoryState.getAvailableResourceItemStock(itemType);

            if (resourceShopItem.quantityTextEntityId != null) {
                this.shopEntityFactory.updateAssociatedText(
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
    }

}
