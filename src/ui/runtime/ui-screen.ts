import type { UITheme } from "../style/ui-theme.js";
import type { UINode } from "./ui-node.js";

export type UIScreenBuildContext = {
  theme: UITheme;
};

export interface UIScreen {
  readonly id: string;
  build(context: UIScreenBuildContext): UINode;
}
