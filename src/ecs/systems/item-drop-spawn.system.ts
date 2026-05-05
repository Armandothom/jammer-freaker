import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { ItemDropIntentComponent } from "../components/item-drop-intent.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { DroppedResource, ItemDropRateTable } from "../components/types/item-drop-rate-table.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class ItemDropSpawnSystem implements ISystem {
    constructor(
        private entityFactory: EntityFactory,
        private itemDropIntentComponentStore: ComponentStore<ItemDropIntentComponent>,
    ) {

    }
    update(deltaTime: number): void {
        for (const itemDropIntent of this.itemDropIntentComponentStore.getAllEntities()) {
            const dropResult = this.rollDrop();
            const dropIntent = this.itemDropIntentComponentStore.get(itemDropIntent);
            const whereX = dropIntent.whereX
            const whereY = dropIntent.whereY - dropIntent.offsetY;
            this.itemDropIntentComponentStore.remove(itemDropIntent);
            if (!dropResult) return;
            if (dropResult.type === InventoryResourceType.PistolMag) {
                this.entityFactory.createItemDrop(whereX, whereY, dropResult.type, dropResult.amount, SpriteName.PISTOL_MAG_DROP_1, SpriteSheetName.PISTOL_MAG_DROP, AnimationName.PISTOL_MAG_DROPPED);
            }
            if (dropResult.type === InventoryResourceType.SmgMag) {
                this.entityFactory.createItemDrop(whereX, whereY, dropResult.type, dropResult.amount, SpriteName.SMG_MAG_DROP_1, SpriteSheetName.SMG_MAG_DROP, AnimationName.SMG_MAG_DROPPED);
            }
            if (dropResult.type === InventoryResourceType.RifleMag) {
                this.entityFactory.createItemDrop(whereX, whereY, dropResult.type, dropResult.amount, SpriteName.RIFLE_MAG_DROP_1, SpriteSheetName.RIFLE_MAG_DROP, AnimationName.RIFLE_MAG_DROPPED);
            }
            if (dropResult.type === InventoryResourceType.SniperMag) {
                this.entityFactory.createItemDrop(whereX, whereY, dropResult.type, dropResult.amount, SpriteName.SNIPER_MAG_DROP_1, SpriteSheetName.SNIPER_MAG_DROP, AnimationName.SNIPER_MAG_DROPPED);
            }
            if (dropResult.type === InventoryResourceType.ShotgunShellBox) {
                this.entityFactory.createItemDrop(whereX, whereY, dropResult.type, dropResult.amount, SpriteName.SHOTGUN_SHELLBOX_DROP_1, SpriteSheetName.SHOTGUN_SHELLBOX_DROP, AnimationName.SHOTGUN_SHELLBOX_DROPPED);
            }
            if (dropResult.type === InventoryResourceType.Grenade) {
                this.entityFactory.createItemDrop(whereX, whereY, dropResult.type, dropResult.amount, SpriteName.GRENADE_DROP_1, SpriteSheetName.GRENADE_DROP, AnimationName.GRENADE_DROPPED);
            }
            if (dropResult.type === InventoryResourceType.Money) {
                this.entityFactory.createItemDrop(whereX, whereY, dropResult.type, dropResult.amount, SpriteName.MONEY_DROP_1, SpriteSheetName.MONEY_DROP, AnimationName.MONEY_DROPPED);
            }

        }
    }

    private rollDrop(): DroppedResource | null {
        const keys = Object.keys(ItemDropRateTable) as InventoryResourceType[];

        let totalChance = 0;

        for (const key of keys) {
            totalChance += ItemDropRateTable[key].chance;
        }

        const roll = Math.random() * totalChance;

        let accumulated = 0;

        for (const key of keys) {
            const entry = ItemDropRateTable[key];
            accumulated += entry.chance;

            if (roll <= accumulated) {
                return {
                    type: key,
                    amount: entry.quantity,
                };
            }
        }

        return null;
    }

}