export const INVENTORY_OVERLAY_SCREEN_ID = "inventory-overlay";

export const INVENTORY_OVERLAY_NODE_IDS = {
  root: "inventory-overlay.root",
  panelFrame: "inventory-overlay.panel-frame",
  backpackFrame: "inventory-overlay.backpack-frame",
  dragVisual: {
    icon: "inventory-overlay.drag-visual.icon",
    label: "inventory-overlay.drag-visual.label",
    quantity: "inventory-overlay.drag-visual.quantity",
    root: "inventory-overlay.drag-visual.root",
  },
  weaponSlot: (slotIndex: number) => ({
    ammoIcon: `inventory-overlay.weapon-slot.${slotIndex}.ammo-icon`,
    ammoText: `inventory-overlay.weapon-slot.${slotIndex}.ammo-text`,
    icon: `inventory-overlay.weapon-slot.${slotIndex}.icon`,
    magIcon: `inventory-overlay.weapon-slot.${slotIndex}.mag-icon`,
    magText: `inventory-overlay.weapon-slot.${slotIndex}.mag-text`,
    root: `inventory-overlay.weapon-slot.${slotIndex}.root`,
  }),
  backpackSlot: (slotIndex: number) => ({
    icon: `inventory-overlay.backpack-slot.${slotIndex}.icon`,
    label: `inventory-overlay.backpack-slot.${slotIndex}.label`,
    quantity: `inventory-overlay.backpack-slot.${slotIndex}.quantity`,
    root: `inventory-overlay.backpack-slot.${slotIndex}.root`,
  }),
} as const;
