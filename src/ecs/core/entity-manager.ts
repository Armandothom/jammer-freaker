export class EntityManager {
  private _id: number = 0;
  constructor() {

  }

  public registerEntity() {
    this._id += 1;
    return this._id;
  }

}