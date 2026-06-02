import { BuildingInteractionManager } from "../../game/world-map/buildings/building-interaction-manager.js";
import {
    getBuildingDoorPanelSide,
    type BuildingDoorPanelSide,
    type BuildingTileType,
} from "../../game/world-map/buildings/building-types.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { WorldTilemapManager } from "../../game/world-map/world-tilemap-manager.js";
import type {
    InteractableDoorVisualState,
    InteractableSpriteState,
} from "../components/interactable-component.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

const QUARTER_TURN = Math.PI / 2;
const HALF_TURN = Math.PI;
const FULL_TURN = Math.PI * 2;
const ROTATION_EPSILON = 0.0001;
const DOOR_RENDER_HEIGHT = 7;
const DOOR_VISUAL_Z_LAYER = 2;

type DoorOpenDirection = "north" | "south" | "east" | "west";
type DoorRunAxis = "horizontal" | "vertical";
interface DoorRunPosition {
    index: number;
    length: number;
    startX: number;
    startY: number;
    axis: DoorRunAxis;
}
interface DoorCorner {
    x: number;
    y: number;
}

export class InteractableSetterSystem implements ISystem {
    private readonly interactableEntityIdsByFeatureId = new Map<string, number>();

    constructor(
        private buildingManager: BuildingInteractionManager,
        private worldTilemapManager: WorldTilemapManager,
        private entityFactory: EntityFactory,
    ) {

    }
    update(deltaTime: number): void {
        const activeFeatureIds = new Set<string>();
        const doors = this.buildingManager.getDoors();

        for (const door of doors) {
            activeFeatureIds.add(door.id);

            if (this.interactableEntityIdsByFeatureId.has(door.id)) {
                continue;
            }

            const { closedSpriteState, closedVisualState, openVisualState } = this.resolveDoorStates(
                door.tileX,
                door.tileY,
                door.tileType,
            );
            const entityId = this.entityFactory.createDoor(
                door.tileX,
                door.tileY,
                closedSpriteState,
                closedVisualState,
                openVisualState,
            );

            this.interactableEntityIdsByFeatureId.set(door.id, entityId);
        }

        for (const [featureId, entityId] of this.interactableEntityIdsByFeatureId) {
            if (activeFeatureIds.has(featureId)) {
                continue;
            }

            this.entityFactory.destroyInteractable(entityId);
            this.interactableEntityIdsByFeatureId.delete(featureId);
        }
    }

    reset(): void {
        for (const entityId of this.interactableEntityIdsByFeatureId.values()) {
            this.entityFactory.destroyInteractable(entityId);
        }

        this.interactableEntityIdsByFeatureId.clear();
    }

    private resolveDoorStates(
        tileX: number,
        tileY: number,
        tileType: BuildingTileType | undefined,
    ): {
        closedSpriteState: InteractableSpriteState;
        closedVisualState: InteractableDoorVisualState | undefined;
        openVisualState: InteractableDoorVisualState | undefined;
    } {
        const wallTile = this.worldTilemapManager.getWall(tileX, tileY);
        const closedSpriteState: InteractableSpriteState = {
            rotation: wallTile?.spriteRotation ?? null,
            mirrorX: wallTile?.spriteMirrorX ?? false,
            mirrorY: wallTile?.spriteMirrorY ?? false,
        };
        const openDirection = this.resolveDoorOpenDirection(tileX, tileY, closedSpriteState.rotation);
        const closedVisualState = wallTile
            ? this.resolveDoorClosedVisualState(tileX, tileY, wallTile)
            : undefined;
        const openVisualState = wallTile
            ? this.resolveDoorOpenVisualState(tileX, tileY, wallTile, openDirection, tileType)
            : undefined;

        return {
            closedSpriteState,
            closedVisualState,
            openVisualState,
        };
    }

