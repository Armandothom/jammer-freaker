import type { UIVisual } from "../style/ui-visual-types.js";
import type { UIInteraction } from "../input/ui-action.js";
import { cloneUINodeTree, type UINode, walkUINodeTree } from "./ui-node.js";

export type UIDocumentRoot = {
  layer: "base" | "overlay";
  node: UINode;
  screenId: string;
};

export type UIRenderableNode = {
  nodeId: string;
  renderOrder: number;
  resolvedHeight: number;
  resolvedWidth: number;
  screenId: string;
  visual: UIVisual;
  x: number;
  y: number;
  zIndex: number;
};

export type UIInteractiveNode = {
  interaction: UIInteraction;
  interactionOrder: number;
  nodeId: string;
  resolvedHeight: number;
  resolvedWidth: number;
  screenId: string;
  x: number;
  y: number;
  zIndex: number;
};

export class UIDocument {
  private nodeIndex = new Map<string, UINode>();
  private roots: UIDocumentRoot[] = [];

  public clear(): void {
    this.nodeIndex.clear();
    this.roots = [];
  }

  public getNode(nodeId: string): UINode {
    const node = this.nodeIndex.get(nodeId);

    if (!node) {
      throw new Error(`UI node not found: ${nodeId}`);
    }

    return node;
  }

  public getNodeOrNull(nodeId: string): UINode | null {
    return this.nodeIndex.get(nodeId) ?? null;
  }

  public getRenderableNodes(): UIRenderableNode[] {
    const renderableNodes: UIRenderableNode[] = [];
    let renderOrder = 0;

    for (const root of this.roots) {
      renderOrder = this.collectRenderableNodes(
        root.node,
        root.screenId,
        true,
        renderableNodes,
        renderOrder,
      );
    }

    return renderableNodes;
  }

  public getInteractiveNodes(): UIInteractiveNode[] {
    const interactiveNodes: UIInteractiveNode[] = [];
    let interactionOrder = 0;

    for (const root of this.roots) {
      interactionOrder = this.collectInteractiveNodes(
        root.node,
        root.screenId,
        true,
        interactiveNodes,
        interactionOrder,
      );
    }

    return interactiveNodes;
  }

  public getRoots(): UIDocumentRoot[] {
    return this.roots;
  }

  public setRoots(roots: UIDocumentRoot[]): void {
    const clonedRoots = roots.map((root) => ({
      layer: root.layer,
      node: cloneUINodeTree(root.node),
      screenId: root.screenId,
    }));

    this.validateUniqueNodeIds(clonedRoots);
    this.roots = clonedRoots;
    this.rebuildIndex();
  }

  private validateUniqueNodeIds(roots: UIDocumentRoot[]): void {
    const seenIds = new Set<string>();

    for (const root of roots) {
      walkUINodeTree(root.node, (node) => {
        if (seenIds.has(node.id)) {
          throw new Error(`Duplicate UI node id detected: ${node.id}`);
        }

        seenIds.add(node.id);
      });
    }
  }

  private collectRenderableNodes(
    node: UINode,
    screenId: string,
    parentVisible: boolean,
    renderableNodes: UIRenderableNode[],
    renderOrder: number,
  ): number {
    const currentVisible = parentVisible && node.visible;

    if (currentVisible && node.visual && node.resolved) {
      if (node.visual.sprite || node.visual.text) {
        renderableNodes.push({
          nodeId: node.id,
          renderOrder,
          resolvedHeight: node.resolved.height,
          resolvedWidth: node.resolved.width,
          screenId,
          visual: node.visual,
          x: node.resolved.x,
          y: node.resolved.y,
          zIndex: node.zIndex,
        });
        renderOrder += 1;
      }
    }

    for (const child of node.children) {
      renderOrder = this.collectRenderableNodes(
        child,
        screenId,
        currentVisible,
        renderableNodes,
        renderOrder,
      );
    }

    return renderOrder;
  }

  private collectInteractiveNodes(
    node: UINode,
    screenId: string,
    parentVisible: boolean,
    interactiveNodes: UIInteractiveNode[],
    interactionOrder: number,
  ): number {
    const currentVisible = parentVisible && node.visible;

    if (currentVisible && node.resolved && node.interaction && !node.interaction.disabled) {
      interactiveNodes.push({
        interaction: node.interaction,
        interactionOrder,
        nodeId: node.id,
        resolvedHeight: node.resolved.height,
        resolvedWidth: node.resolved.width,
        screenId,
        x: node.resolved.x,
        y: node.resolved.y,
        zIndex: node.zIndex,
      });
      interactionOrder += 1;
    }

    for (const child of node.children) {
      interactionOrder = this.collectInteractiveNodes(
        child,
        screenId,
        currentVisible,
        interactiveNodes,
        interactionOrder,
      );
    }

    return interactionOrder;
  }

  private rebuildIndex(): void {
    this.nodeIndex.clear();

    for (const root of this.roots) {
      walkUINodeTree(root.node, (node) => {
        this.nodeIndex.set(node.id, node);
      });
    }
  }
}
