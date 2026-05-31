import { TilemapWallTileState, WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { InteractableComponent, InteractableKind } from "../components/interactable-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

const INTERACTION_RADIUS = 32;
const DOOR_OCCUPANCY_BUFFER = 4;
type GeometryCacheInvalidator = () => void;
type ContainerContentOpener = (containerEntityId: number) => void;
type Rect = { left: number; right: number; top: number; bottom: number };

export class InteractionInputSystem implements ISystem {
    private isEPressed = false;

    constructor(
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private interactableComponentStore: ComponentStore<InteractableComponent>,
        private worldTilemapManager: WorldTilemapManager,
        private entityFactory: EntityFactory,
        private invalidateGeometryCaches: GeometryCacheInvalidator,
        private openContainerContent: ContainerContentOpener,
    ) {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    update(deltaTime: number): void {
        if (!this.isEPressed) {
            return;
        }

        const playerEntities = this.playerComponentStore.getAllEntities();

        if (playerEntities.length === 0) {
            return;
        }

        const playerEntity = playerEntities[0];
        const playerInteractionPoint = this.getPlayerInteractionPoint(playerEntity);

        const interactableEntities = this.interactableComponentStore.getAllEntities();
        let nearestInteractableEntity: number | null = null;
        let nearestDistanceSquared = Number.POSITIVE_INFINITY;

        for (const interactableEntity of interactableEntities) {
            const interactable = this.interactableComponentStore.get(interactableEntity);

            if (this.shouldSkipInteraction(interactable, playerInteractionPoint)) {
                continue;
            }

            const distanceSquared = this.getInteractableDistanceSquared(interactable, playerInteractionPoint);
            const interactionRadius = Math.max(INTERACTION_RADIUS, interactable.radius);

            if (
                distanceSquared <= interactionRadius * interactionRadius &&
                distanceSquared < nearestDistanceSquared
            ) {
                nearestInteractableEntity = interactableEntity;
                nearestDistanceSquared = distanceSquared;
            }
        }

        if (nearestInteractableEntity === null) {
            return;
        }

        this.isEPressed = false;
        this.solveInteraction(nearestInteractableEntity);
    }

    private solveInteraction(entity: number): void {
        const interactable = this.interactableComponentStore.get(entity);

        switch (interactable.kind) {
            case InteractableKind.DOOR:
                this.toggleDoorGroup(interactable);
                return;

            case InteractableKind.CONTAINER:
                this.openContainerContent(interactable.targetEntityId ?? entity);
                return;
        }
    }

    private toggleDoorGroup(origin: InteractableComponent): void {
        const doorGroup = this.getContiguousDoorGroup(origin);
        const shouldOpen = doorGroup.some((door) => !this.isDoorOpen(door));
        const baseState: TilemapWallTileState = shouldOpen
            ? {
                impassable: false,
                seeThrough: true,
                impact: false,
            }
            : {
                impassable: true,
                seeThrough: false,
                impact: true,
            };
        let hasUpdatedDoor = false;

        for (const door of doorGroup) {
            const state: TilemapWallTileState = {
                ...baseState,
                ...(!shouldOpen && door.closedSpriteState
                    ? {
                        spriteRotation: door.closedSpriteState.rotation,
                        spriteMirrorX: door.closedSpriteState.mirrorX,
                        spriteMirrorY: door.closedSpriteState.mirrorY,
                    }
                    : {}),
            };
            const updated = this.worldTilemapManager.setWallTileState(door.tileX, door.tileY, state);

            if (updated) {
                hasUpdatedDoor = true;
                this.syncDoorVisual(door, shouldOpen);
            }
        }

        if (hasUpdatedDoor) {
            this.invalidateGeometryCaches();
        }
    }

    private syncDoorVisual(door: InteractableComponent, isOpen: boolean): void {
        this.worldTilemapManager.setBreakableTileRenderEnabled(door.tileX, door.tileY, false);
        const visualState = isOpen ? door.openVisualState : door.closedVisualState;

        if (!visualState) {
            this.destroyDoorVisual(door);
            return;
        }

        if (door.visualEntityId !== null) {
            this.entityFactory.destroyDoorVisual(door.visualEntityId);
        }

        door.visualEntityId = this.entityFactory.createDoorVisual(visualState);
    }

    private destroyDoorVisual(door: InteractableComponent): void {
        if (door.visualEntityId === null) {
            return;
        }

        this.entityFactory.destroyDoorVisual(door.visualEntityId);
        door.visualEntityId = null;
    }

    private isDoorOpen(door: InteractableComponent): boolean {
        return !this.worldTilemapManager.isWallSolid(door.tileX, door.tileY);
    }

    private shouldSkipInteraction(
        interactable: InteractableComponent,
        playerInteractionPoint: { x: number; y: number },
    ): boolean {
        if (interactable.kind !== InteractableKind.DOOR) {
            return false;
        }

        return this.isPlayerInsideDoorGroupBuffer(interactable, playerInteractionPoint);
    }

    private isPlayerInsideDoorGroupBuffer(
        origin: InteractableComponent,
        playerInteractionPoint: { x: number; y: number },
    ): boolean {
        return this.getContiguousDoorGroup(origin).some((door) => {
            const doorRect = this.getDoorTileRect(door, DOOR_OCCUPANCY_BUFFER);

            return this.isPointInsideRect(playerInteractionPoint, doorRect);
        });
    }

    private getDoorTileRect(door: InteractableComponent, buffer: number): Rect {
        const tileTopLeft = this.worldTilemapManager.tileToWorld(door.tileX, door.tileY);

        return {
            left: tileTopLeft.worldX - buffer,
            right: tileTopLeft.worldX + this.worldTilemapManager.tileSize + buffer,
            top: tileTopLeft.worldY - buffer,
            bottom: tileTopLeft.worldY + this.worldTilemapManager.tileSize + buffer,
        };
    }

    private isPointInsideRect(point: { x: number; y: number }, rect: Rect): boolean {
        return (
            point.x >= rect.left &&
            point.x <= rect.right &&
            point.y >= rect.top &&
            point.y <= rect.bottom
        );
    }

    private getContiguousDoorGroup(origin: InteractableComponent): InteractableComponent[] {
        const doorByTile = new Map<string, InteractableComponent>();

        for (const entity of this.interactableComponentStore.getAllEntities()) {
            const interactable = this.interactableComponentStore.get(entity);

            if (interactable.kind !== InteractableKind.DOOR) {
                continue;
            }

            doorByTile.set(this.getTileKey(interactable.tileX, interactable.tileY), interactable);
        }

        const group: InteractableComponent[] = [];
        const visited = new Set<string>();
        const queue: InteractableComponent[] = [origin];

        while (queue.length > 0) {
            const door = queue.shift()!;
            const key = this.getTileKey(door.tileX, door.tileY);

            if (visited.has(key)) {
                continue;
            }

            visited.add(key);
            group.push(door);

            const neighbors = [
                [door.tileX + 1, door.tileY],
                [door.tileX - 1, door.tileY],
                [door.tileX, door.tileY + 1],
                [door.tileX, door.tileY - 1],
            ];

            for (const [tileX, tileY] of neighbors) {
                const neighbor = doorByTile.get(this.getTileKey(tileX, tileY));

                if (neighbor && !visited.has(this.getTileKey(tileX, tileY))) {
                    queue.push(neighbor);
                }
            }
        }

        return group;
    }

    private getPlayerInteractionPoint(playerEntity: number): { x: number; y: number } {
        const playerPosition = this.positionComponentStore.get(playerEntity);
        const playerSprite = this.spriteComponentStore.getOrNull(playerEntity);

        return {
            x: playerPosition.x + (playerSprite?.width ?? 0) / 2,
            y: playerPosition.y + (playerSprite?.height ?? 0) / 2,
        }
    }

    private getInteractableDistanceSquared(
        interactable: InteractableComponent,
        point: { x: number; y: number },
    ): number {
        const tileTopLeft = this.worldTilemapManager.tileToWorld(interactable.tileX, interactable.tileY);
        const tileRight = tileTopLeft.worldX + this.worldTilemapManager.tileSize;
        const tileBottom = tileTopLeft.worldY + this.worldTilemapManager.tileSize;
        const nearestX = Math.min(Math.max(point.x, tileTopLeft.worldX), tileRight);
        const nearestY = Math.min(Math.max(point.y, tileTopLeft.worldY), tileBottom);
        const dx = nearestX - point.x;
        const dy = nearestY - point.y;

        return dx * dx + dy * dy;
    }

    private getTileKey(tileX: number, tileY: number): string {
        return `${tileX}_${tileY}`;
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        if (event.key.toLowerCase() === "e") {
            this.isEPressed = true;
        }
    };

    private onKeyUp = (event: KeyboardEvent): void => {
        if (event.key.toLowerCase() === "e") {
            this.isEPressed = false;
        }
    };
}
