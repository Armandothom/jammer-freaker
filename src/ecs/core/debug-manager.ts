import { DebuggerSpawnerOrderType } from "../debugger-orders/types/debugger.js";
import { DebugManagerSettings, DebugSettingKey } from "./types/debug-manager-settings.js";

export class DebugManager {
    private settings = new DebugManagerSettings();
    private spawnerState : {
        active : boolean
        type : DebuggerSpawnerOrderType | null
    } = {
        active : false,
        type : null
    }; 
    
    constructor() {
    }


    public toggleDebugSetting(key: DebugSettingKey) {
        switch (key) {
            case DebugSettingKey.SPRITE_BOUNDS:
                this.settings.showSpriteBounds = !this.settings.showSpriteBounds;
                break;
            case DebugSettingKey.AI_PATH:
                this.settings.showAiPath = !this.settings.showAiPath;
                break;
            case DebugSettingKey.DEBUG_PAINT:
                this.settings.showDebugPaint = !this.settings.showDebugPaint;
                break;
        }
    }


    public toggleSpawnerState(isActive : boolean, type : DebuggerSpawnerOrderType) {
        this.spawnerState.active = isActive;
        this.spawnerState.type = isActive ? type : null;
    }

    public getDebugSetting(key: DebugSettingKey) {
        switch (key) {
            case DebugSettingKey.SPRITE_BOUNDS:
                return this.settings.showSpriteBounds;
            case DebugSettingKey.AI_PATH:
                return this.settings.showAiPath;
            case DebugSettingKey.DEBUG_PAINT:
                return this.settings.showDebugPaint;
        }
    }

    get isSpawnerActive() {
        return this.spawnerState.active;
    }

    get activeSpawnerType() {
        return this.spawnerState.type;
    }
}
