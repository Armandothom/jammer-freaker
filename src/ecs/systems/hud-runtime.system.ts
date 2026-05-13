import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { HudPresenter } from "../../ui/presenters/hud.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { HUD_NODE_IDS } from "../../ui/screens/node-ids/hud-node-ids.js";
import { HUD_SKIN_MAP } from "../../ui/style/hud-skin-map.js";
import { ISystem } from "./system.interface.js";

export class HudRuntimeSystem implements ISystem {
  private uiNodeBinder: UINodeBinder | null = null;
  private bleedBlinkTime = 0;

  constructor(
    private uiRuntime: UIRuntime,
    private hudPresenter: HudPresenter,
  ) { }

  public update(deltaTime: number): void {
    this.bleedBlinkTime += deltaTime;
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
    binder.setVisibility(HUD_NODE_IDS.health.bleedRoot, viewModel.health.bleeding);
    if (viewModel.health.bleeding) {
      binder.patchText(HUD_NODE_IDS.health.bleedText, {
        text: viewModel.health.bleedStacksText,
      });
      binder.patchSprite(HUD_NODE_IDS.health.bleedIcon, {
        opacity: this.resolveBleedIconOpacity(),
      });
    }
    binder.setVisibility(HUD_NODE_IDS.medicalApply.root, viewModel.medicalApply.visible);
    if (viewModel.medicalApply.visible) {
      binder.patchLayout(HUD_NODE_IDS.medicalApply.root, {
        offsetX: Math.round(
          viewModel.medicalApply.playerScreenX
          + (viewModel.medicalApply.playerSpriteWidth / 2)
          - (HUD_SKIN_MAP.medicalApplyBar.width / 2),
        ),
        offsetY: Math.round(
          viewModel.medicalApply.playerScreenY
          + viewModel.medicalApply.playerSpriteHeight
          + HUD_SKIN_MAP.medicalApplyBar.playerPaddingY,
        ),
      });
      binder.patchSprite(HUD_NODE_IDS.medicalApply.fill, {
        clip: {
          sourceWidth: HUD_SKIN_MAP.medicalApplyBar.fillSourceWidth * viewModel.medicalApply.fillRatio,
        },
      });
    }
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
    binder.patchText(HUD_NODE_IDS.medicalItems.healpack.quantity, {
      text: viewModel.medicalItems.healpack.countText,
    });
    binder.patchText(HUD_NODE_IDS.medicalItems.bandage.quantity, {
      text: viewModel.medicalItems.bandage.countText,
    });
    binder.patchText(HUD_NODE_IDS.medicalItems.epipen.quantity, {
      text: viewModel.medicalItems.epipen.countText,
    });
    binder.patchText(HUD_NODE_IDS.medicalItems.combatStim.quantity, {
      text: viewModel.medicalItems.combatStim.countText,
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

  private resolveBleedIconOpacity(): number {
    const { blinkIntensity, blinkSpeedHz } = HUD_SKIN_MAP.healthBleedIndicator;
    const normalizedPulse = (Math.sin(this.bleedBlinkTime * blinkSpeedHz * Math.PI * 2) + 1) / 2;
    const intensity = Math.max(0, Math.min(blinkIntensity, 1));

    return 1 - intensity + normalizedPulse * intensity;
  }
}
