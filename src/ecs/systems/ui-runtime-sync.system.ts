import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { UIRuntimeEntityFactory } from "../entities/ui-runtime-entity-factory.js";
import { ISystem } from "./system.interface.js";

export class UIRuntimeSyncSystem implements ISystem {
  private nodeEntityMap = new Map<string, number>();

  constructor(
    private uiRuntime: UIRuntime,
    private uiRuntimeEntityFactory: UIRuntimeEntityFactory,
  ) { }

  public reset(): void {
    for (const entityId of this.nodeEntityMap.values()) {
      this.uiRuntimeEntityFactory.destroyNodeEntity(entityId);
    }

    this.nodeEntityMap.clear();
  }

  public update(_deltaTime: number): void {
    const renderableNodes = this.uiRuntime.getRenderableNodes();
    const activeNodeIds = new Set(renderableNodes.map((node) => node.nodeId));

    for (const renderableNode of renderableNodes) {
      const entityId = this.nodeEntityMap.get(renderableNode.nodeId);
      if (entityId == null) {
        const nextEntityId = this.uiRuntimeEntityFactory.createNodeEntity(renderableNode);
        this.nodeEntityMap.set(renderableNode.nodeId, nextEntityId);
        continue;
      }

      this.uiRuntimeEntityFactory.updateNodeEntity(entityId, renderableNode);
    }

    for (const [nodeId, entityId] of Array.from(this.nodeEntityMap.entries())) {
      if (activeNodeIds.has(nodeId)) {
        continue;
      }

      this.uiRuntimeEntityFactory.destroyNodeEntity(entityId);
      this.nodeEntityMap.delete(nodeId);
    }
  }
}
