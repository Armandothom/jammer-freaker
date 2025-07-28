import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class WeaponComponent {
    public spriteName: SpriteName;
    public spriteSheetName: SpriteSheetName;
    public animationName: AnimationName;
    public weaponWidth: number;
    public weaponHeight: number;
    constructor(spriteName: SpriteName, spriteSheetName: SpriteSheetName, animationName: AnimationName, weaponWidth: number = 32, weaponHeight: number = 32) {
        this.spriteName = spriteName;
        this.spriteSheetName = spriteSheetName;
        this.animationName = animationName;
        this.weaponWidth = weaponWidth;
        this.weaponHeight = weaponHeight;
    }
}