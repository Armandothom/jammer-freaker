import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { HealthComponent } from "../components/health.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { PlayerInitialProperties } from "../components/types/player-properties.js";
import { UI_TYPE_LAYOUT_PRESET } from "../components/types/ui-type-layout-preset.js";
import { UIEntryType, UIType } from "../components/types/ui-type.js";
import { WeaponType } from "../components/types/weapon-type.js";
import { UIComponent } from "../components/ui-component.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { SPRITESHEET_MAPPED_VALUES } from "../../game/asset-manager/consts/sprite-mapped-values.js";
import { ISystem } from "./system.interface.js";

const HEALTH_BAR_RENDER_WIDTH = 192;
const HEALTH_BAR_RENDER_HEIGHT = 32;
const HEALTH_BAR_FILL_SOURCE_WIDTH = 288;
const ACTION_BAR_WEAPON_SLOT_SPACING = 40;
const HIDDEN_UI_SIZE = 0;
const KEYBIND_HINT_RENDER_WIDTH = 32;
const KEYBIND_HINT_RENDER_HEIGHT = 32;
const SECONDARY_WEAPON_ORDER: WeaponType[] = [
    WeaponType.SMG,
    WeaponType.RIFLE,
    WeaponType.SNIPER,
];

export class UIUpdateSystem implements ISystem {
    private isHUDBuilded = false;
    private secondaryWeaponStateKey = "";
    constructor(
        private entityFactory: EntityFactory,
        private inventoryManager: InventoryManager,
        private playerInitialProperties: PlayerInitialProperties,
        private uiComponentStore: ComponentStore<UIComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
    ) {

    }
    update(deltaTime: number): void {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        const inventory = this.inventoryComponentStore.get(playerEntity);
        const playerActualHp = this.healthComponentStore.get(playerEntity);

        if (this.isHUDBuilded === false) {
            this.createHUD(inventory, playerActualHp);
        } else {
            this.updateHUD();
        }
    }

    private createHUD(inventory: InventoryComponent, playerActualHp: HealthComponent) {
        const preset = UI_TYPE_LAYOUT_PRESET;
        const healthBarWidth = 192;
        const healthBarHeight = 32;
        const equippedWeaponType = inventory.equippedWeaponType;
        const playerTotalHp = this.playerInitialProperties.hp;
        if (equippedWeaponType === null) return;
        const weaponSprite = this.resolveWeaponSprite(equippedWeaponType);
        const bulletsInMag = this.inventoryManager.getRoundsInMag(inventory, equippedWeaponType);
        const magUsed = this.inventoryManager.getAmmoResourceTypeForWeapon(equippedWeaponType);
        const magsAvaliable = this.inventoryManager.getResourceAmount(inventory, magUsed);
        const magSprite = this.resolveInventoryResourceSprite(magUsed);
        const actualMoney = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Money);

