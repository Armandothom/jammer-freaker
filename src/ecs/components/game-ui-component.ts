import { GameUIEntryType, GameUIType } from "./types/game-ui-type.js";

export class GameUIComponent {
    constructor(
        public readonly entryType: GameUIEntryType,
        public readonly gameUiType: GameUIType,
    ) { }
}
