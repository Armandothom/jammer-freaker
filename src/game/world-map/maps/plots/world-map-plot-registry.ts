import type { BuildingOrientation, BuildingPlotDefinition } from "../../buildings/building-types.js";
import type { WorldMapId } from "../world-map-registry.js";

export interface WorldMapPlotDefinition {
  mapId: WorldMapId;
  tileSize: number;
  plots: BuildingPlotDefinition[];
}

type RawPlotDefinition = {
  id: unknown;
  xMin: unknown;
  yMin: unknown;
  xMax: unknown;
  yMax: unknown;
  orientation: unknown;
};

type RawWorldMapPlotDefinition = {
  mapId: unknown;
  tileSize: unknown;
  plots: unknown;
};

type ImportedJsonModule = {
  default: unknown;
};

const RAW_WORLD_MAP_PLOT_MODULES = import.meta.glob<ImportedJsonModule>(
  "./map_*_plots.json",
  { eager: true },
);

const PLOT_ORIENTATIONS: BuildingOrientation[] = ["north", "south", "east", "west"];

export const WORLD_MAP_PLOT_REGISTRY: Record<WorldMapId, WorldMapPlotDefinition> =
  buildWorldMapPlotRegistry(RAW_WORLD_MAP_PLOT_MODULES);

export function getWorldMapPlots(mapId: WorldMapId): BuildingPlotDefinition[] {
  return WORLD_MAP_PLOT_REGISTRY[mapId]?.plots.map((plot) => ({ ...plot })) ?? [];
}

function buildWorldMapPlotRegistry(
  rawModules: Record<string, ImportedJsonModule>,
): Record<WorldMapId, WorldMapPlotDefinition> {
  const registry: Record<WorldMapId, WorldMapPlotDefinition> = {};

  for (const modulePath of Object.keys(rawModules)) {
    const definition = parseWorldMapPlotDefinition(rawModules[modulePath].default, modulePath);

    if (registry[definition.mapId]) {
      throw new Error(`Duplicate plot definition for map "${definition.mapId}" found in "${modulePath}".`);
    }

    registry[definition.mapId] = definition;
  }

  return registry;
}

function parseWorldMapPlotDefinition(
  raw: unknown,
  sourcePath: string,
): WorldMapPlotDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Invalid world map plot definition in "${sourcePath}".`);
  }

  const rawDefinition = raw as RawWorldMapPlotDefinition;
  const mapId = parseNonEmptyString(rawDefinition.mapId, `${sourcePath}.mapId`);
  const tileSize = parsePositiveInteger(rawDefinition.tileSize, `${sourcePath}.tileSize`);

  if (!Array.isArray(rawDefinition.plots)) {
    throw new Error(`World map plots "${mapId}" must define plots.`);
  }

  const plots = rawDefinition.plots.map((plot, index) => (
    parsePlotDefinition(mapId, tileSize, plot, index)
  ));

  return {
    mapId,
    tileSize,
    plots,
  };
}

function parsePlotDefinition(
  mapId: string,
  tileSize: number,
  raw: unknown,
  index: number,
): BuildingPlotDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Plot "${index}" for map "${mapId}" is invalid.`);
  }

  const rawPlot = raw as RawPlotDefinition;
  const id = parseNonEmptyString(rawPlot.id, `${mapId}.plots[${index}].id`);
  const xMin = parseNonNegativeInteger(rawPlot.xMin, `${mapId}.plots[${index}].xMin`);
  const yMin = parseNonNegativeInteger(rawPlot.yMin, `${mapId}.plots[${index}].yMin`);
  const xMax = parsePositiveInteger(rawPlot.xMax, `${mapId}.plots[${index}].xMax`);
  const yMax = parsePositiveInteger(rawPlot.yMax, `${mapId}.plots[${index}].yMax`);
  const orientation = parsePlotOrientation(rawPlot.orientation, `${mapId}.plots[${index}].orientation`);

  if (xMax <= xMin || yMax <= yMin) {
    throw new Error(`Plot "${id}" for map "${mapId}" has invalid bounds.`);
  }

  if (!isAlignedToTileSize(xMin, tileSize) || !isAlignedToTileSize(yMin, tileSize)) {
    throw new Error(`Plot "${id}" for map "${mapId}" min bounds must align to tileSize.`);
  }

  if (!isAlignedToTileSize(xMax, tileSize) || !isAlignedToTileSize(yMax, tileSize)) {
    throw new Error(`Plot "${id}" for map "${mapId}" max bounds must align to tileSize.`);
  }

  return {
    id,
    xMin,
    yMin,
    xMax,
    yMax,
    orientation,
  };
}

function parsePlotOrientation(value: unknown, path: string): BuildingOrientation {
  if (typeof value !== "string" || PLOT_ORIENTATIONS.indexOf(value as BuildingOrientation) === -1) {
    throw new Error(`"${path}" must be a valid plot orientation.`);
  }

  return value as BuildingOrientation;
}

function parsePositiveInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new Error(`"${path}" must be a positive integer.`);
  }

  return Number(value);
}

function parseNonNegativeInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error(`"${path}" must be a non-negative integer.`);
  }

  return Number(value);
}

function parseNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`"${path}" must be a non-empty string.`);
  }

  return value;
}

function isAlignedToTileSize(value: number, tileSize: number): boolean {
  return value % tileSize === 0;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}
