import { HealthComponent } from "../../ecs/components/health.component.js";
import { InventoryComponent } from "../../ecs/components/inventory-component.js";
import { PlayerComponent } from "../../ecs/components/player.component.js";
import { INVENTORY_RESOURCE_SPRITE_CONFIG } from "../../ecs/components/types/inventory-resource-sprite-config.js";
import { InventoryResourceType } from "../../ecs/components/types/inventory-resource-type.js";
import { PlayerInitialProperties } from "../../ecs/components/types/player-properties.js";
import { WeaponType } from "../../ecs/components/types/weapon-config.js";
import { ComponentStore } from "../../ecs/core/component-store.js";
import { InventoryManager } from "../../ecs/core/inventory-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import type { HudViewModel } from "../view-models/hud.view-model.js";

type HudAmmoIcon = {
  spriteName: SpriteName;
  spriteSheetName: SpriteSheetName;
  width: number;
  height: number;
};

export class HudPresenter {
  constructor(
    private inventoryManager: InventoryManager,
    private playerInitialProperties: PlayerInitialProperties,
    private inventoryComponentStore: ComponentStore<InventoryComponent>,
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private healthComponentStore: ComponentStore<HealthComponent>,
  ) { }

  public buildViewModel(): HudViewModel | null {
    const playerEntity = this.playerComponentStore.getAllEntities()[0];
    if (playerEntity == null) {
      return null;
    }

    const inventory = this.inventoryComponentStore.getOrNull(playerEntity);
    const health = this.healthComponentStore.getOrNull(playerEntity);
    if (!inventory || !health || inventory.equippedWeaponType == null) {
      return null;
    }

    const weaponType = inventory.equippedWeaponType;
    const ammoIcon = this.resolveAmmoIcon(weaponType);
    const roundsInMag = this.inventoryManager.getRoundsInMag(inventory, weaponType);
    const magCount = ammoIcon.resourceType != null
      ? this.inventoryManager.getResourceAmount(inventory, ammoIcon.resourceType)
      : 0;
    const grenadeCount = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Grenade);
    const money = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Money);
    const maxHp = Math.max(health.maxHp, 1);
    const fillRatio = Math.max(0, Math.min(health.hp / maxHp, 1));

    return {
      grenades: {
        countText: this.formatHudCounter(grenadeCount),
      },
      health: {
        fillRatio,
        text: `${health.hp}/${this.playerInitialProperties.hp}`,
      },
      mags: {
        countText: this.formatHudCounter(magCount),
        iconHeight: ammoIcon.height,
        iconSpriteName: ammoIcon.spriteName,
        iconSpriteSheetName: ammoIcon.spriteSheetName,
        iconWidth: ammoIcon.width,
      },
      money: {
        text: `$${this.formatMoney(money)}`,
      },
      weapon: {
        iconSpriteName: this.resolveWeaponSprite(weaponType),
      },
      weaponAmmo: {
        roundsInMagText: this.formatHudCounter(roundsInMag),
      },
    };
  }

  private formatHudCounter(value: number): string {
    const normalizedValue = Math.max(0, value);
    return normalizedValue < 10
      ? `0${normalizedValue}`
      : `${normalizedValue}`;
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
  }

  private resolveAmmoIcon(weaponType: WeaponType): HudAmmoIcon & { resourceType: InventoryResourceType | null } {
    switch (weaponType) {
      case WeaponType.PISTOL:
        return this.buildResourceIcon(SpriteName.PISTOL_MAG_ICON, InventoryResourceType.PistolMag);

      case WeaponType.SMG:
        return this.buildResourceIcon(SpriteName.SMG_MAG_ICON, InventoryResourceType.SmgMag);

      // Keeps current gameplay stable until a dedicated rifle-mag icon exists.
      case WeaponType.RIFLE:
        return this.buildResourceIcon(SpriteName.SMG_MAG_ICON, InventoryResourceType.RifleMag);

      case WeaponType.SHOTGUN:
        return this.buildResourceIcon(SpriteName.SHOTGUN_SHELL_BOX_ICON, InventoryResourceType.ShotgunShell);

      case WeaponType.SNIPER:
        return this.buildResourceIcon(SpriteName.SNIPER_MAG_ICON, InventoryResourceType.SniperMag);
      case WeaponType.KNIFE:
      case WeaponType.SHIELD:
      case WeaponType.GRENADE:
      default:
        return {
          height: 0,
          resourceType: null,
          spriteName: SpriteName.BLANK,
          spriteSheetName: SpriteSheetName.BLANK,
          width: 0,
        };
    }
  }

  private buildResourceIcon(
    spriteName: SpriteName,
    resourceType: InventoryResourceType,
  ): HudAmmoIcon & { resourceType: InventoryResourceType } {
    const size = INVENTORY_RESOURCE_SPRITE_CONFIG[resourceType];

    return {
      height: size.height,
      resourceType,
      spriteName,
      spriteSheetName: SpriteSheetName.RESOURCES_ICON,
      width: size.width,
    };
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

      case WeaponType.SHOTGUN:
        return SpriteName.SHOTGUN;

      case WeaponType.GRENADE:
      default:
        return SpriteName.BLANK;
    }
  }
}
