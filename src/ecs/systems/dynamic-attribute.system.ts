import { LevelManager } from "../core/level-manager.js";
import { ISystem } from "./system.interface.js";
import { EnemyType } from "../components/types/enemy-type.js";
import { ComponentStore } from "../core/component-store.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ProjectileComponent } from "../components/projectile-component.js";

export class DynamicAttributeSystem implements ISystem {
    private lastLevelApplied = -1;
    constructor(
        private levelManager: LevelManager,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
    ) {

    }
    update(deltaTime: number): void {
        const currentLevel = this.levelManager.levelNumber;

        for (const entity of this.velocityComponentStore.getAllEntities()) {
            const velocity = this.velocityComponentStore.get(entity);

            if (velocity.scaledAtLevel != currentLevel && !this.projectileComponentStore.has(entity)) {
                // the factor below is defined empirically
                // the velocity this way is ratio by the tileSize of de terrain, it isn't fixed by pixel walking

                const velocityScaled = (-0.133) * (currentLevel - 8) + 1.6;
                velocity.currentVelocityX = velocityScaled;
                velocity.currentVelocityY = velocityScaled;
                velocity.scaledAtLevel = currentLevel;
            }
        }
    }
}