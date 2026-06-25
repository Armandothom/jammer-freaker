import { getLootItemCategory } from "../../../ecs/components/types/loot-item-category.js";
import type { LootTableItemId } from "./loot-tables.js";

export function formatLootItemName(itemId: LootTableItemId): string {
  return `${itemId}`
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatLootItemDetails(itemId: LootTableItemId): string {
  const itemName = formatLootItemName(itemId);
  const itemCategory = getLootItemCategory(itemId);

  return itemCategory
    ? `${itemName}\n${itemCategory}`
    : itemName;
}

export function formatLootItemAbbreviation(itemId: LootTableItemId): string {
  const words = formatLootItemName(itemId).split(" ").filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0] ?? "").slice(0, 2).toUpperCase();
}
