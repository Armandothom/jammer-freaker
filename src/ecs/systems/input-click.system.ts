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
        private intentClickComponentStore: ComponentStore<IntentClickComponent>,
        private clickCooldownMs = 20000,
        private pressTresholdMs = 200,
        private spamTresholdMs = 20000
    ) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners();
    };

    update(deltaTime: number): void {
        this.pressTresholdMs -= deltaTime * 1000;
        if (this.pressTresholdMs < 0) this.pressTresholdMs = 0;

        if (this.isMouseDown && this.pressTresholdMs === 0) {
            this.pushClickIntent(true); // isHold = true
            this.pressTresholdMs = 200;
        }
    }

    private initListeners() {

        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.isMouseDown = true;
            this.updateMousePosition(e);

            if (this.clickCooldownMs === 0) {
                this.pushClickIntent(true); // isHold = true
                this.clickCooldownMs = this.spamTresholdMs;
            }
            // dispara o primeiro com isHold=true
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

            if (this.clickCooldownMs === 0) {
                this.pushClickIntent(false); // isHold = false
                this.clickCooldownMs = this.spamTresholdMs;
            }
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