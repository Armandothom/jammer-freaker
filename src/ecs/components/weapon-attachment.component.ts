export class WeaponSpriteAttachmentComponent {
  constructor(
    public parentEntityId: number,
    public offsetX: number = 0,
    public offsetY: number = 0,
    public rotateByMouseAim: boolean = false,
    public barrelX : number = 0,
    public barrelY : number = 0
  ) {}
}
