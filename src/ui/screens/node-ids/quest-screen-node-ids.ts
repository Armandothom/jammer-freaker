export const QUEST_SCREEN_ID = "quest-screen";

function createSlotNodeIds(prefix: string) {
  return {
    icon: `${prefix}.icon`,
    label: `${prefix}.label`,
    quantity: `${prefix}.quantity`,
    root: `${prefix}.root`,
  };
}

export const QUEST_SCREEN_NODE_IDS = {
  background: "quest-screen.background",
  delivery: {
    blocker: "quest-screen.delivery.blocker",
    button: "quest-screen.delivery.button",
    frame: "quest-screen.delivery.frame",
    popup: "quest-screen.delivery.popup",
    title: "quest-screen.delivery.title",
  },
  dragVisual: {
    icon: "quest-screen.drag-visual.icon",
    label: "quest-screen.drag-visual.label",
    quantity: "quest-screen.drag-visual.quantity",
    root: "quest-screen.drag-visual.root",
  },
  finalPreview: {
    bestSources: "quest-screen.final-preview.best-sources",
    objectives: "quest-screen.final-preview.objectives",
    rewards: "quest-screen.final-preview.rewards",
    root: "quest-screen.final-preview.root",
    title: "quest-screen.final-preview.title",
    type: "quest-screen.final-preview.type",
  },
  hoveredItemName: "quest-screen.hovered-item-name",
  inventoryFrame: "quest-screen.inventory-frame",
  mainActionButton: "quest-screen.main-action-button",
  mainPanel: "quest-screen.main-panel",
  quest: {
    bestSources: "quest-screen.quest.best-sources",
    objectives: "quest-screen.quest.objectives",
    rewards: "quest-screen.quest.rewards",
    status: "quest-screen.quest.status",
    title: "quest-screen.quest.title",
    type: "quest-screen.quest.type",
  },
  returnButton: "quest-screen.return-button",
  root: "quest-screen.root",
  storageFrame: "quest-screen.storage-frame",
  tabs: {
    backpack: "quest-screen.tab.backpack",
    campStorage: "quest-screen.tab.camp-storage",
  },
  deliverySlot(slotIndex: number) {
    return createSlotNodeIds(`quest-screen.delivery-slot.${slotIndex}`);
  },
  inventorySlot(slotIndex: number) {
    return createSlotNodeIds(`quest-screen.inventory-slot.${slotIndex}`);
  },
  storageSlot(slotIndex: number) {
    return createSlotNodeIds(`quest-screen.storage-slot.${slotIndex}`);
  },
} as const;
