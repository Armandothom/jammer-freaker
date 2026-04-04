import { SPRITESHEET_MAPPED_VALUES } from "../../game/asset-manager/consts/sprite-mapped-values.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { HealthComponent } from "../components/health.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { PlayerInitialProperties } from "../components/types/player-properties.js";
import { GAME_UI_TYPE_LAYOUT_PRESET } from "../components/types/game-ui-type-layout-preset.js";
import { GameUIEntryType, GameUIType } from "../components/types/game-ui-type.js";
import { WeaponType } from "../components/types/weapon-type.js";
import { GameUIComponent } from "../components/game-ui-component.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

const HEALTH_BAR_RENDER_WIDTH = 192;
const HEALTH_BAR_RENDER_HEIGHT = 24;
const HEALTH_BAR_FILL_SOURCE_WIDTH = 288;
const ACTION_BAR_WEAPON_SLOT_SPACING = 40;
const HIDDEN_GAME_UI_SIZE = 0;
const KEYBIND_HINT_RENDER_WIDTH = 32;
const KEYBIND_HINT_RENDER_HEIGHT = 32;
const SECONDARY_WEAPON_ORDER: WeaponType[] = [
    WeaponType.SMG,
    WeaponType.RIFLE,
    WeaponType.SNIPER,
];

