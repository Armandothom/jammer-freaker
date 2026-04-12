import { getBitmapTextSize } from "../../utils/get-bitmap-text-size.js";
import type { UIDocumentRoot } from "../runtime/ui-document.js";
import type { UINode } from "../runtime/ui-node.js";
import { DEFAULT_UI_THEME, type UITheme } from "../style/ui-theme.js";
import type { UITextVisual } from "../style/ui-visual-types.js";
import {
  normalizePadding,
  type UIAxisAlign,
  type UIChildrenLayout,
  type UIRect,
  type UIViewport,
} from "./ui-layout-types.js";

type UISize = {
  height: number;
  width: number;
};

export class UILayoutEngine {
  constructor(private theme: UITheme = DEFAULT_UI_THEME) { }

  public layoutDocument(roots: UIDocumentRoot[], viewport: UIViewport): void {
    const viewportFrame: UIRect = {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    };

    for (const root of roots) {
      this.layoutNode(root.node, viewportFrame);
    }
  }

  private layoutNode(node: UINode, frame: UIRect): void {
    const size = this.measureNode(node, frame.width, frame.height);
    const rect = this.resolveAnchoredRect(node, frame, size);

    node.resolved = rect;
    this.layoutChildren(node);
  }

  private layoutChildren(node: UINode): void {
    if (node.children.length === 0 || !node.resolved) {
      return;
    }

    const padding = normalizePadding(
      node.layout.padding ?? this.theme.defaultPadding,
    );
    const contentFrame: UIRect = {
      x: node.resolved.x + padding.left,
      y: node.resolved.y + padding.top,
      width: Math.max(0, node.resolved.width - padding.left - padding.right),
      height: Math.max(0, node.resolved.height - padding.top - padding.bottom),
    };
    const childrenLayout = node.layout.childrenLayout ?? this.theme.defaultChildrenLayout;

    switch (childrenLayout.kind) {
      case "stack-x":
        this.layoutStackX(node, contentFrame, childrenLayout);
        return;

      case "stack-y":
        this.layoutStackY(node, contentFrame, childrenLayout);
        return;

      case "absolute":
      case "overlay":
      default:
        for (const child of node.children) {
          this.layoutNode(child, contentFrame);
        }
        return;
    }
  }

  private layoutStackX(
    node: UINode,
    contentFrame: UIRect,
    childrenLayout: Extract<UIChildrenLayout, { kind: "stack-x" }>,
  ): void {
    const visibleChildren = node.children.filter((child) => child.visible);
    const gap = childrenLayout.gap ?? 0;
    let currentX = contentFrame.x;

    for (const child of visibleChildren) {
      const childSize = this.measureNode(child, contentFrame.width, contentFrame.height);
      const childY = this.resolveAlignedOffset(
        contentFrame.y,
        contentFrame.height,
        childSize.height,
        childrenLayout.align,
      );

      this.layoutNodeAt(child, {
        x: currentX,
        y: childY,
        width: childSize.width,
        height: childSize.height,
      });
      currentX += childSize.width + gap;
    }
  }

  private layoutStackY(
    node: UINode,
    contentFrame: UIRect,
    childrenLayout: Extract<UIChildrenLayout, { kind: "stack-y" }>,
  ): void {
    const visibleChildren = node.children.filter((child) => child.visible);
    const gap = childrenLayout.gap ?? 0;
    let currentY = contentFrame.y;

    for (const child of visibleChildren) {
      const childSize = this.measureNode(child, contentFrame.width, contentFrame.height);
      const childX = this.resolveAlignedOffset(
        contentFrame.x,
        contentFrame.width,
        childSize.width,
        childrenLayout.align,
      );

      this.layoutNodeAt(child, {
        x: childX,
        y: currentY,
        width: childSize.width,
        height: childSize.height,
      });
      currentY += childSize.height + gap;
    }
  }

  private layoutNodeAt(node: UINode, rect: UIRect): void {
    node.resolved = rect;
    this.layoutChildren(node);
  }

  private measureNode(
    node: UINode,
    availableWidth: number,
    availableHeight: number,
  ): UISize {
    const width = this.resolveSize(
      node.layout.width,
      availableWidth,
      () => this.measureContentWidth(node, availableWidth, availableHeight),
    );
    const height = this.resolveSize(
      node.layout.height,
      availableHeight,
      () => this.measureContentHeight(node, availableWidth, availableHeight),
    );

    return {
      height: Math.max(0, height),
      width: Math.max(0, width),
    };
  }

