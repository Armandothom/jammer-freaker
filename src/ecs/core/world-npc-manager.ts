import { femaleFirstName } from "../../game/npc-names/female-first-name.js";
import { maleFirstName } from "../../game/npc-names/male-first-name.js";
import { surnames } from "../../game/npc-names/surnames.js";
import { MathUtils } from "../../utils/shared/math-utils.js";
import { CreateNpcDto, NpcGender, NpcLevel, WorldNpc } from "./types/npc.model.js";

export class WorldNpcManager {
    private _lastId = 0;
    private _npcStore = new Map<number, WorldNpc>();
    private readonly _maleNameList = maleFirstName;
    private readonly _femaleNameList = femaleFirstName;
    private readonly _surnameList = surnames;
    constructor() {
    }

    private generateNpcId() {
        const id = this._lastId;
        this._lastId += 1;
        return id;
    }

    private generateRandomName(gender : NpcGender) {
        let surname = this._surnameList[MathUtils.randomIntBetween(0, this._surnameList.length)].name;
        let name : string = 'Sasha'; //fallback
        if(gender == NpcGender.FEMALE) {
            name = this._femaleNameList[MathUtils.randomIntBetween(0, this._femaleNameList.length)].name;
        } else {
            name = this._maleNameList[MathUtils.randomIntBetween(0, this._maleNameList.length)].name;
        }
        return `${name} ${surname}`;
    }

    public createNpc(dto : CreateNpcDto) {
        const gender = dto.gender ?? NpcGender.FEMALE;
        const name = dto.name ?? this.generateRandomName(gender);
        const level = dto.level ?? MathUtils.randomIntBetween(1, 3) as NpcLevel;
        const npc = new WorldNpc(
            this.generateNpcId(),
            name,
            level,
            dto.faction,
            gender
        )
        this._npcStore.set(npc.id, npc);
        return npc;
    }
}
