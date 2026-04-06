import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { ShopButtonState, ShopButtonType } from "../components/types/shop-button-config.js";
import { SHOP_RESOURCE_ITEM_CONFIG, SHOP_RESOURCE_ITEMS_ORDER } from "../components/types/shop-resource-item-config.js";
import { SHOP_TAB_CONFIG, SHOP_TABS_ORDER, ShopTabType } from "../components/types/shop-tab-config.js";
import { SHOP_UI_TYPE_LAYOUT_PRESET, ShopUITypeLayoutPreset } from "../components/types/shop-ui-type-layout-preset.js";
import { ShopUIEntryType, ShopUIType } from "../components/types/shop-ui-type.js";
import { SHOP_WEAPON_ITEM_CONFIG, SHOP_WEAPON_ITEMS_ORDER } from "../components/types/shop-weapon-item-config.js";
import { ShopEntityFactory } from "../entities/shop-entity-factory.js";
import { UIManager } from "./ui-manager.js";

const STEP_Y_WEAPON = 54;
const STEP_X_TAB = 108;

export class ShopManager {
    private moneyTextEntityId: number | null = null;

    constructor(
        private shopEntityFactory: ShopEntityFactory,
        private shopInventoryState: ShopInventoryState,
        private shopTabState: ShopTabState,
        private uiManager: UIManager,
    ) { }

    public createInitialUI(): void {
        this.createBackground();
        this.createWeaponItems();
        this.createTabButtons();
        this.createReturnButton();
        this.createMoneyText();
    }

    public createBackground(): void {
        const layout = this.resolveLayout(ShopUIType.BACKGROUND);

        this.shopEntityFactory.createBackground(
            ShopUIEntryType.BACKGROUND,
            ShopUIType.BACKGROUND,
            layout.anchor,
            layout.offsetX,
            layout.offsetY,
        );
    }

    public createWeaponItems(): void {
        for (let index = 0; index < SHOP_WEAPON_ITEMS_ORDER.length; index++) {
            const itemType = SHOP_WEAPON_ITEMS_ORDER[index];
            const itemConfig = SHOP_WEAPON_ITEM_CONFIG[itemType];
            const layout = this.resolveLayout(ShopUIType.WEAPON, index);

            const buttonText = `$${this.formatMoney(itemConfig.price)}`;
            const isPurchased = this.shopInventoryState.isWeaponItemPurchased(itemType);
            const buttonState = isPurchased
                ? ShopButtonState.DISABLED
                : ShopButtonState.NORMAL;

            this.shopEntityFactory.createShopItem(
                ShopUIEntryType.ITEM,
                ShopUIType.WEAPON,
                ShopTabType.WEAPONS,
                layout.anchor,
                layout.offsetX,
                layout.offsetY,
                itemConfig.spriteName,
                SpriteSheetName.WEAPON,
                buttonText,
                buttonState,
                itemConfig.name,
                itemType,
                itemConfig.width,
                itemConfig.height,
            );
        }
    }

    public createResourceItems(): void {
        for (let index = 0; index < SHOP_RESOURCE_ITEMS_ORDER.length; index++) {
            const itemType = SHOP_RESOURCE_ITEMS_ORDER[index];
            const itemConfig = SHOP_RESOURCE_ITEM_CONFIG[itemType];
            const layout = this.resolveLayout(ShopUIType.WEAPON, index);
            const availableQuantity = this.shopInventoryState.getAvailableResourceItemStock(itemType);

            const buttonText = `$${this.formatMoney(itemConfig.price)}`;
            const buttonState = availableQuantity > 0
                ? ShopButtonState.NORMAL
                : ShopButtonState.DISABLED;

            this.shopEntityFactory.createShopItem(
                ShopUIEntryType.ITEM,
                ShopUIType.WEAPON,
                ShopTabType.RESOURCES,
                layout.anchor,
                layout.offsetX,
                layout.offsetY,
                itemConfig.spriteName,
                SpriteSheetName.RESOURCES_ICON,
                buttonText,
                buttonState,
                itemConfig.name,
                itemType,
                itemConfig.width,
                itemConfig.height,
                `x${availableQuantity}`,
            );
        }
    }

    public createTabButtons(): void {
        const activeTabType = this.shopTabState.getActiveTabType();

        for (let index = 0; index < SHOP_TABS_ORDER.length; index++) {
            const tabType = SHOP_TABS_ORDER[index];
            const config = SHOP_TAB_CONFIG[tabType];
            const layout = this.resolveLayout(ShopUIType.TAB_BUTTON, index);
            const buttonState = tabType === activeTabType
                ? ShopButtonState.SELECTED
                : ShopButtonState.NORMAL;

            this.shopEntityFactory.createTabButton(
                tabType,
                config.label,
                ShopUIEntryType.BUTTON,
                ShopUIType.TAB_BUTTON,
                layout.anchor,
                layout.offsetX,
                layout.offsetY,
                buttonState,
                SpriteSheetName.BUTTONS,
            );
        }
    }

    public createReturnButton(): void {
        const layout = this.resolveLayout(ShopUIType.RETURN_BUTTON, 0);

        this.shopEntityFactory.createStandaloneButton(
            ShopUIEntryType.BUTTON,
            ShopUIType.RETURN_BUTTON,
            layout.anchor,
            layout.offsetX,
            layout.offsetY,
            ShopButtonType.RETURN,
            undefined,
            ShopButtonState.NORMAL,
            SpriteSheetName.BUTTONS,
            "Next mission",
        );
    }

    public createMoneyText(): void {
        const moneyText = this.formatMoney(this.shopInventoryState.getMoney());
        const layout = this.resolveLayout(ShopUIType.MONEY_TEXT);
        const screenPosition = this.uiManager.resolveScreenPosition(layout.anchor, layout.offsetX, layout.offsetY);
        this.moneyTextEntityId = this.shopEntityFactory.createStandaloneText(
            `$${moneyText}`,
            screenPosition.x,
            screenPosition.y,
        );
    }

    public updateMoneyText(): void {
        const moneyText = this.formatMoney(this.shopInventoryState.getMoney());

        if (this.moneyTextEntityId == null) {
            this.createMoneyText();
            return;
        }

        this.shopEntityFactory.updateStandaloneText(this.moneyTextEntityId, `$${moneyText}`);
    }

    public reset(): void {
        this.moneyTextEntityId = null;
    }

    private resolveLayout(
        type: ShopUIType,
        index?: number,
    ): ShopUITypeLayoutPreset {
        const base = SHOP_UI_TYPE_LAYOUT_PRESET[type];

        if (type === ShopUIType.WEAPON && index !== undefined) {
            return {
                anchor: base.anchor,
                offsetX: base.offsetX,
                offsetY: base.offsetY + STEP_Y_WEAPON * index,
            };
        }

        if (type === ShopUIType.TAB_BUTTON && index !== undefined) {
            return {
                anchor: base.anchor,
                offsetX: base.offsetX + STEP_X_TAB * index,
                offsetY: base.offsetY,
            };
        }

        if (type === ShopUIType.RETURN_BUTTON && index !== undefined) {
            return {
                anchor: base.anchor,
                offsetX: base.offsetX,
                offsetY: base.offsetY,
            };
        }


        if (type === ShopUIType.MONEY_TEXT) {
            return {
                anchor: base.anchor,
                offsetX: base.offsetX,
                offsetY: base.offsetY,
            };
        }

        return base;
    }

    private formatMoney(value: number): string {
        return new Intl.NumberFormat("en-US").format(value);
    }
}
