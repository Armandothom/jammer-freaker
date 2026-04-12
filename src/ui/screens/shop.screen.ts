import {
  SHOP_RESOURCE_ITEM_CONFIG,
  SHOP_RESOURCE_ITEMS_ORDER,
} from "../../ecs/components/types/shop-resource-item-config.js";
import { SHOP_TAB_CONFIG, SHOP_TABS_ORDER } from "../../ecs/components/types/shop-tab-config.js";
import {
  SHOP_UPGRADE_TAB_CONFIG,
  SHOP_UPGRADE_TABS_ORDER,
} from "../../ecs/components/types/shop-upgrade-tab-config.js";
import {
  SHOP_WEAPON_ITEM_CONFIG,
  SHOP_WEAPON_ITEMS_ORDER,
} from "../../ecs/components/types/shop-weapon-item-config.js";
import { WEAPON_UPGRADE_TYPES_ORDER } from "../../ecs/components/types/weapon-upgrade-config.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import {
  createBuyResourceAction,
  createBuyUpgradeAction,
  createBuyWeaponAction,
  createNavigateUpgradeTabsAction,
  createReturnToGameplayAction,
  createSelectShopTabAction,
  createSelectUpgradeTabAction,
} from "../input/shop-ui-actions.js";
import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { SHOP_SKIN_MAP } from "../style/shop-skin-map.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import { createLegacyPointLayout, resolveLegacyAnchorLayout } from "../widgets/legacy-layout.js";
import { createShopItemRowWidget } from "../widgets/shop-item-row.widget.js";
import { createUpgradeItemRowWidget } from "../widgets/upgrade-item-row.widget.js";
import { createUpgradeTabButtonWidget } from "../widgets/upgrade-tab-button.widget.js";
import { SHOP_NODE_IDS } from "./node-ids/shop-node-ids.js";

const MONEY_FORMATTER = new Intl.NumberFormat("en-US");

