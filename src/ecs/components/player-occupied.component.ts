export enum PlayerOccupiedKind {
  CONTAINER = "container",
  INVENTORY = "inventory",
}

export class PlayerOccupiedComponent {
  constructor(
    public kind: PlayerOccupiedKind,
    public sourceEntityId: number | null = null,
  ) { }
}
