export class CollisionLastFrameComponent {
  registeredTime : number;
  entityCollision : boolean;
  constructor(registeredTime : number, entityCollision : boolean) {
    this.registeredTime = registeredTime;
    this.entityCollision = entityCollision;
  }
}
