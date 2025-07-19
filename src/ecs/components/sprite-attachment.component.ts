export class SpriteAttachmentComponent {
  constructor(
    public parentEntityId: number,
    public offsetX: number = 0,
    public offsetY: number = 0,
    public rotateByMouseAim: boolean = false
  ) {}
}
