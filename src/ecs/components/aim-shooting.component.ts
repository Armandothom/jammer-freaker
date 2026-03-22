export class AimShootingComponent {
    public aimAngle: number;
    public pivotPointSprite : number;

    constructor(aimAngle: number, pivotPointSprite :number = 0) {
        this.aimAngle = aimAngle;
        this.pivotPointSprite = pivotPointSprite;
    }
}