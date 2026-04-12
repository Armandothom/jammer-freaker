import type {
  UIChildrenLayout,
  UINodeLayout,
  UIRect,
} from "../layout/ui-layout-types.js";
import type { UIInteraction } from "../input/ui-action.js";
import type { UIVisual } from "../style/ui-visual-types.js";

export type UINodeResolvedState = UIRect;

export type UINode = {
  id: string;
  children: UINode[];
  interaction?: UIInteraction;
  layout: UINodeLayout;
  resolved?: UINodeResolvedState;
  visible: boolean;
  visual?: UIVisual;
  zIndex: number;
};

export function createUINode(
  node: Omit<Partial<UINode>, "id"> & { id: string },
): UINode {
  return {
    children: node.children ?? [],
    id: node.id,
    interaction: cloneInteraction(node.interaction),
    layout: cloneLayout(node.layout),
    resolved: node.resolved,
    visible: node.visible ?? true,
    visual: cloneVisual(node.visual),
    zIndex: node.zIndex ?? 0,
  };
}

export function cloneUINodeTree(node: UINode): UINode {
  return {
    children: node.children.map(cloneUINodeTree),
    id: node.id,
    interaction: cloneInteraction(node.interaction),
    layout: cloneLayout(node.layout),
    resolved: undefined,
    visible: node.visible,
    visual: cloneVisual(node.visual),
    zIndex: node.zIndex,
  };
}

export function walkUINodeTree(
  node: UINode,
  visitor: (node: UINode) => void,
): void {
  visitor(node);

  for (const child of node.children) {
    walkUINodeTree(child, visitor);
  }
}

function cloneLayout(layout?: UINodeLayout): UINodeLayout {
  if (!layout) {
    return {};
  }

  return {
    ...layout,
    childrenLayout: cloneChildrenLayout(layout.childrenLayout),
    padding: layout.padding ? { ...layout.padding } : undefined,
  };
}

function cloneChildrenLayout(layout?: UIChildrenLayout): UIChildrenLayout | undefined {
  if (!layout) {
    return undefined;
  }

  return { ...layout };
}

function cloneInteraction(interaction?: UIInteraction): UIInteraction | undefined {
  if (!interaction) {
    return undefined;
  }

  return {
    ...interaction,
    action: {
      ...interaction.action,
      payload: interaction.action.payload ? { ...interaction.action.payload } : undefined,
    },
  };
}

function cloneVisual(visual?: UIVisual): UIVisual | undefined {
  if (!visual) {
    return undefined;
  }

  return {
    sprite: visual.sprite
      ? {
        ...visual.sprite,
        clip: visual.sprite.clip ? { ...visual.sprite.clip } : undefined,
      }
      : undefined,
    text: visual.text ? { ...visual.text } : undefined,
  };
}
