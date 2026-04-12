import { ShopInventoryState } from "../../ecs/components/states/shop-inventory-state.js";
import { ShopUpgradeTabState } from "../../ecs/components/states/shop-upgrade-tab-state.js";
import {
  UI_BUTTON_CONFIG,
  UIButtonVariant,
} from "../style/ui-button-config.js";
import {
  SHOP_UPGRADE_TAB_CONFIG,
  SHOP_UPGRADE_TABS_ORDER,
  type ShopUpgradeTabType,
} from "../../ecs/components/types/shop-upgrade-tab-config.js";
import { SHOP_SKIN_MAP } from "../style/shop-skin-map.js";

export type ShopUpgradeTabWindowState = {
  activeTabType: ShopUpgradeTabType;
  canNavigateLeft: boolean;
  canNavigateRight: boolean;
  leftNavOffsetX: number | null;
  rightNavOffsetX: number | null;
  tabOffsetsByType: Map<ShopUpgradeTabType, number>;
  visibleTabs: ShopUpgradeTabType[];
};

export function navigateShopUpgradeTabWindow(
  shopInventoryState: ShopInventoryState,
  shopUpgradeTabState: ShopUpgradeTabState,
  direction: -1 | 1,
): boolean {
  const displayTabs = getOwnedUpgradeTabsInDisplayOrder(shopInventoryState);
  if (displayTabs.length === 0) {
    return false;
  }

  const visibleCapacity = getVisibleUpgradeTabCapacity(displayTabs.length);
  syncUpgradeTabState(displayTabs, visibleCapacity, shopUpgradeTabState);

  const didMove = shopUpgradeTabState.shiftVisibleWindow(
    direction * visibleCapacity,
    displayTabs.length,
    visibleCapacity,
  );

  if (!didMove) {
    return false;
  }

  return syncActiveUpgradeTabAfterWindowShift(
    displayTabs,
    visibleCapacity,
    direction,
    shopUpgradeTabState,
  );
}

export function resolveShopUpgradeTabWindowState(
  shopInventoryState: ShopInventoryState,
  shopUpgradeTabState: ShopUpgradeTabState,
): ShopUpgradeTabWindowState | null {
  const displayTabs = getOwnedUpgradeTabsInDisplayOrder(shopInventoryState);
  if (displayTabs.length === 0) {
    return null;
  }

  const visibleCapacity = getVisibleUpgradeTabCapacity(displayTabs.length);
  syncUpgradeTabState(displayTabs, visibleCapacity, shopUpgradeTabState);

  const windowStart = shopUpgradeTabState.getVisibleWindowStartIndex();
  const visibleTabs = displayTabs.slice(windowStart, windowStart + visibleCapacity);
  const canNavigateLeft = windowStart > 0;
  const canNavigateRight = windowStart + visibleCapacity < displayTabs.length;
  const tabLayout = buildUpgradeTabTrackLayout(
    visibleTabs.length,
    canNavigateLeft,
    canNavigateRight,
  );
  const tabOffsetsByType = new Map<ShopUpgradeTabType, number>();

  visibleTabs.forEach((tabType, index) => {
    tabOffsetsByType.set(tabType, tabLayout.tabOffsets[index]);
  });

  return {
    activeTabType: shopUpgradeTabState.getActiveTabType(),
    canNavigateLeft,
    canNavigateRight,
    leftNavOffsetX: tabLayout.leftNavOffsetX,
    rightNavOffsetX: tabLayout.rightNavOffsetX,
    tabOffsetsByType,
    visibleTabs,
  };
}

