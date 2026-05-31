import type { UIRuntime } from "../runtime/ui-runtime.js";
import type { UIAction } from "./ui-action.js";
import { UIHitTest } from "./ui-hit-test.js";

type UIScreenPosition = {
  button: number;
  x: number;
  y: number;
};

type UIPointerEventName =
  | "double-click"
  | "pointer-cancel"
  | "pointer-down"
  | "pointer-move"
  | "pointer-up";

export class UIInputSystem {
  private canvas: HTMLCanvasElement;
  private activePointerAction: UIAction | null = null;
  private isPointerDown = false;
  private pendingActions: UIAction[] = [];

  constructor(private uiRuntime: UIRuntime) {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("UIInputSystem: canvas not found in DOM.");
    }

    this.canvas = canvas;
    this.initializeListeners();
  }

  public consumeAction(): UIAction | null {
    return this.pendingActions.shift() ?? null;
  }

  public reset(): void {
    this.activePointerAction = null;
    this.isPointerDown = false;
    this.pendingActions = [];
  }

  private getClickScreenPosition(event: MouseEvent): UIScreenPosition {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      button: event.button,
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  private enqueuePointerAction(
    action: UIAction,
    eventName: UIPointerEventName,
    point: UIScreenPosition,
    extraPayload: Record<string, string> = {},
  ): void {
    if (eventName === "pointer-move") {
      this.pendingActions = this.pendingActions.filter((pendingAction) => {
        return pendingAction.payload?.pointerEvent !== "pointer-move";
      });
    }

    this.pendingActions.push({
      ...action,
      payload: {
        ...action.payload,
        ...extraPayload,
        mouseButton: `${point.button}`,
        pointerEvent: eventName,
        pointerX: `${point.x}`,
        pointerY: `${point.y}`,
      },
    });
  }

  private isPointerTrackingAction(action: UIAction | null): action is UIAction {
    return action?.payload?.placementBind === "true";
  }

  private pickAction(point: UIScreenPosition): UIAction | null {
    return new UIHitTest(this.uiRuntime.getDocument()).pickAction(point);
  }

  private initializeListeners(): void {
    this.canvas.addEventListener("mousedown", (event: MouseEvent) => {
      const point = this.getClickScreenPosition(event);
      const action = this.pickAction(point);
      const shouldTrackPointer = point.button === 0 && this.isPointerTrackingAction(action);

      this.isPointerDown = shouldTrackPointer;
      this.activePointerAction = shouldTrackPointer ? action : null;

      if (action) {
        this.enqueuePointerAction(action, "pointer-down", point);
      }
    });
    this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
      if (!this.isPointerDown || !this.activePointerAction) {
        return;
      }

      this.enqueuePointerAction(
        this.activePointerAction,
        "pointer-move",
        this.getClickScreenPosition(event),
      );
    });
    this.canvas.addEventListener("mouseleave", (event: MouseEvent) => {
      if (!this.activePointerAction) {
        return;
      }

      this.enqueuePointerAction(
        this.activePointerAction,
        "pointer-cancel",
        this.getClickScreenPosition(event),
        { pointerMissed: "true" },
      );
      this.isPointerDown = false;
      this.activePointerAction = null;
    });
    this.canvas.addEventListener("mouseup", (event: MouseEvent) => {
      const point = this.getClickScreenPosition(event);
      const hitAction = this.pickAction(point);

      if (this.activePointerAction && this.isPointerTrackingAction(hitAction)) {
        this.enqueuePointerAction(hitAction, "pointer-up", point);
      }

      if (this.activePointerAction && hitAction !== this.activePointerAction) {
        this.enqueuePointerAction(
          this.activePointerAction,
          "pointer-cancel",
          point,
          { pointerMissed: hitAction ? "false" : "true" },
        );
      }

      this.isPointerDown = false;
      this.activePointerAction = null;
    });
    this.canvas.addEventListener("dblclick", (event: MouseEvent) => {
      const point = this.getClickScreenPosition(event);
      const action = this.pickAction(point);

      if (this.isPointerTrackingAction(action)) {
        this.enqueuePointerAction(action, "double-click", point);
      }
    });
    this.canvas.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
    });
  }
}