    private resolveDoorOpenDirection(
        tileX: number,
        tileY: number,
        closedRotation: number | null,
    ): DoorOpenDirection {
        const isVerticalDoor = isQuarterTurn(closedRotation);
        const doorAxis = isVerticalDoor ? "vertical" : "horizontal";
        const doorRun = this.getDoorRunPosition(tileX, tileY, doorAxis);
        const {
            north: northInteriorCount,
            south: southInteriorCount,
            west: westInteriorCount,
            east: eastInteriorCount,
        } = this.getDoorRunInteriorCounts(doorRun);

        if (isVerticalDoor && eastInteriorCount !== westInteriorCount) {
            return eastInteriorCount > westInteriorCount ? "east" : "west";
        }

        if (!isVerticalDoor && southInteriorCount !== northInteriorCount) {
            return southInteriorCount > northInteriorCount ? "south" : "north";
        }

        if (eastInteriorCount !== westInteriorCount) {
            return eastInteriorCount > westInteriorCount ? "east" : "west";
        }

        if (southInteriorCount !== northInteriorCount) {
            return southInteriorCount > northInteriorCount ? "south" : "north";
        }

        if (isVerticalDoor) {
            return (closedRotation ?? 0) > 0 ? "east" : "west";
        }

        return "north";
    }

    private resolveDoorClosedVisualState(
        tileX: number,
        tileY: number,
        wallTile: NonNullable<ReturnType<WorldTilemapManager["getWall"]>>,
    ): InteractableDoorVisualState {
        const tileSize = this.worldTilemapManager.tileSize;
        const { worldX, worldY } = this.worldTilemapManager.tileToWorld(tileX, tileY);
        const rotation = wallTile.spriteRotation ?? null;
        const shouldRotateAroundTileCenter = rotation !== null;
        const pivotX = shouldRotateAroundTileCenter ? tileSize / 2 : 0;
        const pivotY = shouldRotateAroundTileCenter ? tileSize / 2 : 0;

        return {
            spriteName: wallTile.spriteName,
            spriteSheetName: wallTile.spriteSheetName!,
            x: worldX + pivotX,
            y: worldY + pivotY,
            rotation,
            mirrorX: wallTile.spriteMirrorX ?? false,
            mirrorY: wallTile.spriteMirrorY ?? false,
            pivotXFactor: pivotX / tileSize,
            pivotYFactor: pivotY / DOOR_RENDER_HEIGHT,
            zLayer: DOOR_VISUAL_Z_LAYER,
        };
    }

    private resolveDoorOpenVisualState(
        tileX: number,
        tileY: number,
        wallTile: NonNullable<ReturnType<WorldTilemapManager["getWall"]>>,
        openDirection: DoorOpenDirection,
        tileType: BuildingTileType | undefined,
    ): InteractableDoorVisualState {
        const tileSize = this.worldTilemapManager.tileSize;
        const { worldX, worldY } = this.worldTilemapManager.tileToWorld(tileX, tileY);
        const axis = this.resolveOpenDoorRunAxis(openDirection);
        const doorRun = this.getDoorRunPosition(tileX, tileY, axis);
        const doorPanelSide = this.resolveDoorPanelSide(tileType, doorRun);
        const anchor = this.resolveClosedDoorHingePoint(
            worldX,
            worldY,
            tileSize,
            wallTile.spriteRotation ?? null,
            openDirection,
            doorPanelSide,
        );
        const pivot = this.resolveOpenDoorPivot(openDirection, doorPanelSide);

        return {
            spriteName: wallTile.spriteName,
            spriteSheetName: wallTile.spriteSheetName!,
            x: anchor.x,
            y: anchor.y,
            rotation: this.resolveOpenDoorBaseRotation(openDirection),
            mirrorX: wallTile.spriteMirrorX ?? false,
            mirrorY: wallTile.spriteMirrorY ?? false,
            pivotXFactor: pivot.x,
            pivotYFactor: pivot.y,
            zLayer: DOOR_VISUAL_Z_LAYER,
        };
    }

