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
    private enemyMoveButton: HTMLButtonElement | null;
    private spawnCursorBadge: HTMLElement | null;
    private moveCursorBadge: HTMLElement | null;
    private enemyEntityPreviousButton : HTMLElement | null;
    private enemyEntityNextButton : HTMLElement | null;
    private enemyEntityHighlightDiv : HTMLElement | null;
    private isInputPanelVisible = false;

    constructor(debugManager: DebugManager, cameraManager : CameraManager) {
        this.debugManager = debugManager;
        this.cameraManager = cameraManager;
        this.panel = document.querySelector<HTMLElement>("#debug-panel");
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas");
        this.spawnEnemyButton = document.querySelector<HTMLButtonElement>("#spawnEnemyButton");
        this.enemyMoveButton = document.querySelector<HTMLButtonElement>("#enemyMoveButton");
        this.spawnCursorBadge = document.querySelector<HTMLElement>("#spawnCursorBadge");
        this.moveCursorBadge = document.querySelector<HTMLElement>("#moveCursorBadge");
        this.enemyEntityHighlightDiv = document.querySelector<HTMLElement>("#enemyEntityValue");
        this.enemyEntityPreviousButton = document.querySelector<HTMLButtonElement>("#enemyEntityPreviousButton");
        this.enemyEntityNextButton = document.querySelector<HTMLButtonElement>("#enemyEntityNextButton");

        this.initializePanelInputs();
        this.initializeSpawnerUi();
        this.initializeEnemyEntityOptionsUi();
        this.canvas?.addEventListener("mouseenter", this.handleCanvasMouseEnter);
        this.canvas?.addEventListener("mouseleave", this.handleCanvasMouseLeave);
        this.canvas?.addEventListener("mousemove", this.handleCanvasMouseMove);
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


    private handleCanvasMouseMove = (event: MouseEvent): void => {
        if (!this.debugManager.isDebugPointerActive) {
            return;
        }

        if(this.spawnCursorBadge && this.debugManager.isSpawnerPointerActive) {
            this.spawnCursorBadge.hidden = false;
            this.spawnCursorBadge.style.left = `${event.clientX}px`;
            this.spawnCursorBadge.style.top = `${event.clientY}px`;
        }

        if(this.moveCursorBadge && this.debugManager.isMovePointerActive) {
            this.moveCursorBadge.hidden = false;
            this.moveCursorBadge.style.left = `${event.clientX}px`;
            this.moveCursorBadge.style.top = `${event.clientY}px`;
        }
    }

    //--Spawner
    private initializeSpawnerUi() {
        this.spawnEnemyButton?.addEventListener("click", ((e : MouseEvent) => {
            this.handleSpawnToggleClick(DebuggerSpawnerOrderType.INFANTRY)
        }));
        this.canvas?.addEventListener("click", this.handleCanvasSpawnClick);
        this.syncSpawnerUi();
    }

    private handleSpawnToggleClick(type : DebuggerSpawnerOrderType) {
        this.debugManager.toggleSpawnerState(!this.debugManager.isDebugPointerActive, type);
        this.syncSpawnerUi();
    }

    private handleCanvasSpawnClick = (e : MouseEvent): void => {
        if(!this.debugManager.isSpawnerPointerActive) {
            return;
        }
        const coords = this.getWorldCoordFromClick(e);
        if(!coords) {
            return;
        }
        OrderDebuggerOrchestrator.insertSpawnOrder([
            {
                x : coords.worldPosX,
                y : coords.worldPosY,
                type : this.debugManager.activeSpawnerType!
            }
        ])
    }

    private syncSpawnerUi() {
        document.body.classList.toggle("debug-spawner-active", this.debugManager.isDebugPointerActive);
        if (!this.debugManager.isSpawnerPointerActive && this.spawnCursorBadge) {
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

    //!--Spawner



    //--Enemy Entities Options
    private initializeEnemyEntityOptionsUi() {
        this.enemyMoveButton?.addEventListener("click", ((e : MouseEvent) => {
            this.handleMoveToggleClick()
        }));
        this.canvas?.addEventListener("click", this.handleCanvasMouseOrderMove);
        this.enemyEntityNextButton?.addEventListener("click", (() => this.toggleHighlightedEnemy("right")));
        this.enemyEntityPreviousButton?.addEventListener("click", (() => this.toggleHighlightedEnemy("left")));
        this.syncEnemyOptionsUi();
    }

    private toggleHighlightedEnemy(arrowSelected : "left" | "right") {
        this.debugManager.toggleHighlightedEnemy(arrowSelected);
        this.syncEnemyOptionsUi();
    }


    private handleCanvasMouseOrderMove = (e: MouseEvent): void => {
        if (!this.debugManager.isMovePointerActive || !this.moveCursorBadge) {
            return;
        }
        this.moveCursorBadge.hidden = false;
        this.moveCursorBadge.style.left = `${e.clientX}px`;
        this.moveCursorBadge.style.top = `${e.clientY}px`;
        const coords = this.getWorldCoordFromClick(e);
        if(!coords || !this.debugManager.selectedEnemyEntity) {
            return;
        }
        OrderDebuggerOrchestrator.insertMoveOrder([
            {
                x : coords.worldPosX,
                y : coords.worldPosY,
                entityId : this.debugManager.selectedEnemyEntity
            }
        ])
    }


    //!--Enemy Entities Options

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

    private handleMoveToggleClick() {
        this.debugManager.toggleMoveOrderState(!this.debugManager.isMovePointerActive);
        this.syncEnemyOptionsUi();
    }

    private handleCanvasMouseEnter = (): void => {
        if(this.debugManager.isSpawnerPointerActive && this.spawnCursorBadge) {
            this.spawnCursorBadge.hidden = false;
        }
        if(this.debugManager.isMovePointerActive && this.moveCursorBadge) {
            this.moveCursorBadge.hidden = false;
        }
    }

    private handleCanvasMouseLeave = (): void => {
        if(this.spawnCursorBadge && this.debugManager.isSpawnerPointerActive) {
            this.spawnCursorBadge.hidden = true;
        }
        if(this.moveCursorBadge && this.debugManager.isMovePointerActive) {
            this.moveCursorBadge.hidden = true;
        }
    }

    private syncEnemyOptionsUi() {
        if (!this.debugManager.isMovePointerActive && this.moveCursorBadge) {
            this.enemyMoveButton!.textContent = "Move Enemy";
            this.moveCursorBadge.hidden = true;
        } else {
            this.enemyMoveButton!.textContent = "Disable Move Mode";
        }

        if(this.enemyEntityHighlightDiv && this.debugManager.selectedEnemyEntity != null) {
            this.enemyEntityHighlightDiv.textContent = this.debugManager.selectedEnemyEntity.toString();
        }
    }

    private getWorldCoordFromClick(e : MouseEvent) {
        const rect = this.canvas!.getBoundingClientRect();
        const viewport = this.cameraManager.getViewport();
        const mousePosX = e.clientX - rect.left;
        const mousePosY = e.clientY - rect.top;
        const worldPosY = mousePosY + viewport.top;
        const worldPosX = mousePosX + viewport.left;
        if(worldPosX < 0 || worldPosY < 0) {
            return;
        }
        return {
            worldPosY, worldPosX
        }
    }
}
