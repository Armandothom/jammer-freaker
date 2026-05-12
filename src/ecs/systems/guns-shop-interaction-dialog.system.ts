import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { GunsShopDialogIntentComponent } from "../components/guns-shop-dialog-intent.component.js";
import { GunsShopDialogEvent } from "../components/types/guns-shop-dialog-event.enum.js";
import { ComponentStore } from "../core/component-store.js";
import { DialogManager } from "../core/dialog-manager.js";
import { DialogEntityFactory } from "../entities/dialog-entity-factory.js";
import { ISystem } from "./system.interface.js";

const MIN_DIALOG_DURATION_SECONDS = 1.8;
const DIALOG_DURATION_PER_CHARACTER_SECONDS = 0.1;
const GUNS_SHOP_DIALOG_SCREEN_X = 210;
const GUNS_SHOP_DIALOG_SCREEN_Y = 200;

export class GunsShopInteractionDialogSystem implements ISystem {
    constructor(
        private dialogEntityFactory: DialogEntityFactory,
        private dialogManager: DialogManager,
        private gunsShopDialogIntentComponentStore: ComponentStore<GunsShopDialogIntentComponent>,
        private dialogComponentStore: ComponentStore<DialogComponent>,
        private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.consumeDialogIntents();
        this.updateDialogTimers(deltaTime);
    }

    private consumeDialogIntents(): void {
        for (const [sourceEntityId, dialogIntent] of this.gunsShopDialogIntentComponentStore.getValuesAndEntityId()) {
            this.gunsShopDialogIntentComponentStore.remove(sourceEntityId);

            const dialogText = this.handleEvent(dialogIntent.event);
            if (dialogText === null) {
                continue;
            }

            this.destroyDialogsFromSource(sourceEntityId);
            this.dialogEntityFactory.createScreenSpaceDialog(
                sourceEntityId,
                dialogText,
                this.calculateDialogDuration(dialogText),
                GUNS_SHOP_DIALOG_SCREEN_X,
                GUNS_SHOP_DIALOG_SCREEN_Y,
            );
        }
    }

    private updateDialogTimers(deltaTime: number): void {
        for (const [dialogEntityId, lifetime] of this.dialogLifetimeComponentStore.getValuesAndEntityId()) {
            lifetime.remainingTime -= deltaTime;

            if (lifetime.remainingTime > 0) {
                continue;
            }

            this.dialogEntityFactory.destroyDialog(dialogEntityId);
        }
    }

    private destroyDialogsFromSource(sourceEntityId: number): void {
        for (const [dialogEntityId, dialog] of this.dialogComponentStore.getValuesAndEntityId()) {
            if (dialog.sourceEntityId !== sourceEntityId) {
                continue;
            }

            this.dialogEntityFactory.destroyDialog(dialogEntityId);
        }
    }

    private handleEvent(event: GunsShopDialogEvent): string | null {
        switch (event) {
            case GunsShopDialogEvent.ENTER_GUNS_SHOP_HIGH_MONEY:
            case GunsShopDialogEvent.ENTER_GUNS_SHOP_MEDIUM_MONEY:
            case GunsShopDialogEvent.ENTER_GUNS_SHOP_LOW_MONEY:
            case GunsShopDialogEvent.CANT_BUY:
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
