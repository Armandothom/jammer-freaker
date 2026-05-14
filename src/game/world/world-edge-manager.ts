import { SegmentAssignerPath } from './types/segment.js';
import { WorldMapCoordinates } from './types/tilemap-tile.js';
import { WorldTilemapManager } from './world-tilemap-manager.js';

export class WorldEdgeManager {
  private _verticesPositionWallEdge : Array<WorldMapCoordinates> = [];
  constructor(private worldTilemapManager : WorldTilemapManager) {
  }

  public setEdges() {
    this._verticesPositionWallEdge = [];
    const wallEdgeTiles = this.getWallEdgeTiles();
    for (const wallEdgeTile of wallEdgeTiles) {
      const tile = this.worldTilemapManager.getTileFromKey(wallEdgeTile)!;
      const { tileX, tileY } = tile;
      const isFreeTopTile = this.hasNotWallTile(tileX, tileY - 1);
      const isFreeBottomTile = this.hasNotWallTile(tileX, tileY + 1);
      const isFreeLeftTile = this.hasNotWallTile(tileX - 1, tileY);
      const isFreeRightTile = this.hasNotWallTile(tileX + 1, tileY);
      const isFreeTopLeftDiagonal = this.hasNotWallTile(tileX - 1, tileY - 1);
      const isFreeTopRightDiagonal = this.hasNotWallTile(tileX + 1, tileY - 1);
      const isFreeBottomLeftDiagonal = this.hasNotWallTile(tileX - 1, tileY + 1);
      const isFreeBottomRightDiagonal = this.hasNotWallTile(tileX + 1, tileY + 1);
      //Concave edges
      if(isFreeTopTile && isFreeRightTile && isFreeTopRightDiagonal) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "topright"));
      }
      if(isFreeTopTile && isFreeLeftTile && isFreeTopLeftDiagonal) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "topleft"));
      }
      if(isFreeBottomTile && isFreeRightTile && isFreeBottomRightDiagonal) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "bottomright"));
      }
      if(isFreeBottomTile && isFreeLeftTile && isFreeBottomLeftDiagonal) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "bottomleft"));
      }
      //Convex edges
      if(!isFreeRightTile && !isFreeBottomTile && isFreeBottomRightDiagonal) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "bottomright"));
      }
      if(!isFreeRightTile && !isFreeTopTile && isFreeTopRightDiagonal) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "topright"));
      }
      if(!isFreeLeftTile && !isFreeBottomTile && isFreeBottomLeftDiagonal) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "bottomleft"));
      }
      if(!isFreeLeftTile && !isFreeTopTile && isFreeTopLeftDiagonal) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "topleft"));
      }
      //Diagonals with free adjacent tiles only, no need to cover bottoms since top is already covering the edge
      if(!isFreeTopRightDiagonal && isFreeTopTile && isFreeRightTile) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "topright"));
      }
      if(!isFreeTopLeftDiagonal && isFreeTopTile && isFreeLeftTile) {
        this._verticesPositionWallEdge.push(this.getEdgeWorldCoordinate(tileX, tileY, "topleft"));
      }
    }
  }

  private hasNotWallTile(tileX: number, tileY: number): boolean {
    const key = this.worldTilemapManager.setTilemapKey(tileX, tileY);
    const tile = this.worldTilemapManager.getTileFromKey(key);
    return !tile || !this.worldTilemapManager.impassableWallTiles.has(key);
  }

  private getEdgeWorldCoordinate(tileX : number, tileY : number, corner : "topright" | "topleft" | "bottomleft" | "bottomright") : WorldMapCoordinates {
    const worldCoordinates = this.worldTilemapManager.tileToWorld(tileX, tileY);
    const tileBorderDistance = this.worldTilemapManager.tileSize;
    let x = worldCoordinates.worldX;
    let y = worldCoordinates.worldY;
    switch (corner) {
      case "topleft":
        break;
      case "topright":
        x += tileBorderDistance;
        break;
      case "bottomleft":
        y += tileBorderDistance;
        break;
      case "bottomright":
        x += tileBorderDistance;
        y += tileBorderDistance;
        break;
    }
    return {x, y};
  }

  private getWallEdgeTiles() {
    const assignedHorizontalSegments = new Set<string>();
    const assignedVerticalSegments = new Set<string>();
    const edgeTiles = new Set<string>();
    for (const tile of Array.from(this.worldTilemapManager.impassableWallTiles.values())) {
      let distanceFromTile = 1;
      const keyTile = this.worldTilemapManager.setTilemapKey(tile.x, tile.y);
      const segmentPathAssigner : Record<"north" | "south" | "east" | "west", SegmentAssignerPath> = {
      "north" : {
          isFinished : false,
          edge : keyTile
        },
        "south" : {
          isFinished : false,
          edge : keyTile
        },
        "west" : {
          isFinished : false,
          edge : keyTile
        },
        "east" : {
          isFinished : false,
          edge : keyTile
        },
      };
      while(true) {
        this.moveEdgeSegmentDirection(tile.x + distanceFromTile, tile.y, segmentPathAssigner.east, assignedHorizontalSegments);
        this.moveEdgeSegmentDirection(tile.x - distanceFromTile, tile.y, segmentPathAssigner.west, assignedHorizontalSegments);
        this.moveEdgeSegmentDirection(tile.x, tile.y - distanceFromTile, segmentPathAssigner.north, assignedVerticalSegments);
        this.moveEdgeSegmentDirection(tile.x, tile.y + distanceFromTile, segmentPathAssigner.south, assignedVerticalSegments);
        if(segmentPathAssigner.south.isFinished && segmentPathAssigner.north.isFinished &&
           segmentPathAssigner.east.isFinished && segmentPathAssigner.west.isFinished) {
          break;
        }
        distanceFromTile += 1;
      }
      edgeTiles.add(segmentPathAssigner.east.edge);
      edgeTiles.add(segmentPathAssigner.west.edge);
      edgeTiles.add(segmentPathAssigner.north.edge);
      edgeTiles.add(segmentPathAssigner.south.edge);
    }
    return edgeTiles;
  }

  private moveEdgeSegmentDirection(x: number, y: number, segmentPath: SegmentAssignerPath, assignedSegments : Set<string>) {
    const tileKey = this.worldTilemapManager.setTilemapKey(x, y);
    if ((this.worldTilemapManager.maxNumberTilesY < y || this.worldTilemapManager.maxNumberTilesX < x || x < 0 || y < 0) ||
      !this.worldTilemapManager.impassableWallTiles.has(tileKey) || assignedSegments.has(tileKey)) {
      segmentPath.isFinished = true;
    } else {
      segmentPath.edge = tileKey;
      assignedSegments.add(tileKey);
    }
  }

  get verticesPositionWallEdge() {
    return this._verticesPositionWallEdge;
  }
}
