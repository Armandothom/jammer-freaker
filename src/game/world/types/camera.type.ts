

export abstract class OutsideBondsSide {
  xAxis! : "left" | "right" | null;
  xDiff!: number;
  yAxis! : "top" | "bottom" | null;
  yDiff!: number;
}