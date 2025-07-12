import { EntityId } from "./types/entity-id.type.js";

export class ComponentStore<T> {
  private components: Map<EntityId, T> = new Map();
  constructor() {

  }

  public add(entityId : EntityId, component : T) {
    console.log("Entity adicionada", entityId);
    return this.components.set(entityId, component);
  }

  public get(entityId : EntityId) {
    const value = this.components.get(entityId)
    if(!value){
      throw new Error("Error when trying to get component store");
    } 
    return value;
  }

  public remove(entityId : EntityId) {
    return this.components.delete(entityId);
  }

  public has(entityId : EntityId) {
    return this.components.has(entityId);
  }

  public getAllEntities(){
    return Array.from(this.components.keys());
  }
}