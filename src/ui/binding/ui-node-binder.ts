import type { UINode } from "../runtime/ui-node.js";
import type { UIDocument } from "../runtime/ui-document.js";
import type { UIInteraction } from "../input/ui-action.js";
import type { UINodeLayout } from "../layout/ui-layout-types.js";
import type { UITextVisual, UISpriteClip, UISpriteVisual } from "../style/ui-visual-types.js";

type UISpriteVisualPatch = Partial<Omit<UISpriteVisual, "clip">> & {
  clip?: Partial<UISpriteClip>;
};

export class UINodeBinder {
  constructor(private document: UIDocument) { }

  public getNode(nodeId: string): UINode {
    return this.document.getNode(nodeId);
  }

  public patchSprite(nodeId: string, patch: UISpriteVisualPatch): void {
    const node = this.getNode(nodeId);
    if (!node.visual?.sprite) {
      throw new Error(`UI node does not have sprite visual: ${nodeId}`);
    }

    let nextClip = node.visual.sprite.clip;
    if (patch.clip) {
      if (!nextClip) {
        throw new Error(`UI node does not have sprite clip visual: ${nodeId}`);
      }

      nextClip = {
        ...nextClip,
        ...patch.clip,
      };
    }

    node.visual.sprite = {
      ...node.visual.sprite,
      ...patch,
      clip: nextClip,
    };
  }

  public patchText(nodeId: string, patch: Partial<UITextVisual>): void {
    const node = this.getNode(nodeId);
    if (!node.visual?.text) {
      throw new Error(`UI node does not have text visual: ${nodeId}`);
    }

    node.visual.text = {
      ...node.visual.text,
      ...patch,
    };
  }

  public patchInteraction(nodeId: string, patch: Partial<UIInteraction>): void {
    const node = this.getNode(nodeId);
    if (!node.interaction) {
      throw new Error(`UI node does not have interaction: ${nodeId}`);
    }

    node.interaction = {
      ...node.interaction,
      ...patch,
      action: patch.action
        ? {
          ...node.interaction.action,
          ...patch.action,
          payload: patch.action.payload
            ? {
              ...node.interaction.action.payload,
              ...patch.action.payload,
            }
            : node.interaction.action.payload,
        }
        : node.interaction.action,
    };
  }

  public patchLayout(nodeId: string, patch: Partial<UINodeLayout>): void {
    const node = this.getNode(nodeId);

    node.layout = {
      ...node.layout,
      ...patch,
      childrenLayout: patch.childrenLayout
        ? { ...patch.childrenLayout }
        : node.layout.childrenLayout,
      padding: patch.padding
        ? {
          ...node.layout.padding,
          ...patch.padding,
        }
        : node.layout.padding,
    };
  }

  public setVisibility(nodeId: string, visible: boolean): void {
    this.getNode(nodeId).visible = visible;
  }
}
