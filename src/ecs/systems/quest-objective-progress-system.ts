import { ActiveQuestComponent } from "../components/active-quest-component.js";
import { QuestObjectiveCompletedIntentComponent } from "../components/quest-objective-completed-intent.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class QuestObjectiveProgressSystem implements ISystem {
  constructor(
    private activeQuestComponent: ActiveQuestComponent,
    private questObjectiveCompletedIntentComponentStore: ComponentStore<QuestObjectiveCompletedIntentComponent>,
  ) {
  }

  update(_deltaTime: number): void {
    for (const entity of this.questObjectiveCompletedIntentComponentStore.getAllEntities()) {
      const intent = this.questObjectiveCompletedIntentComponentStore.get(entity);
      this.activeQuestComponent.applyObjectiveCompletedIntent(intent);
      this.questObjectiveCompletedIntentComponentStore.remove(entity);
    }
  }
}
