import {
  GUNS_SHOP_RESOURCE_ITEM_CONFIG,
  GUNS_SHOP_RESOURCE_ITEMS_ORDER,
} from "../../ecs/components/types/guns-shop-resource-item-config.js";
import { GUNS_SHOP_TAB_CONFIG, GUNS_SHOP_TABS_ORDER } from "../../ecs/components/types/guns-shop-tab-config.js";
import {
  GUNS_SHOP_UPGRADE_TAB_CONFIG,
  GUNS_SHOP_UPGRADE_TABS_ORDER,
} from "../../ecs/components/types/guns-shop-upgrade-tab-config.js";
import {
  GUNS_SHOP_WEAPON_ITEM_CONFIG,
  GUNS_SHOP_WEAPON_ITEMS_ORDER,
} from "../../ecs/components/types/guns-shop-weapon-item-config.js";
import { WEAPON_UPGRADE_TYPES_ORDER } from "../../ecs/components/types/weapon-upgrade-config.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import {
  createBuyGunsShopResourceAction,
  createBuyGunsShopUpgradeAction,
  createBuyGunsShopWeaponAction,
  createNavigateGunsShopUpgradeTabsAction,
  createReturnFromGunsShopToGameplayAction,
  createSelectGunsShopTabAction,
  createSelectGunsShopUpgradeTabAction,
} from "../input/guns-shop-ui-actions.js";
import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { GUNS_SHOP_SKIN_MAP } from "../style/guns-shop-skin-map.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import { createLegacyPointLayout, resolveLegacyAnchorLayout } from "../widgets/legacy-layout.js";
import { createGunsShopItemRowWidget } from "../widgets/guns-shop-item-row.widget.js";
import { createUpgradeItemRowWidget } from "../widgets/upgrade-item-row.widget.js";
import { createUpgradeTabButtonWidget } from "../widgets/upgrade-tab-button.widget.js";
import { GUNS_SHOP_NODE_IDS } from "./node-ids/guns-shop-node-ids.js";

const MONEY_FORMATTER = new Intl.NumberFormat("en-US");

