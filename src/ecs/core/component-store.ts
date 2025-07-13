import { EntityId } from "./types/entity-id.type.js";

export class ComponentStore<T> {
  private components: Map<EntityId, T> = new Map();
  private className!: string;
  constructor(className: string) {
    this.className = className;
  }

  public add(entityId: EntityId, component: T) {

    return this.components.set(entityId, component);
  }

  public get(entityId: EntityId) {
    const value = this.components.get(entityId)
    if (!value) {
      throw new Error(`[${this.className}] Error when trying to get component store ${entityId}`);
    }
    return value;
  }

  public getOrNull(entityId : EntityId) {
    const value = this.components.get(entityId)
    if (!value) {
      return null;
    }
    return value;
  }

  public remove(entityId: EntityId) {
    return this.components.delete(entityId);
  }

  public has(entityId: EntityId) {
    return this.components.has(entityId);
  }

  public getAllEntities() {
    return Array.from(this.components.keys());
  }

  public getAllValues() {
    return Array.from(this.components.values());
  }
}