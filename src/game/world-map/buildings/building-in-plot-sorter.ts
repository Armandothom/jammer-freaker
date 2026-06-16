import type { WorldMapId } from "../maps/world-map-registry.js";
import { getWorldMapPlots } from "../maps/plots/world-map-plot-registry.js";
import {
  BUILDING_PLACEMENT_CONFIG,
  BUILDING_TYPE_MAP,
  BUILDING_TYPE_PLACEMENT_ORDER,
  type BuildingName,
  type BuildingType,
} from "./buildings-config.js";
import { BUILDINGS_PER_MAP } from "./buildings-per-map.js";
import {
  getBuildingDefinition,
  getBuildingOrientationDefinition,
} from "./building-registry.js";
import type {
  BuildingDefinition,
  BuildingOrientation,
  BuildingPlacementRect,
  BuildingPlotDefinition,
  BuildingVariationDefinition,
  PlacedBuilding,
} from "./building-types.js";

interface BuildingPlacementCandidate {
  buildingName: BuildingName;
  buildingType: BuildingType;
}

interface BuildingFootprint {
  width: number;
  height: number;
}

export interface RandomLike {
  next(): number;
}

export class MathRandom implements RandomLike {
  next(): number {
    return Math.random();
  }
}

export class BuildingInPlotSorter {
  private readonly missingBuildingWarnings = new Set<BuildingName>();

  constructor(
    private readonly rng: RandomLike = new MathRandom(),
  ) {}

  public generateBuildingsForMap(mapId: WorldMapId): PlacedBuilding[] {
    const distribution = BUILDINGS_PER_MAP[mapId];
    const plots = getWorldMapPlots(mapId);

    if (!distribution || plots.length === 0) {
      return [];
    }

    const placements: PlacedBuilding[] = [];
    const occupiedRects: BuildingPlacementRect[] = [];
    const candidates = this.buildPlacementCandidates(distribution);

    for (const candidate of candidates) {
      const placement = this.tryPlaceBuilding(candidate.buildingName, plots, occupiedRects);

      if (!placement) {
        console.warn(
          `[BuildingInPlotSorter] Unable to place building "${candidate.buildingName}" in map "${mapId}".`,
        );
        continue;
      }

      occupiedRects.push(placement.rect);
      placements.push(placement);
    }

    return placements;
  }

  private buildPlacementCandidates(
    distribution: Record<BuildingName, number>,
  ): BuildingPlacementCandidate[] {
    const candidatesByType = new Map<BuildingType, BuildingPlacementCandidate[]>();

    for (const buildingName of Object.keys(distribution) as BuildingName[]) {
      const buildingType = BUILDING_TYPE_MAP[buildingName];
      const quantity = Math.max(0, Math.floor(distribution[buildingName] ?? 0));

      if (quantity <= 0) {
        continue;
      }

      if (!getBuildingDefinition(buildingName)) {
        this.warnMissingBuildingDefinition(buildingName);
        continue;
      }

      const buildingCandidates = candidatesByType.get(buildingType) ?? [];

      for (let index = 0; index < quantity; index++) {
        buildingCandidates.push({
          buildingName,
          buildingType,
        });
      }

      candidatesByType.set(buildingType, buildingCandidates);
    }

    const orderedCandidates: BuildingPlacementCandidate[] = [];

    for (const buildingType of BUILDING_TYPE_PLACEMENT_ORDER) {
      orderedCandidates.push(...this.shuffle(candidatesByType.get(buildingType) ?? []));
    }

    return orderedCandidates;
  }

  private tryPlaceBuilding(
    buildingName: BuildingName,
    plots: BuildingPlotDefinition[],
    occupiedRects: BuildingPlacementRect[],
  ): PlacedBuilding | null {
    const buildingDefinition = getBuildingDefinition(buildingName);

    if (!buildingDefinition) {
      this.warnMissingBuildingDefinition(buildingName);
      return null;
    }

    const variation = this.pickVariation(buildingDefinition);
    const shuffledPlots = this.shuffle(plots);

    for (const plot of shuffledPlots) {
      const orientationDefinition = getBuildingOrientationDefinition(variation, plot.orientation);

      if (!orientationDefinition) {
        continue;
      }

      const footprint = {
        width: orientationDefinition.width * buildingDefinition.tileSize,
        height: orientationDefinition.height * buildingDefinition.tileSize,
      };
      const rect = this.tryPlaceRect(plot, footprint, occupiedRects);

      if (!rect) {
        continue;
      }

      return {
        buildingName,
        variationId: variation.id,
        variationIndex: variation.variation,
        orientation: plot.orientation,
        plotId: plot.id,
        tileSize: buildingDefinition.tileSize,
        rect,
        tiles: orientationDefinition.tiles,
      };
    }

    return null;
  }

