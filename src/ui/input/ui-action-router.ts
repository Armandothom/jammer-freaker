import type { UIAction, UIActionHandler } from "./ui-action.js";

export class UIActionRouter {
  constructor(private handlers: UIActionHandler[]) { }

  public route(action: UIAction): boolean {
    for (const handler of this.handlers) {
      if (handler.handle(action)) {
        return true;
      }
    }

    return false;
  }
}