        this.entityFactory.createHUDItem(
            UIEntryType.HUD,
            UIType.HEALTH_BAR,
            preset.health_bar.anchor,
            preset.health_bar.offsetX,
            preset.health_bar.offsetY,
            SpriteName.HEALTH_BAR_EMPTY,
            SpriteSheetName.HEALTH_BAR,
            healthBarWidth,
            healthBarHeight,
        );
        this.entityFactory.createHUDItem(
            UIEntryType.HUD,
            UIType.HEALTH_BAR,
            preset.health_bar.anchor,
            preset.health_bar.offsetX,
            preset.health_bar.offsetY,
            SpriteName.HEALTH_BAR_FILL,
            SpriteSheetName.HEALTH_BAR,
            healthBarWidth,
            healthBarHeight,
        );
        this.entityFactory.createHUDItemText(
            UIEntryType.HUD,
            UIType.HEALTH_BAR_TEXT,
            preset.health_bar_text.anchor,
            preset.health_bar_text.offsetX,
            preset.health_bar_text.offsetY,
            `${playerActualHp.hp}/${playerTotalHp}`,
            healthBarWidth,
        );
        this.entityFactory.createHUDItem(
            UIEntryType.HUD,
            UIType.WEAPON_ICON,
            preset.weapon_icon.anchor,
            preset.weapon_icon.offsetX,
            preset.weapon_icon.offsetY,
            weaponSprite,
            SpriteSheetName.WEAPON,
            36,
            20,
        );
        this.entityFactory.createHUDItemText(
            UIEntryType.HUD,
            UIType.BULLET_QUANTITY,
            preset.bullet_quantity.anchor,
            preset.bullet_quantity.offsetX,
            preset.bullet_quantity.offsetY,
            `${bulletsInMag}`,
        );
        this.entityFactory.createHUDItem(
            UIEntryType.HUD,
            UIType.BULLET_ICON,
            preset.bullet_icon.anchor,
            preset.bullet_icon.offsetX,
            preset.bullet_icon.offsetY,
            SpriteName.BULLET_ICON,
            SpriteSheetName.RESOURCES_ICON,
            7,
            16,
        );
        this.entityFactory.createHUDItemText(
            UIEntryType.HUD,
            UIType.MAG_QUANTITY,
            preset.mag_quantity.anchor,
            preset.mag_quantity.offsetX,
            preset.mag_quantity.offsetY,
            `${magsAvaliable}`,
        );
        this.entityFactory.createHUDItem(
            UIEntryType.HUD,
            UIType.MAG_ICON,
            preset.mag_icon.anchor,
            preset.mag_icon.offsetX,
            preset.mag_icon.offsetY,
            magSprite,
            SpriteSheetName.RESOURCES_ICON,
            12,
            20,
        );
        this.entityFactory.createHUDItemText(
            UIEntryType.HUD,
            UIType.MONEY,
            preset.money.anchor,
            preset.money.offsetX,
            preset.money.offsetY,
            `$${actualMoney}`,
        );
        this.entityFactory.createKeybindHint(
            UIEntryType.ACTION_BAR,
            UIType.WEAPON_KEYBIND_1,
            preset.weapon_keybind_1.anchor,
            preset.weapon_keybind_1.offsetX,
            preset.weapon_keybind_1.offsetY,
            "1",
        );
        this.entityFactory.createHUDItem(
            UIEntryType.ACTION_BAR,
            UIType.WEAPON_SLOT_1,
            preset.weapon_slot_1.anchor,
            preset.weapon_slot_1.offsetX,
            preset.weapon_slot_1.offsetY,
            SpriteName.PISTOL,
            SpriteSheetName.WEAPON,
            36,
            20,
        )
        this.createSecondaryWeaponActionBarSlot(UIType.WEAPON_KEYBIND_2, UIType.WEAPON_SLOT_2, 1);
        this.createSecondaryWeaponActionBarSlot(UIType.WEAPON_KEYBIND_3, UIType.WEAPON_SLOT_3, 2);
        this.createSecondaryWeaponActionBarSlot(UIType.WEAPON_KEYBIND_4, UIType.WEAPON_SLOT_4, 3);
        this.entityFactory.createKeybindHint(
            UIEntryType.ACTION_BAR,
            UIType.GRENADE_KEYBIND,
            preset.grenade_slot_keybind.anchor,
            preset.grenade_slot_keybind.offsetX,
            preset.grenade_slot_keybind.offsetY,
            "G",
        );
        this.entityFactory.createHUDItem(
            UIEntryType.ACTION_BAR,
            UIType.GRENADE_SLOT,
            preset.grenade_slot.anchor,
            preset.grenade_slot.offsetX,
            preset.grenade_slot.offsetY,
            SpriteName.GRENADE_1,
            SpriteSheetName.PROJECTILE,
        );
        this.entityFactory.createKeybindHint(
            UIEntryType.ACTION_BAR,
            UIType.KNIFE_KEYBIND,
            preset.knife_slot_keybind.anchor,
            preset.knife_slot_keybind.offsetX,
            preset.knife_slot_keybind.offsetY,
            "F",
        );
        this.entityFactory.createHUDItem(
            UIEntryType.ACTION_BAR,
            UIType.KNIFE_SLOT,
            preset.knife_slot.anchor,
            preset.knife_slot.offsetX,
            preset.knife_slot.offsetY,
            SpriteName.KNIFE,
            SpriteSheetName.WEAPON,
            24,
            14,
        )
        this.secondaryWeaponStateKey = this.buildSecondaryWeaponStateKey(inventory);
        this.syncSecondaryWeaponActionBar(inventory);

