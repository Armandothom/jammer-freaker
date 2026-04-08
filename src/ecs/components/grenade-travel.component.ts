export class GrenadeTravelComponent {
    public readonly originX: number;
    public readonly originY: number;
    public readonly targetX: number;
    public readonly targetY: number;
    public readonly totalTravelTime: number;
    public travelTime: number;
    public readonly maxHeight: number;
    public currentRenderOffsetY: number;

    constructor(
        originX: number,
        originY: number,
        targetX: number,
        targetY: number,
        totalTravelTime: number,
        maxHeight: number,
        travelTime: number = 0,
        currentRenderOffsetY: number = 0,
    ) {
        this.originX = originX;
        this.originY = originY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.totalTravelTime = totalTravelTime;
        this.maxHeight = maxHeight;
        this.travelTime = travelTime;
        this.currentRenderOffsetY = currentRenderOffsetY;
    }
}
