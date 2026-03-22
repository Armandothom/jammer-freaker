export class CameraComponent {
    public viewportWidth: number;
    public viewportHeight: number;
    public smoothing: number;

    constructor(
        viewportWidth: number = 800,
        viewportHeight: number = 600,
        smoothing: number = 1.0,
    ) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.smoothing = smoothing;
    }
}