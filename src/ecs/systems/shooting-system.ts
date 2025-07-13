import { EnemyComponent } from "../components/enemy.component.js";
import { IntentClickComponent } from "../components/intent-click.component.js";
import { IntentShootingComponent } from "../components/intentShootingComponentStore.js";
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
        private intentClickComponentStore: ComponentStore<IntentClickComponent>,
        private intentShootingComponentStore: ComponentStore<IntentShootingComponent>,
        private poisitionComponentStore: ComponentStore<PositionComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>

    ) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners();
    };

    update(deltaTime: number): void {
        if (this.isMouseDown) {
            this.pushShootIntent(true); // isHold = true
        }
        const shootIntents = this.intentShootingComponentStore.getAllEntities();
        for (const shootIntent in shootIntents) {
            this.pushShootIntent(true);
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
        const shooters = this.shooterComponentStore.getAllEntities();
        let playerPos: { x: number, y: number } | undefined;

        for (const shooter of shooters) {

            if (this.playerComponentStore.has(shooter)) {
                playerPos = this.poisitionComponentStore.get(shooter);
                this.intentClickComponentStore.add(shooter, new IntentClickComponent(
                    this.currentMousePos.x,
                    this.currentMousePos.y,
                    isHold
                ))
            }

            if (this.enemyComponentStore.has(shooter)) {
                this.intentShootingComponentStore.add(shooter, new IntentShootingComponent(
                    playerPos!.x,
                    playerPos!.y
                ));
            }
        }
    }
}