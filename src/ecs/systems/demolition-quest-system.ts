import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { BuildingInteractionManager } from "../../game/world-map/buildings/building-interaction-manager.js";
import { isBuildingName, type BuildingName, } from "../../game/world-map/buildings/buildings-config.js";
import type { BuildingPlacementRect, PlacedBuilding, } from "../../game/world-map/buildings/building-types.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { ActiveQuestComponent } from "../components/active-quest-component.js";
import { DemolitionBombComponent } from "../components/demolition-bomb.component.js";
import { DemolitionPlantComponent } from "../components/demolition-plant.component.js";
import { DemolitionPromptComponent } from "../components/demolition-prompt.component.js";
import { MedicalItemUseComponent } from "../components/medical-item-use.component.js";
import { MovementInputComponent } from "../components/movement-input.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { QuestObjectiveCompletedIntentComponent } from "../components/quest-objective-completed-intent.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { QUEST_CONFIG, QuestType, } from "../components/types/quest-config.js";
import { WeaponType } from "../components/types/weapon-config.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

const PLANT_KEY = "KeyB";
const PLANT_TIME_SECONDS = 2;
const BOMB_FUSE_SECONDS = 10;
const DEMOLITION_DAMAGE = 1000;

export class DemolitionQuestSystem implements ISystem {
  private pressedKeys = new Set<string>();
  private previousPressedKeys = new Set<string>();
  private readonly unavailableBuildingInstanceIds = new Set<string>();

  constructor(
    private activeQuestComponent: ActiveQuestComponent,
    private buildingInteractionManager: BuildingInteractionManager,
    private entityFactory: EntityFactory,
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private movementInputComponentStore: ComponentStore<MovementInputComponent>,
    private medicalItemUseComponentStore: ComponentStore<MedicalItemUseComponent>,
    private demolitionPromptComponentStore: ComponentStore<DemolitionPromptComponent>,
    private demolitionPlantComponentStore: ComponentStore<DemolitionPlantComponent>,
    private demolitionBombComponentStore: ComponentStore<DemolitionBombComponent>,
    private questObjectiveCompletedIntentComponentStore: ComponentStore<QuestObjectiveCompletedIntentComponent>,
  ) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  public update(deltaTime: number): void {
    const playerEntity = this.getPlayerEntity();

    if (playerEntity == null) {
      this.demolitionPromptComponentStore.clear();
      this.syncInputFrame();
      return;
    }

    this.updatePlanting(playerEntity, deltaTime);
    this.updateBomb(playerEntity, deltaTime);
    this.handlePlantInput(playerEntity);
    this.updatePrompt(playerEntity);
    this.syncInputFrame();
  }

  public destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  public reset(): void {
    this.unavailableBuildingInstanceIds.clear();
    this.pressedKeys.clear();
    this.previousPressedKeys.clear();
  }

  private updatePlanting(playerEntity: number, deltaTime: number): void {
    const plant = this.demolitionPlantComponentStore.getOrNull(playerEntity);

    if (!plant) {
      return;
    }

    if (this.playerMoved(playerEntity) || !this.isPlayerInsideBuilding(playerEntity, plant.rect)) {
      this.demolitionPlantComponentStore.remove(playerEntity);
      this.unavailableBuildingInstanceIds.delete(plant.buildingInstanceId);
      return;
    }

    plant.timer += deltaTime;

    if (plant.timer < plant.applyTime) {
      return;
    }

    this.demolitionPlantComponentStore.remove(playerEntity);
    this.demolitionBombComponentStore.add(
      playerEntity,
      new DemolitionBombComponent(
        plant.buildingInstanceId,
        plant.buildingName,
        plant.rect,
        BOMB_FUSE_SECONDS,
      ),
    );
  }

  private updateBomb(playerEntity: number, deltaTime: number): void {
    const bomb = this.demolitionBombComponentStore.getOrNull(playerEntity);

    if (!bomb) {
      return;
    }

    bomb.timer += deltaTime;

    if (bomb.timer < bomb.fuseTime) {
      return;
    }

    this.demolitionBombComponentStore.remove(playerEntity);
    this.unavailableBuildingInstanceIds.add(bomb.buildingInstanceId);
    this.emitDemolitionObjectiveCompleted(playerEntity, bomb.buildingName);
    this.createDemolitionHitbox(playerEntity, bomb.rect);
  }

  private handlePlantInput(playerEntity: number): void {
    if (!this.wasKeyPressedThisFrame(PLANT_KEY)) {
      return;
    }

    if (
      this.demolitionPlantComponentStore.has(playerEntity)
      || this.demolitionBombComponentStore.has(playerEntity)
      || this.medicalItemUseComponentStore.has(playerEntity)
    ) {
      return;
    }

    const targetBuilding = this.getCurrentTargetBuilding(playerEntity);

    if (!targetBuilding) {
      return;
    }

    this.demolitionPlantComponentStore.add(
      playerEntity,
      new DemolitionPlantComponent(
        targetBuilding.instanceId,
        targetBuilding.placement.buildingName,
        { ...targetBuilding.placement.rect },
        PLANT_TIME_SECONDS,
      ),
    );
    this.unavailableBuildingInstanceIds.add(targetBuilding.instanceId);
  }

