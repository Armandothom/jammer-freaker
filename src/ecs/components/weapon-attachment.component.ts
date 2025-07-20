export class WeaponSpriteAttachmentComponent {
  constructor(
    public parentEntityId: number,
    public offsetXAimRight: number = 0,
    public offsetXAimLeft: number = 0,
    public offsetYAimRight: number = 0,
    public offsetYAimLeft: number = 0,
    public barrelOffset : number = 5,
    public barrelX : number = 0,
    public barrelY : number = 0
  ) {}
}
