import { CameraManager } from "../../game/world/camera-manager.js";
import { DebugManager } from "../core/debug-manager.js";
import { DebugSettingKey } from "../core/types/debug-manager-settings.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { DebuggerSpawnerOrderType } from "../debugger-orders/types/debugger.js";
import { ISystem } from "./system.interface.js";

export class InputDebugSystem implements ISystem {
    private debugManager: DebugManager;
    private cameraManager: CameraManager;
    private panel: HTMLElement | null;
    private canvas: HTMLCanvasElement | null;
    private spawnEnemyButton: HTMLButtonElement | null;
    private spawnCursorBadge: HTMLElement | null;
    private isInputPanelVisible = false;

    constructor(debugManager: DebugManager, cameraManager : CameraManager) {
        this.debugManager = debugManager;
        this.cameraManager = cameraManager;
        this.panel = document.querySelector<HTMLElement>("#debug-panel");
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas");
        this.spawnEnemyButton = document.querySelector<HTMLButtonElement>("#spawnEnemyButton");
        this.spawnCursorBadge = document.querySelector<HTMLElement>("#spawn-cursor-badge");

        this.initializePanelInputs();
        this.initializeSpawnerUi();
        window.addEventListener("keydown", ((event) => {
            if (event.key.toLowerCase() !== "o" || event.repeat) {
                return;
            }
            event.preventDefault();
            this.isInputPanelVisible = !this.isInputPanelVisible;
            this.syncPanelVisibility();
        }));
    }

    update(_deltaTime: number): void {

    }

    private initializePanelInputs() {
        this.bindDebugCheckbox(DebugSettingKey.SPRITE_BOUNDS);
        this.bindDebugCheckbox(DebugSettingKey.DEBUG_PAINT);
        this.bindDebugCheckbox(DebugSettingKey.AI_PATH);
        this.syncPanelVisibility();
    }

    private initializeSpawnerUi() {
        this.spawnEnemyButton?.addEventListener("click", ((e : MouseEvent) => {
            this.handleSpawnToggleClick(DebuggerSpawnerOrderType.INFANTRY)
        }));
        this.canvas?.addEventListener("mouseenter", this.handleCanvasMouseEnter);
        this.canvas?.addEventListener("mouseleave", this.handleCanvasMouseLeave);
        this.canvas?.addEventListener("mousemove", this.handleCanvasMouseMove);
        this.canvas?.addEventListener("click", this.handleCanvasSpawnClick);
        this.syncSpawnerUi();
    }

    private bindDebugCheckbox(settingKey: DebugSettingKey) {
        const input = document.querySelector<HTMLInputElement>(`#${settingKey}`);
        if (!input) {
            return;
        }

        input.checked = this.debugManager.getDebugSetting(settingKey);
        input.addEventListener("change", () => {
            const currentValue = this.debugManager.getDebugSetting(settingKey);
            if (currentValue !== input.checked) {
                this.debugManager.toggleDebugSetting(settingKey);
            }
        });
    }

    private syncPanelVisibility() {
        if (!this.panel) {
            return;
        }
        this.panel.hidden = !this.isInputPanelVisible;
    }

    private handleSpawnToggleClick(type : DebuggerSpawnerOrderType) {
        this.debugManager.toggleSpawnerState(!this.debugManager.isSpawnerActive, type);
        this.syncSpawnerUi();
    }

    private handleCanvasMouseEnter = (): void => {
        if (!this.debugManager.isSpawnerActive || !this.spawnCursorBadge) {
            return;
        }

        this.spawnCursorBadge.hidden = false;
    }

    private handleCanvasMouseLeave = (): void => {
        if (!this.spawnCursorBadge || !this.debugManager.activeSpawnerType) {
            return;
        }

        this.spawnCursorBadge.hidden = true;
    }

    private handleCanvasSpawnClick = (e : MouseEvent): void => {
        if(!this.debugManager.isSpawnerActive) {
            return;
        }
        const rect = this.canvas!.getBoundingClientRect();
        const viewport = this.cameraManager.getViewport();
        const mousePosX = e.clientX - rect.left;
        const mousePosY = e.clientY - rect.top;
        const worldPosY = mousePosY + viewport.top;
        const worldPosX = mousePosX + viewport.left;
        if(worldPosX < 0 || worldPosY < 0) {
            return;
        }
        OrderDebuggerOrchestrator.insertSpawnOrder([
            {
                x : worldPosX,
                y : worldPosY,
                type : this.debugManager.activeSpawnerType!
            }
        ])
    }

    private handleCanvasMouseMove = (event: MouseEvent): void => {
        if (!this.debugManager.isSpawnerActive || !this.spawnCursorBadge) {
            return;
        }

        this.spawnCursorBadge.hidden = false;
        this.spawnCursorBadge.style.left = `${event.clientX}px`;
        this.spawnCursorBadge.style.top = `${event.clientY}px`;
    }

    private syncSpawnerUi() {
        document.body.classList.toggle("debug-spawner-active", this.debugManager.isSpawnerActive);
        console.log(this.debugManager.activeSpawnerType)
        if (!this.debugManager.isSpawnerActive && this.spawnCursorBadge) {
            this.spawnEnemyButton!.textContent = "Spawn Enemy";
            this.spawnCursorBadge.hidden = true;
        } else {
            switch (this.debugManager.activeSpawnerType) {
                case DebuggerSpawnerOrderType.INFANTRY:
                    this.spawnEnemyButton!.textContent = "Disable Spawn Mode";
                    break;
                default:
                    break;
            }
        }
    }
}
