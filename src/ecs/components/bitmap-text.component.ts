export type BitmapTextHorizontalAlign = "left" | "center" | "right";

export class BitmapTextComponent {
  constructor(
    public text: string,
    public fontId: string,
    public scale: number,
    public maxWidth: number | null,
    public autoWrap: boolean,
    public horizontalAlign: BitmapTextHorizontalAlign,
  ) {
  }
}
