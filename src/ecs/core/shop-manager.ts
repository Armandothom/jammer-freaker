import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { getBitmapTextSize } from "../../utils/get-bitmap-text-size.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { ShopUpgradeTabState } from "../components/states/shop-upgrade-tab-state.js";
import {
    SHOP_BUTTON_CONFIG,
    ShopButtonState,
    ShopButtonType,
} from "../components/types/shop-button-config.js";
import { ShopDialogEvent } from "../components/types/shop-dialog-event.enum.js";
import { SHOP_RESOURCE_ITEM_CONFIG, SHOP_RESOURCE_ITEMS_ORDER } from "../components/types/shop-resource-item-config.js";
import { SHOP_TAB_CONFIG, SHOP_TABS_ORDER, ShopTabType } from "../components/types/shop-tab-config.js";
import { SHOP_UI_TYPE_LAYOUT_PRESET, ShopUITypeLayoutPreset } from "../components/types/shop-ui-type-layout-preset.js";
import { ShopUIEntryType, ShopUIType } from "../components/types/shop-ui-type.js";
import {
    SHOP_UPGRADE_TAB_CONFIG,
    SHOP_UPGRADE_TABS_ORDER,
    type ShopUpgradeTabType,
} from "../components/types/shop-upgrade-tab-config.js";
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
const SHOP_HIGH_MONEY_THRESHOLD = 2000;
const SHOP_MEDIUM_MONEY_THRESHOLD = 750;
const UPGRADE_TAB_TRACK_WIDTH = 302;
const UPGRADE_TAB_TRACK_GAP = 8;
const UPGRADE_TAB_NAV_WIDTH = 32;
const UPGRADE_TAB_NAV_HEIGHT = 32;