  private tryPlaceRect(
    plot: BuildingPlotDefinition,
    footprint: BuildingFootprint,
    occupiedRects: BuildingPlacementRect[],
  ): BuildingPlacementRect | null {
    const fixedAxisRect = this.resolveSidewalkAlignedRect(plot, footprint);

    if (!fixedAxisRect) {
      return null;
    }

    const candidateRects = this.buildCandidateRects(plot, fixedAxisRect, footprint);

    for (const rect of this.shuffle(candidateRects)) {
      if (this.collidesWithOccupiedRects(rect, occupiedRects)) {
        continue;
      }

      return rect;
    }

    return null;
  }

  private resolveSidewalkAlignedRect(
    plot: BuildingPlotDefinition,
    footprint: BuildingFootprint,
  ): Pick<BuildingPlacementRect, "x" | "y"> | null {
    const sidewalkPadding = BUILDING_PLACEMENT_CONFIG.sidewalkPadding;

    switch (plot.orientation) {
      case "north":
        return {
          x: plot.xMin,
          y: plot.yMin + sidewalkPadding,
        };

      case "south":
        return {
          x: plot.xMin,
          y: plot.yMax - sidewalkPadding - footprint.height,
        };

      case "east":
        return {
          x: plot.xMax - sidewalkPadding - footprint.width,
          y: plot.yMin,
        };

      case "west":
        return {
          x: plot.xMin + sidewalkPadding,
          y: plot.yMin,
        };

      default: {
        const exhaustiveCheck: never = plot.orientation;
        return exhaustiveCheck;
      }
    }
  }

  private buildCandidateRects(
    plot: BuildingPlotDefinition,
    fixedAxisRect: Pick<BuildingPlacementRect, "x" | "y">,
    footprint: BuildingFootprint,
  ): BuildingPlacementRect[] {
    const candidates: BuildingPlacementRect[] = [];

    if (this.isHorizontalSidewalk(plot.orientation)) {
      const minX = plot.xMin;
      const maxX = plot.xMax - footprint.width;

      if (maxX < minX || !this.isRectInsidePlot({ ...fixedAxisRect, ...footprint }, plot)) {
        return [];
      }

      for (const x of this.buildGridPositions(minX, maxX)) {
        candidates.push({
          x,
          y: fixedAxisRect.y,
          width: footprint.width,
          height: footprint.height,
        });
      }

      return candidates;
    }

    const minY = plot.yMin;
    const maxY = plot.yMax - footprint.height;

    if (maxY < minY || !this.isRectInsidePlot({ ...fixedAxisRect, ...footprint }, plot)) {
      return [];
    }

    for (const y of this.buildGridPositions(minY, maxY)) {
      candidates.push({
        x: fixedAxisRect.x,
        y,
        width: footprint.width,
        height: footprint.height,
      });
    }

    return candidates;
  }

  private isRectInsidePlot(
    rect: BuildingPlacementRect,
    plot: BuildingPlotDefinition,
  ): boolean {
    return rect.x >= plot.xMin
      && rect.y >= plot.yMin
      && rect.x + rect.width <= plot.xMax
      && rect.y + rect.height <= plot.yMax;
  }

  private buildGridPositions(min: number, max: number): number[] {
    const gridSize = BUILDING_PLACEMENT_CONFIG.placementGridSize;
    const positions: number[] = [];

    for (let value = min; value <= max; value += gridSize) {
      positions.push(value);
    }

    if (positions[positions.length - 1] !== max) {
      positions.push(max);
    }

    return positions;
  }

  private collidesWithOccupiedRects(
    rect: BuildingPlacementRect,
    occupiedRects: BuildingPlacementRect[],
  ): boolean {
    const padding = BUILDING_PLACEMENT_CONFIG.buildingPadding;

    return occupiedRects.some((occupiedRect) => (
      rect.x < occupiedRect.x + occupiedRect.width + padding
      && rect.x + rect.width + padding > occupiedRect.x
      && rect.y < occupiedRect.y + occupiedRect.height + padding
      && rect.y + rect.height + padding > occupiedRect.y
    ));
  }

  private isHorizontalSidewalk(orientation: BuildingOrientation): boolean {
    return orientation === "north" || orientation === "south";
  }

  private pickVariation(
    buildingDefinition: BuildingDefinition,
  ): BuildingVariationDefinition {
    const variationIndex = this.randomInt(0, buildingDefinition.variations.length - 1);
    return buildingDefinition.variations[variationIndex];
  }

  private warnMissingBuildingDefinition(buildingName: BuildingName): void {
    if (this.missingBuildingWarnings.has(buildingName)) {
      return;
    }

    this.missingBuildingWarnings.add(buildingName);
    console.warn(`[BuildingInPlotSorter] Missing building definition for "${buildingName}".`);
  }

  private shuffle<T>(items: T[]): T[] {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = this.randomInt(0, index);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
  }

  private randomInt(min: number, max: number): number {
    if (max <= min) {
      return min;
    }

    return Math.floor(this.rng.next() * (max - min + 1)) + min;
  }
}
