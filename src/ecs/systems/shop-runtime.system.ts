import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { ShopPresenter } from "../../ui/presenters/shop.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import {
  UI_BUTTON_CONFIG,
  UIButtonState,
  UIButtonVariant,
} from "../../ui/style/ui-button-config.js";
import { SHOP_NODE_IDS } from "../../ui/screens/shop-node-ids.js";
import { ShopTabType } from "../components/types/shop-tab-config.js";
import { ISystem } from "./system.interface.js";

export class ShopRuntimeSystem implements ISystem {
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private shopPresenter: ShopPresenter,
  ) { }

  public update(_deltaTime: number): void {
    const binder = this.getBinder();
    const viewModel = this.shopPresenter.buildViewModel();

    binder.patchText(SHOP_NODE_IDS.money, {
      text: viewModel.moneyText,
    });

    viewModel.tabs.forEach((tabViewModel) => {
      this.applyButtonState(
        SHOP_NODE_IDS.tab(tabViewModel.tabType),
        UIButtonVariant.TAB,
        tabViewModel.buttonState,
      );
    });

    binder.setVisibility(
      SHOP_NODE_IDS.sections.weapons,
      viewModel.activeTab === ShopTabType.WEAPONS,
    );
    binder.setVisibility(
      SHOP_NODE_IDS.sections.resources,
      viewModel.activeTab === ShopTabType.RESOURCES,
    );
    binder.setVisibility(
      SHOP_NODE_IDS.sections.upgrades,
      viewModel.upgradeSectionVisible,
    );

    viewModel.weaponItems.forEach((itemViewModel) => {
      const nodeIds = SHOP_NODE_IDS.weaponItem(itemViewModel.itemType);
      binder.setVisibility(nodeIds.root, itemViewModel.visible);
      this.applyButtonState(
        nodeIds.button,
        UIButtonVariant.PRIMARY,
        itemViewModel.buttonState,
      );
    });

    viewModel.resourceItems.forEach((itemViewModel) => {
      const nodeIds = SHOP_NODE_IDS.resourceItem(itemViewModel.itemType);
      binder.setVisibility(nodeIds.root, itemViewModel.visible);
      binder.patchText(nodeIds.quantity, {
        text: itemViewModel.quantityText,
      });
      this.applyButtonState(
        nodeIds.button,
        UIButtonVariant.PRIMARY,
        itemViewModel.buttonState,
      );
    });

    binder.setVisibility(
      SHOP_NODE_IDS.upgradeNavigation.left,
      viewModel.upgradeTabs.leftNavigationVisible,
    );
    binder.setVisibility(
      SHOP_NODE_IDS.upgradeNavigation.right,
      viewModel.upgradeTabs.rightNavigationVisible,
    );
    binder.patchLayout(SHOP_NODE_IDS.upgradeNavigation.left, {
      offsetX: viewModel.upgradeTabs.leftNavigationOffsetX - 32,
    });
    binder.patchLayout(SHOP_NODE_IDS.upgradeNavigation.right, {
      offsetX: viewModel.upgradeTabs.rightNavigationOffsetX - 32,
    });

    viewModel.upgradeTabs.buttons.forEach((tabViewModel) => {
      const nodeId = SHOP_NODE_IDS.upgradeTab(tabViewModel.tabType);
      binder.setVisibility(nodeId, tabViewModel.visible);
      binder.patchLayout(nodeId, {
        offsetX: tabViewModel.offsetX - UI_BUTTON_CONFIG[UIButtonVariant.COMPACT].width,
      });
      this.applyButtonState(
        nodeId,
        UIButtonVariant.COMPACT,
        tabViewModel.buttonState,
      );
    });

    viewModel.upgradeRows.forEach((rowViewModel) => {
      const nodeIds = SHOP_NODE_IDS.upgradeRow(rowViewModel.upgradeType);
      binder.setVisibility(nodeIds.root, rowViewModel.visible);
      binder.patchText(nodeIds.label, {
        text: rowViewModel.labelText,
      });
      binder.patchText(nodeIds.info, {
        text: rowViewModel.infoText,
      });
      binder.patchText(nodeIds.button, {
        text: rowViewModel.buttonText,
      });
      this.applyButtonState(
        nodeIds.button,
        UIButtonVariant.PRIMARY,
        rowViewModel.buttonState,
      );
    });

    this.uiRuntime.relayout();
  }

  private applyButtonState(
    nodeId: string,
    buttonVariant: UIButtonVariant,
    buttonState: UIButtonState,
  ): void {
    const binder = this.getBinder();

    binder.patchInteraction(nodeId, {
      disabled: buttonState === UIButtonState.DISABLED,
    });
    binder.patchSprite(nodeId, {
      spriteName: UI_BUTTON_CONFIG[buttonVariant].states[buttonState].spriteName,
    });
  }

  private getBinder(): UINodeBinder {
    if (!this.uiNodeBinder) {
      this.uiNodeBinder = new UINodeBinder(this.uiRuntime.getDocument());
    }

    return this.uiNodeBinder;
  }
}
