import { TilemapCoordinates } from "../../../game/world-map/types/tilemap-tile.js";

export type SoldierId = number;

export enum SquadIdleOrder {
  PATROL = 'patrol',
  GUARD = 'guard',
  PREPARING_AMBUSH = 'preparingAmbush',
  REST = 'rest'
}

export enum SquadRole {
  RIFLEMAN = 'rifleman',
  LEADER = 'leader',
  RADIOMAN = 'radioman',
  SAPPER = 'sapper'
}

export class SquadAnchorOffset {
  xOffset!: number
  yOffset!: number
}

export class SquadNpcStats {
  id! : number
  role! : SquadRole
}


export class SquadAnchor {
  currentAnchor! : TilemapCoordinates
  soldier! : Map<SoldierId, SquadAnchorOffset>
}

export class SquadInformation {
  soldierIds! : SquadNpcStats[];
  currentOrder! : SquadIdleOrder;
}

export class SquadActiveInformation {
  soldiers! : SquadNpcStats[];
  currentOrder! : SquadIdleOrder;
}