type UpgradeTabViewModel = {
    activeTabType: ShopUpgradeTabType;
    canNavigateLeft: boolean;
    canNavigateRight: boolean;
    leftNavOffsetX: number | null;
    offsetY: number;
    rightNavOffsetX: number | null;
    tabOffsets: number[];
    visibleTabs: ShopUpgradeTabType[];
    uiAnchor: ShopUITypeLayoutPreset["anchor"];
};

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
        const viewModel = this.resolveUpgradeTabViewModel();
        if (viewModel == null) {
            return;
        }

        if (viewModel.canNavigateLeft && viewModel.leftNavOffsetX != null) {
            this.shopEntityFactory.createUpgradeTabNavigationButton(
                ShopUIEntryType.BUTTON,
                ShopUIType.UPGRADE_TAB_NAV_LEFT_BUTTON,
                viewModel.uiAnchor,
                viewModel.leftNavOffsetX,
                viewModel.offsetY,
                SpriteName.BUTTON_ARROW_LEFT,
                UPGRADE_TAB_NAV_WIDTH,
                UPGRADE_TAB_NAV_HEIGHT,
            );
        }

        for (let index = 0; index < viewModel.visibleTabs.length; index++) {
            const upgradeTabType = viewModel.visibleTabs[index];
            const config = SHOP_UPGRADE_TAB_CONFIG[upgradeTabType];
            const buttonState = upgradeTabType === viewModel.activeTabType
                ? ShopButtonState.SELECTED
                : ShopButtonState.NORMAL;

            this.shopEntityFactory.createUpgradeTabButton(
                upgradeTabType,
                ShopUIEntryType.BUTTON,
                ShopUIType.UPGRADE_TAB_BUTTON,
                viewModel.uiAnchor,
                viewModel.tabOffsets[index],
                viewModel.offsetY,
                buttonState,
                SpriteSheetName.BUTTONS,
                config.weaponSprite,
            )
        }

        if (viewModel.canNavigateRight && viewModel.rightNavOffsetX != null) {
            this.shopEntityFactory.createUpgradeTabNavigationButton(
                ShopUIEntryType.BUTTON,
                ShopUIType.UPGRADE_TAB_NAV_RIGHT_BUTTON,
                viewModel.uiAnchor,
                viewModel.rightNavOffsetX,
                viewModel.offsetY,
                SpriteName.BUTTON_ARROW_RIGHT,
                UPGRADE_TAB_NAV_WIDTH,
                UPGRADE_TAB_NAV_HEIGHT,
            );
        }
    }

    public createUpgrades(): void {
        const viewModel = this.resolveUpgradeTabViewModel();
        if (viewModel == null) {
            return;
        }

        const upgradedWeapon = SHOP_UPGRADE_TAB_CONFIG[viewModel.activeTabType].weaponType;
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
                viewModel.activeTabType,
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

    public navigateUpgradeTabWindow(direction: -1 | 1): boolean {
        const displayTabs = this.getOwnedUpgradeTabsInDisplayOrder();
        if (displayTabs.length === 0) {
            return false;
        }

        const visibleCapacity = this.getVisibleUpgradeTabCapacity(displayTabs.length);
        this.syncUpgradeTabState(displayTabs, visibleCapacity);

        const didMove = this.shopUpgradeTabState.shiftVisibleWindow(
            direction * visibleCapacity,
            displayTabs.length,
            visibleCapacity,
        );

        if (!didMove) {
            return false;
        }

        return this.syncActiveUpgradeTabAfterWindowShift(
            displayTabs,
            visibleCapacity,
            direction,
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

        this.updateTextEntity(this.moneyTextEntityId, `$${moneyText}`);
    }

    public updateAssociatedText(entityId: number, text: string): void {
        this.updateTextEntity(entityId, text);
    }

    public reset(): void {
        this.moneyTextEntityId = null;
    }

    private resolveUpgradeTabViewModel(): UpgradeTabViewModel | null {
        const displayTabs = this.getOwnedUpgradeTabsInDisplayOrder();
        if (displayTabs.length === 0) {
            return null;
        }

        const visibleCapacity = this.getVisibleUpgradeTabCapacity(displayTabs.length);
        this.syncUpgradeTabState(displayTabs, visibleCapacity);

        const windowStart = this.shopUpgradeTabState.getVisibleWindowStartIndex();
        const visibleTabs = displayTabs.slice(windowStart, windowStart + visibleCapacity);
        const canNavigateLeft = windowStart > 0;
        const canNavigateRight = windowStart + visibleCapacity < displayTabs.length;
        const tabLayout = this.buildUpgradeTabTrackLayout(
            visibleTabs.length,
            canNavigateLeft,
            canNavigateRight,
        );

        return {
            activeTabType: this.shopUpgradeTabState.getActiveTabType(),
            canNavigateLeft,
            canNavigateRight,
            leftNavOffsetX: tabLayout.leftNavOffsetX,
            offsetY: tabLayout.offsetY,
            rightNavOffsetX: tabLayout.rightNavOffsetX,
            tabOffsets: tabLayout.tabOffsets,
            uiAnchor: tabLayout.uiAnchor,
            visibleTabs,
        };
    }

    private getOwnedUpgradeTabsInDisplayOrder(): ShopUpgradeTabType[] {
        return SHOP_UPGRADE_TABS_ORDER
            .filter((upgradeTabType) => {
                const config = SHOP_UPGRADE_TAB_CONFIG[upgradeTabType];
                return this.shopInventoryState.isWeaponOwned(config.weaponType);
            })
            .reverse();
    }

    private syncUpgradeTabState(
        displayTabs: ShopUpgradeTabType[],
        visibleCapacity: number,
    ): void {
        const activeTabType = this.shopUpgradeTabState.getActiveTabType();

        if (displayTabs.indexOf(activeTabType) === -1) {
            this.shopUpgradeTabState.setActiveTabType(displayTabs[0]);
        }

        this.shopUpgradeTabState.clampVisibleWindowStartIndex(displayTabs.length, visibleCapacity);

        const activeIndex = displayTabs.indexOf(this.shopUpgradeTabState.getActiveTabType());
        if (activeIndex >= 0) {
            this.shopUpgradeTabState.ensureIndexVisible(
                activeIndex,
                displayTabs.length,
                visibleCapacity,
            );
        }
    }

    private syncActiveUpgradeTabAfterWindowShift(
        displayTabs: ShopUpgradeTabType[],
        visibleCapacity: number,
        direction: -1 | 1,
    ): boolean {
        const windowStart = this.shopUpgradeTabState.getVisibleWindowStartIndex();
        const visibleTabs = displayTabs.slice(windowStart, windowStart + visibleCapacity);
        const activeTabType = this.shopUpgradeTabState.getActiveTabType();

        if (visibleTabs.indexOf(activeTabType) !== -1) {
            return false;
        }

        const nextActiveTab = direction > 0
            ? visibleTabs[0]
            : visibleTabs[visibleTabs.length - 1];

        if (nextActiveTab == null || nextActiveTab === activeTabType) {
            return false;
        }

        this.shopUpgradeTabState.setActiveTabType(nextActiveTab);
        return true;
    }

    private getVisibleUpgradeTabCapacity(totalTabs: number): number {
        const capacityWithoutNavigation = this.calculateUpgradeTabCapacity(false);
        if (totalTabs <= capacityWithoutNavigation) {
            return capacityWithoutNavigation;
        }

        return this.calculateUpgradeTabCapacity(true);
    }

    private calculateUpgradeTabCapacity(useNavigation: boolean): number {
        const tabWidth = SHOP_BUTTON_CONFIG[ShopButtonType.UPGRADE_TAB].width;
        const reservedNavigationWidth = useNavigation
            ? (UPGRADE_TAB_NAV_WIDTH * 2) + (UPGRADE_TAB_TRACK_GAP * 2)
            : 0;
        const availableWidth = UPGRADE_TAB_TRACK_WIDTH - reservedNavigationWidth;

        return Math.max(
            1,
            Math.floor((availableWidth + UPGRADE_TAB_TRACK_GAP) / (tabWidth + UPGRADE_TAB_TRACK_GAP)),
        );
    }

    private buildUpgradeTabTrackLayout(
        visibleTabCount: number,
        showLeftNavigation: boolean,
        showRightNavigation: boolean,
    ): Pick<
        UpgradeTabViewModel,
        "leftNavOffsetX" | "offsetY" | "rightNavOffsetX" | "tabOffsets" | "uiAnchor"
    > {
        const baseLayout = SHOP_UI_TYPE_LAYOUT_PRESET[ShopUIType.UPGRADE_TAB_BUTTON];
        const tabWidth = SHOP_BUTTON_CONFIG[ShopButtonType.UPGRADE_TAB].width;
        const trackRightInset = baseLayout.offsetX - tabWidth;
        const elementTypes: Array<"left_nav" | "tab" | "right_nav"> = [];

        if (showLeftNavigation) {
            elementTypes.push("left_nav");
        }

        for (let index = 0; index < visibleTabCount; index++) {
            elementTypes.push("tab");
        }

        if (showRightNavigation) {
            elementTypes.push("right_nav");
        }

        const totalWidth = elementTypes.reduce((sum, elementType) => {
            return sum + (elementType === "tab" ? tabWidth : UPGRADE_TAB_NAV_WIDTH);
        }, 0) + Math.max(0, elementTypes.length - 1) * UPGRADE_TAB_TRACK_GAP;
        const startPosition = Math.max(0, UPGRADE_TAB_TRACK_WIDTH - totalWidth);

        let position = startPosition;
        let leftNavOffsetX: number | null = null;
        let rightNavOffsetX: number | null = null;
        const tabOffsets: number[] = [];

        for (let index = 0; index < elementTypes.length; index++) {
            const elementType = elementTypes[index];
            const offsetX = trackRightInset + UPGRADE_TAB_TRACK_WIDTH - position;

            if (elementType === "left_nav") {
                leftNavOffsetX = offsetX;
            } else if (elementType === "right_nav") {
                rightNavOffsetX = offsetX;
            } else {
                tabOffsets.push(offsetX);
            }

            position += (elementType === "tab" ? tabWidth : UPGRADE_TAB_NAV_WIDTH)
                + UPGRADE_TAB_TRACK_GAP;
        }

        return {
            leftNavOffsetX,
            offsetY: baseLayout.offsetY,
            rightNavOffsetX,
            tabOffsets,
            uiAnchor: baseLayout.anchor,
        };
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
