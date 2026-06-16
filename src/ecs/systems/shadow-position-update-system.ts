import { SPRITESHEET_MAPPED_VALUES } from "../../game/asset-manager/consts/sprite-mapped-values.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { ParentEntityComponent } from "../components/parent-entity-component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShadowComponent } from "../components/shadow-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { resolveShadowPosition } from "../core/shadow-position-resolver.js";
import { ISystem } from "./system.interface.js";


export class ShadowPositionUpdateSystem implements ISystem {
    constructor(
        private shadowComponentStore: ComponentStore<ShadowComponent>,
        private parentEntityComponentStore: ComponentStore<ParentEntityComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
    ) {
    }
    update(deltaTime: number): void {
        const spriteSheet = SPRITESHEET_MAPPED_VALUES.get(SpriteSheetName.SHADOWS);
        const spriteData = spriteSheet?.sprites.get(SpriteName.SHADOW_1);
        const offsetY = spriteData?.spriteCellOffset.offsetY;
        for (const shadowEntity of this.shadowComponentStore.getAllEntities()) {
            const shadowSprite = this.spriteComponentStore.get(shadowEntity);
            const parentEntityId = this.parentEntityComponentStore.get(shadowEntity).parentEntityId;
            const parentSprite = this.spriteComponentStore.get(parentEntityId);
            const parentPosition = this.getParentEntityPosition(parentEntityId);
            const newShadowPosition = resolveShadowPosition(
                parentPosition.x,
                parentPosition.y,
                parentSprite.width,
                parentSprite.height,
                shadowSprite.width,
                shadowSprite.height,
                offsetY!,
            );
            this.positionComponentStore.get(shadowEntity).x = newShadowPosition.x;
            this.positionComponentStore.get(shadowEntity).y = newShadowPosition.y;
        }
    }

    private getParentEntityPosition(parentEntityId: number): PositionComponent {
        const position = this.positionComponentStore.get(parentEntityId);
        return position;
    }
}