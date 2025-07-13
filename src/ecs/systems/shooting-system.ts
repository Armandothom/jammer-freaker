import { EnemyComponent } from "../components/enemy.component.js";
import { IntentClickComponent } from "../components/intent-click.component.js";
import { IntentShootingComponent } from "../components/intentShootingComponentStore.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class ShootingSystem implements ISystem {

    private canvas: HTMLCanvasElement;
    private isMouseDown: boolean = false;
    private currentMousePos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private intentClickComponentStore: ComponentStore<IntentClickComponent>,
        private intentShootingComponentStore: ComponentStore<IntentShootingComponent>,
        private poisitionComponentStore: ComponentStore<PositionComponent>,

    ) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners();
    };

    update(deltaTime: number): void {
        if (this.isMouseDown) {
            this.pushShootIntent(true); // isHold = true
        }
    }

    private initListeners() {

        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.isMouseDown = true;
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener("mouseup", () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener("click", (e: MouseEvent) => {
            this.updateMousePosition(e);
            this.pushShootIntent(false); // isHold = false
        });
    }

    private updateMousePosition = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        this.currentMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    private pushShootIntent(isHold: boolean) {
        const playerEntities = this.playerComponentStore.getAllEntities();
        const enemyEntities = this.enemyComponentStore.getAllEntities()
        let playerPos: { x: number, y: number } | undefined;

        for (const entity of playerEntities) {
            this.intentClickComponentStore.add(entity, new IntentClickComponent(
                this.currentMousePos.x,
                this.currentMousePos.y,
                isHold
            ))
            playerPos = this.poisitionComponentStore.get(entity);
        }

        if (playerPos) {
            for (const entity of enemyEntities) {
                this.intentShootingComponentStore.add(entity, new IntentShootingComponent(playerPos.x, playerPos.y))
            }
        }
    }
}