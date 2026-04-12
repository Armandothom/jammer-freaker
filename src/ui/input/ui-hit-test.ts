import type { UIDocument } from "../runtime/ui-document.js";
import type { UIAction } from "./ui-action.js";

type UIPoint = {
  x: number;
  y: number;
};

export class UIHitTest {
  constructor(private document: UIDocument) { }

  public pickAction(point: UIPoint): UIAction | null {
    const interactiveNodes = this.document
      .getInteractiveNodes()
      .sort((left, right) => {
        if (left.zIndex !== right.zIndex) {
          return right.zIndex - left.zIndex;
        }

        return right.interactionOrder - left.interactionOrder;
      });

    for (const interactiveNode of interactiveNodes) {
      if (this.isPointInside(point, interactiveNode)) {
        return interactiveNode.interaction.action;
      }
    }

    return null;
  }

  private isPointInside(
    point: UIPoint,
    target: ReturnType<UIDocument["getInteractiveNodes"]>[number],
  ): boolean {
    return point.x >= target.x
      && point.x <= target.x + target.resolvedWidth
      && point.y >= target.y
      && point.y <= target.y + target.resolvedHeight;
  }
}
