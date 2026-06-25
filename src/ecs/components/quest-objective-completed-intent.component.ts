import type { QuestId } from "./types/quest-config.js";

export class QuestObjectiveCompletedIntentComponent {
  constructor(
    public questId: QuestId,
    public objectiveIndex: number,
    public completedQuantity: number = 1,
  ) {
  }
}
