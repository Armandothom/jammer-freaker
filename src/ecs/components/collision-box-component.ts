type CollisionBoxConfig = {
    collides?: boolean
    widthFactor?: number
    heightFactor?: number
    offsetX?: number
    offsetY?: number
}

export class CollisionBoxComponent {
    public collides: boolean
    public widthFactor: number
    public heightFactor: number
    public offsetX: number
    public offsetY: number

    constructor(config: CollisionBoxConfig = {}) {
        this.collides = config.collides ?? true
        this.widthFactor = config.widthFactor ?? 0.75
        this.heightFactor = config.heightFactor ?? 0.75
        this.offsetX = config.offsetX ?? 0.125
        this.offsetY = config.offsetY ?? 0.125
    }
}