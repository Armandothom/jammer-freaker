export type NpcLevel = 1 | 2 | 3;
export enum NpcFaction {
  OPFOR = "opfor",
  BLUFOR = "blufor",
  CIVIL = "civil"
}
export enum NpcGender {
  MALE = "male",
  FEMALE = "female"
}

export class WorldNpc {
  id! : number
  name! : string
  level! : NpcLevel
  faction! : NpcFaction
  gender!: NpcGender
  constructor(id : number, name : string, level : NpcLevel, faction : NpcFaction, gender: NpcGender) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.faction = faction;
    this.gender = gender;
  }
}

export abstract class CreateNpcDto {
  name?: string;
  level?: NpcLevel
  gender?: NpcGender
  faction! : NpcFaction
}