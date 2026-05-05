import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { HUD_SKIN_MAP } from "../style/hud-skin-map.js";
import { createProgressBarWidget } from "../widgets/progress-bar.widget.js";
import { createResourceCounterWidget } from "../widgets/resource-counter.widget.js";
import { createWeaponPanelWidget } from "../widgets/weapon-panel.widget.js";
import { HUD_NODE_IDS } from "./node-ids/hud-node-ids.js";

export class HudScreen implements UIScreen {
  public readonly id = "hud";

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createProgressBarWidget({
          anchor: HUD_SKIN_MAP.healthBar.anchor,
          backgroundNodeId: HUD_NODE_IDS.health.background,
          backgroundSpriteName: HUD_SKIN_MAP.healthBar.backgroundSpriteName,
          fillNodeId: HUD_NODE_IDS.health.fill,
          fillSourceHeight: HUD_SKIN_MAP.healthBar.fillSourceHeight,
          fillSourceWidth: HUD_SKIN_MAP.healthBar.fillSourceWidth,
          fillSpriteName: HUD_SKIN_MAP.healthBar.fillSpriteName,
          height: HUD_SKIN_MAP.healthBar.height,
          nodeId: HUD_NODE_IDS.health.root,
          offsetX: HUD_SKIN_MAP.healthBar.offsetX,
          offsetY: HUD_SKIN_MAP.healthBar.offsetY,
          spriteSheetName: HUD_SKIN_MAP.healthBar.spriteSheetName,
          textNodeId: HUD_NODE_IDS.health.text,
          textOffsetY: HUD_SKIN_MAP.healthBar.textOffsetY,
          width: HUD_SKIN_MAP.healthBar.width,
        }),
        createWeaponPanelWidget({
          anchor: HUD_SKIN_MAP.weaponPanel.anchor,
          frameHeight: HUD_SKIN_MAP.weaponPanel.frame.height,
          frameNodeId: HUD_NODE_IDS.weapon.frame,
          frameSpriteName: HUD_SKIN_MAP.weaponPanel.frame.spriteName,
          frameSpriteSheetName: HUD_SKIN_MAP.weaponPanel.frame.spriteSheetName,
          frameWidth: HUD_SKIN_MAP.weaponPanel.frame.width,
          iconHeight: HUD_SKIN_MAP.weaponPanel.icon.height,
          iconNodeId: HUD_NODE_IDS.weapon.icon,
          iconOffsetX: HUD_SKIN_MAP.weaponPanel.icon.offsetX,
          iconOffsetY: HUD_SKIN_MAP.weaponPanel.icon.offsetY,
          iconSpriteName: HUD_SKIN_MAP.weaponPanel.icon.spriteName,
          iconSpriteSheetName: HUD_SKIN_MAP.weaponPanel.icon.spriteSheetName,
          iconWidth: HUD_SKIN_MAP.weaponPanel.icon.width,
          nodeId: HUD_NODE_IDS.weapon.root,
          offsetX: HUD_SKIN_MAP.weaponPanel.offsetX,
          offsetY: HUD_SKIN_MAP.weaponPanel.offsetY,
        }),
        createResourceCounterWidget({
          anchor: HUD_SKIN_MAP.weaponAmmoCounter.anchor,
          defaultIconHeight: HUD_SKIN_MAP.weaponAmmoCounter.icon.height,
          defaultIconSpriteName: HUD_SKIN_MAP.weaponAmmoCounter.icon.spriteName,
          defaultIconSpriteSheetName: HUD_SKIN_MAP.weaponAmmoCounter.icon.spriteSheetName,
          defaultIconWidth: HUD_SKIN_MAP.weaponAmmoCounter.icon.width,
          iconNodeId: HUD_NODE_IDS.weaponAmmo.icon,
          iconOffsetX: HUD_SKIN_MAP.weaponAmmoCounter.icon.offsetX,
          iconOffsetY: HUD_SKIN_MAP.weaponAmmoCounter.icon.offsetY,
          nodeId: HUD_NODE_IDS.weaponAmmo.root,
          offsetX: HUD_SKIN_MAP.weaponAmmoCounter.offsetX,
          offsetY: HUD_SKIN_MAP.weaponAmmoCounter.offsetY,
          textNodeId: HUD_NODE_IDS.weaponAmmo.text,
          textWidth: HUD_SKIN_MAP.weaponAmmoCounter.textWidth,
          textOffsetX: HUD_SKIN_MAP.weaponAmmoCounter.textOffsetX,
          textOffsetY: HUD_SKIN_MAP.weaponAmmoCounter.textOffsetY,
        }),
        createResourceCounterWidget({
          anchor: HUD_SKIN_MAP.magCounter.anchor,
          defaultIconHeight: HUD_SKIN_MAP.magCounter.icon.height,
          defaultIconSpriteName: HUD_SKIN_MAP.magCounter.icon.spriteName,
          defaultIconSpriteSheetName: HUD_SKIN_MAP.magCounter.icon.spriteSheetName,
          defaultIconWidth: HUD_SKIN_MAP.magCounter.icon.width,
          iconNodeId: HUD_NODE_IDS.weaponMags.icon,
          iconOffsetX: HUD_SKIN_MAP.magCounter.icon.offsetX,
          iconOffsetY: HUD_SKIN_MAP.magCounter.icon.offsetY,
          nodeId: HUD_NODE_IDS.weaponMags.root,
          offsetX: HUD_SKIN_MAP.magCounter.offsetX,
          offsetY: HUD_SKIN_MAP.magCounter.offsetY,
          textNodeId: HUD_NODE_IDS.weaponMags.text,
          textWidth: HUD_SKIN_MAP.magCounter.textWidth,
          textOffsetX: HUD_SKIN_MAP.magCounter.textOffsetX,
          textOffsetY: HUD_SKIN_MAP.magCounter.textOffsetY,
        }),
        createResourceCounterWidget({
          anchor: HUD_SKIN_MAP.grenadeCounter.anchor,
          defaultIconHeight: HUD_SKIN_MAP.grenadeCounter.icon.height,
          defaultIconSpriteName: HUD_SKIN_MAP.grenadeCounter.icon.spriteName,
          defaultIconSpriteSheetName: HUD_SKIN_MAP.grenadeCounter.icon.spriteSheetName,
          defaultIconWidth: HUD_SKIN_MAP.grenadeCounter.icon.width,
          iconNodeId: HUD_NODE_IDS.grenades.icon,
          iconOffsetX: HUD_SKIN_MAP.grenadeCounter.icon.offsetX,
          iconOffsetY: HUD_SKIN_MAP.grenadeCounter.icon.offsetY,
          nodeId: HUD_NODE_IDS.grenades.root,
          offsetX: HUD_SKIN_MAP.grenadeCounter.offsetX,
          offsetY: HUD_SKIN_MAP.grenadeCounter.offsetY,
          textNodeId: HUD_NODE_IDS.grenades.text,
          textWidth: HUD_SKIN_MAP.grenadeCounter.textWidth,
          textOffsetX: HUD_SKIN_MAP.grenadeCounter.textOffsetX,
          textOffsetY: HUD_SKIN_MAP.grenadeCounter.textOffsetY,
        }),
        createUINode({
          id: HUD_NODE_IDS.money.text,
          layout: {
            anchor: HUD_SKIN_MAP.money.anchor,
            offsetX: HUD_SKIN_MAP.money.offsetX,
            offsetY: HUD_SKIN_MAP.money.offsetY,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "left",
              maxWidth: null,
              text: "",
            },
          },
        }),
      ],
      id: HUD_NODE_IDS.root,
      layout: {
        childrenLayout: {
          kind: "overlay",
        },
        height: "fill",
        width: "fill",
      },
      visible: false,
    });
  }
}
