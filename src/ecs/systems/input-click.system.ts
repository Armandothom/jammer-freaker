import { IntentClickComponent } from "../components/intent-click.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class InputClickSystem implements ISystem {

    private clickQueue: { x: number, y: number }[] = [];
    private canvas: HTMLCanvasElement;
    private isMouseDown: boolean = false;
    private currentMousePos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private intentClickComponentStore: ComponentStore<IntentClickComponent>
    ) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners();
    };

    update(deltaTime: number): void {
        // Não tem update por frame, é dado pelo initListeners no constructor e demais eventos
    }

    private initListeners() {
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.isMouseDown = true;
            console.log("[mousedown] registrado");

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.currentMousePos = { x, y };
            this.clickQueue.push({ x, y });
        });

        this.canvas.addEventListener("mouseup", () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener("click", (e: MouseEvent) => {
            this.updateMousePosition(e);
            this.pushClickIntent(false); // isHold = false
        });
    }

    private updateMousePosition = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        this.currentMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    private pushClickIntent(isHold: boolean) {
        const entities = this.playerComponentStore.getAllEntities();
        for (const entity of entities) {
            this.intentClickComponentStore.add(entity, new IntentClickComponent(
                this.currentMousePos.x,
                this.currentMousePos.y,
                isHold
            ))
        }
    }

}
