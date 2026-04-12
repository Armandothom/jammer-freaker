import { UILayoutEngine } from "../layout/ui-layout-engine.js";
import type { UIViewport } from "../layout/ui-layout-types.js";
import { DEFAULT_UI_THEME, type UITheme } from "../style/ui-theme.js";
import {
  UIDocument,
  type UIDocumentRoot,
  type UIRenderableNode,
} from "./ui-document.js";
import type { UIScreen } from "./ui-screen.js";
import { UIScreenRegistry } from "./ui-screen-registry.js";

export class UIRuntime {
  private baseScreenId: string | null = null;
  private document = new UIDocument();
  private layoutEngine: UILayoutEngine;
  private overlayScreenIds: string[] = [];
  private screenRegistry = new UIScreenRegistry();
  private viewport: UIViewport = {
    height: 0,
    width: 0,
  };

  constructor(private theme: UITheme = DEFAULT_UI_THEME) {
    this.layoutEngine = new UILayoutEngine(theme);
  }

  public clearOverlays(): void {
    if (this.overlayScreenIds.length === 0) {
      return;
    }

    this.overlayScreenIds = [];
    this.rebuildDocument();
  }

  public getDocument(): UIDocument {
    return this.document;
  }

  public getRenderableNodes(): UIRenderableNode[] {
    return this.document.getRenderableNodes();
  }

  public popOverlay(screenId?: string): void {
    if (this.overlayScreenIds.length === 0) {
      return;
    }

    if (!screenId) {
      this.overlayScreenIds.pop();
      this.rebuildDocument();
      return;
    }

    const nextOverlayIds = this.overlayScreenIds.filter((id) => id !== screenId);
    if (nextOverlayIds.length === this.overlayScreenIds.length) {
      return;
    }

    this.overlayScreenIds = nextOverlayIds;
    this.rebuildDocument();
  }

  public pushOverlay(screenId: string): void {
    if (this.overlayScreenIds.indexOf(screenId) !== -1) {
      return;
    }

    this.overlayScreenIds.push(screenId);
    this.rebuildDocument();
  }

  public registerScreen(screen: UIScreen): void {
    this.screenRegistry.register(screen);
  }

  public reset(): void {
    this.baseScreenId = null;
    this.overlayScreenIds = [];
    this.document.clear();
  }

  public relayout(): void {
    this.layout();
  }

  public setBaseScreen(screenId: string | null): void {
    if (this.baseScreenId === screenId) {
      return;
    }

    this.baseScreenId = screenId;
    this.rebuildDocument();
  }

  public updateViewport(width: number, height: number): void {
    if (this.viewport.width === width && this.viewport.height === height) {
      return;
    }

    this.viewport = {
      height,
      width,
    };
    this.layout();
  }

  private buildDocumentRoot(
    screenId: string,
    layer: UIDocumentRoot["layer"],
  ): UIDocumentRoot {
    const screen = this.screenRegistry.get(screenId);
    const node = screen.build({
      theme: this.theme,
    });

    return {
      layer,
      node,
      screenId,
    };
  }

  private layout(): void {
    this.layoutEngine.layoutDocument(this.document.getRoots(), this.viewport);
  }

  private rebuildDocument(): void {
    const roots: UIDocumentRoot[] = [];

    if (this.baseScreenId) {
      roots.push(this.buildDocumentRoot(this.baseScreenId, "base"));
    }

    for (const overlayScreenId of this.overlayScreenIds) {
      roots.push(this.buildDocumentRoot(overlayScreenId, "overlay"));
    }

    this.document.setRoots(roots);
    this.layout();
  }
}
