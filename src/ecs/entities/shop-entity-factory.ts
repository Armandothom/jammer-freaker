import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { getBitmapTextBounds, getBitmapTextSize } from "../../utils/get-bitmap-text-size.js";
import { getCenteredBitmapTextPosition } from "../../utils/get-centered-bitmap-text-position.js";
import { AnimationComponent } from "../components/animation.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { ClickableRegionComponent } from "../components/clickable-region-component.js";
import { DialogAnimComponent } from "../components/dialog-anim.component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { GunDealerComponent } from "../components/gun-dealer-component.js";
import { ParentEntityComponent } from "../components/parent-entity-component.js";
import { RegionClickedComponent } from "../components/region-clicked-component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ResourceShopItemComponent } from "../components/resource-shop-item.component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { ShopButtonComponent } from "../components/shop-button-component.js";
import { ShopDialogIntentComponent } from "../components/shop-dialog-intent.component.js";
import { ShopTabButtonComponent } from "../components/shop-tab-button.component.js";
import { ShopUIAnchorComponent } from "../components/shop-ui-anchor.component.js";
import { ShopUIComponent } from "../components/shop-ui-component.js";
import { ShopUpgradeTabButtonComponent } from "../components/shop-upgrade-tab-button-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { SHOP_BUTTON_CONFIG, ShopButtonState, ShopButtonType } from "../components/types/shop-button-config.js";
import { ShopDialogEvent } from "../components/types/shop-dialog-event.enum.js";
import { isShopResourceItemType, ShopResourceItemType } from "../components/types/shop-resource-item-config.js";
import { ShopTabType } from "../components/types/shop-tab-config.js";
import { SHOP_UI_TYPE_LAYOUT_PRESET } from "../components/types/shop-ui-type-layout-preset.js";
import { ShopUIEntryType, ShopUIType } from "../components/types/shop-ui-type.js";
import { ShopUpgradeTabType } from "../components/types/shop-upgrade-tab-config.js";
import { isShopWeaponItemType, type ShopWeaponItemType } from "../components/types/shop-weapon-item-config.js";
import { UIAnchor } from "../components/types/ui-anchor.js";
import { WeaponUpgradeType } from "../components/types/weapon-upgrade-config.js";
import { UpgradeShopItemComponent } from "../components/upgrade-shop-item-component.js";
import { WeaponShopItemComponent } from "../components/weapon-shop-item.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import {
    createDialogBitmapTextComponent,
    SHOP_DIALOG_FALLBACK_MAX_WIDTH,
} from "../core/dialog-text-layout.js";
import { EntityManager } from "../core/entity-manager.js";
import { UIManager } from "../core/ui-manager.js";

const DEFAULT_DIALOG_FONT_ID = "04b_03";
const DEFAULT_DIALOG_TEXT_SCALE = 2;
const DEFAULT_SHOP_UI_TEXT_MAX_WIDTH = 160;
const DEFAULT_DIALOG_PADDING_X = 16;
const DEFAULT_DIALOG_PADDING_Y = 24;
const DEFAULT_DIALOG_TEXT_OFFSET_X = 16;
const DEFAULT_DIALOG_TEXT_OFFSET_Y = 16;
const DEFAULT_DIALOG_MIN_WIDTH = 48;
const DEFAULT_DIALOG_MIN_HEIGHT = 48;

export class ShopEntityFactory {
    constructor(
        private entityManager: EntityManager,
        private uiManager: UIManager,
        private renderableComponentStore: ComponentStore<RenderableComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private zLayerComponentStore: ComponentStore<ZLayerComponent>,
        private screenPositionComponentStore: ComponentStore<ScreenPositionComponent>,
        private shopUIComponentStore: ComponentStore<ShopUIComponent>,
        private shopUIAnchorComponentStore: ComponentStore<ShopUIAnchorComponent>,
        private clickableRegionComponent: ComponentStore<ClickableRegionComponent>,
        private regionClickedComponentStore: ComponentStore<RegionClickedComponent>,
        private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
        private weaponShopItemComponentStore: ComponentStore<WeaponShopItemComponent>,
        private resourceShopItemComponentStore: ComponentStore<ResourceShopItemComponent>,
        private shopButtonComponentStore: ComponentStore<ShopButtonComponent>,
        private shopTabButtonComponentStore: ComponentStore<ShopTabButtonComponent>,
        private parentEntityComponentStore: ComponentStore<ParentEntityComponent>,
        private dialogComponentStore: ComponentStore<DialogComponent>,
        private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent>,
        private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent>,
        private dialogAnimComponentStore: ComponentStore<DialogAnimComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private shopDialogIntentComponentStore: ComponentStore<ShopDialogIntentComponent>,
        private gunDealerComponentStore: ComponentStore<GunDealerComponent>,
        private shopUpgradeTabButtonComponentStore: ComponentStore<ShopUpgradeTabButtonComponent>,
        private upgradeShopItemComponentStore: ComponentStore<UpgradeShopItemComponent>,
    ) {
    }

