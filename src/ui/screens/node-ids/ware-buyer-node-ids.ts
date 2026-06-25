export const WARE_BUYER_SCREEN_ID = "ware-buyer";

export const WARE_BUYER_NODE_IDS = {
  background: "ware-buyer.background",
  content: "ware-buyer.content",
  hoveredItemName: "ware-buyer.hovered-item-name",
  inventoryFrame: "ware-buyer.inventory-frame",
  questButton: "ware-buyer.quest-button",
  returnButton: "ware-buyer.return-button",
  root: "ware-buyer.root",
  saleFrame: "ware-buyer.sale-frame",
  sellButton: "ware-buyer.sell-button",
  storageFrame: "ware-buyer.storage-frame",
  totalValue: "ware-buyer.total-value",
  tabs: {
    backpack: "ware-buyer.tab.backpack",
    campStorage: "ware-buyer.tab.camp-storage",
  },
  dragVisual: {
    icon: "ware-buyer.drag-visual.icon",
    label: "ware-buyer.drag-visual.label",
    quantity: "ware-buyer.drag-visual.quantity",
    root: "ware-buyer.drag-visual.root",
  },
  inventorySlot(slotIndex: number) {
    return {
      icon: `ware-buyer.inventory-slot.${slotIndex}.icon`,
      label: `ware-buyer.inventory-slot.${slotIndex}.label`,
      quantity: `ware-buyer.inventory-slot.${slotIndex}.quantity`,
      root: `ware-buyer.inventory-slot.${slotIndex}.root`,
    };
  },
  saleSlot(slotIndex: number) {
    return {
      icon: `ware-buyer.sale-slot.${slotIndex}.icon`,
      label: `ware-buyer.sale-slot.${slotIndex}.label`,
      quantity: `ware-buyer.sale-slot.${slotIndex}.quantity`,
      root: `ware-buyer.sale-slot.${slotIndex}.root`,
    };
  },
  storageSlot(slotIndex: number) {
    return {
      icon: `ware-buyer.storage-slot.${slotIndex}.icon`,
      label: `ware-buyer.storage-slot.${slotIndex}.label`,
      quantity: `ware-buyer.storage-slot.${slotIndex}.quantity`,
      root: `ware-buyer.storage-slot.${slotIndex}.root`,
    };
  },
} as const;