export class GunsShopScreen implements UIScreen {
  public readonly id = "guns-shop";

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createUINode({
          id: GUNS_SHOP_NODE_IDS.background,
          layout: {
            anchor: GUNS_SHOP_SKIN_MAP.background.anchor,
            offsetX: GUNS_SHOP_SKIN_MAP.background.offsetX,
            offsetY: GUNS_SHOP_SKIN_MAP.background.offsetY,
          },
          visual: {
            sprite: {
              height: GUNS_SHOP_SKIN_MAP.background.height,
              spriteName: GUNS_SHOP_SKIN_MAP.background.spriteName,
              spriteSheetName: GUNS_SHOP_SKIN_MAP.background.spriteSheetName,
              width: GUNS_SHOP_SKIN_MAP.background.width,
            },
          },
        }),
        createUINode({
          id: GUNS_SHOP_NODE_IDS.money,
          layout: createLegacyPointLayout(
            GUNS_SHOP_SKIN_MAP.money.anchor,
            GUNS_SHOP_SKIN_MAP.money.offsetX,
            GUNS_SHOP_SKIN_MAP.money.offsetY,
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
        ...GUNS_SHOP_TABS_ORDER.map((tabType, index) => createButtonWidget({
          anchor: GUNS_SHOP_SKIN_MAP.tabs.anchor,
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.TAB,
          legacyAnchor: true,
          nodeId: GUNS_SHOP_NODE_IDS.tab(tabType),
          offsetX: GUNS_SHOP_SKIN_MAP.tabs.offsetX + (GUNS_SHOP_SKIN_MAP.tabs.stepX * index),
          offsetY: GUNS_SHOP_SKIN_MAP.tabs.offsetY,
          onClickAction: createSelectGunsShopTabAction(tabType),
          text: GUNS_SHOP_TAB_CONFIG[tabType].label,
        })),
        createButtonWidget({
          anchor: GUNS_SHOP_SKIN_MAP.returnButton.anchor,
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.PROMINENT,
          legacyAnchor: true,
          nodeId: GUNS_SHOP_NODE_IDS.returnButton,
          offsetX: GUNS_SHOP_SKIN_MAP.returnButton.offsetX,
          offsetY: GUNS_SHOP_SKIN_MAP.returnButton.offsetY,
          onClickAction: createReturnFromGunsShopToGameplayAction(),
          text: "Next mission",
        }),
        createUINode({
          children: GUNS_SHOP_WEAPON_ITEMS_ORDER.map((itemType, index) => {
            const nodeIds = GUNS_SHOP_NODE_IDS.weaponItem(itemType);
            const config = GUNS_SHOP_WEAPON_ITEM_CONFIG[itemType];

            return createGunsShopItemRowWidget({
              anchor: GUNS_SHOP_SKIN_MAP.itemRows.anchor,
              buttonNodeId: nodeIds.button,
              buttonOffsetX: GUNS_SHOP_SKIN_MAP.itemRows.buttonOffsetX,
              buttonOffsetY: GUNS_SHOP_SKIN_MAP.itemRows.buttonOffsetY,
              buttonState: UIButtonState.NORMAL,
              buttonText: `$${MONEY_FORMATTER.format(config.price)}`,
              iconNodeId: nodeIds.icon,
              itemHeight: config.height,
              itemName: config.name,
              itemNameNodeId: nodeIds.name,
              itemSpriteName: config.spriteName,
              itemSpriteSheetName: SpriteSheetName.WEAPON,
              itemWidth: config.width,
              legacyOffsetX: GUNS_SHOP_SKIN_MAP.itemRows.offsetX,
              legacyOffsetY: GUNS_SHOP_SKIN_MAP.itemRows.offsetY + (GUNS_SHOP_SKIN_MAP.itemRows.stepY * index),
              nameOffsetX: GUNS_SHOP_SKIN_MAP.itemRows.nameOffsetX,
              nodeId: nodeIds.root,
              onButtonClickAction: createBuyGunsShopWeaponAction(itemType),
            });
          }),
          id: GUNS_SHOP_NODE_IDS.sections.weapons,
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
          children: GUNS_SHOP_RESOURCE_ITEMS_ORDER.map((itemType, index) => {
            const nodeIds = GUNS_SHOP_NODE_IDS.resourceItem(itemType);
            const config = GUNS_SHOP_RESOURCE_ITEM_CONFIG[itemType];

            return createGunsShopItemRowWidget({
              anchor: GUNS_SHOP_SKIN_MAP.itemRows.anchor,
              buttonNodeId: nodeIds.button,
              buttonOffsetX: GUNS_SHOP_SKIN_MAP.itemRows.buttonOffsetX,
              buttonOffsetY: GUNS_SHOP_SKIN_MAP.itemRows.buttonOffsetY,
              buttonState: UIButtonState.NORMAL,
              buttonText: `$${MONEY_FORMATTER.format(config.price)}`,
              iconNodeId: nodeIds.icon,
              itemHeight: config.height,
              itemName: config.name,
              itemNameNodeId: nodeIds.name,
              itemSpriteName: config.spriteName,
              itemSpriteSheetName: SpriteSheetName.RESOURCES_ICON,
              itemWidth: config.width,
              legacyOffsetX: GUNS_SHOP_SKIN_MAP.itemRows.offsetX,
              legacyOffsetY: GUNS_SHOP_SKIN_MAP.itemRows.offsetY + (GUNS_SHOP_SKIN_MAP.itemRows.stepY * index),
              nameOffsetX: GUNS_SHOP_SKIN_MAP.itemRows.nameOffsetX,
              nodeId: nodeIds.root,
              onButtonClickAction: createBuyGunsShopResourceAction(itemType),
              quantityNodeId: nodeIds.quantity,
              quantityText: `x${config.availableQuantity}`,
              secondarySpacingX: GUNS_SHOP_SKIN_MAP.itemRows.secondarySpacingX,
            });
          }),
          id: GUNS_SHOP_NODE_IDS.sections.resources,
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
              id: GUNS_SHOP_NODE_IDS.upgradeNavigation.left,
              interaction: {
                action: createNavigateGunsShopUpgradeTabsAction("left"),
              },
              layout: resolveLegacyAnchorLayout(
                GUNS_SHOP_SKIN_MAP.upgradeTabs.anchor,
                GUNS_SHOP_SKIN_MAP.upgradeTabs.navOffsetX,
                GUNS_SHOP_SKIN_MAP.upgradeTabs.navOffsetY,
                GUNS_SHOP_SKIN_MAP.upgradeTabs.navWidth,
                GUNS_SHOP_SKIN_MAP.upgradeTabs.navHeight,
              ),
              visible: false,
              visual: {
                sprite: {
                  height: GUNS_SHOP_SKIN_MAP.upgradeTabs.navHeight,
                  spriteName: SpriteName.BUTTON_ARROW_LEFT,
                  spriteSheetName: SpriteSheetName.BUTTON_ARROWS,
                  width: GUNS_SHOP_SKIN_MAP.upgradeTabs.navWidth,
                },
              },
            }),
            createUINode({
              id: GUNS_SHOP_NODE_IDS.upgradeNavigation.right,
              interaction: {
                action: createNavigateGunsShopUpgradeTabsAction("right"),
              },
              layout: resolveLegacyAnchorLayout(
                GUNS_SHOP_SKIN_MAP.upgradeTabs.anchor,
                GUNS_SHOP_SKIN_MAP.upgradeTabs.navOffsetX,
                GUNS_SHOP_SKIN_MAP.upgradeTabs.navOffsetY,
                GUNS_SHOP_SKIN_MAP.upgradeTabs.navWidth,
                GUNS_SHOP_SKIN_MAP.upgradeTabs.navHeight,
              ),
              visible: false,
              visual: {
                sprite: {
                  height: GUNS_SHOP_SKIN_MAP.upgradeTabs.navHeight,
                  spriteName: SpriteName.BUTTON_ARROW_RIGHT,
                  spriteSheetName: SpriteSheetName.BUTTON_ARROWS,
                  width: GUNS_SHOP_SKIN_MAP.upgradeTabs.navWidth,
                },
              },
            }),
            ...GUNS_SHOP_UPGRADE_TABS_ORDER.map((tabType) => createUpgradeTabButtonWidget({
              anchor: GUNS_SHOP_SKIN_MAP.upgradeTabs.anchor,
              buttonState: UIButtonState.NORMAL,
              iconHeight: GUNS_SHOP_SKIN_MAP.upgradeTabs.iconHeight,
              iconOffsetX: GUNS_SHOP_SKIN_MAP.upgradeTabs.iconOffsetX,
              iconOffsetY: GUNS_SHOP_SKIN_MAP.upgradeTabs.iconOffsetY,
              iconSpriteName: GUNS_SHOP_UPGRADE_TAB_CONFIG[tabType].weaponSprite,
              iconWidth: GUNS_SHOP_SKIN_MAP.upgradeTabs.iconWidth,
              legacyOffsetX: GUNS_SHOP_SKIN_MAP.upgradeTabs.offsetX,
              legacyOffsetY: GUNS_SHOP_SKIN_MAP.upgradeTabs.offsetY,
              nodeId: GUNS_SHOP_NODE_IDS.upgradeTab(tabType),
              onClickAction: createSelectGunsShopUpgradeTabAction(tabType),
            })),
            ...WEAPON_UPGRADE_TYPES_ORDER.map((upgradeType, index) => {
              const nodeIds = GUNS_SHOP_NODE_IDS.upgradeRow(upgradeType);

              return createUpgradeItemRowWidget({
                anchor: GUNS_SHOP_SKIN_MAP.upgradeRows.anchor,
                buttonNodeId: nodeIds.button,
                buttonOffsetX: GUNS_SHOP_SKIN_MAP.upgradeRows.buttonOffsetX,
                buttonOffsetY: GUNS_SHOP_SKIN_MAP.upgradeRows.buttonOffsetY,
                buttonState: UIButtonState.NORMAL,
                buttonText: "",
                infoNodeId: nodeIds.info,
                infoOffsetX: GUNS_SHOP_SKIN_MAP.upgradeRows.infoOffsetX,
                infoText: "",
                labelNodeId: nodeIds.label,
                labelText: "",
                legacyOffsetX: GUNS_SHOP_SKIN_MAP.upgradeRows.offsetX,
                legacyOffsetY: GUNS_SHOP_SKIN_MAP.upgradeRows.offsetY + (GUNS_SHOP_SKIN_MAP.upgradeRows.stepY * index),
                nodeId: nodeIds.root,
                onButtonClickAction: createBuyGunsShopUpgradeAction(upgradeType),
              });
            }),
          ],
          id: GUNS_SHOP_NODE_IDS.sections.upgrades,
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
      id: GUNS_SHOP_NODE_IDS.root,
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
