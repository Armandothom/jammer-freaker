import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";

export class EmptyUIScreen implements UIScreen {
  constructor(public readonly id: string) { }

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      id: this.id,
      layout: {
        childrenLayout: {
          kind: "overlay",
        },
        height: "fill",
        width: "fill",
      },
    });
  }
}
