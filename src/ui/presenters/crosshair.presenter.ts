import type { InventoryComponent } from "../../ecs/components/inventory-component.js";
import type { PlayerComponent } from "../../ecs/components/player.component.js";
import type { SpreadRadiusComponent } from "../../ecs/components/spread-radius.component.js";
import { WeaponConfig } from "../../ecs/components/types/weapon-config.js";
import type { ComponentStore } from "../../ecs/core/component-store.js";
import type { UINodeBinder } from "../binding/ui-node-binder.js";
import { CROSSHAIR_NODE_IDS } from "../screens/node-ids/crosshair-node-ids.js";
import { resolveCrosshairCardinalLayout } from "../screens/crosshair-screen-overlay.js";
import { CROSSHAIR_SKIN_MAP } from "../style/crosshair-skin-map.js";
import type {
  CrosshairCardinal,
  CrosshairPoint,
  CrosshairViewModel,
} from "../view-models/crosshair.view-model.js";

const CARDINALS: CrosshairCardinal[] = ["north", "south", "east", "west"];

export class CrosshairPresenter {
  private center: CrosshairPoint = { ...CROSSHAIR_SKIN_MAP.defaultCenter };
  private radiusOverride: number | null = null;
  private visible: boolean = CROSSHAIR_SKIN_MAP.visible;

  constructor(
    private inventoryComponentStore?: ComponentStore<InventoryComponent>,
    private playerComponentStore?: ComponentStore<PlayerComponent>,
    private spreadRadiusComponentStore?: ComponentStore<SpreadRadiusComponent>,
  ) { }

  public buildViewModel(): CrosshairViewModel {
    return {
      center: { ...this.center },
      radius: this.resolveRadius(),
      visible: this.visible,
    };
  }

  public moveToMousePosition(mouseX: number, mouseY: number): void {
    this.center = {
      x: mouseX,
      y: mouseY,
    };
  }

  public setRadius(radius: number): void {
    this.radiusOverride = radius;
  }

  public clearRadiusOverride(): void {
    this.radiusOverride = null;
  }

  public setVisible(visible: boolean): void {
    this.visible = visible;
  }

  public applyViewModel(
    binder: UINodeBinder,
    viewModel: CrosshairViewModel = this.buildViewModel(),
    relayout?: () => void,
  ): void {
    binder.setVisibility(CROSSHAIR_NODE_IDS.root, viewModel.visible);

    for (const cardinal of CARDINALS) {
      const layout = resolveCrosshairCardinalLayout(
        cardinal,
        viewModel.center.x,
        viewModel.center.y,
        viewModel.radius,
      );

      binder.patchLayout(CROSSHAIR_NODE_IDS.cardinal[cardinal], layout);
      const node = binder.getNode(CROSSHAIR_NODE_IDS.cardinal[cardinal]);
      node.resolved = {
        height: CROSSHAIR_SKIN_MAP.cardinal.height,
        width: CROSSHAIR_SKIN_MAP.cardinal.width,
        x: layout.offsetX,
        y: layout.offsetY,
      };
    }

    relayout?.();
  }

  private resolveRadius(): number {
    if (this.radiusOverride != null) {
      return this.radiusOverride;
    }

    const spreadRadius = this.resolveSpreadRadius();
    if (spreadRadius != null) {
      return spreadRadius;
    }

    const equippedWeaponRadius = this.resolveEquippedWeaponMinRadius();
    return equippedWeaponRadius ?? CROSSHAIR_SKIN_MAP.defaultRadius;
  }

  private resolveSpreadRadius(): number | null {
    if (!this.spreadRadiusComponentStore) {
      return null;
    }

    const playerEntity = this.resolvePlayerEntity();
    if (playerEntity == null) {
      return null;
    }

    return this.spreadRadiusComponentStore.getOrNull(playerEntity)?.spreadRadius ?? null;
  }

  private resolveEquippedWeaponMinRadius(): number | null {
    const inventory = this.resolvePlayerInventory();
    const equippedWeaponType = inventory?.equippedWeaponType;
    if (equippedWeaponType == null) {
      return null;
    }

    return WeaponConfig[equippedWeaponType].spreadMinRadius;
  }

  private resolvePlayerInventory(): InventoryComponent | null {
    if (!this.inventoryComponentStore) {
      return null;
    }

    const playerEntity = this.resolvePlayerEntity();
    if (playerEntity != null) {
      return this.inventoryComponentStore.getOrNull(playerEntity);
    }

    return this.inventoryComponentStore.getAllValues()[0] ?? null;
  }

  private resolvePlayerEntity(): number | null {
    return this.playerComponentStore?.getAllEntities()[0] ?? null;
  }
}
