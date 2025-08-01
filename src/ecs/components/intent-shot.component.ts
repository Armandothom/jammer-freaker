export class IntentShotComponent {
    constructor(
        public x: number,
        public y: number,
        public isHold: boolean = false, // true = mousedown contínuo, false = clique único
    ) { }
}