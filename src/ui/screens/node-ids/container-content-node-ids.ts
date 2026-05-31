export const CONTAINER_CONTENT_SCREEN_ID = "container-content-screen";

export const CONTAINER_CONTENT_NODE_IDS = {
  closeButton: "container-content.close-button",
  closeButtonLabel: "container-content.close-button.label",
  containerFrame: "container-content.container-frame",
  dragVisual: {
    icon: "container-content.drag-visual.icon",
    label: "container-content.drag-visual.label",
    quantity: "container-content.drag-visual.quantity",
    root: "container-content.drag-visual.root",
  },
  hoveredItemName: "container-content.hovered-item-name",
  root: "container-content.root",
  takeAllButton: "container-content.take-all-button",
  slot(slotIndex: number) {
    return {
      icon: `container-content.slot.${slotIndex}.icon`,
      label: `container-content.slot.${slotIndex}.label`,
      quantity: `container-content.slot.${slotIndex}.quantity`,
      root: `container-content.slot.${slotIndex}.root`,
    };
  },
} as const;
