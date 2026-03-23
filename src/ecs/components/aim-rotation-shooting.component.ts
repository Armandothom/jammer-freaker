export class AimRotationShootingComponent {
    public aimAngle: number;
    public pivotPointSprite : number;

    constructor(aimAngle: number, pivotPointSprite : number) {
        this.aimAngle = aimAngle;
        this.pivotPointSprite = pivotPointSprite;
    }
}