export class PlayerInitialProperties {
    public hp: number;
    public damage: number;
    public velocity: number;

    constructor() {
        this.hp = 100;
        this.damage = 20;
        this.velocity = 4 * 32 / 60; // 40 tiles in 10 s, initial tileSize = 32 px;
    }

}