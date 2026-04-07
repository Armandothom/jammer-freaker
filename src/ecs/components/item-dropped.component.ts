import { InventoryResourceType } from "./types/inventory-resource-type.js";


export class ItemDroppedComponent {
    constructor(
        public readonly type: InventoryResourceType,
        public readonly amount: number
    ) { }
}