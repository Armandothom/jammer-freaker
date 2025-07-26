export class AimShootingComponent {
    public aimAngle: number;
    public offsetAimAngle : number;

    constructor(aimAngle: number, offsetAimAngle :number = 0) {
        this.aimAngle = aimAngle;
        this.offsetAimAngle = offsetAimAngle;
    }
}