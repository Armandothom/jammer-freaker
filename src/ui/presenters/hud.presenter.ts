import { BleedDamageComponent } from "../../ecs/components/bleed-damage.component.js";
import { HealthComponent } from "../../ecs/components/health.component.js";
import { InventoryComponent } from "../../ecs/components/inventory-component.js";
import { MedicalItemUseComponent } from "../../ecs/components/medical-item-use.component.js";
import { PlayerComponent } from "../../ecs/components/player.component.js";
import { PositionComponent } from "../../ecs/components/position.component.js";
import { SpriteComponent } from "../../ecs/components/sprite.component.js";
import { INVENTORY_RESOURCE_SPRITE_CONFIG } from "../../ecs/components/types/inventory-resource-sprite-config.js";
import { InventoryResourceType } from "../../ecs/components/types/inventory-resource-type.js";
import { PlayerInitialProperties } from "../../ecs/components/types/player-properties.js";
import { WeaponType } from "../../ecs/components/types/weapon-config.js";
import { ComponentStore } from "../../ecs/core/component-store.js";
import { InventoryManager } from "../../ecs/core/inventory-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { CameraManager } from "../../game/world/camera-manager.js";
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
    private bleedDamageComponentStore: ComponentStore<BleedDamageComponent>,
    private medicalItemUseComponentStore: ComponentStore<MedicalItemUseComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private cameraManager: CameraManager,
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
    const bleedDamage = this.bleedDamageComponentStore.getOrNull(playerEntity);
    const medicalApply = this.buildMedicalApplyViewModel(playerEntity);

    return {
      grenades: {
        countText: this.formatHudCounter(grenadeCount),
      },
      health: {
        bleeding: bleedDamage != null,
        bleedStacksText: `x${bleedDamage?.bleedStacks ?? 0}`,
        fillRatio,
        text: `${health.hp}/${health.maxHp}`,
      },
      medicalApply,
      medicalItems: {
        bandage: {
          countText: this.formatHudCounter(this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Bandage)),
        },
        combatStim: {
          countText: this.formatHudCounter(this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.CombatStim)),
        },
        epipen: {
          countText: this.formatHudCounter(this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Epipen)),
        },
        healpack: {
          countText: this.formatHudCounter(this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Healpack)),
        },
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

  private buildMedicalApplyViewModel(playerEntity: number): HudViewModel["medicalApply"] {
    const medicalItemUse = this.medicalItemUseComponentStore.getOrNull(playerEntity);
    const playerPosition = this.positionComponentStore.getOrNull(playerEntity);
    const playerSprite = this.spriteComponentStore.getOrNull(playerEntity);

    if (!medicalItemUse || !playerPosition || !playerSprite) {
      return this.buildHiddenMedicalApplyViewModel();
    }

    const viewport = this.cameraManager.getViewport();
    const applyTime = Math.max(medicalItemUse.applyTime, Number.EPSILON);
    const fillRatio = Math.max(0, Math.min(medicalItemUse.timer / applyTime, 1));

    return {
      fillRatio,
      playerScreenX: playerPosition.x - viewport.left,
      playerScreenY: playerPosition.y - viewport.top,
      playerSpriteHeight: playerSprite.height,
      playerSpriteWidth: playerSprite.width,
      visible: true,
    };
  }

  private buildHiddenMedicalApplyViewModel(): HudViewModel["medicalApply"] {
    return {
      fillRatio: 0,
      playerScreenX: 0,
      playerScreenY: 0,
      playerSpriteHeight: 0,
      playerSpriteWidth: 0,
      visible: false,
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
