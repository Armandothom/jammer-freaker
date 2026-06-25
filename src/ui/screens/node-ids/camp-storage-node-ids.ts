export const CAMP_STORAGE_SCREEN_ID = "camp-storage";

export const CAMP_STORAGE_NODE_IDS = {
  background: "camp-storage.background",
  content: "camp-storage.content",
  hoveredItemName: "camp-storage.hovered-item-name",
  inventoryFrame: "camp-storage.inventory-frame",
  inventoryTitle: "camp-storage.inventory-title",
  returnButton: "camp-storage.return-button",
  root: "camp-storage.root",
  storageFrame: "camp-storage.storage-frame",
  storageTitle: "camp-storage.storage-title",
  dragVisual: {
    icon: "camp-storage.drag-visual.icon",
    label: "camp-storage.drag-visual.label",
    quantity: "camp-storage.drag-visual.quantity",
    root: "camp-storage.drag-visual.root",
  },
  inventorySlot(slotIndex: number) {
    return {
      icon: `camp-storage.inventory-slot.${slotIndex}.icon`,
      label: `camp-storage.inventory-slot.${slotIndex}.label`,
      quantity: `camp-storage.inventory-slot.${slotIndex}.quantity`,
      root: `camp-storage.inventory-slot.${slotIndex}.root`,
    };
  },
  storageSlot(slotIndex: number) {
    return {
      icon: `camp-storage.storage-slot.${slotIndex}.icon`,
      label: `camp-storage.storage-slot.${slotIndex}.label`,
      quantity: `camp-storage.storage-slot.${slotIndex}.quantity`,
      root: `camp-storage.storage-slot.${slotIndex}.root`,
    };
  },
} as const;
