import type { UIScreen } from "./ui-screen.js";

export class UIScreenRegistry {
  private screens = new Map<string, UIScreen>();

  public register(screen: UIScreen): void {
    if (this.screens.has(screen.id)) {
      throw new Error(`UI screen already registered: ${screen.id}`);
    }

    this.screens.set(screen.id, screen);
  }

  public get(screenId: string): UIScreen {
    const screen = this.screens.get(screenId);

    if (!screen) {
      throw new Error(`UI screen not found: ${screenId}`);
    }

    return screen;
  }
}
