export type UIAction = {
  type: string;
  payload?: Record<string, string>;
};

export type UIInteraction = {
  action: UIAction;
  disabled?: boolean;
};

export interface UIActionHandler {
  handle(action: UIAction): boolean;
}
