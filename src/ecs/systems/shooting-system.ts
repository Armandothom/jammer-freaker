import { EnemyComponent } from "../components/enemy.component.js";
import { IntentShotComponent } from "../components/intentShotComponentStore.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class ShootingSystem implements ISystem {

    private canvas: HTMLCanvasElement;
    private isMouseDown: boolean = false;
    private currentMousePos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>

    ) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners();
    };

    update(deltaTime: number): void {
        if (this.isMouseDown) {
            this.pushShotIntent(true); // isHold = true
        }
        const shotIntents = this.intentShotComponentStore.getAllEntities();
        for (const shotIntent in shotIntents) {
            this.pushShotIntent(true);
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
            this.pushShotIntent(false); // isHold = false
        });
    }

    private updateMousePosition = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        this.currentMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    private pushShotIntent(isHold: boolean) {
        const shooters = this.shooterComponentStore.getAllEntities();
        let playerPos: { x: number, y: number } | undefined;

        for (const shooter of shooters) {

            if (this.playerComponentStore.has(shooter)) {
                playerPos = this.positionComponentStore.get(shooter);
                this.intentShotComponentStore.add(shooter, new IntentShotComponent(
                    this.currentMousePos.x,
                    this.currentMousePos.y,
                    isHold
                ))
            }

            if (this.enemyComponentStore.has(shooter)) {
                this.intentShotComponentStore.add(shooter, new IntentShotComponent(
                    playerPos!.x,
                    playerPos!.y,
                    true
                ));
            }
        }
    }
}