function buildUpgradeTabTrackLayout(
  visibleTabCount: number,
  showLeftNavigation: boolean,
  showRightNavigation: boolean,
): {
  leftNavOffsetX: number | null;
  rightNavOffsetX: number | null;
  tabOffsets: number[];
} {
  const tabWidth = UI_BUTTON_CONFIG[UIButtonVariant.COMPACT].width;
  const trackRightInset = SHOP_SKIN_MAP.upgradeTabs.offsetX - tabWidth;
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

  // Keep the visible upgrade-tab window pinned to the left edge of the track.
  const startPosition = 0;

  let position = startPosition;
  let leftNavOffsetX: number | null = null;
  let rightNavOffsetX: number | null = null;
  const tabOffsets: number[] = [];

  for (const elementType of elementTypes) {
    const offsetX = trackRightInset + SHOP_SKIN_MAP.upgradeTabs.trackWidth - position;

    if (elementType === "left_nav") {
      leftNavOffsetX = offsetX;
    } else if (elementType === "right_nav") {
      rightNavOffsetX = offsetX;
    } else {
      tabOffsets.push(offsetX);
    }

    position += (elementType === "tab"
      ? tabWidth
      : SHOP_SKIN_MAP.upgradeTabs.navWidth) + SHOP_SKIN_MAP.upgradeTabs.gap;
  }

  return {
    leftNavOffsetX,
    rightNavOffsetX,
    tabOffsets,
  };
}

function calculateUpgradeTabCapacity(useNavigation: boolean): number {
  const tabWidth = UI_BUTTON_CONFIG[UIButtonVariant.COMPACT].width;
  const reservedNavigationWidth = useNavigation
    ? (SHOP_SKIN_MAP.upgradeTabs.navWidth * 2) + (SHOP_SKIN_MAP.upgradeTabs.gap * 2)
    : 0;
  const availableWidth = SHOP_SKIN_MAP.upgradeTabs.trackWidth - reservedNavigationWidth;

  return Math.max(
    1,
    Math.floor((availableWidth + SHOP_SKIN_MAP.upgradeTabs.gap)
      / (tabWidth + SHOP_SKIN_MAP.upgradeTabs.gap)),
  );
}

function getOwnedUpgradeTabsInDisplayOrder(
  shopInventoryState: ShopInventoryState,
): ShopUpgradeTabType[] {
  return SHOP_UPGRADE_TABS_ORDER
    .filter((upgradeTabType) => {
      const config = SHOP_UPGRADE_TAB_CONFIG[upgradeTabType];
      return shopInventoryState.isWeaponOwned(config.weaponType);
    })
    .reverse();
}

function getVisibleUpgradeTabCapacity(totalTabs: number): number {
  const capacityWithoutNavigation = calculateUpgradeTabCapacity(false);
  if (totalTabs <= capacityWithoutNavigation) {
    return capacityWithoutNavigation;
  }

  return calculateUpgradeTabCapacity(true);
}

function syncActiveUpgradeTabAfterWindowShift(
  displayTabs: ShopUpgradeTabType[],
  visibleCapacity: number,
  direction: -1 | 1,
  shopUpgradeTabState: ShopUpgradeTabState,
): boolean {
  const windowStart = shopUpgradeTabState.getVisibleWindowStartIndex();
  const visibleTabs = displayTabs.slice(windowStart, windowStart + visibleCapacity);
  const activeTabType = shopUpgradeTabState.getActiveTabType();

  if (visibleTabs.indexOf(activeTabType) !== -1) {
    return false;
  }

  const nextActiveTab = direction > 0
    ? visibleTabs[0]
    : visibleTabs[visibleTabs.length - 1];

  if (nextActiveTab == null || nextActiveTab === activeTabType) {
    return false;
  }

  shopUpgradeTabState.setActiveTabType(nextActiveTab);
  return true;
}

function syncUpgradeTabState(
  displayTabs: ShopUpgradeTabType[],
  visibleCapacity: number,
  shopUpgradeTabState: ShopUpgradeTabState,
): void {
  const activeTabType = shopUpgradeTabState.getActiveTabType();

  if (displayTabs.indexOf(activeTabType) === -1) {
    shopUpgradeTabState.setActiveTabType(displayTabs[0]);
  }

  shopUpgradeTabState.clampVisibleWindowStartIndex(displayTabs.length, visibleCapacity);

  const activeIndex = displayTabs.indexOf(shopUpgradeTabState.getActiveTabType());
  if (activeIndex >= 0) {
    shopUpgradeTabState.ensureIndexVisible(
      activeIndex,
      displayTabs.length,
      visibleCapacity,
    );
  }
}