  private resolveAnchoredRect(
    node: UINode,
    frame: UIRect,
    size: UISize,
  ): UIRect {
    const anchor = node.layout.anchor ?? "top-left";
    const offsetX = node.layout.offsetX ?? 0;
    const offsetY = node.layout.offsetY ?? 0;
    let x = frame.x + offsetX;
    let y = frame.y + offsetY;

    switch (anchor) {
      case "top-right":
        x = frame.x + frame.width - size.width - offsetX;
        y = frame.y + offsetY;
        break;

      case "bottom-left":
        x = frame.x + offsetX;
        y = frame.y + frame.height - size.height - offsetY;
        break;

      case "bottom-right":
        x = frame.x + frame.width - size.width - offsetX;
        y = frame.y + frame.height - size.height - offsetY;
        break;

      case "center":
        x = frame.x + ((frame.width - size.width) / 2) + offsetX;
        y = frame.y + ((frame.height - size.height) / 2) + offsetY;
        break;

      case "top-left":
      default:
        x = frame.x + offsetX;
        y = frame.y + offsetY;
        break;
    }

    return {
      height: size.height,
      width: size.width,
      x: Math.round(x),
      y: Math.round(y),
    };
  }

  private resolveAlignedOffset(
    frameStart: number,
    frameSize: number,
    contentSize: number,
    align: UIAxisAlign | undefined,
  ): number {
    if (align === "center") {
      return frameStart + Math.round((frameSize - contentSize) / 2);
    }

    if (align === "end") {
      return frameStart + frameSize - contentSize;
    }

    return frameStart;
  }

  private resolveSize(
    sizeValue: number | "fill" | "content" | undefined,
    availableSize: number,
    contentMeasure: () => number,
  ): number {
    if (typeof sizeValue === "number") {
      return sizeValue;
    }

    if (sizeValue === "fill") {
      return availableSize;
    }

    return contentMeasure();
  }

  private measureContentWidth(
    node: UINode,
    availableWidth: number,
    availableHeight: number,
  ): number {
    if (typeof node.visual?.sprite?.width === "number") {
      return node.visual.sprite.width;
    }

    if (node.visual?.text) {
      return this.measureText(node.visual.text).width;
    }

    return this.measureChildren(node, availableWidth, availableHeight).width;
  }

  private measureContentHeight(
    node: UINode,
    availableWidth: number,
    availableHeight: number,
  ): number {
    if (typeof node.visual?.sprite?.height === "number") {
      return node.visual.sprite.height;
    }

    if (node.visual?.text) {
      return this.measureText(node.visual.text).height;
    }

    return this.measureChildren(node, availableWidth, availableHeight).height;
  }

  private measureChildren(
    node: UINode,
    availableWidth: number,
    availableHeight: number,
  ): UISize {
    const visibleChildren = node.children.filter((child) => child.visible);
    if (visibleChildren.length === 0) {
      return {
        height: 0,
        width: 0,
      };
    }

    const padding = normalizePadding(
      node.layout.padding ?? this.theme.defaultPadding,
    );
    const childAvailableWidth = Math.max(0, availableWidth - padding.left - padding.right);
    const childAvailableHeight = Math.max(0, availableHeight - padding.top - padding.bottom);
    const childrenLayout = node.layout.childrenLayout ?? this.theme.defaultChildrenLayout;

    switch (childrenLayout.kind) {
      case "stack-x": {
        const gap = childrenLayout.gap ?? 0;
        let width = 0;
        let maxHeight = 0;

        visibleChildren.forEach((child, index) => {
          const childSize = this.measureNode(child, childAvailableWidth, childAvailableHeight);
          width += childSize.width;
          if (index > 0) {
            width += gap;
          }
          maxHeight = Math.max(maxHeight, childSize.height);
        });

        return {
          height: maxHeight + padding.top + padding.bottom,
          width: width + padding.left + padding.right,
        };
      }

      case "stack-y": {
        const gap = childrenLayout.gap ?? 0;
        let height = 0;
        let maxWidth = 0;

        visibleChildren.forEach((child, index) => {
          const childSize = this.measureNode(child, childAvailableWidth, childAvailableHeight);
          height += childSize.height;
          if (index > 0) {
            height += gap;
          }
          maxWidth = Math.max(maxWidth, childSize.width);
        });

        return {
          height: height + padding.top + padding.bottom,
          width: maxWidth + padding.left + padding.right,
        };
      }

      case "absolute":
      case "overlay":
      default: {
        let maxWidth = 0;
        let maxHeight = 0;

        for (const child of visibleChildren) {
          const childSize = this.measureNode(child, childAvailableWidth, childAvailableHeight);
          maxWidth = Math.max(maxWidth, childSize.width);
          maxHeight = Math.max(maxHeight, childSize.height);
        }

        return {
          height: maxHeight + padding.top + padding.bottom,
          width: maxWidth + padding.left + padding.right,
        };
      }
    }
  }

  private measureText(text: UITextVisual): UISize {
    const fontId = text.fontId ?? this.theme.defaultFontId;
    const scale = text.scale ?? this.theme.defaultTextScale;
    const measured = getBitmapTextSize(text.text, fontId, scale);
    const width = typeof text.maxWidth === "number" && text.maxWidth > 0
      ? Math.min(measured.width, text.maxWidth)
      : measured.width;

    return {
      height: measured.height,
      width,
    };
  }
}
