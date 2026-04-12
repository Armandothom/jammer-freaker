import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { HUD_NODE_IDS } from "../../ui/screens/hud-node-ids.js";
import { HUD_SKIN_MAP } from "../../ui/style/hud-skin-map.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { HudPresenter } from "../../ui/presenters/hud.presenter.js";
import { ISystem } from "./system.interface.js";

export class HudRuntimeSystem implements ISystem {
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private hudPresenter: HudPresenter,
  ) { }

  public update(_deltaTime: number): void {
    const binder = this.getBinder();
    const viewModel = this.hudPresenter.buildViewModel();

    if (!viewModel) {
      binder.setVisibility(HUD_NODE_IDS.root, false);
      this.uiRuntime.relayout();
      return;
    }

    binder.setVisibility(HUD_NODE_IDS.root, true);
    binder.patchText(HUD_NODE_IDS.health.text, {
      text: viewModel.health.text,
    });
    binder.patchSprite(HUD_NODE_IDS.health.fill, {
      clip: {
        sourceWidth: HUD_SKIN_MAP.healthBar.fillSourceWidth * viewModel.health.fillRatio,
      },
    });
    binder.patchSprite(HUD_NODE_IDS.weapon.icon, {
      spriteName: viewModel.weapon.iconSpriteName,
    });
    binder.patchText(HUD_NODE_IDS.weaponAmmo.text, {
      text: viewModel.weaponAmmo.roundsInMagText,
    });
    binder.patchText(HUD_NODE_IDS.weaponMags.text, {
      text: viewModel.mags.countText,
    });
    binder.patchSprite(HUD_NODE_IDS.weaponMags.icon, {
      height: viewModel.mags.iconHeight,
      spriteName: viewModel.mags.iconSpriteName,
      spriteSheetName: viewModel.mags.iconSpriteSheetName,
      width: viewModel.mags.iconWidth,
    });
    binder.patchText(HUD_NODE_IDS.grenades.text, {
      text: viewModel.grenades.countText,
    });
    binder.patchText(HUD_NODE_IDS.money.text, {
      text: viewModel.money.text,
    });
    this.uiRuntime.relayout();
  }

  private getBinder(): UINodeBinder {
    if (!this.uiNodeBinder) {
      this.uiNodeBinder = new UINodeBinder(this.uiRuntime.getDocument());
    }

    return this.uiNodeBinder;
  }
}
