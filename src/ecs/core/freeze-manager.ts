export class FreezeManager{
    public gameFrozen: boolean;
    constructor(){
        this.gameFrozen = false;
    }

    public freezeGame(){
        this.gameFrozen = true;
    }
    public unfreezeGame(){
        this.gameFrozen = false;
    }
    public isFrozen(){
        return this.gameFrozen;
    }
}