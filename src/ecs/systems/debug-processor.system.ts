import { CameraManager } from "../../game/world/camera-manager.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { DebugManager } from "../core/debug-manager.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { ISystem } from "./system.interface.js";

export class DebugProcessorSystem implements ISystem {
    private _colorHighlight : string = "#c407ce";
    private _paddingHighlight : number = 5;
    private _highlightLineThickness : number = 5;
    constructor(
        private debugManager: DebugManager, 
        private cameraManager : CameraManager,
        private spriteComponentStore : ComponentStore<SpriteComponent>,
        private positionComponentStore : ComponentStore<PositionComponent>,
        ) {
        this.debugManager = debugManager;
        this.cameraManager = cameraManager;
    }

    update(_deltaTime: number): void {
        this.setHighlightEnemyEntity();
    }

    private setHighlightEnemyEntity() {
        if(!this.debugManager.selectedEnemyEntity) {
            return;
        }
        const entityId = this.debugManager.selectedEnemyEntity;
        const sprite = this.spriteComponentStore.getOrNull(entityId);
        const position = this.positionComponentStore.getOrNull(entityId);
        if(!sprite || !position) {
            return;
        }
        const lineWidth = sprite.width + (this._paddingHighlight * 2);
        const lineHeight = sprite.height + (this._paddingHighlight * 2);
        const startX = position.x - this._paddingHighlight;
        const startY = position.y - this._paddingHighlight;
        const endX = startX + sprite.width + this._paddingHighlight; 
        const endY = startY + sprite.height + this._paddingHighlight;
        if(!this.cameraManager.isWithinViewport(startX, endX, startY, endY)) {
            return;
        }
       OrderDebuggerOrchestrator.insertPaintOrder([
        {
            type : "fill",
            x: startX,
            y : startY,
            width : lineWidth,
            height : this._highlightLineThickness,
            color : this._colorHighlight
        },
        {
            type : "fill",
            x: startX,
            y : startY,
            width : this._highlightLineThickness,
            height : lineHeight,
            color : this._colorHighlight
        },
        {
            type : "fill",
            x: endX,
            y : startY,
            width : this._highlightLineThickness,
            height : lineHeight,
            color : this._colorHighlight
        },
        {
            type : "fill",
            x: startX,
            y : endY,
            width : lineWidth,
            height : this._highlightLineThickness,
            color : this._colorHighlight
        }
       ])
    }
}
