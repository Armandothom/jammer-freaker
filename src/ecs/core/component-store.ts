import { EntityId } from "./types/entity-id.type.js";

export class ComponentStore<T> {
  private components: Map<EntityId, T> = new Map();
  constructor() {

  }

  public add(entityId : EntityId, component : T) {
    return this.components.set(entityId, component);
  }

  public get(entityId : EntityId) {
    return this.components.get(entityId);
  }

  public remove(entityId : EntityId) {
    return this.components.delete(entityId);
  }

  public has(entityId : EntityId) {
    return this.components.has(entityId);
  }
}