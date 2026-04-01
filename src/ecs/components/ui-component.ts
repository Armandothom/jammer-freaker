import { UIEntryType, UIType } from "./types/ui-type.js";

export class UIComponent {
    constructor(
        public readonly entryType: UIEntryType,
        public readonly uiType: UIType,
    ) { }
}
