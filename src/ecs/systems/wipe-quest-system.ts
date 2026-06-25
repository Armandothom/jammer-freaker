import { ActiveQuestComponent } from "../components/active-quest-component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { QuestObjectiveCompletedIntentComponent } from "../components/quest-objective-completed-intent.component.js";
import { QUEST_CONFIG, QuestType, } from "../components/types/quest-config.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";
import { ISystem } from "./system.interface.js";

export class WipeQuestSystem implements ISystem {
  private processedDeadEnemyEntityIds = new Set<number>();

  constructor(
    private activeQuestComponent: ActiveQuestComponent,
    private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
    private questObjectiveCompletedIntentComponentStore: ComponentStore<QuestObjectiveCompletedIntentComponent>,
    private entityManager: EntityManager,
  ) {
    this.reset();
  }

  update(_deltaTime: number): void {
    const newDeadEnemyEntityIds = this.getNewDeadEnemyEntityIds();

    if (newDeadEnemyEntityIds.length === 0) {
      return;
    }

    for (const deadEnemyEntityId of newDeadEnemyEntityIds) {
      this.processedDeadEnemyEntityIds.add(deadEnemyEntityId);
    }

    this.emitWipeObjectiveProgress(newDeadEnemyEntityIds.length);
  }

  public reset(): void {
    this.processedDeadEnemyEntityIds = new Set(this.enemyDeadComponentStore.getAllEntities());
  }

  private getNewDeadEnemyEntityIds(): number[] {
    return this.enemyDeadComponentStore.getAllEntities().filter((enemyEntityId) => {
      return !this.processedDeadEnemyEntityIds.has(enemyEntityId);
    });
  }

  private emitWipeObjectiveProgress(newDeadEnemyCount: number): void {
    for (const questId of this.activeQuestComponent.getActiveQuestIds()) {
      const quest = QUEST_CONFIG[questId];

      if (quest.type !== QuestType.WIPE) {
        continue;
      }

      quest.objectives.forEach((objective, objectiveIndex) => {
        if (!("target" in objective) || objective.target !== "Enemy") {
          return;
        }

        const completedQuantity = this.activeQuestComponent.getObjectiveProgress(questId, objectiveIndex);
        const remainingQuantity = Math.max(0, objective.quantity - completedQuantity);
        const progressQuantity = Math.min(newDeadEnemyCount, remainingQuantity);

        if (progressQuantity <= 0) {
          return;
        }

        this.questObjectiveCompletedIntentComponentStore.add(
          this.entityManager.registerEntity(),
          new QuestObjectiveCompletedIntentComponent(questId, objectiveIndex, progressQuantity)
        );
      });
    }
  }
}