        this.isHUDBuilded = true
    }

    private updateHUD() {

        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        const inventory = this.inventoryComponentStore.get(playerEntity);

        for (const uiItemEntity of this.uiComponentStore.getAllEntities()) {
            const uiType = this.uiComponentStore.get(uiItemEntity).uiType;
            this.uiHandlers[uiType](uiItemEntity, playerEntity);
        }

        this.syncSecondaryWeaponActionBarIfNeeded(inventory);
    }

    private resolveWeaponSprite(weaponType: WeaponType): SpriteName {
        switch (weaponType) {
            case WeaponType.PISTOL:
                return SpriteName.PISTOL;

            case WeaponType.SMG:
                return SpriteName.SMG;

            case WeaponType.RIFLE:
                return SpriteName.RIFLE;

            case WeaponType.SNIPER:
                return SpriteName.SNIPER;

            case WeaponType.KNIFE:
                return SpriteName.KNIFE;

            case WeaponType.SHIELD:
                return SpriteName.SHIELD;

            case WeaponType.GRENADE:
                throw new Error("WeaponType.GRENADE não possui sprite mapeado em WEAPON spritesheet.");

            default: {
                const exhaustiveCheck: never = weaponType;
                throw new Error(`WeaponType não suportado em resolveWeaponSprite: ${exhaustiveCheck}`);
            }
        }
    }

    private resolveInventoryResourceSprite(resourceType: InventoryResourceType): SpriteName {
        switch (resourceType) {
            case InventoryResourceType.PistolMag:
                return SpriteName.PISTOL_MAG_ICON;

            case InventoryResourceType.SmgMag:
                return SpriteName.SMG_MAG_ICON;

            case InventoryResourceType.RifleMag:
                throw new Error("InventoryResourceType.RifleMag ainda não possui sprite mapeado em RESOURCES_ICON spritesheet.");

            case InventoryResourceType.Grenade:
                throw new Error("InventoryResourceType.Grenade ainda não possui sprite mapeado em RESOURCES_ICON spritesheet.");

            case InventoryResourceType.Money:
                throw new Error("InventoryResourceType.Money ainda não possui sprite mapeado em RESOURCES_ICON spritesheet.");

            default: {
                const exhaustiveCheck: never = resourceType;
                throw new Error(`InventoryResourceType não suportado em resolveInventoryResourceSprite: ${exhaustiveCheck}`);
            }
        }
    }

    private createSecondaryWeaponActionBarSlot(
        keybindUiType: UIType,
        slotUiType: UIType,
        spacingMultiplier: number,
    ) {
        const preset = UI_TYPE_LAYOUT_PRESET;
        const keybindPreset = preset[keybindUiType];
        const slotPreset = preset[slotUiType];
        const offsetX = ACTION_BAR_WEAPON_SLOT_SPACING * spacingMultiplier;

        this.entityFactory.createKeybindHint(
            UIEntryType.ACTION_BAR,
            keybindUiType,
            keybindPreset.anchor,
            keybindPreset.offsetX + offsetX,
            keybindPreset.offsetY,
            "",
        );
        this.entityFactory.createHUDItem(
            UIEntryType.ACTION_BAR,
            slotUiType,
            slotPreset.anchor,
            slotPreset.offsetX + offsetX,
            slotPreset.offsetY,
            SpriteName.BLANK,
            SpriteSheetName.BLANK,
            HIDDEN_UI_SIZE,
            HIDDEN_UI_SIZE,
        );
    }

    private syncSecondaryWeaponActionBar(inventory: InventoryComponent) {
        const ownedSecondaryWeapons = this.getOwnedSecondaryWeapons(inventory);
        const secondaryWeaponByUiType = new Map<UIType, WeaponType | null>([
            [UIType.WEAPON_KEYBIND_2, ownedSecondaryWeapons[0] ?? null],
            [UIType.WEAPON_SLOT_2, ownedSecondaryWeapons[0] ?? null],
            [UIType.WEAPON_KEYBIND_3, ownedSecondaryWeapons[1] ?? null],
            [UIType.WEAPON_SLOT_3, ownedSecondaryWeapons[1] ?? null],
            [UIType.WEAPON_KEYBIND_4, ownedSecondaryWeapons[2] ?? null],
            [UIType.WEAPON_SLOT_4, ownedSecondaryWeapons[2] ?? null],
        ]);

        for (const uiEntity of this.uiComponentStore.getAllEntities()) {
            const uiType = this.uiComponentStore.get(uiEntity).uiType;
            const weaponType = secondaryWeaponByUiType.get(uiType);

            if (weaponType === undefined) {
                continue;
            }

            if (
                uiType === UIType.WEAPON_KEYBIND_2 ||
                uiType === UIType.WEAPON_KEYBIND_3 ||
                uiType === UIType.WEAPON_KEYBIND_4
            ) {
                this.applySecondaryWeaponKeybindState(uiEntity, weaponType);
                continue;
            }

            this.applySecondaryWeaponSlotState(uiEntity, weaponType);
        }
    }

    private syncSecondaryWeaponActionBarIfNeeded(inventory: InventoryComponent) {
        const nextStateKey = this.buildSecondaryWeaponStateKey(inventory);

        if (nextStateKey === this.secondaryWeaponStateKey) {
            return;
        }

        this.secondaryWeaponStateKey = nextStateKey;
        this.syncSecondaryWeaponActionBar(inventory);
    }

    private buildSecondaryWeaponStateKey(inventory: InventoryComponent): string {
        const smgOwned = this.inventoryManager.getWeaponState(inventory, WeaponType.SMG)?.owned ? "1" : "0";
        const rifleOwned = this.inventoryManager.getWeaponState(inventory, WeaponType.RIFLE)?.owned ? "1" : "0";
        const sniperOwned = this.inventoryManager.getWeaponState(inventory, WeaponType.SNIPER)?.owned ? "1" : "0";

        return `${smgOwned}${rifleOwned}${sniperOwned}`;
    }

    private getOwnedSecondaryWeapons(inventory: InventoryComponent): WeaponType[] {
        return SECONDARY_WEAPON_ORDER.filter((weaponType) =>
            this.inventoryManager.getWeaponState(inventory, weaponType)?.owned,
        );
    }

    private applySecondaryWeaponKeybindState(uiEntity: number, weaponType: WeaponType | null) {
        const sprite = this.spriteComponentStore.getOrNull(uiEntity);
        if (sprite) {
            if (weaponType === null) {
                sprite.spriteName = SpriteName.BLANK;
                sprite.spriteSheetName = SpriteSheetName.BLANK;
                sprite.width = HIDDEN_UI_SIZE;
                sprite.height = HIDDEN_UI_SIZE;
            } else {
                sprite.spriteName = SpriteName.KEYBOARD_KEY;
                sprite.spriteSheetName = SpriteSheetName.KEYBOARD_KEY;
                sprite.width = KEYBIND_HINT_RENDER_WIDTH;
                sprite.height = KEYBIND_HINT_RENDER_HEIGHT;
            }
        }

        const bitmapText = this.bitmapTextComponentStore.getOrNull(uiEntity);
        if (bitmapText) {
            bitmapText.text = weaponType === null
                ? ""
                : this.resolveWeaponKeybindLabel(weaponType);
        }
    }

    private applySecondaryWeaponSlotState(uiEntity: number, weaponType: WeaponType | null) {
        const sprite = this.spriteComponentStore.getOrNull(uiEntity);
        if (!sprite) {
            return;
        }

        if (weaponType === null) {
            sprite.spriteName = SpriteName.BLANK;
            sprite.spriteSheetName = SpriteSheetName.BLANK;
            sprite.width = HIDDEN_UI_SIZE;
            sprite.height = HIDDEN_UI_SIZE;
            return;
        }

        const weaponSprite = this.resolveWeaponSprite(weaponType);
        const renderSize = this.resolveActionBarWeaponRenderSize(weaponType);

        sprite.spriteName = weaponSprite;
        sprite.spriteSheetName = SpriteSheetName.WEAPON;
        sprite.width = renderSize.width;
        sprite.height = renderSize.height;
    }

    private resolveWeaponKeybindLabel(weaponType: WeaponType): string {
        switch (weaponType) {
            case WeaponType.PISTOL:
                return "1";

            case WeaponType.SMG:
                return "2";

            case WeaponType.RIFLE:
                return "3";

            case WeaponType.SNIPER:
                return "4";

            default:
                throw new Error(`WeaponType sem keybind suportado na action bar: ${weaponType}`);
        }
    }

    private resolveActionBarWeaponRenderSize(weaponType: WeaponType): { width: number, height: number } {
        const weaponSprite = this.resolveWeaponSprite(weaponType);
        const weaponSpriteSheet = SPRITESHEET_MAPPED_VALUES.get(SpriteSheetName.WEAPON);
        const spriteMappedValue = weaponSpriteSheet?.sprites.get(weaponSprite);

        if (!spriteMappedValue) {
            throw new Error(`Sprite nÃ£o encontrado para action bar: ${weaponSprite}`);
        }

        return {
            width: spriteMappedValue.originalRenderSpriteWidth,
            height: spriteMappedValue.originalRenderSpriteHeight,
        };
    }

    private uiHandlers: Record<UIType, (uiEntity: number, playerEntity: number) => void> = {
        [UIType.HEALTH_BAR]: (uiEntity: number, playerEntity: number) => {
            const sprite = this.spriteComponentStore.getOrNull(uiEntity);
            if (!sprite) {
                return;
            }

            if (sprite.spriteName === SpriteName.HEALTH_BAR_EMPTY) {
                sprite.width = HEALTH_BAR_RENDER_WIDTH;
                sprite.height = HEALTH_BAR_RENDER_HEIGHT;
                return;
            }

            if (sprite.spriteName !== SpriteName.HEALTH_BAR_FILL) {
                return;
            }

            const health = this.healthComponentStore.get(playerEntity);
            const maxHp = Math.max(health.maxHp, 1);
            const lifePercent = Math.max(0, Math.min(health.hp / maxHp, 1));
            const healthBarSheet = SPRITESHEET_MAPPED_VALUES.get(SpriteSheetName.HEALTH_BAR);
            const fillSprite = healthBarSheet?.sprites.get(SpriteName.HEALTH_BAR_FILL);

            sprite.width = HEALTH_BAR_RENDER_WIDTH * lifePercent;
            sprite.height = HEALTH_BAR_RENDER_HEIGHT;

            if (!fillSprite) {
                return;
            }

            fillSprite.spriteCellOffset.width = HEALTH_BAR_FILL_SOURCE_WIDTH * lifePercent;
        },
        [UIType.HEALTH_BAR_TEXT]: (uiEntity: number, playerEntity: number) => {
            const playerActualHp = this.healthComponentStore.get(playerEntity);
            const playerTotalHp = this.playerInitialProperties.hp;
            this.bitmapTextComponentStore.get(uiEntity).text = `${playerActualHp.hp}/${playerTotalHp}`;
        },
        [UIType.WEAPON_ICON]: (uiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const equippedWeaponType = inventory.equippedWeaponType;
            if (equippedWeaponType === null) return;
            const newSpriteName = this.resolveWeaponSprite(equippedWeaponType);
            this.spriteComponentStore.get(uiEntity).spriteName = newSpriteName;
            // Spritesheet is the same (Weapon);
        },
        [UIType.BULLET_QUANTITY]: (uiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const equippedWeaponType = inventory.equippedWeaponType;
            if (equippedWeaponType === null) return;
            const roundsInMag = this.inventoryManager.getRoundsInMag(inventory, equippedWeaponType)
            this.bitmapTextComponentStore.get(uiEntity).text = `${roundsInMag}`;
        },
        [UIType.BULLET_ICON]: (uiEntity: number, playerEntity: number) => {
            // No update
        },
        [UIType.MAG_ICON]: (uiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const equippedWeaponType = inventory.equippedWeaponType;
            if (equippedWeaponType === null) return;
            const magUsed = this.inventoryManager.getAmmoResourceTypeForWeapon(equippedWeaponType);
            const newSpriteName = this.resolveInventoryResourceSprite(magUsed);
            this.spriteComponentStore.get(uiEntity).spriteName = newSpriteName;
            // Spritesheet is the same (Resources);
        },
        [UIType.MAG_QUANTITY]: (uiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const equippedWeaponType = inventory.equippedWeaponType;
            if (equippedWeaponType === null) return;
            const magUsed = this.inventoryManager.getAmmoResourceTypeForWeapon(equippedWeaponType);
            const magsAvaliable = this.inventoryManager.getResourceAmount(inventory, magUsed);
            this.bitmapTextComponentStore.get(uiEntity).text = `${magsAvaliable}`;
        },
        [UIType.MONEY]: (uiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const money = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Money);
            const moneyFormated = this.formatMoney(money);
            this.bitmapTextComponentStore.get(uiEntity).text = `$${moneyFormated}`
        },
        [UIType.HOSTAGES]: (uiEntity: number, playerEntity: number) => {
            //to be implemented
        },
        [UIType.WEAPON_KEYBIND_1]: (uiEntity: number, playerEntity: number) => {
            // No update -- always pistol
        },
        [UIType.WEAPON_KEYBIND_2]: (uiEntity: number, playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [UIType.WEAPON_KEYBIND_3]: (uiEntity: number, playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [UIType.WEAPON_KEYBIND_4]: (uiEntity: number, playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [UIType.GRENADE_KEYBIND]: (uiEntity: number, playerEntity: number) => {
            // No update
        },
        [UIType.KNIFE_KEYBIND]: (uiEntity: number, playerEntity: number) => {
            // No update
        },
        [UIType.WEAPON_SLOT_1]: (uiEntity: number, playerEntity: number) => {
            // No update -- always pistol
        },
        [UIType.WEAPON_SLOT_2]: (uiEntity: number, playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [UIType.WEAPON_SLOT_3]: (uiEntity: number, playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [UIType.WEAPON_SLOT_4]: (uiEntity: number, playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [UIType.GRENADE_SLOT]: (uiEntity: number, playerEntity: number) => {
            // No update
        },
        [UIType.KNIFE_SLOT]: (uiEntity: number, playerEntity: number) => {
            // No update
        },
        [UIType.FLOATING_TEXT]: (uiEntity: number, playerEntity: number) => { },
    };

    private formatMoney(value: number): string {
        return new Intl.NumberFormat('en-US').format(value);
    }
}
