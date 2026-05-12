import { GunsShopInventoryState } from "../../ecs/components/states/guns-shop-inventory-state.js";
import { GunsShopUpgradeTabState } from "../../ecs/components/states/guns-shop-upgrade-tab-state.js";
import {
  UI_BUTTON_CONFIG,
  UIButtonVariant,
} from "../style/ui-button-config.js";
import {
  GUNS_SHOP_UPGRADE_TAB_CONFIG,
  GUNS_SHOP_UPGRADE_TABS_ORDER,
  type GunsShopUpgradeTabType,
} from "../../ecs/components/types/guns-shop-upgrade-tab-config.js";
import { GUNS_SHOP_SKIN_MAP } from "../style/guns-shop-skin-map.js";

export type GunsShopUpgradeTabWindowState = {
  activeTabType: GunsShopUpgradeTabType;
  canNavigateLeft: boolean;
  canNavigateRight: boolean;
  leftNavOffsetX: number | null;
  rightNavOffsetX: number | null;
  tabOffsetsByType: Map<GunsShopUpgradeTabType, number>;
  visibleTabs: GunsShopUpgradeTabType[];
};

export function navigateGunsShopUpgradeTabWindow(
  gunsShopInventoryState: GunsShopInventoryState,
  gunsShopUpgradeTabState: GunsShopUpgradeTabState,
  direction: -1 | 1,
): boolean {
  const displayTabs = getOwnedUpgradeTabsInDisplayOrder(gunsShopInventoryState);
  if (displayTabs.length === 0) {
    return false;
  }

  const visibleCapacity = getVisibleUpgradeTabCapacity(displayTabs.length);
  syncUpgradeTabState(displayTabs, visibleCapacity, gunsShopUpgradeTabState);

  const didMove = gunsShopUpgradeTabState.shiftVisibleWindow(
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
    gunsShopUpgradeTabState,
  );
}

export function resolveGunsShopUpgradeTabWindowState(
  gunsShopInventoryState: GunsShopInventoryState,
  gunsShopUpgradeTabState: GunsShopUpgradeTabState,
): GunsShopUpgradeTabWindowState | null {
  const displayTabs = getOwnedUpgradeTabsInDisplayOrder(gunsShopInventoryState);
  if (displayTabs.length === 0) {
    return null;
  }

  const visibleCapacity = getVisibleUpgradeTabCapacity(displayTabs.length);
  syncUpgradeTabState(displayTabs, visibleCapacity, gunsShopUpgradeTabState);

  const windowStart = gunsShopUpgradeTabState.getVisibleWindowStartIndex();
  const visibleTabs = displayTabs.slice(windowStart, windowStart + visibleCapacity);
  const canNavigateLeft = windowStart > 0;
  const canNavigateRight = windowStart + visibleCapacity < displayTabs.length;
  const tabLayout = buildUpgradeTabTrackLayout(
    visibleTabs.length,
    canNavigateLeft,
    canNavigateRight,
  );
  const tabOffsetsByType = new Map<GunsShopUpgradeTabType, number>();

  visibleTabs.forEach((tabType, index) => {
    tabOffsetsByType.set(tabType, tabLayout.tabOffsets[index]);
  });

  return {
    activeTabType: gunsShopUpgradeTabState.getActiveTabType(),
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
  const trackRightInset = GUNS_SHOP_SKIN_MAP.upgradeTabs.offsetX - tabWidth;
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
    const offsetX = trackRightInset + GUNS_SHOP_SKIN_MAP.upgradeTabs.trackWidth - position;

    if (elementType === "left_nav") {
      leftNavOffsetX = offsetX;
    } else if (elementType === "right_nav") {
      rightNavOffsetX = offsetX;
    } else {
      tabOffsets.push(offsetX);
    }

    position += (elementType === "tab"
      ? tabWidth
      : GUNS_SHOP_SKIN_MAP.upgradeTabs.navWidth) + GUNS_SHOP_SKIN_MAP.upgradeTabs.gap;
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
    ? (GUNS_SHOP_SKIN_MAP.upgradeTabs.navWidth * 2) + (GUNS_SHOP_SKIN_MAP.upgradeTabs.gap * 2)
    : 0;
  const availableWidth = GUNS_SHOP_SKIN_MAP.upgradeTabs.trackWidth - reservedNavigationWidth;

  return Math.max(
    1,
    Math.floor((availableWidth + GUNS_SHOP_SKIN_MAP.upgradeTabs.gap)
      / (tabWidth + GUNS_SHOP_SKIN_MAP.upgradeTabs.gap)),
  );
}

function getOwnedUpgradeTabsInDisplayOrder(
  gunsShopInventoryState: GunsShopInventoryState,
): GunsShopUpgradeTabType[] {
  return GUNS_SHOP_UPGRADE_TABS_ORDER
    .filter((upgradeTabType) => {
      const config = GUNS_SHOP_UPGRADE_TAB_CONFIG[upgradeTabType];
      return gunsShopInventoryState.isWeaponOwned(config.weaponType);
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
  displayTabs: GunsShopUpgradeTabType[],
  visibleCapacity: number,
  direction: -1 | 1,
  gunsShopUpgradeTabState: GunsShopUpgradeTabState,
): boolean {
  const windowStart = gunsShopUpgradeTabState.getVisibleWindowStartIndex();
  const visibleTabs = displayTabs.slice(windowStart, windowStart + visibleCapacity);
  const activeTabType = gunsShopUpgradeTabState.getActiveTabType();

  if (visibleTabs.indexOf(activeTabType) !== -1) {
    return false;
  }

  const nextActiveTab = direction > 0
    ? visibleTabs[0]
    : visibleTabs[visibleTabs.length - 1];

  if (nextActiveTab == null || nextActiveTab === activeTabType) {
    return false;
  }

  gunsShopUpgradeTabState.setActiveTabType(nextActiveTab);
  return true;
}

function syncUpgradeTabState(
  displayTabs: GunsShopUpgradeTabType[],
  visibleCapacity: number,
  gunsShopUpgradeTabState: GunsShopUpgradeTabState,
): void {
  const activeTabType = gunsShopUpgradeTabState.getActiveTabType();

  if (displayTabs.indexOf(activeTabType) === -1) {
    gunsShopUpgradeTabState.setActiveTabType(displayTabs[0]);
  }

  gunsShopUpgradeTabState.clampVisibleWindowStartIndex(displayTabs.length, visibleCapacity);

  const activeIndex = displayTabs.indexOf(gunsShopUpgradeTabState.getActiveTabType());
  if (activeIndex >= 0) {
    gunsShopUpgradeTabState.ensureIndexVisible(
      activeIndex,
      displayTabs.length,
      visibleCapacity,
    );
  }
}
