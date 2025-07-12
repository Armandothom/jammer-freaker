import { ISystem } from "./system.interface.js";
import { Rect } from "./types/rect.type.js";

export class InputClickSystem implements ISystem {

    private clickQueue: { x: number, y: number }[] = [],

    constructor(
        private canvas: HTMLCanvasElement,
    ) {
        this.initListeners()
    };

    update(deltaTime: number): void {
        // Não tem update por frame, é dado pelo initListeners no constructor
    }

    private initListeners() {
        this.canvas.addEventListener("click", (e: MouseEvent) => {
            ;
            const rect: Rect = {
                left: this.canvas.getBoundingClientRect().left,
                right: this.canvas.getBoundingClientRect().right,
                top: this.canvas.getBoundingClientRect().top,
                bottom: this.canvas.getBoundingClientRect().bottom,
            }
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            this.clickQueue.push({ x: clickX, y: clickY });
        });
    }

    public consumeClicks(): { x: number; y: number }[] {
        const clicks = [...this.clickQueue];
        this.clickQueue.length = 0;
        return clicks;
    }
}
