import { SOUND_KEYS, SOUND_VOLUME } from "../../game/asset-manager/consts/sound-mapped.values.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { ItemDroppedComponent } from "../components/item-dropped.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import {
    InventoryResourceType,
    SHOTGUN_SHELLS_PER_BOX,
} from "../components/types/inventory-resource-type.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";
import { Rect } from "./types/rect.type.js";

export class ItemDropUpdateSystem implements ISystem {
    constructor(
        private entityFactory: EntityFactory,
        private spriteManager: SpriteManager,
        private inventoryManager: InventoryManager,
        private itemDroppedComponentStore: ComponentStore<ItemDroppedComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private soundEventBus: SoundEventBus,
    ) {

    }
    update(deltaTime: number): void {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        const inventory = this.inventoryComponentStore.get(playerEntity);
        for (const itemDropped of this.itemDroppedComponentStore.getAllEntities()) {
            const item = this.itemDroppedComponentStore.get(itemDropped);
            if (this.isPlayerOverlappingDroppedItem(itemDropped, playerEntity)) {
                const collectedResource = this.resolveCollectedResource(item);
                const wasCollected = this.inventoryManager.addResource(
                    inventory,
                    collectedResource.type,
                    collectedResource.amount,
                );
                if (!wasCollected) {
                    continue;
                }

                this.soundEventBus.emitSound({
                    key: SOUND_KEYS.ITEM_PICKUP,
                    volume: SOUND_VOLUME.ITEM_PICKUP,
                })
                this.entityFactory.destroyItemDrop(itemDropped);
            }
        }
    }

    private resolveCollectedResource(item: ItemDroppedComponent): {
        type: InventoryResourceType;
        amount: number;
    } {
        if (item.type === InventoryResourceType.ShotgunShellBox) {
            return {
                type: InventoryResourceType.ShotgunShell,
                amount: item.amount * SHOTGUN_SHELLS_PER_BOX,
            };
        }

        return {
            type: item.type,
            amount: item.amount,
        };
    }

    private buildEntityRectFromPosition(entity: number): Rect {
        const position = this.positionComponentStore.get(entity);
        const spriteComponent = this.spriteComponentStore.get(entity);

        const spriteProps = this.spriteManager.getSpriteProperties(
            spriteComponent.spriteName,
            spriteComponent.spriteSheetName,
        );

        const spriteWidth = spriteProps.sprite.originalRenderSpriteWidth;
        const spriteHeight = spriteProps.sprite.originalRenderSpriteHeight;

        const width = spriteWidth;
        const height = spriteHeight;

        return {
            left: position.x,
            right: position.x + width,
            top: position.y,
            bottom: position.y + height,
        };
    }

    private isPlayerOverlappingDroppedItem(itemEntity: number, playerEntity: number): boolean {

        const playerRect = this.buildEntityRectFromPosition(playerEntity);
        const itemRect = this.buildEntityRectFromPosition(itemEntity);

        return this.isRectOverlapping(playerRect, itemRect);
    }

    private isRectOverlapping(a: Rect, b: Rect): boolean {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

}
