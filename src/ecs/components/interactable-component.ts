import type { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export enum InteractableKind {
    DOOR = "door",
    CONTAINER = "container",
}

export interface InteractableSpriteState {
    rotation: number | null;
    mirrorX: boolean;
    mirrorY: boolean;
}

export interface InteractableDoorVisualState {
    spriteName: SpriteName;
    spriteSheetName: SpriteSheetName;
    x: number;
    y: number;
    rotation: number | null;
    mirrorX: boolean;
    mirrorY: boolean;
    pivotXFactor: number;
    pivotYFactor: number;
    zLayer: number;
}

export interface InteractableComponentOptions {
    kind: InteractableKind;
    tileX: number;
    tileY: number;
    radius: number;
    targetEntityId?: number | null;
    closedSpriteState?: InteractableSpriteState;
    closedVisualState?: InteractableDoorVisualState;
    openVisualState?: InteractableDoorVisualState;
}

export class InteractableComponent {
    public kind: InteractableKind;
    public tileX: number;
    public tileY: number;
    public radius: number;
    public targetEntityId: number | null;
    public closedSpriteState?: InteractableSpriteState;
    public closedVisualState?: InteractableDoorVisualState;
    public openVisualState?: InteractableDoorVisualState;
    public visualEntityId: number | null;

    constructor(
        options: InteractableComponentOptions,
    ) {
        this.kind = options.kind;
        this.tileX = options.tileX;
        this.tileY = options.tileY;
        this.radius = options.radius;
        this.targetEntityId = options.targetEntityId ?? null;
        this.closedSpriteState = options.closedSpriteState;
        this.closedVisualState = options.closedVisualState;
        this.openVisualState = options.openVisualState;
        this.visualEntityId = null;
    }
}
