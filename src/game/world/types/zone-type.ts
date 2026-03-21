export enum ZoneType {
    NorthExterior = 'NorthExterior',
    SouthExterior = 'SouthExterior',
    EastExterior = 'EastExterior',
    WestExterior = 'WestExterior',

    NorthWestCorner = 'NorthWestCorner',
    NorthEastCorner = 'NorthEastCorner',
    SouthWestCorner = 'SouthWestCorner',
    SouthEastCorner = 'SouthEastCorner',

    InnerNorthWest = 'InnerNorthWest',
    InnerNorthEast = 'InnerNorthEast',
    InnerSouthWest = 'InnerSouthWest',
    InnerSouthEast = 'InnerSouthEast',
}

export interface WorldZone {
    zoneGridX: number;
    zoneGridY: number;

    tileX: number;
    tileY: number;

    widthTiles: number;
    heightTiles: number;

    type: ZoneType;
}