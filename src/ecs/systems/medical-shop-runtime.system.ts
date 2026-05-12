import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { MedicalShopPresenter } from "../../ui/presenters/medical-shop.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { MEDICAL_SHOP_NODE_IDS } from "../../ui/screens/node-ids/medical-shop-node-ids.js";
import {
    UI_BUTTON_CONFIG,
    UIButtonState,
    UIButtonVariant,
} from "../../ui/style/ui-button-config.js";
import { MedicalShopTabType } from "../components/types/medical-shop-tab-config.js";
import { ISystem } from "./system.interface.js";

export class MedicalShopRuntimeSystem implements ISystem {
    private uiNodeBinder: UINodeBinder | null = null;

    constructor(
        private uiRuntime: UIRuntime,
        private medicalShopPresenter: MedicalShopPresenter,
    ) { }

    public update(_deltaTime: number): void {
        const binder = this.getBinder();
        const viewModel = this.medicalShopPresenter.buildViewModel();

        binder.patchText(MEDICAL_SHOP_NODE_IDS.money, {
            text: viewModel.moneyText,
        });

        viewModel.tabs.forEach((tabViewModel) => {
            this.applyButtonState(
                MEDICAL_SHOP_NODE_IDS.tab(tabViewModel.tabType),
                UIButtonVariant.TAB,
                tabViewModel.buttonState,
            );
        });

        binder.setVisibility(
            MEDICAL_SHOP_NODE_IDS.sections.resources,
            viewModel.activeTab === MedicalShopTabType.RESOURCES,
        );
        binder.setVisibility(
            MEDICAL_SHOP_NODE_IDS.sections.upgrades,
            viewModel.upgradeSectionVisible,
        );

        viewModel.resourceItems.forEach((itemViewModel) => {
            const nodeIds = MEDICAL_SHOP_NODE_IDS.resourceItem(itemViewModel.itemType);
            binder.setVisibility(nodeIds.root, itemViewModel.visible);
            binder.patchText(nodeIds.quantity, {
                text: itemViewModel.quantityText,
            });
            binder.patchText(nodeIds.button, {
                text: itemViewModel.priceText,
            });
            this.applyButtonState(
                nodeIds.button,
                UIButtonVariant.PRIMARY,
                itemViewModel.buttonState,
            );
        });

        viewModel.upgradeItems.forEach((itemViewModel) => {
            const nodeIds = MEDICAL_SHOP_NODE_IDS.upgradeItem(itemViewModel.upgradeType);
            binder.setVisibility(nodeIds.root, itemViewModel.visible);
            binder.patchText(nodeIds.level, {
                text: itemViewModel.levelText,
            });
            binder.patchText(nodeIds.button, {
                text: itemViewModel.priceText,
            });
            this.applyButtonState(
                nodeIds.button,
                UIButtonVariant.PRIMARY,
                itemViewModel.buttonState,
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
