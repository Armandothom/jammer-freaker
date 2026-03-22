export class WeaponSpriteAttachmentComponent {
  constructor(
    public parentEntityId: number,
    public offsetXAim: number = 0,
    public offsetYAim: number = 0,
    public barrelOffset : number = 5,
    public barrelX : number = 0,
    public barrelY : number = 0
  ) {}
}