    private resolveClosedDoorHingePoint(
        worldX: number,
        worldY: number,
        tileSize: number,
        closedRotation: number | null,
        openDirection: DoorOpenDirection,
        doorPanelSide: BuildingDoorPanelSide,
    ): { x: number; y: number } {
        const corners = this.resolveClosedDoorCorners(worldX, worldY, tileSize, closedRotation);
        const sideCorners = this.getDoorHingeSideCorners(corners, openDirection);

        if (openDirection === "east" || openDirection === "west") {
            return sideCorners.reduce((selected, corner) => (
                doorPanelSide === "left"
                    ? (corner.y < selected.y ? corner : selected)
                    : (corner.y > selected.y ? corner : selected)
            ));
        }

        return sideCorners.reduce((selected, corner) => (
            doorPanelSide === "left"
                ? (corner.x < selected.x ? corner : selected)
                : (corner.x > selected.x ? corner : selected)
        ));
    }

    private resolveClosedDoorCorners(
        worldX: number,
        worldY: number,
        tileSize: number,
        closedRotation: number | null,
    ): DoorCorner[] {
        return [
            this.resolveClosedDoorCorner(worldX, worldY, tileSize, closedRotation, 0, 0),
            this.resolveClosedDoorCorner(worldX, worldY, tileSize, closedRotation, tileSize, 0),
            this.resolveClosedDoorCorner(worldX, worldY, tileSize, closedRotation, 0, DOOR_RENDER_HEIGHT),
            this.resolveClosedDoorCorner(worldX, worldY, tileSize, closedRotation, tileSize, DOOR_RENDER_HEIGHT),
        ];
    }

    private resolveClosedDoorCorner(
        worldX: number,
        worldY: number,
        tileSize: number,
        closedRotation: number | null,
        localX: number,
        localY: number,
    ): DoorCorner {
        const pivotX = tileSize / 2;
        const pivotY = tileSize / 2;
        const angle = closedRotation ?? 0;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const deltaX = localX - pivotX;
        const deltaY = localY - pivotY;

        return {
            x: worldX + pivotX + (deltaX * cosine) - (deltaY * sine),
            y: worldY + pivotY + (deltaX * sine) + (deltaY * cosine),
        };
    }

    private getDoorHingeSideCorners(
        corners: DoorCorner[],
        openDirection: DoorOpenDirection,
    ): DoorCorner[] {
        switch (openDirection) {
            case "north":
                return this.getExtremeCorners(corners, "y", "min");

            case "south":
                return this.getExtremeCorners(corners, "y", "max");

            case "east":
                return this.getExtremeCorners(corners, "x", "max");

            case "west":
                return this.getExtremeCorners(corners, "x", "min");

            default: {
                const exhaustiveCheck: never = openDirection;
                return exhaustiveCheck;
            }
        }
    }

    private getExtremeCorners(
        corners: DoorCorner[],
        axis: "x" | "y",
        direction: "min" | "max",
    ): DoorCorner[] {
        const extreme = corners.reduce((selected, corner) => (
            direction === "min"
                ? (corner[axis] < selected[axis] ? corner : selected)
                : (corner[axis] > selected[axis] ? corner : selected)
        ))[axis];

        return corners.filter((corner) => Math.abs(corner[axis] - extreme) <= ROTATION_EPSILON);
    }

    private resolveOpenDoorPivot(
        openDirection: DoorOpenDirection,
        doorPanelSide: BuildingDoorPanelSide,
    ): { x: number; y: number } {
        const isLeftPanel = doorPanelSide === "left";

        switch (openDirection) {
            case "north":
                return { x: 1, y: isLeftPanel ? 1 : 0 };

            case "south":
                return { x: 1, y: isLeftPanel ? 0 : 1 };

            case "east":
                return { x: 0, y: isLeftPanel ? 0 : 1 };

            case "west":
                return { x: 0, y: isLeftPanel ? 1 : 0 };

            default: {
                const exhaustiveCheck: never = openDirection;
                return exhaustiveCheck;
            }
        }
    }

