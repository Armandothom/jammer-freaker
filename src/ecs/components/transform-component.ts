export class TransformComponent {
    constructor(
        public xOffset: number = 0,
        public yOffset: number = 0,
        public rotationOffset: number = 0,
        public rotationPivotX?: number,
        public rotationPivotY?: number,
        public rotationPivotXFactor?: number,
        public rotationPivotYFactor?: number,
    ) {
    }
}
