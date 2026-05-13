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
        this.createBleedIndicatorNode(),
        createProgressBarWidget({
          anchor: HUD_SKIN_MAP.medicalApplyBar.anchor,
          backgroundNodeId: HUD_NODE_IDS.medicalApply.background,
          backgroundSpriteName: HUD_SKIN_MAP.medicalApplyBar.backgroundSpriteName,
          fillNodeId: HUD_NODE_IDS.medicalApply.fill,
          fillSourceHeight: HUD_SKIN_MAP.medicalApplyBar.fillSourceHeight,
          fillSourceWidth: HUD_SKIN_MAP.medicalApplyBar.fillSourceWidth,
          fillSpriteName: HUD_SKIN_MAP.medicalApplyBar.fillSpriteName,
          height: HUD_SKIN_MAP.medicalApplyBar.height,
          nodeId: HUD_NODE_IDS.medicalApply.root,
          offsetX: 0,
          offsetY: 0,
          spriteSheetName: HUD_SKIN_MAP.medicalApplyBar.spriteSheetName,
          visible: false,
          width: HUD_SKIN_MAP.medicalApplyBar.width,
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
        this.createMedicalItemCounterNode({
          keyText: "T",
          nodeIds: HUD_NODE_IDS.medicalItems.healpack,
          rowIndex: 0,
        }),
        this.createMedicalItemCounterNode({
          keyText: "V",
          nodeIds: HUD_NODE_IDS.medicalItems.bandage,
          rowIndex: 1,
        }),
        this.createMedicalItemCounterNode({
          keyText: "C",
          nodeIds: HUD_NODE_IDS.medicalItems.epipen,
          rowIndex: 2,
        }),
        this.createMedicalItemCounterNode({
          keyText: "X",
          nodeIds: HUD_NODE_IDS.medicalItems.combatStim,
          rowIndex: 3,
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

  private createMedicalItemCounterNode(args: {
    keyText: string;
    nodeIds: {
      icon: string;
      key: string;
      quantity: string;
      root: string;
    };
    rowIndex: number;
  }): ReturnType<typeof createUINode> {
    const skin = HUD_SKIN_MAP.medicalItemCounters;

    return createUINode({
      children: [
        createUINode({
          id: args.nodeIds.icon,
          layout: {
            height: skin.icon.height,
            offsetX: skin.icon.offsetX,
            offsetY: skin.icon.offsetY,
            width: skin.icon.width,
          },
          visual: {
            sprite: {
              height: skin.icon.height,
              spriteName: skin.icon.spriteName,
              spriteSheetName: skin.icon.spriteSheetName,
              width: skin.icon.width,
            },
          },
        }),
        createUINode({
          id: args.nodeIds.quantity,
          layout: {
            height: "content",
            offsetX: skin.quantityOffsetX,
            offsetY: skin.quantityOffsetY,
            width: skin.quantityTextWidth,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "right",
              maxWidth: skin.quantityTextWidth,
              text: "",
            },
          },
        }),
        createUINode({
          id: args.nodeIds.key,
          layout: {
            height: "content",
            offsetX: skin.keyOffsetX,
            offsetY: skin.keyOffsetY,
            width: skin.keyTextWidth,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "left",
              maxWidth: skin.keyTextWidth,
              text: args.keyText,
            },
          },
        }),
      ],
      id: args.nodeIds.root,
      layout: {
        anchor: skin.anchor,
        childrenLayout: {
          kind: "overlay",
        },
        offsetX: skin.offsetX,
        offsetY: skin.offsetY + args.rowIndex * skin.rowGap,
      },
    });
  }

  private createBleedIndicatorNode(): ReturnType<typeof createUINode> {
    const skin = HUD_SKIN_MAP.healthBleedIndicator;

    return createUINode({
      children: [
        createUINode({
          id: HUD_NODE_IDS.health.bleedIcon,
          layout: {
            height: skin.icon.height,
            offsetX: skin.icon.offsetX,
            offsetY: skin.icon.offsetY,
            width: skin.icon.width,
          },
          visual: {
            sprite: {
              height: skin.icon.height,
              opacity: 1,
              spriteName: skin.icon.spriteName,
              spriteSheetName: skin.icon.spriteSheetName,
              width: skin.icon.width,
            },
          },
        }),
        createUINode({
          id: HUD_NODE_IDS.health.bleedText,
          layout: {
            height: "content",
            offsetX: skin.textOffsetX,
            offsetY: skin.textOffsetY,
            width: skin.textWidth,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "left",
              maxWidth: skin.textWidth,
              text: "",
            },
          },
        }),
      ],
      id: HUD_NODE_IDS.health.bleedRoot,
      layout: {
        anchor: skin.anchor,
        childrenLayout: {
          kind: "overlay",
        },
        offsetX: skin.offsetX,
        offsetY: skin.offsetY,
      },
      visible: false,
    });
  }
}