    private resolveDoorPanelSide(
        tileType: BuildingTileType | undefined,
        doorRun: DoorRunPosition,
    ): BuildingDoorPanelSide {
        return getBuildingDoorPanelSide(tileType)
            ?? (this.getDoorRunSide(doorRun) < 0 ? "left" : "right");
    }

    private resolveOpenDoorRunAxis(openDirection: DoorOpenDirection): DoorRunAxis {
        return openDirection === "east" || openDirection === "west"
            ? "vertical"
            : "horizontal";
    }

    private getDoorRunPosition(
        tileX: number,
        tileY: number,
        axis: DoorRunAxis,
    ): DoorRunPosition {
        const deltaX = axis === "horizontal" ? 1 : 0;
        const deltaY = axis === "vertical" ? 1 : 0;
        let startX = tileX;
        let startY = tileY;
        let endX = tileX;
        let endY = tileY;

        while (this.isDoorWallTile(startX - deltaX, startY - deltaY)) {
            startX -= deltaX;
            startY -= deltaY;
        }

        while (this.isDoorWallTile(endX + deltaX, endY + deltaY)) {
            endX += deltaX;
            endY += deltaY;
        }

        return {
            index: axis === "horizontal" ? tileX - startX : tileY - startY,
            length: axis === "horizontal" ? endX - startX + 1 : endY - startY + 1,
            startX,
            startY,
            axis,
        };
    }

    private getDoorRunInteriorCounts(
        doorRun: DoorRunPosition,
    ): { north: number; south: number; west: number; east: number } {
        const counts = {
            north: 0,
            south: 0,
            west: 0,
            east: 0,
        };
        const deltaX = doorRun.axis === "horizontal" ? 1 : 0;
        const deltaY = doorRun.axis === "vertical" ? 1 : 0;

        for (let index = 0; index < doorRun.length; index += 1) {
            const tileX = doorRun.startX + (deltaX * index);
            const tileY = doorRun.startY + (deltaY * index);

            counts.north += Number(this.isInteriorGroundTile(tileX, tileY - 1));
            counts.south += Number(this.isInteriorGroundTile(tileX, tileY + 1));
            counts.west += Number(this.isInteriorGroundTile(tileX - 1, tileY));
            counts.east += Number(this.isInteriorGroundTile(tileX + 1, tileY));
        }

        return counts;
    }

    private getDoorRunSide(doorRun: DoorRunPosition): -1 | 1 {
        return doorRun.index < (doorRun.length / 2) ? -1 : 1;
    }

    private resolveOpenDoorBaseRotation(openDirection: DoorOpenDirection): number | null {
        switch (openDirection) {
            case "north":
                return QUARTER_TURN;

            case "south":
                return -QUARTER_TURN;

            case "east":
                return null;

            case "west":
                return HALF_TURN;

            default: {
                const exhaustiveCheck: never = openDirection;
                return exhaustiveCheck;
            }
        }
    }

    private isInteriorGroundTile(tileX: number, tileY: number): boolean {
        if (!this.worldTilemapManager.isWithinTilemap({ tileX, tileY })) {
            return false;
        }

        return this.worldTilemapManager.getTileType(tileX, tileY) === "building_floor";
    }

    private isDoorWallTile(tileX: number, tileY: number): boolean {
        if (!this.worldTilemapManager.isWithinTilemap({ tileX, tileY })) {
            return false;
        }

        return this.worldTilemapManager.getWall(tileX, tileY)?.spriteName === SpriteName.DOOR_1;
    }
}

function normalizeRotation(rotation: number): number | null {
    const normalized = ((((rotation + Math.PI) % FULL_TURN) + FULL_TURN) % FULL_TURN) - Math.PI;

    return Math.abs(normalized) <= ROTATION_EPSILON ? null : normalized;
}

function isQuarterTurn(rotation: number | null): boolean {
    const normalized = Math.abs(normalizeRotation(rotation ?? 0) ?? 0);

    return Math.abs(normalized - QUARTER_TURN) <= ROTATION_EPSILON;
}
