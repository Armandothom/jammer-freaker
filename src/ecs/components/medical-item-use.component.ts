import { InventoryResourceType } from "./types/inventory-resource-type.js";

export class MedicalItemUseComponent {
    public itemApplied: InventoryResourceType;
    public applyTime: number;
    public timer: number = 0;
    constructor(
        itemApplied: InventoryResourceType,
        applyTime: number,
    ) {
        this.itemApplied = itemApplied;
        this.applyTime = applyTime;
    }
}