  private updatePrompt(playerEntity: number): void {
    if (
      this.demolitionPlantComponentStore.has(playerEntity)
      || this.demolitionBombComponentStore.has(playerEntity)
      || this.medicalItemUseComponentStore.has(playerEntity)
    ) {
      this.demolitionPromptComponentStore.remove(playerEntity);
      return;
    }

    const targetBuilding = this.getCurrentTargetBuilding(playerEntity);

    if (!targetBuilding) {
      this.demolitionPromptComponentStore.remove(playerEntity);
      return;
    }

    this.demolitionPromptComponentStore.add(
      playerEntity,
      new DemolitionPromptComponent(targetBuilding.instanceId),
    );
  }

  private createDemolitionHitbox(playerEntity: number, rect: BuildingPlacementRect): void {
    this.entityFactory.createHitBox(
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      {
        animationName: AnimationName.GRENADE_EXPLOSION,
        awaitAnimationEnd: AnimationName.GRENADE_EXPLOSION,
        damage: DEMOLITION_DAMAGE,
        damageSource: WeaponType.GRENADE,
        loop: false,
        markAsGrenadeExplosion: true,
        shooterEntityId: playerEntity,
        spriteName: SpriteName.GRENADE_EXPLOSION_1,
        spriteSheetName: SpriteSheetName.GRENADE_EXPLOSION,
        trackHits: true,
        zLayer: 4,
      },
    );
  }

  private emitDemolitionObjectiveCompleted(playerEntity: number, buildingName: BuildingName): void {
    for (const questId of this.activeQuestComponent.getActiveQuestIds()) {
      const quest = QUEST_CONFIG[questId];

      if (quest.type !== QuestType.DEMOLITION) {
        continue;
      }

      const objectiveIndex = quest.objectives.findIndex((objective) => {
        return "target" in objective && objective.target === buildingName;
      });

      if (objectiveIndex === -1) {
        continue;
      }

      this.questObjectiveCompletedIntentComponentStore.add(
        playerEntity,
        new QuestObjectiveCompletedIntentComponent(questId, objectiveIndex, 1),
      );
      return;
    }
  }

  private getCurrentTargetBuilding(
    playerEntity: number,
  ): { instanceId: string; placement: PlacedBuilding } | null {
    const targetBuildingNames = this.getActiveDemolitionBuildingNames();

    if (targetBuildingNames.size === 0) {
      return null;
    }

    const playerPoint = this.getPlayerCenter(playerEntity);

    if (!playerPoint) {
      return null;
    }

    for (const placement of this.buildingInteractionManager.getPlacedBuildings()) {
      if (!targetBuildingNames.has(placement.buildingName)) {
        continue;
      }

      const instanceId = this.getBuildingInstanceId(placement);

      if (this.unavailableBuildingInstanceIds.has(instanceId)) {
        continue;
      }

      if (this.containsPoint(placement.rect, playerPoint.x, playerPoint.y)) {
        return { instanceId, placement };
      }
    }

    return null;
  }

  private getActiveDemolitionBuildingNames(): Set<BuildingName> {
    const targets = new Set<BuildingName>();

    for (const questId of this.activeQuestComponent.getActiveQuestIds()) {
      const quest = QUEST_CONFIG[questId];

      if (quest.type !== QuestType.DEMOLITION) {
        continue;
      }

      for (const objective of quest.objectives) {
        if ("target" in objective && isBuildingName(objective.target)) {
          targets.add(objective.target);
        }
      }
    }

    return targets;
  }

  private getPlayerEntity(): number | null {
    return this.playerComponentStore.getAllEntities()[0] ?? null;
  }

  private getPlayerCenter(playerEntity: number): { x: number; y: number } | null {
    const position = this.positionComponentStore.getOrNull(playerEntity);
    const sprite = this.spriteComponentStore.getOrNull(playerEntity);

    if (!position || !sprite) {
      return null;
    }

    return {
      x: position.x + sprite.width / 2,
      y: position.y + sprite.height / 2,
    };
  }

  private isPlayerInsideBuilding(playerEntity: number, rect: BuildingPlacementRect): boolean {
    const playerPoint = this.getPlayerCenter(playerEntity);

    return playerPoint !== null && this.containsPoint(rect, playerPoint.x, playerPoint.y);
  }

  private playerMoved(playerEntity: number): boolean {
    return this.movementInputComponentStore.has(playerEntity);
  }

  private containsPoint(rect: BuildingPlacementRect, x: number, y: number): boolean {
    return x >= rect.x
      && x <= rect.x + rect.width
      && y >= rect.y
      && y <= rect.y + rect.height;
  }

  private getBuildingInstanceId(placement: PlacedBuilding): string {
    const originTileX = Math.round(placement.rect.x / placement.tileSize);
    const originTileY = Math.round(placement.rect.y / placement.tileSize);

    return [
      placement.buildingName,
      placement.variationId,
      placement.orientation,
      placement.plotId,
      `${originTileX}_${originTileY}`,
    ].join(":");
  }

  private wasKeyPressedThisFrame(code: string): boolean {
    return this.pressedKeys.has(code) && !this.previousPressedKeys.has(code);
  }

  private syncInputFrame(): void {
    this.previousPressedKeys = new Set(this.pressedKeys);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.pressedKeys.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };
}