export class ShopScreen implements UIScreen {
  public readonly id = "shop";

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createUINode({
          id: SHOP_NODE_IDS.background,
          layout: {
            anchor: SHOP_SKIN_MAP.background.anchor,
            offsetX: SHOP_SKIN_MAP.background.offsetX,
            offsetY: SHOP_SKIN_MAP.background.offsetY,
          },
          visual: {
            sprite: {
              height: SHOP_SKIN_MAP.background.height,
              spriteName: SHOP_SKIN_MAP.background.spriteName,
              spriteSheetName: SHOP_SKIN_MAP.background.spriteSheetName,
              width: SHOP_SKIN_MAP.background.width,
            },
          },
        }),
        createUINode({
          id: SHOP_NODE_IDS.money,
          layout: createLegacyPointLayout(
            SHOP_SKIN_MAP.money.anchor,
            SHOP_SKIN_MAP.money.offsetX,
            SHOP_SKIN_MAP.money.offsetY,
          ),
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "left",
              maxWidth: null,
              text: "$0",
            },
          },
        }),
        ...SHOP_TABS_ORDER.map((tabType, index) => createButtonWidget({
          anchor: SHOP_SKIN_MAP.tabs.anchor,
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.TAB,
          legacyAnchor: true,
          nodeId: SHOP_NODE_IDS.tab(tabType),
          offsetX: SHOP_SKIN_MAP.tabs.offsetX + (SHOP_SKIN_MAP.tabs.stepX * index),
          offsetY: SHOP_SKIN_MAP.tabs.offsetY,
          onClickAction: createSelectShopTabAction(tabType),
          text: SHOP_TAB_CONFIG[tabType].label,
        })),
        createButtonWidget({
          anchor: SHOP_SKIN_MAP.returnButton.anchor,
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.PROMINENT,
          legacyAnchor: true,
          nodeId: SHOP_NODE_IDS.returnButton,
          offsetX: SHOP_SKIN_MAP.returnButton.offsetX,
          offsetY: SHOP_SKIN_MAP.returnButton.offsetY,
          onClickAction: createReturnToGameplayAction(),
          text: "Next mission",
        }),
        createUINode({
          children: SHOP_WEAPON_ITEMS_ORDER.map((itemType, index) => {
            const nodeIds = SHOP_NODE_IDS.weaponItem(itemType);
            const config = SHOP_WEAPON_ITEM_CONFIG[itemType];

            return createShopItemRowWidget({
              anchor: SHOP_SKIN_MAP.itemRows.anchor,
              buttonNodeId: nodeIds.button,
              buttonOffsetX: SHOP_SKIN_MAP.itemRows.buttonOffsetX,
              buttonOffsetY: SHOP_SKIN_MAP.itemRows.buttonOffsetY,
              buttonState: UIButtonState.NORMAL,
              buttonText: `$${MONEY_FORMATTER.format(config.price)}`,
              iconNodeId: nodeIds.icon,
              itemHeight: config.height,
              itemName: config.name,
              itemNameNodeId: nodeIds.name,
              itemSpriteName: config.spriteName,
              itemSpriteSheetName: SpriteSheetName.WEAPON,
              itemWidth: config.width,
              legacyOffsetX: SHOP_SKIN_MAP.itemRows.offsetX,
              legacyOffsetY: SHOP_SKIN_MAP.itemRows.offsetY + (SHOP_SKIN_MAP.itemRows.stepY * index),
              nameOffsetX: SHOP_SKIN_MAP.itemRows.nameOffsetX,
              nodeId: nodeIds.root,
              onButtonClickAction: createBuyWeaponAction(itemType),
            });
          }),
          id: SHOP_NODE_IDS.sections.weapons,
          layout: {
            childrenLayout: {
              kind: "absolute",
            },
            height: "fill",
            width: "fill",
          },
          visible: false,
        }),
        createUINode({
          children: SHOP_RESOURCE_ITEMS_ORDER.map((itemType, index) => {
            const nodeIds = SHOP_NODE_IDS.resourceItem(itemType);
            const config = SHOP_RESOURCE_ITEM_CONFIG[itemType];

            return createShopItemRowWidget({
              anchor: SHOP_SKIN_MAP.itemRows.anchor,
              buttonNodeId: nodeIds.button,
              buttonOffsetX: SHOP_SKIN_MAP.itemRows.buttonOffsetX,
              buttonOffsetY: SHOP_SKIN_MAP.itemRows.buttonOffsetY,
              buttonState: UIButtonState.NORMAL,
              buttonText: `$${MONEY_FORMATTER.format(config.price)}`,
              iconNodeId: nodeIds.icon,
              itemHeight: config.height,
              itemName: config.name,
              itemNameNodeId: nodeIds.name,
              itemSpriteName: config.spriteName,
              itemSpriteSheetName: SpriteSheetName.RESOURCES_ICON,
              itemWidth: config.width,
              legacyOffsetX: SHOP_SKIN_MAP.itemRows.offsetX,
              legacyOffsetY: SHOP_SKIN_MAP.itemRows.offsetY + (SHOP_SKIN_MAP.itemRows.stepY * index),
              nameOffsetX: SHOP_SKIN_MAP.itemRows.nameOffsetX,
              nodeId: nodeIds.root,
              onButtonClickAction: createBuyResourceAction(itemType),
              quantityNodeId: nodeIds.quantity,
              quantityText: `x${config.availableQuantity}`,
              secondarySpacingX: SHOP_SKIN_MAP.itemRows.secondarySpacingX,
            });
          }),
          id: SHOP_NODE_IDS.sections.resources,
          layout: {
            childrenLayout: {
              kind: "absolute",
            },
            height: "fill",
            width: "fill",
          },
          visible: false,
        }),
        createUINode({
          children: [
            createUINode({
              id: SHOP_NODE_IDS.upgradeNavigation.left,
              interaction: {
                action: createNavigateUpgradeTabsAction("left"),
              },
              layout: resolveLegacyAnchorLayout(
                SHOP_SKIN_MAP.upgradeTabs.anchor,
                SHOP_SKIN_MAP.upgradeTabs.navOffsetX,
                SHOP_SKIN_MAP.upgradeTabs.navOffsetY,
                SHOP_SKIN_MAP.upgradeTabs.navWidth,
                SHOP_SKIN_MAP.upgradeTabs.navHeight,
              ),
              visible: false,
              visual: {
                sprite: {
                  height: SHOP_SKIN_MAP.upgradeTabs.navHeight,
                  spriteName: SpriteName.BUTTON_ARROW_LEFT,
                  spriteSheetName: SpriteSheetName.BUTTON_ARROWS,
                  width: SHOP_SKIN_MAP.upgradeTabs.navWidth,
                },
              },
            }),
            createUINode({
              id: SHOP_NODE_IDS.upgradeNavigation.right,
              interaction: {
                action: createNavigateUpgradeTabsAction("right"),
              },
              layout: resolveLegacyAnchorLayout(
                SHOP_SKIN_MAP.upgradeTabs.anchor,
                SHOP_SKIN_MAP.upgradeTabs.navOffsetX,
                SHOP_SKIN_MAP.upgradeTabs.navOffsetY,
                SHOP_SKIN_MAP.upgradeTabs.navWidth,
                SHOP_SKIN_MAP.upgradeTabs.navHeight,
              ),
              visible: false,
              visual: {
                sprite: {
                  height: SHOP_SKIN_MAP.upgradeTabs.navHeight,
                  spriteName: SpriteName.BUTTON_ARROW_RIGHT,
                  spriteSheetName: SpriteSheetName.BUTTON_ARROWS,
                  width: SHOP_SKIN_MAP.upgradeTabs.navWidth,
                },
              },
            }),
            ...SHOP_UPGRADE_TABS_ORDER.map((tabType) => createUpgradeTabButtonWidget({
              anchor: SHOP_SKIN_MAP.upgradeTabs.anchor,
              buttonState: UIButtonState.NORMAL,
              iconHeight: SHOP_SKIN_MAP.upgradeTabs.iconHeight,
              iconOffsetX: SHOP_SKIN_MAP.upgradeTabs.iconOffsetX,
              iconOffsetY: SHOP_SKIN_MAP.upgradeTabs.iconOffsetY,
              iconSpriteName: SHOP_UPGRADE_TAB_CONFIG[tabType].weaponSprite,
              iconWidth: SHOP_SKIN_MAP.upgradeTabs.iconWidth,
              legacyOffsetX: SHOP_SKIN_MAP.upgradeTabs.offsetX,
              legacyOffsetY: SHOP_SKIN_MAP.upgradeTabs.offsetY,
              nodeId: SHOP_NODE_IDS.upgradeTab(tabType),
              onClickAction: createSelectUpgradeTabAction(tabType),
            })),
            ...WEAPON_UPGRADE_TYPES_ORDER.map((upgradeType, index) => {
              const nodeIds = SHOP_NODE_IDS.upgradeRow(upgradeType);

              return createUpgradeItemRowWidget({
                anchor: SHOP_SKIN_MAP.upgradeRows.anchor,
                buttonNodeId: nodeIds.button,
                buttonOffsetX: SHOP_SKIN_MAP.upgradeRows.buttonOffsetX,
                buttonOffsetY: SHOP_SKIN_MAP.upgradeRows.buttonOffsetY,
                buttonState: UIButtonState.NORMAL,
                buttonText: "",
                infoNodeId: nodeIds.info,
                infoOffsetX: SHOP_SKIN_MAP.upgradeRows.infoOffsetX,
                infoText: "",
                labelNodeId: nodeIds.label,
                labelText: "",
                legacyOffsetX: SHOP_SKIN_MAP.upgradeRows.offsetX,
                legacyOffsetY: SHOP_SKIN_MAP.upgradeRows.offsetY + (SHOP_SKIN_MAP.upgradeRows.stepY * index),
                nodeId: nodeIds.root,
                onButtonClickAction: createBuyUpgradeAction(upgradeType),
              });
            }),
          ],
          id: SHOP_NODE_IDS.sections.upgrades,
          layout: {
            childrenLayout: {
              kind: "absolute",
            },
            height: "fill",
            width: "fill",
          },
          visible: false,
        }),
      ],
      id: SHOP_NODE_IDS.root,
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        height: "fill",
        width: "fill",
      },
    });
  }
}
