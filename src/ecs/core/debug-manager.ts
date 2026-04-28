import { CameraManager } from "../../game/world/camera-manager.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { PositionComponent } from "../components/position.component.js";
import { DebuggerSpawnerOrderType } from "../debugger-orders/types/debugger.js";
import { ComponentStore } from "./component-store.js";
import { DebugManagerSettings, DebugSettingKey } from "./types/debug-manager-settings.js";

export class DebugManager {
    private _settings = new DebugManagerSettings();
    private _selectedEnemyEntity : number | null = null;
    private _selectedDebugIndex : number = -1;
    private _isMoveOrderActive: boolean = false;
    private _spawnerState : {
        active : boolean
        type : DebuggerSpawnerOrderType | null
    } = {
        active : false,
        type : null
    }; 
    
    constructor(
        private enemyComponentStore : ComponentStore<EnemyComponent>
    ) {
    }


    public toggleDebugSetting(key: DebugSettingKey) {
        switch (key) {
            case DebugSettingKey.SPRITE_BOUNDS:
                this._settings.showSpriteBounds = !this._settings.showSpriteBounds;
                break;
            case DebugSettingKey.AI_PATH:
                this._settings.showAiPath = !this._settings.showAiPath;
                break;
            case DebugSettingKey.DEBUG_PAINT:
                this._settings.showDebugPaint = !this._settings.showDebugPaint;
                break;
            case DebugSettingKey.INSPECT_TILE:
                this._settings.showInspectTile = !this._settings.showInspectTile;
                break;
        }
    }


    public toggleSpawnerState(isActive : boolean, type : DebuggerSpawnerOrderType) {
        this._spawnerState.active = isActive;
        this._spawnerState.type = isActive ? type : null;
    }

    public toggleMoveOrderState(isActive : boolean) {
        this._isMoveOrderActive = isActive;
    }

    public shiftSelectedDebugIndex(direction : "left" | "right") {
        const selectedIndexOffset = direction === "right" ? 1 : -1;
        this._selectedDebugIndex = Math.max(-1, this._selectedDebugIndex + selectedIndexOffset);
    }

    public toggleHighlightedEnemy(arrowSelected : "left" | "right") {
        const options = this.enemyComponentStore.getAllEntities();
        const selectedOptionsIndex = options.findIndex((option) => option == this._selectedEnemyEntity);
        let newSelectedOptionIndex : number;
        if(options.length == 0) {
            return;
        }
        newSelectedOptionIndex = (selectedOptionsIndex + (arrowSelected == 'right' ? 1 : -1)) % options.length;
        this._selectedEnemyEntity = options[newSelectedOptionIndex];
    }

    public getDebugSetting(key: DebugSettingKey) {
        switch (key) {
            case DebugSettingKey.SPRITE_BOUNDS:
                return this._settings.showSpriteBounds;
            case DebugSettingKey.AI_PATH:
                return this._settings.showAiPath;
            case DebugSettingKey.DEBUG_PAINT:
                return this._settings.showDebugPaint;
            case DebugSettingKey.INSPECT_TILE:
                return this._settings.showInspectTile;
        }
    }

    get isDebugPointerActive() {
        return this._spawnerState.active || this._isMoveOrderActive || this._settings.showInspectTile;
    }

    get isSpawnerPointerActive() {
        return this._spawnerState.active;
    }

    get isMovePointerActive() {
        return this._isMoveOrderActive;
    }

    get isInspectTileActive() {
        return this._settings.showInspectTile;
    }

    get activeSpawnerType() {
        return this._spawnerState.type;
    }
    
    get selectedEnemyEntity() {
        return this._selectedEnemyEntity;
    }

    get selectedDebugIndex() {
        return this._selectedDebugIndex;
    }
}
