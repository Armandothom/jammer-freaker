import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { getBitmapTextSize } from "../../utils/get-bitmap-text-size.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { ShopUpgradeTabState } from "../components/states/shop-upgrade-tab-state.js";
import { ShopButtonState, ShopButtonType } from "../components/types/shop-button-config.js";
import { ShopDialogEvent } from "../components/types/shop-dialog-event.enum.js";
import { SHOP_RESOURCE_ITEM_CONFIG, SHOP_RESOURCE_ITEMS_ORDER } from "../components/types/shop-resource-item-config.js";
import { SHOP_TAB_CONFIG, SHOP_TABS_ORDER, ShopTabType } from "../components/types/shop-tab-config.js";
import { SHOP_UI_TYPE_LAYOUT_PRESET, ShopUITypeLayoutPreset } from "../components/types/shop-ui-type-layout-preset.js";
import { ShopUIEntryType, ShopUIType } from "../components/types/shop-ui-type.js";
import { SHOP_UPGRADE_TAB_CONFIG, SHOP_UPGRADE_TABS_ORDER } from "../components/types/shop-upgrade-tab-config.js";
import { SHOP_WEAPON_ITEM_CONFIG, SHOP_WEAPON_ITEMS_ORDER } from "../components/types/shop-weapon-item-config.js";
import {
    getUpgradeValueIncrease,
    getWeaponUpgradeName,
    getWeaponUpgradePrice,
    WEAPON_UPGRADE_TYPES_ORDER,
    WeaponUpgradeType,
} from "../components/types/weapon-upgrade-config.js";
import { ShopEntityFactory } from "../entities/shop-entity-factory.js";
import { ComponentStore } from "./component-store.js";
import { UIManager } from "./ui-manager.js";

const STEP_Y_WEAPON = 54;
const STEP_X_TAB = 108;
const STEP_Y_UPGRADE_ITEM = 56;
const STEP_X_UPGRADE_TAB = 72;
const SHOP_HIGH_MONEY_THRESHOLD = 2000;
const SHOP_MEDIUM_MONEY_THRESHOLD = 750;

export class ShopManager {
    private moneyTextEntityId: number | null = null;

    constructor(
        private shopEntityFactory: ShopEntityFactory,
        private shopInventoryState: ShopInventoryState,
        private shopTabState: ShopTabState,
        private shopUpgradeTabState: ShopUpgradeTabState,
        private uiManager: UIManager,
        private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
    ) { }

    public createInitialUI(): void {
        this.createGunDealer();
        this.createBackground();
        this.createWeaponItems();
        this.createTabButtons();
        this.createReturnButton();
        this.createMoneyText();
    }