export class GameUIUpdateSystem implements ISystem {
    private isHUDBuilded = false;
    private secondaryWeaponStateKey = "";
    constructor(
        private entityFactory: EntityFactory,
        private inventoryManager: InventoryManager,
        private playerInitialProperties: PlayerInitialProperties,
        private gameUiComponentStore: ComponentStore<GameUIComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
        private screenPositionComponentStore: ComponentStore<ScreenPositionComponent>,
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
        const preset = GAME_UI_TYPE_LAYOUT_PRESET;
        const healthBarWidth = 192;
        const healthBarHeight = 32;
        const equippedWeaponType = inventory.equippedWeaponType;
        const playerTotalHp = this.playerInitialProperties.hp;
        if (equippedWeaponType === null) return;
        const weaponSprite = this.resolveWeaponSprite(equippedWeaponType);
        const bulletsInMag = this.inventoryManager.getRoundsInMag(inventory, equippedWeaponType);
        const magUsed = this.inventoryManager.getAmmoResourceTypeForWeapon(equippedWeaponType);
        const magsAvaliable = this.inventoryManager.getResourceAmount(inventory, magUsed);
        const grenadeAvaliable = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Grenade);
        const magSprite = this.resolveInventoryResourceSprite(magUsed);
        const actualMoney = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Money);

        this.entityFactory.createHUDItem(
            GameUIEntryType.HUD,
            GameUIType.HEALTH_BAR,
            preset.health_bar.anchor,
            preset.health_bar.offsetX,
            preset.health_bar.offsetY,
            SpriteName.HEALTH_BAR_EMPTY,
            SpriteSheetName.HEALTH_BAR,
            healthBarWidth,
            healthBarHeight,
        );
        this.entityFactory.createHUDItem(
            GameUIEntryType.HUD,
            GameUIType.HEALTH_BAR,
            preset.health_bar.anchor,
            preset.health_bar.offsetX,
            preset.health_bar.offsetY,
            SpriteName.HEALTH_BAR_FILL,
            SpriteSheetName.HEALTH_BAR,
            healthBarWidth,
            healthBarHeight,
        );
        this.entityFactory.createHUDItemText(
            GameUIEntryType.HUD,
            GameUIType.HEALTH_BAR_TEXT,
            preset.health_bar_text.anchor,
            preset.health_bar_text.offsetX,
            preset.health_bar_text.offsetY,
            `${playerActualHp.hp}/${playerTotalHp}`,
            healthBarWidth,
        );
        this.entityFactory.createHUDItem(
            GameUIEntryType.HUD,
            GameUIType.WEAPON_FRAME,
            preset.weapon_frame.anchor,
            preset.weapon_frame.offsetX,
            preset.weapon_frame.offsetY,
            SpriteName.WEAPON_FRAME,
            SpriteSheetName.WEAPON_FRAME,
            48,
            48,
        );
        this.entityFactory.createHUDItem(
            GameUIEntryType.HUD,
            GameUIType.WEAPON_ICON,
            preset.weapon_icon.anchor,
            preset.weapon_icon.offsetX,
            preset.weapon_icon.offsetY,
            weaponSprite,
            SpriteSheetName.WEAPON,
            36,
            20,
        );
        this.entityFactory.createHUDItemText(
            GameUIEntryType.HUD,
            GameUIType.BULLET_QUANTITY,
            preset.bullet_quantity.anchor,
            preset.bullet_quantity.offsetX,
            preset.bullet_quantity.offsetY,
            `${bulletsInMag}`,
        );
        this.entityFactory.createHUDItem(
            GameUIEntryType.HUD,
            GameUIType.BULLET_ICON,
            preset.bullet_icon.anchor,
            preset.bullet_icon.offsetX,
            preset.bullet_icon.offsetY,
            SpriteName.BULLET_ICON,
            SpriteSheetName.RESOURCES_ICON,
            8,
            16,
        );
        this.entityFactory.createHUDItemText(
            GameUIEntryType.HUD,
            GameUIType.MAG_QUANTITY,
            preset.mag_quantity.anchor,
            preset.mag_quantity.offsetX,
            preset.mag_quantity.offsetY,
            `${magsAvaliable}`,
        );
        this.entityFactory.createHUDItem(
            GameUIEntryType.HUD,
            GameUIType.MAG_ICON,
            preset.mag_icon.anchor,
            preset.mag_icon.offsetX,
            preset.mag_icon.offsetY,
            magSprite,
            SpriteSheetName.RESOURCES_ICON,
            12,
            20,
        );
        this.entityFactory.createHUDItemText(
            GameUIEntryType.HUD,
            GameUIType.GRENADE_QUANTITY,
            preset.grenade_quantity.anchor,
            preset.grenade_quantity.offsetX,
            preset.grenade_quantity.offsetY,
            `${magsAvaliable}`,
        );
        this.entityFactory.createHUDItem(
            GameUIEntryType.HUD,
            GameUIType.GRENADE_ICON,
            preset.grenade_icon.anchor,
            preset.grenade_icon.offsetX,
            preset.grenade_icon.offsetY,
            SpriteName.GRENADE_1,
            SpriteSheetName.PROJECTILE,
            14,
            16,
        );
        this.entityFactory.createHUDItemText(
            GameUIEntryType.HUD,
            GameUIType.MONEY,
            preset.money.anchor,
            preset.money.offsetX,
            preset.money.offsetY,
            `$${actualMoney}`,
        );
        // this.entityFactory.createKeybindHint(
        //     GameUIEntryType.ACTION_BAR,
        //     GameUIType.WEAPON_KEYBIND_1,
        //     preset.weapon_keybind_1.anchor,
        //     preset.weapon_keybind_1.offsetX,
        //     preset.weapon_keybind_1.offsetY,
        //     "1",
        // );
        // this.entityFactory.createHUDItem(
        //     GameUIEntryType.ACTION_BAR,
        //     GameUIType.WEAPON_SLOT_1,
        //     preset.weapon_slot_1.anchor,
        //     preset.weapon_slot_1.offsetX,
        //     preset.weapon_slot_1.offsetY,
        //     SpriteName.PISTOL,
        //     SpriteSheetName.WEAPON,
        //     36,
        //     20,
        // )
        // this.createSecondaryWeaponActionBarSlot(GameUIType.WEAPON_KEYBIND_2, GameUIType.WEAPON_SLOT_2, 1);
        // this.createSecondaryWeaponActionBarSlot(GameUIType.WEAPON_KEYBIND_3, GameUIType.WEAPON_SLOT_3, 2);
        // this.createSecondaryWeaponActionBarSlot(GameUIType.WEAPON_KEYBIND_4, GameUIType.WEAPON_SLOT_4, 3);
        // this.entityFactory.createKeybindHint(
        //     GameUIEntryType.ACTION_BAR,
        //     GameUIType.GRENADE_KEYBIND,
        //     preset.grenade_slot_keybind.anchor,
        //     preset.grenade_slot_keybind.offsetX,
        //     preset.grenade_slot_keybind.offsetY,
        //     "G",
        // );
        // this.entityFactory.createHUDItem(
        //     GameUIEntryType.ACTION_BAR,
        //     GameUIType.GRENADE_SLOT,
        //     preset.grenade_slot.anchor,
        //     preset.grenade_slot.offsetX,
        //     preset.grenade_slot.offsetY,
        //     SpriteName.GRENADE_1,
        //     SpriteSheetName.PROJECTILE,
        // );
        // this.entityFactory.createKeybindHint(
        //     GameUIEntryType.ACTION_BAR,
        //     GameUIType.KNIFE_KEYBIND,
        //     preset.knife_slot_keybind.anchor,
        //     preset.knife_slot_keybind.offsetX,
        //     preset.knife_slot_keybind.offsetY,
        //     "F",
        // );
        // this.entityFactory.createHUDItem(
        //     GameUIEntryType.ACTION_BAR,
        //     GameUIType.KNIFE_SLOT,
        //     preset.knife_slot.anchor,
        //     preset.knife_slot.offsetX,
        //     preset.knife_slot.offsetY,
        //     SpriteName.KNIFE,
        //     SpriteSheetName.WEAPON,
        //     24,
        //     14,
        // )
        this.secondaryWeaponStateKey = this.buildSecondaryWeaponStateKey(inventory);
        this.syncSecondaryWeaponActionBar(inventory);

        this.isHUDBuilded = true
    }

    private updateHUD() {

        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        const inventory = this.inventoryComponentStore.get(playerEntity);

        for (const gameUiItemEntity of this.gameUiComponentStore.getAllEntities()) {
            const gameUiType = this.gameUiComponentStore.get(gameUiItemEntity).gameUiType;
            this.gameUiHandlers[gameUiType](gameUiItemEntity, playerEntity);
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
        keybindGameUiType: GameUIType,
        slotGameUiType: GameUIType,
        spacingMultiplier: number,
    ) {
        const preset = GAME_UI_TYPE_LAYOUT_PRESET;
        const keybindPreset = preset[keybindGameUiType];
        const slotPreset = preset[slotGameUiType];
        const offsetX = ACTION_BAR_WEAPON_SLOT_SPACING * spacingMultiplier;

        this.entityFactory.createKeybindHint(
            GameUIEntryType.ACTION_BAR,
            keybindGameUiType,
            keybindPreset.anchor,
            keybindPreset.offsetX + offsetX,
            keybindPreset.offsetY,
            "",
        );
        this.entityFactory.createHUDItem(
            GameUIEntryType.ACTION_BAR,
            slotGameUiType,
            slotPreset.anchor,
            slotPreset.offsetX + offsetX,
            slotPreset.offsetY,
            SpriteName.BLANK,
            SpriteSheetName.BLANK,
            HIDDEN_GAME_UI_SIZE,
            HIDDEN_GAME_UI_SIZE,
        );
    }

    private syncSecondaryWeaponActionBar(inventory: InventoryComponent) {
        const ownedSecondaryWeapons = this.getOwnedSecondaryWeapons(inventory);
        const secondaryWeaponByGameUiType = new Map<GameUIType, WeaponType | null>([
            [GameUIType.WEAPON_KEYBIND_2, ownedSecondaryWeapons[0] ?? null],
            [GameUIType.WEAPON_SLOT_2, ownedSecondaryWeapons[0] ?? null],
            [GameUIType.WEAPON_KEYBIND_3, ownedSecondaryWeapons[1] ?? null],
            [GameUIType.WEAPON_SLOT_3, ownedSecondaryWeapons[1] ?? null],
            [GameUIType.WEAPON_KEYBIND_4, ownedSecondaryWeapons[2] ?? null],
            [GameUIType.WEAPON_SLOT_4, ownedSecondaryWeapons[2] ?? null],
        ]);

        for (const gameUiEntity of this.gameUiComponentStore.getAllEntities()) {
            const gameUiType = this.gameUiComponentStore.get(gameUiEntity).gameUiType;
            const weaponType = secondaryWeaponByGameUiType.get(gameUiType);

            if (weaponType === undefined) {
                continue;
            }

            if (
                gameUiType === GameUIType.WEAPON_KEYBIND_2 ||
                gameUiType === GameUIType.WEAPON_KEYBIND_3 ||
                gameUiType === GameUIType.WEAPON_KEYBIND_4
            ) {
                this.applySecondaryWeaponKeybindState(gameUiEntity, weaponType);
                continue;
            }

            this.applySecondaryWeaponSlotState(gameUiEntity, weaponType);
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

    private applySecondaryWeaponKeybindState(gameUiEntity: number, weaponType: WeaponType | null) {
        const sprite = this.spriteComponentStore.getOrNull(gameUiEntity);
        if (sprite) {
            if (weaponType === null) {
                sprite.spriteName = SpriteName.BLANK;
                sprite.spriteSheetName = SpriteSheetName.BLANK;
                sprite.width = HIDDEN_GAME_UI_SIZE;
                sprite.height = HIDDEN_GAME_UI_SIZE;
            } else {
                sprite.spriteName = SpriteName.KEYBOARD_KEY;
                sprite.spriteSheetName = SpriteSheetName.KEYBOARD_KEY;
                sprite.width = KEYBIND_HINT_RENDER_WIDTH;
                sprite.height = KEYBIND_HINT_RENDER_HEIGHT;
            }
        }

        const bitmapText = this.bitmapTextComponentStore.getOrNull(gameUiEntity);
        if (bitmapText) {
            bitmapText.text = weaponType === null
                ? ""
                : this.resolveWeaponKeybindLabel(weaponType);
        }
    }

    private applySecondaryWeaponSlotState(gameUiEntity: number, weaponType: WeaponType | null) {
        const sprite = this.spriteComponentStore.getOrNull(gameUiEntity);
        if (!sprite) {
            return;
        }

        if (weaponType === null) {
            sprite.spriteName = SpriteName.BLANK;
            sprite.spriteSheetName = SpriteSheetName.BLANK;
            sprite.width = HIDDEN_GAME_UI_SIZE;
            sprite.height = HIDDEN_GAME_UI_SIZE;
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

    private gameUiHandlers: Record<GameUIType, (gameUiEntity: number, playerEntity: number) => void> = {
        [GameUIType.HEALTH_BAR]: (gameUiEntity: number, playerEntity: number) => {
            const sprite = this.spriteComponentStore.getOrNull(gameUiEntity);
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
        [GameUIType.HEALTH_BAR_TEXT]: (gameUiEntity: number, playerEntity: number) => {
            const playerActualHp = this.healthComponentStore.get(playerEntity);
            const playerTotalHp = this.playerInitialProperties.hp;
            this.bitmapTextComponentStore.get(gameUiEntity).text = `${playerActualHp.hp}/${playerTotalHp}`;
        },
        [GameUIType.WEAPON_ICON]: (gameUiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const equippedWeaponType = inventory.equippedWeaponType;
            if (equippedWeaponType === null) return;
            const newSpriteName = this.resolveWeaponSprite(equippedWeaponType);
            this.spriteComponentStore.get(gameUiEntity).spriteName = newSpriteName;
            // Spritesheet is the same (Weapon);
        },
        [GameUIType.BULLET_QUANTITY]: (gameUiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const equippedWeaponType = inventory.equippedWeaponType;
            if (equippedWeaponType === null) return;
            const roundsInMag = this.inventoryManager.getRoundsInMag(inventory, equippedWeaponType)
            this.bitmapTextComponentStore.get(gameUiEntity).text = `${roundsInMag}`;
        },
        [GameUIType.BULLET_ICON]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update
        },
        [GameUIType.MAG_ICON]: (gameUiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const equippedWeaponType = inventory.equippedWeaponType;
            if (equippedWeaponType === null) return;
            const magUsed = this.inventoryManager.getAmmoResourceTypeForWeapon(equippedWeaponType);
            const newSpriteName = this.resolveInventoryResourceSprite(magUsed);
            this.spriteComponentStore.get(gameUiEntity).spriteName = newSpriteName;
            // Spritesheet is the same (Resources);
        },
        [GameUIType.MAG_QUANTITY]: (gameUiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const equippedWeaponType = inventory.equippedWeaponType;
            if (equippedWeaponType === null) return;
            const magUsed = this.inventoryManager.getAmmoResourceTypeForWeapon(equippedWeaponType);
            const magsAvaliable = this.inventoryManager.getResourceAmount(inventory, magUsed);
            this.bitmapTextComponentStore.get(gameUiEntity).text = `${magsAvaliable}`;
        },
        [GameUIType.GRENADE_ICON]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update
        },
        [GameUIType.GRENADE_QUANTITY]: (gameUiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const grenadeQuantity = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Grenade);
            this.bitmapTextComponentStore.get(gameUiEntity).text = `${grenadeQuantity}`;
        },
        [GameUIType.MONEY]: (gameUiEntity: number, playerEntity: number) => {
            const inventory = this.inventoryComponentStore.get(playerEntity);
            const money = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Money);
            const moneyFormated = this.formatMoney(money);
            this.bitmapTextComponentStore.get(gameUiEntity).text = `$${moneyFormated}`
        },
        [GameUIType.HOSTAGES]: (_gameUiEntity: number, _playerEntity: number) => {
            //to be implemented
        },
        [GameUIType.WEAPON_KEYBIND_1]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update -- always pistol
        },
        [GameUIType.WEAPON_KEYBIND_2]: (_gameUiEntity: number, _playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [GameUIType.WEAPON_KEYBIND_3]: (_gameUiEntity: number, _playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [GameUIType.WEAPON_KEYBIND_4]: (_gameUiEntity: number, _playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [GameUIType.GRENADE_KEYBIND]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update
        },
        [GameUIType.KNIFE_KEYBIND]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update
        },
        [GameUIType.WEAPON_SLOT_1]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update -- always pistol
        },
        [GameUIType.WEAPON_SLOT_2]: (_gameUiEntity: number, _playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [GameUIType.WEAPON_SLOT_3]: (_gameUiEntity: number, _playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [GameUIType.WEAPON_SLOT_4]: (_gameUiEntity: number, _playerEntity: number) => {
            // Handled in syncSecondaryWeaponActionBar
        },
        [GameUIType.GRENADE_SLOT]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update
        },
        [GameUIType.KNIFE_SLOT]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update
        },
        [GameUIType.WEAPON_FRAME]: (_gameUiEntity: number, _playerEntity: number) => {
            // No update
        },
        [GameUIType.FLOATING_TEXT]: (_gameUiEntity: number, _playerEntity: number) => { },
    };

    private formatMoney(value: number): string {
        return new Intl.NumberFormat('en-US').format(value);
    }
}
