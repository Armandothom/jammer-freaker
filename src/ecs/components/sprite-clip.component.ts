export class SpriteClipComponent {
  constructor(
    public sourceOffsetX: number,
    public sourceOffsetY: number,
    public sourceWidth: number,
    public sourceHeight: number,
    public trimRenderedSize: boolean = true,
  ) { }
}