    public createGunDealer(): number {
        const money = this.shopInventoryState.getMoney();
        const dialogEvent = this.resolveEntryDialogEvent(money);

        return this.shopEntityFactory.createGunDealer(dialogEvent);
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

    public createUpgradeTabButtons(): void {
        const activeUpgradeTabType = this.shopUpgradeTabState.getActiveTabType();
        const visibleUpgradeTabs = SHOP_UPGRADE_TABS_ORDER.filter((upgradeTabType) => {
            const config = SHOP_UPGRADE_TAB_CONFIG[upgradeTabType];
            return this.shopInventoryState.isWeaponOwned(config.weaponType);
        });
        const leftAlignedStartIndex = SHOP_UPGRADE_TABS_ORDER.length - visibleUpgradeTabs.length;

        for (let index = 0; index < visibleUpgradeTabs.length; index++) {
            const upgradeTabType = visibleUpgradeTabs[index];
            const config = SHOP_UPGRADE_TAB_CONFIG[upgradeTabType];
            const layout = this.resolveLayout(
                ShopUIType.UPGRADE_TAB_BUTTON,
                leftAlignedStartIndex + index,
            );
            const buttonState = upgradeTabType === activeUpgradeTabType
                ? ShopButtonState.SELECTED
                : ShopButtonState.NORMAL;
            this.shopEntityFactory.createUpgradeTabButton(
                upgradeTabType,
                ShopUIEntryType.BUTTON,
                ShopUIType.UPGRADE_TAB_BUTTON,
                layout.anchor,
                layout.offsetX,
                layout.offsetY,
                buttonState,
                SpriteSheetName.BUTTONS,
                config.weaponSprite,
            )

        }
    }

    public createUpgrades(): void {
        const activeUpgradeTabType = this.shopUpgradeTabState.getActiveTabType();
        const upgradedWeapon = SHOP_UPGRADE_TAB_CONFIG[activeUpgradeTabType].weaponType;
        const shouldShowMaxedOutUpgrade = this.shopInventoryState.shouldShowWeaponMaxedOutUpgrade(upgradedWeapon);
        let visibleUpgradeIndex = 0;

        for (const upgradeType of WEAPON_UPGRADE_TYPES_ORDER) {
            if (upgradeType === WeaponUpgradeType.MAXED_OUT && !shouldShowMaxedOutUpgrade) {
                continue;
            }

            const upgradeName = getWeaponUpgradeName(upgradeType);
            const upgradeProgressLevel = this.shopInventoryState.getWeaponUpgradeProgressLevel(upgradedWeapon, upgradeType);
            const nextUpgradeLevel = this.shopInventoryState.getWeaponUpgradeLevel(upgradedWeapon, upgradeType);
            const canPurchaseUpgrade = this.shopInventoryState.canPurchaseWeaponUpgrade(upgradedWeapon, upgradeType);
            const upgradeInfo = getUpgradeValueIncrease(upgradedWeapon, upgradeType, upgradeProgressLevel);
            const buttonText = canPurchaseUpgrade
                ? `$${this.formatMoney(getWeaponUpgradePrice(upgradedWeapon, upgradeType, nextUpgradeLevel))}`
                : "MAX";
            const buttonState = canPurchaseUpgrade
                ? ShopButtonState.NORMAL
                : ShopButtonState.DISABLED;
            const layout = this.resolveLayout(ShopUIType.UPGRADE_ITEM, visibleUpgradeIndex);
            const upgradeLabel = upgradeType === WeaponUpgradeType.MAXED_OUT
                ? upgradeName
                : `${upgradeName}\nLvl. ${upgradeProgressLevel}`;

            this.shopEntityFactory.createUpgradeItem(
                upgradeType,
                activeUpgradeTabType,
                upgradeLabel,
                upgradeInfo,
                buttonText,
                buttonState,
                layout.anchor,
                layout.offsetX,
                layout.offsetY,
            );

            visibleUpgradeIndex += 1;
        }
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

        this.updateTextEntity(this.moneyTextEntityId, `$${moneyText}`);
    }

    public updateAssociatedText(entityId: number, text: string): void {
        this.updateTextEntity(entityId, text);
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

        if (type === ShopUIType.UPGRADE_TAB_BUTTON && index !== undefined) {
            return {
                anchor: base.anchor,
                offsetX: base.offsetX + STEP_X_UPGRADE_TAB * index,
                offsetY: base.offsetY,
            };
        }

        if (type === ShopUIType.UPGRADE_ITEM && index !== undefined) {
            return {
                anchor: base.anchor,
                offsetX: base.offsetX,
                offsetY: base.offsetY + STEP_Y_UPGRADE_ITEM * index,
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

    private resolveEntryDialogEvent(money: number): ShopDialogEvent {
        if (money >= SHOP_HIGH_MONEY_THRESHOLD) {
            return ShopDialogEvent.ENTER_SHOP_HIGH_MONEY;
        }

        if (money >= SHOP_MEDIUM_MONEY_THRESHOLD) {
            return ShopDialogEvent.ENTER_SHOP_MEDIUM_MONEY;
        }

        return ShopDialogEvent.ENTER_SHOP_LOW_MONEY;
    }

    private updateTextEntity(entityId: number, text: string): void {
        if (!this.bitmapTextComponentStore.has(entityId)) {
            return;
        }

        const textComponent = this.bitmapTextComponentStore.get(entityId);
        const textSize = getBitmapTextSize(text, textComponent.fontId, textComponent.scale);

        textComponent.text = text;
        textComponent.maxWidth = textSize.width;
    }
}
