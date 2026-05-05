export type CrosshairCardinal = "north" | "south" | "east" | "west";

export type CrosshairPoint = {
  x: number;
  y: number;
};

export type CrosshairViewModel = {
  center: CrosshairPoint;
  radius: number;
  visible: boolean;
};
