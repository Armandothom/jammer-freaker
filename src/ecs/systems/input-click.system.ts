import { ClickIntentComponent } from "../components/click-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { Rect } from "./types/rect.type.js";

export class InputClickSystem implements ISystem {

    private clickQueue: { x: number, y: number }[] = [];
    private canvas : HTMLCanvasElement;
    constructor(
        private playerComponentStore : ComponentStore<PlayerComponent>,
        private clickIntentComponentStore: ComponentStore<ClickIntentComponent>,) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners()
    };

    update(deltaTime: number): void {
        // Não tem update por frame, é dado pelo initListeners no constructor
    }

    private initListeners() {
        this.canvas.addEventListener("click", (e: MouseEvent) => {
            const playerRes = this.playerComponentStore.getAllEntities();
            const playerId = playerRes[0];
            const rect: Rect = {
                left: this.canvas.getBoundingClientRect().left,
                right: this.canvas.getBoundingClientRect().right,
                top: this.canvas.getBoundingClientRect().top,
                bottom: this.canvas.getBoundingClientRect().bottom,
            }
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            this.clickIntentComponentStore.add(playerId, new ClickIntentComponent(clickX, clickY))
            this.clickQueue.push({ x: clickX, y: clickY });
        });
    }

    public consumeClicks(): { x: number; y: number }[] {
        const clicks = [...this.clickQueue];
        this.clickQueue.length = 0;
        return clicks;
    }
}