    createGunDealer(dialogEvent: ShopDialogEvent): number {
        const entityId = this.entityManager.registerEntity();
        this.shopDialogIntentComponentStore.add(entityId, new ShopDialogIntentComponent(dialogEvent));
        this.gunDealerComponentStore.add(entityId, new GunDealerComponent());

        return entityId;
    }

    createBackground(entryType: ShopUIEntryType, uiType: ShopUIType, uiAnchor: UIAnchor, offsetX: number, offsetY: number) {
        const entityId = this.entityManager.registerEntity();
        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.SHOP_BACKGROUND, SpriteSheetName.SHOP_BACKGROUND, 800, 600));
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(1));
        this.shopUIComponentStore.add(entityId, new ShopUIComponent(entryType, uiType));
        this.shopUIAnchorComponentStore.add(entityId, new ShopUIAnchorComponent(uiAnchor, offsetX, offsetY));
        const screenPosition = this.uiManager.resolveScreenPosition(uiAnchor, offsetX, offsetY);
        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenPosition.x, screenPosition.y));
    }

    createDialog(
        sourceEntityId: number,
        text: string,
        remainingTime: number,
        dialogType: string = "speech",
        followSource: boolean = true,
        destroyOnExpire: boolean = true,
        screenX: number = 0,
        screenY: number = 0,
    ) {
        const entityId = this.entityManager.registerEntity();
        const dialogAnimation = new DialogAnimComponent(AnimationName.DIALOG_BALLOON_IDLE);
        const animationComponent = new AnimationComponent(
            dialogAnimation.animationName,
            dialogAnimation.loop,
        );
        animationComponent.startAnimationTime = dialogAnimation.startAnimationTime;

        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenX, screenY));
        this.dialogComponentStore.add(entityId, new DialogComponent(
            sourceEntityId,
            dialogType,
            text,
            followSource,
            destroyOnExpire,
        ));
        this.dialogLifetimeComponentStore.add(entityId, new DialogLifetimeComponent(remainingTime));
        this.dialogBubbleSpriteComponentStore.add(entityId, new DialogBubbleSpriteComponent(
            SpriteName.DIALOG_BALLOON_1,
            SpriteSheetName.DIALOG_BALLOON,
            DEFAULT_DIALOG_PADDING_X,
            DEFAULT_DIALOG_PADDING_Y,
            DEFAULT_DIALOG_TEXT_OFFSET_X,
            DEFAULT_DIALOG_TEXT_OFFSET_Y,
            DEFAULT_DIALOG_MIN_WIDTH,
            DEFAULT_DIALOG_MIN_HEIGHT,
        ));
        this.bitmapTextComponentStore.add(
            entityId,
            createDialogBitmapTextComponent(
                text,
                DEFAULT_DIALOG_FONT_ID,
                DEFAULT_DIALOG_TEXT_SCALE,
                SHOP_DIALOG_FALLBACK_MAX_WIDTH,
            ),
        );
        this.dialogAnimComponentStore.add(entityId, dialogAnimation);
        this.animationComponentStore.add(entityId, animationComponent);
        this.spriteComponentStore.add(entityId, new SpriteComponent(
            SpriteName.DIALOG_BALLOON_1,
            SpriteSheetName.DIALOG_BALLOON,
            DEFAULT_DIALOG_MIN_WIDTH,
            DEFAULT_DIALOG_MIN_HEIGHT,
        ));
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
        return entityId;
    }

    destroyDialog(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);
        this.spriteComponentStore.remove(entityId);
        this.animationComponentStore.remove(entityId);
        this.dialogComponentStore.remove(entityId);
        this.dialogLifetimeComponentStore.remove(entityId);
        this.dialogBubbleSpriteComponentStore.remove(entityId);
        this.bitmapTextComponentStore.remove(entityId);
        this.dialogAnimComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
    }

    createShopItem(
        entryType: ShopUIEntryType,
        uiType: ShopUIType,
        shopTabType: ShopTabType,
        uiAnchor: UIAnchor,
        offsetX: number,
        offsetY: number,
        spriteName: SpriteName,
        spriteSheetName: SpriteSheetName,
        buttonText: string,
        buttonState: ShopButtonState,
        itemName: string,
        itemType: ShopWeaponItemType | ShopResourceItemType,
        width: number,
        height: number,
        secondaryText?: string,
    ) {
        const entityId = this.entityManager.registerEntity();

        this.renderableComponentStore.add(entityId, new RenderableComponent());
        if (isShopWeaponItemType(itemType)) {
            this.weaponShopItemComponentStore.add(entityId, new WeaponShopItemComponent(itemType));
        } else if (isShopResourceItemType(itemType)) {
            this.resourceShopItemComponentStore.add(entityId, new ResourceShopItemComponent(itemType));
        } else {
            throw new Error(`Unsupported shop item type: ${itemType}`);
        }
        this.spriteComponentStore.add(entityId, new SpriteComponent(spriteName, spriteSheetName, width, height));
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(2));
        this.shopUIComponentStore.add(entityId, new ShopUIComponent(entryType, uiType));
        this.shopUIAnchorComponentStore.add(entityId, new ShopUIAnchorComponent(uiAnchor, offsetX, offsetY));
        const screenPosition = this.uiManager.resolveScreenPosition(uiAnchor, offsetX, offsetY);
        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenPosition.x, screenPosition.y));
        const preset = SHOP_UI_TYPE_LAYOUT_PRESET;
        const buttonSpacingX = 96 * 2 + 12;
        const buttonSpacingY = 10;
        const buttonOffsetX = offsetX - buttonSpacingX;
        const buttonOffsetY = offsetY - buttonSpacingY;

        this.createAssociatedButton(
            entityId,
            ShopUIEntryType.BUTTON,
            ShopUIType.BUY_BUTTON,
            preset.buy_button.anchor,
            buttonOffsetX,
            buttonOffsetY,
            ShopButtonType.BUY,
            shopTabType,
            buttonState,
            SpriteSheetName.BUTTONS,
            buttonText,
        );

        const buttonScreenPosition = this.uiManager.resolveScreenPosition(
            preset.buy_button.anchor,
            buttonOffsetX,
            buttonOffsetY,
        );

        const buttonTextPosition = getCenteredBitmapTextPosition(
            buttonText,
            SHOP_BUTTON_CONFIG[ShopButtonType.BUY].width,
            SHOP_BUTTON_CONFIG[ShopButtonType.BUY].height,
            DEFAULT_DIALOG_TEXT_SCALE,
        );

        const itemNameBounds = getBitmapTextBounds(itemName, DEFAULT_DIALOG_FONT_ID, DEFAULT_DIALOG_TEXT_SCALE);

        const textSpacingX = 4;
        const itemNameScreenX = screenPosition.x + width + textSpacingX - itemNameBounds.left;
        const itemNameScreenY = buttonScreenPosition.y + buttonTextPosition.y;

        this.createAssociatedText(entityId, itemName, itemNameScreenX, itemNameScreenY);

        if (secondaryText) {
            const secondaryBounds = getBitmapTextBounds(
                secondaryText,
                DEFAULT_DIALOG_FONT_ID,
                DEFAULT_DIALOG_TEXT_SCALE,
            );
            const secondarySpacingX = 8;
            const secondaryTextScreenX = itemNameScreenX + itemNameBounds.width + secondarySpacingX - secondaryBounds.left;
            const secondaryTextEntityId = this.createAssociatedText(entityId, secondaryText, secondaryTextScreenX, itemNameScreenY);

            if (this.resourceShopItemComponentStore.has(entityId)) {
                this.resourceShopItemComponentStore.get(entityId).quantityTextEntityId = secondaryTextEntityId;
            }
        }

        return entityId;
    }

    createAssociatedButton(
        parentEntityId: number,
        entryType: ShopUIEntryType,
        uiType: ShopUIType,
        uiAnchor: UIAnchor,
        offsetX: number,
        offsetY: number,
        buttonType: ShopButtonType,
        shopTabType: ShopTabType | undefined,
        buttonState: ShopButtonState,
        spriteSheetName: SpriteSheetName,
        text: string,
    ) {
        const entityId = this.entityManager.registerEntity();
        const buttonConfig = SHOP_BUTTON_CONFIG[buttonType];
        const visualState = buttonConfig.states[buttonState];

        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.spriteComponentStore.add(entityId, new SpriteComponent(visualState.spriteName, spriteSheetName, buttonConfig.width, buttonConfig.height));
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(2));
        this.shopUIComponentStore.add(entityId, new ShopUIComponent(entryType, uiType));
        this.shopUIAnchorComponentStore.add(entityId, new ShopUIAnchorComponent(uiAnchor, offsetX, offsetY));
        this.shopButtonComponentStore.add(entityId, new ShopButtonComponent(shopTabType, buttonState));
        this.parentEntityComponentStore.add(entityId, new ParentEntityComponent(parentEntityId))

        const screenPosition = this.uiManager.resolveScreenPosition(uiAnchor, offsetX, offsetY);

        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenPosition.x, screenPosition.y));
        this.bitmapTextComponentStore.add(entityId, new BitmapTextComponent(text, DEFAULT_DIALOG_FONT_ID, DEFAULT_DIALOG_TEXT_SCALE, DEFAULT_SHOP_UI_TEXT_MAX_WIDTH, true, "center"));

        if (buttonState !== ShopButtonState.DISABLED) {
            this.clickableRegionComponent.add(entityId, new ClickableRegionComponent(screenPosition.x, screenPosition.y));
            this.regionClickedComponentStore.add(entityId, new RegionClickedComponent());
        }

        return entityId;
    }

    createStandaloneButton(
        entryType: ShopUIEntryType,
        uiType: ShopUIType,
        uiAnchor: UIAnchor,
        offsetX: number,
        offsetY: number,
        buttonType: ShopButtonType,
        shopTabType: ShopTabType | undefined,
        buttonState: ShopButtonState,
        spriteSheetName: SpriteSheetName,
        text: string,
    ) {
        const entityId = this.entityManager.registerEntity();
        const buttonConfig = SHOP_BUTTON_CONFIG[buttonType];
        const visualState = buttonConfig.states[buttonState];

        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.spriteComponentStore.add(entityId, new SpriteComponent(visualState.spriteName, spriteSheetName, buttonConfig.width, buttonConfig.height));
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(2));
        this.shopUIComponentStore.add(entityId, new ShopUIComponent(entryType, uiType));
        this.shopUIAnchorComponentStore.add(entityId, new ShopUIAnchorComponent(uiAnchor, offsetX, offsetY));
        this.shopButtonComponentStore.add(entityId, new ShopButtonComponent(shopTabType, buttonState));

        const screenPosition = this.uiManager.resolveScreenPosition(uiAnchor, offsetX, offsetY);

        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenPosition.x, screenPosition.y));
        this.bitmapTextComponentStore.add(entityId, new BitmapTextComponent(text, DEFAULT_DIALOG_FONT_ID, DEFAULT_DIALOG_TEXT_SCALE, DEFAULT_SHOP_UI_TEXT_MAX_WIDTH, true, "center"));

        if (buttonState !== ShopButtonState.DISABLED) {
            this.clickableRegionComponent.add(entityId, new ClickableRegionComponent(screenPosition.x, screenPosition.y));
            this.regionClickedComponentStore.add(entityId, new RegionClickedComponent());
        }

        return entityId;
    }

    createTabButton(
        tabType: ShopTabType,
        text: string,
        entryType: ShopUIEntryType,
        uiType: ShopUIType,
        uiAnchor: UIAnchor,
        offsetX: number,
        offsetY: number,
        buttonState: ShopButtonState,
        spriteSheetName: SpriteSheetName,
    ) {
        const entityId = this.entityManager.registerEntity();
        const buttonConfig = SHOP_BUTTON_CONFIG[ShopButtonType.TAB];
        const visualState = buttonConfig.states[buttonState];

        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.spriteComponentStore.add(entityId, new SpriteComponent(visualState.spriteName, spriteSheetName, buttonConfig.width, buttonConfig.height));
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(2));
        this.shopUIComponentStore.add(entityId, new ShopUIComponent(entryType, uiType));
        this.shopUIAnchorComponentStore.add(entityId, new ShopUIAnchorComponent(uiAnchor, offsetX, offsetY));
        this.shopButtonComponentStore.add(entityId, new ShopButtonComponent(tabType, buttonState));
        this.shopTabButtonComponentStore.add(entityId, new ShopTabButtonComponent(tabType));

        const screenPosition = this.uiManager.resolveScreenPosition(uiAnchor, offsetX, offsetY);

        this.bitmapTextComponentStore.add(entityId, new BitmapTextComponent(text, DEFAULT_DIALOG_FONT_ID, DEFAULT_DIALOG_TEXT_SCALE, DEFAULT_SHOP_UI_TEXT_MAX_WIDTH, true, "center"));
        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenPosition.x, screenPosition.y));

        if (buttonState !== ShopButtonState.DISABLED) {
            this.clickableRegionComponent.add(entityId, new ClickableRegionComponent(screenPosition.x, screenPosition.y));
            this.regionClickedComponentStore.add(entityId, new RegionClickedComponent());
        }

        return entityId;
    }

    createUpgradeTabButton(tabType: ShopUpgradeTabType,
        entryType: ShopUIEntryType,
        uiType: ShopUIType,
        uiAnchor: UIAnchor,
        offsetX: number,
        offsetY: number,
        buttonState: ShopButtonState,
        spriteSheetName: SpriteSheetName,
        innerSprite: SpriteName,
    ) {
        const entityId = this.entityManager.registerEntity();
        const buttonConfig = SHOP_BUTTON_CONFIG[ShopButtonType.UPGRADE_TAB];
        const visualState = buttonConfig.states[buttonState];

        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.spriteComponentStore.add(entityId, new SpriteComponent(visualState.spriteName, spriteSheetName, buttonConfig.width, buttonConfig.height));
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(2));
        this.shopUIComponentStore.add(entityId, new ShopUIComponent(entryType, uiType));
        this.shopUIAnchorComponentStore.add(entityId, new ShopUIAnchorComponent(uiAnchor, offsetX, offsetY));
        this.shopButtonComponentStore.add(entityId, new ShopButtonComponent(undefined, buttonState));
        this.shopUpgradeTabButtonComponentStore.add(entityId, new ShopUpgradeTabButtonComponent(tabType));

        const screenPosition = this.uiManager.resolveScreenPosition(uiAnchor, offsetX, offsetY);
        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenPosition.x, screenPosition.y));

        if (buttonState !== ShopButtonState.DISABLED) {
            this.clickableRegionComponent.add(entityId, new ClickableRegionComponent(screenPosition.x, screenPosition.y));
            this.regionClickedComponentStore.add(entityId, new RegionClickedComponent());
        }
        this.createTabInnerContent(entityId, uiAnchor, offsetX, offsetY, innerSprite);
        return entityId;
    }

    createTabInnerContent(parentEntityId: number, uiAnchor: UIAnchor, offsetX: number, offsetY: number, innerSprite: SpriteName) {
        const entityId = this.entityManager.registerEntity();
        const innerSprite_offsetX = 16;
        const innerSprite_offsetY = 4;
        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.parentEntityComponentStore.add(entityId, new ParentEntityComponent(parentEntityId));
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
        this.spriteComponentStore.add(entityId, new SpriteComponent(innerSprite, SpriteSheetName.WEAPON, 36, 20)); // can config the sprite size here after
        const screenPosition = this.uiManager.resolveScreenPosition(uiAnchor, offsetX - innerSprite_offsetX, offsetY + innerSprite_offsetY);
        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenPosition.x, screenPosition.y));

    }

    createUpgradeItem(
        upgradeType: WeaponUpgradeType,
        upgradeTabType: ShopUpgradeTabType,
        upgradeName: string,
        upgradeInfo: string,
        buttonText: string,
        buttonState: ShopButtonState,
        uiAnchor: UIAnchor,
        offsetX: number,
        offsetY: number,
    ) {
        const entityId = this.entityManager.registerEntity();
        const screenPosition = this.uiManager.resolveScreenPosition(uiAnchor, offsetX, offsetY);
        this.upgradeShopItemComponentStore.add(entityId, new UpgradeShopItemComponent(upgradeType, upgradeTabType));
        this.createAssociatedText(entityId, upgradeName, screenPosition.x, screenPosition.y);
        const textInfo_offsetX = 96;
        this.createAssociatedText(entityId, upgradeInfo, screenPosition.x + textInfo_offsetX, screenPosition.y);
        const button_offsetX = 224;

        const preset = SHOP_UI_TYPE_LAYOUT_PRESET;
        const buttonSpacingX = 96 * 2 + 12;
        const buttonSpacingY = 10;
        const buttonOffsetX = offsetX - buttonSpacingX;
        const buttonOffsetY = offsetY - buttonSpacingY;

        this.createAssociatedButton(
            entityId,
            ShopUIEntryType.BUTTON,
            ShopUIType.BUY_BUTTON,
            preset.buy_button.anchor,
            buttonOffsetX,
            buttonOffsetY,
            ShopButtonType.BUY,
            ShopTabType.UPGRADES,
            buttonState,
            SpriteSheetName.BUTTONS,
            buttonText,
        );
    }

    createAssociatedText(parentEntityId: number, text: string, screenX: number, screenY: number) {
        const entityId = this.entityManager.registerEntity();
        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(2));
        const textSize = getBitmapTextSize(text, DEFAULT_DIALOG_FONT_ID, DEFAULT_DIALOG_TEXT_SCALE);
        this.parentEntityComponentStore.add(entityId, new ParentEntityComponent(parentEntityId));
        this.bitmapTextComponentStore.add(entityId, new BitmapTextComponent(text, DEFAULT_DIALOG_FONT_ID, DEFAULT_DIALOG_TEXT_SCALE, textSize.width, true, "left"));
        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenX, screenY));

        return entityId;
    }

    createStandaloneText(text: string, screenX: number, screenY: number) {
        const entityId = this.entityManager.registerEntity();
        this.renderableComponentStore.add(entityId, new RenderableComponent());
        this.zLayerComponentStore.add(entityId, new ZLayerComponent(2));
        const textSize = getBitmapTextSize(text, DEFAULT_DIALOG_FONT_ID, DEFAULT_DIALOG_TEXT_SCALE);
        this.bitmapTextComponentStore.add(entityId, new BitmapTextComponent(text, DEFAULT_DIALOG_FONT_ID, DEFAULT_DIALOG_TEXT_SCALE, textSize.width, true, "left"));
        this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenX, screenY));

        return entityId;
    }

    destroyBackground(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        this.spriteComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
        this.shopUIComponentStore.remove(entityId);
        this.shopUIAnchorComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);
    }

    destroyShopItem(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        if (this.weaponShopItemComponentStore.has(entityId)) {
            this.weaponShopItemComponentStore.remove(entityId);
        }
        if (this.resourceShopItemComponentStore.has(entityId)) {
            this.resourceShopItemComponentStore.remove(entityId);
        }
        this.spriteComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
        this.shopUIComponentStore.remove(entityId);
        this.shopUIAnchorComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);
    }

    destroyAssociatedButton(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        this.spriteComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
        this.shopUIComponentStore.remove(entityId);
        this.shopUIAnchorComponentStore.remove(entityId);
        this.shopButtonComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);
        this.bitmapTextComponentStore.remove(entityId);
        this.parentEntityComponentStore.remove(entityId);
        if (this.clickableRegionComponent.has(entityId)) {
            this.clickableRegionComponent.remove(entityId);
        }

        if (this.regionClickedComponentStore.has(entityId)) {
            this.regionClickedComponentStore.remove(entityId);
        }
    }

    destroyStandaloneButton(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        this.spriteComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
        this.shopUIComponentStore.remove(entityId);
        this.shopUIAnchorComponentStore.remove(entityId);
        this.shopButtonComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);
        this.bitmapTextComponentStore.remove(entityId);
        if (this.clickableRegionComponent.has(entityId)) {
            this.clickableRegionComponent.remove(entityId);
        }

        if (this.regionClickedComponentStore.has(entityId)) {
            this.regionClickedComponentStore.remove(entityId);
        }
    }

    destroyTabButton(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        this.spriteComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
        this.shopUIComponentStore.remove(entityId);
        this.shopUIAnchorComponentStore.remove(entityId);
        this.shopButtonComponentStore.remove(entityId);
        this.shopTabButtonComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);
        this.bitmapTextComponentStore.remove(entityId);

        if (this.clickableRegionComponent.has(entityId)) {
            this.clickableRegionComponent.remove(entityId);
        }

        if (this.regionClickedComponentStore.has(entityId)) {
            this.regionClickedComponentStore.remove(entityId);
        }
    }

    destroyUpgradeTabButton(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        this.spriteComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
        this.shopUIComponentStore.remove(entityId);
        this.shopUIAnchorComponentStore.remove(entityId);
        this.shopButtonComponentStore.remove(entityId);
        this.shopUpgradeTabButtonComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);

        if (this.clickableRegionComponent.has(entityId)) {
            this.clickableRegionComponent.remove(entityId);
        }

        if (this.regionClickedComponentStore.has(entityId)) {
            this.regionClickedComponentStore.remove(entityId);
        }
    }

    destroyTabInnerContent(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        this.parentEntityComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
        this.spriteComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);
    }

    destroyAssociatedText(entityId: number): void {
        this.renderableComponentStore.remove(entityId);
        this.zLayerComponentStore.remove(entityId);
        this.parentEntityComponentStore.remove(entityId);
        this.bitmapTextComponentStore.remove(entityId);
        this.screenPositionComponentStore.remove(entityId);
    }

    destroyUpgradeItem(entityId: number): void {
        this.upgradeShopItemComponentStore.remove(entityId);
    }

    destroyUpgradeTabButtonAndAssociates(upgradeTabButtonEntityId: number): void {
        for (const entity of this.parentEntityComponentStore.getAllEntities()) {
            if (this.parentEntityComponentStore.get(entity).parentEntityId !== upgradeTabButtonEntityId) {
                continue;
            }

            if (this.shopButtonComponentStore.has(entity)) {
                this.destroyAssociatedButton(entity);
                continue;
            }

            if (this.bitmapTextComponentStore.has(entity)) {
                this.destroyAssociatedText(entity);
                continue;
            }

            if (this.spriteComponentStore.has(entity)) {
                this.destroyTabInnerContent(entity);
            }
        }

        this.destroyUpgradeTabButton(upgradeTabButtonEntityId);
    }

    destroyShopItemAndAssociates(shopItemEntityId: number): void {
        for (const entity of this.parentEntityComponentStore.getAllEntities()) {
            if (this.parentEntityComponentStore.get(entity).parentEntityId === shopItemEntityId) {
                if (this.shopButtonComponentStore.has(entity)) {
                    this.destroyAssociatedButton(entity);
                    continue;
                }
                if (this.bitmapTextComponentStore.has(entity)) {
                    this.destroyAssociatedText(entity);
                }
            }
        }

        this.destroyShopItem(shopItemEntityId);
    }

    destroyUpgradeItemAndAssociates(upgradeItemEntityId: number): void {
        for (const entity of this.parentEntityComponentStore.getAllEntities()) {
            if (this.parentEntityComponentStore.get(entity).parentEntityId === upgradeItemEntityId) {
                if (this.shopButtonComponentStore.has(entity)) {
                    this.destroyAssociatedButton(entity);
                    continue;
                }
                if (this.bitmapTextComponentStore.has(entity)) {
                    this.destroyAssociatedText(entity);
                    continue;
                }
            }
        }

        this.destroyUpgradeItem(upgradeItemEntityId);
    }
}
