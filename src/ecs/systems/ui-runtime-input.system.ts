import { UIActionRouter } from "../../ui/input/ui-action-router.js";
import { UIInputSystem } from "../../ui/input/ui-input-system.js";
import { ISystem } from "./system.interface.js";

export class UIRuntimeInputSystem implements ISystem {
  constructor(
    private uiInputSystem: UIInputSystem,
    private uiActionRouter: UIActionRouter,
  ) { }

  public reset(): void {
    this.uiInputSystem.reset();
  }

  public update(_deltaTime: number): void {
    for (let action = this.uiInputSystem.consumeAction(); action; action = this.uiInputSystem.consumeAction()) {
      this.uiActionRouter.route(action);
    }
  }
}
