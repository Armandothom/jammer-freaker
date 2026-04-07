import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { ShopDialogIntentComponent } from "../components/shop-dialog-intent.component.js";
import { ShopDialogEvent } from "../components/types/shop-dialog-event.enum.js";
import { ComponentStore } from "../core/component-store.js";
import { DialogManager } from "../core/dialog-manager.js";
import { ShopEntityFactory } from "../entities/shop-entity-factory.js";
import { ISystem } from "./system.interface.js";

const MIN_DIALOG_DURATION_SECONDS = 1.8;
const DIALOG_DURATION_PER_CHARACTER_SECONDS = 0.1;
const SHOP_DIALOG_SCREEN_X = 210;
const SHOP_DIALOG_SCREEN_Y = 200;

export class ShopInteractionDialogSystem implements ISystem {
    constructor(
        private shopEntityFactory: ShopEntityFactory,
        private dialogManager: DialogManager,
        private shopDialogIntentComponentStore: ComponentStore<ShopDialogIntentComponent>,
        private dialogComponentStore: ComponentStore<DialogComponent>,
        private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.consumeDialogIntents();
        this.updateDialogTimers(deltaTime);
    }

    private consumeDialogIntents(): void {
        for (const [sourceEntityId, dialogIntent] of this.shopDialogIntentComponentStore.getValuesAndEntityId()) {
            this.shopDialogIntentComponentStore.remove(sourceEntityId);

            const dialogText = this.handleEvent(dialogIntent.event);
            if (dialogText === null) {
                continue;
            }

            this.destroyDialogsFromSource(sourceEntityId);
            this.shopEntityFactory.createDialog(
                sourceEntityId,
                dialogText,
                this.calculateDialogDuration(dialogText),
                "speech",
                false,
                true,
                SHOP_DIALOG_SCREEN_X,
                SHOP_DIALOG_SCREEN_Y,
            );
        }
    }

    private updateDialogTimers(deltaTime: number): void {
        for (const [dialogEntityId, lifetime] of this.dialogLifetimeComponentStore.getValuesAndEntityId()) {
            lifetime.remainingTime -= deltaTime;

            if (lifetime.remainingTime > 0) {
                continue;
            }

            this.shopEntityFactory.destroyDialog(dialogEntityId);
        }
    }

    private destroyDialogsFromSource(sourceEntityId: number): void {
        for (const [dialogEntityId, dialog] of this.dialogComponentStore.getValuesAndEntityId()) {
            if (dialog.sourceEntityId !== sourceEntityId) {
                continue;
            }

            this.shopEntityFactory.destroyDialog(dialogEntityId);
        }
    }

    private handleEvent(event: ShopDialogEvent): string | null {
        switch (event) {
            case ShopDialogEvent.ENTER_SHOP_HIGH_MONEY:
            case ShopDialogEvent.ENTER_SHOP_MEDIUM_MONEY:
            case ShopDialogEvent.ENTER_SHOP_LOW_MONEY:
            case ShopDialogEvent.CANT_BUY:
                return this.dialogManager.getRandomGunDealerDialogText(event);

            default:
                return null;
        }
    }

    private calculateDialogDuration(text: string): number {
        return Math.max(
            MIN_DIALOG_DURATION_SECONDS,
            text.length * DIALOG_DURATION_PER_CHARACTER_SECONDS,
        );
    }
}
