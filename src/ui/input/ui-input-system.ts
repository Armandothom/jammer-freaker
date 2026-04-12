import type { UIRuntime } from "../runtime/ui-runtime.js";
import type { UIAction } from "./ui-action.js";
import { UIHitTest } from "./ui-hit-test.js";

type UIScreenPosition = {
  x: number;
  y: number;
};

export class UIInputSystem {
  private canvas: HTMLCanvasElement;
  private pendingClick: UIScreenPosition | null = null;

  constructor(private uiRuntime: UIRuntime) {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("UIInputSystem: canvas not found in DOM.");
    }

    this.canvas = canvas;
    this.initializeListeners();
  }

  public consumeAction(): UIAction | null {
    if (!this.pendingClick) {
      return null;
    }

    const click = this.pendingClick;
    this.pendingClick = null;
    const hitTest = new UIHitTest(this.uiRuntime.getDocument());

    return hitTest.pickAction(click);
  }

  public reset(): void {
    this.pendingClick = null;
  }

  private getClickScreenPosition(event: MouseEvent): UIScreenPosition {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  private initializeListeners(): void {
    this.canvas.addEventListener("mousedown", (event: MouseEvent) => {
      this.pendingClick = this.getClickScreenPosition(event);
    });
  }
}
