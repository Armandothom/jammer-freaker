
import { randomNumberWithSeedInfluence } from "../../utils/get-random-with-seed.js";
import { AIAttackOrderComponent } from "../components/ai-attack-order.component.js";
import { AIComponent } from "../components/ai.component.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { DisableAimComponent } from "../components/disable-aim.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { IntentMeleeComponent } from "../components/intent-melee.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AiAttackOrder } from "../components/types/ai-attack-order.js";
import { EnemyType } from "../components/types/enemy-type.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { CoreManager } from "../core/core-manager.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";


export class AiAttackBehaviorSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private aiComponentStore: ComponentStore<AIComponent>,
        private aiAttackOrderComponentStore: ComponentStore<AIAttackOrderComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private aimShootingComponentStore: ComponentStore<AimShootingComponent>,
        private weaponAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent>,
        private intentMeleeComponentStore: ComponentStore<IntentMeleeComponent>,
        private disableAimComponentStore: ComponentStore<DisableAimComponent>,
    ) { }

    update(deltaTime: number): void {
        const playerEntityId = this.playerComponentStore.getAllEntities()[0];
        const aiEntities = this.aiComponentStore.getAllEntities();
        for (const aiEntityId of aiEntities) {
            const aiHasAttackOrder = this.aiAttackOrderComponentStore.has(aiEntityId);
            if (!aiHasAttackOrder) {
                const randomNumber = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 10);
                const durationOrder = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 3);
                if (randomNumber < 8) {
                    this.aiAttackOrderComponentStore.add(aiEntityId, new AIAttackOrderComponent(AiAttackOrder.SHOOT, durationOrder))
                } else {
                    this.aiAttackOrderComponentStore.add(aiEntityId, new AIAttackOrderComponent(AiAttackOrder.STAND_STILL, durationOrder))
                }
            } else {
                const attackOrder = this.aiAttackOrderComponentStore.get(aiEntityId);
                switch (attackOrder.attackOrder) {
                    case AiAttackOrder.SHOOT:
                        const playerPos = this.positionComponentStore.get(playerEntityId);
                        const aiPos = this.positionComponentStore.get(aiEntityId);
                        const enemyType = this.enemyComponentStore.get(aiEntityId).enemyType
                        const offsetXShooting = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 10)
                        const offsetYShooting = randomNumberWithSeedInfluence(aiEntityId.toString(), 0, 10);
                        const weaponAttachments = this.weaponAttachmentComponentStore.getValuesAndEntityId();
                        const weaponAttachment = weaponAttachments.find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == aiEntityId)!;
                        const weaponPosition = this.positionComponentStore.get(weaponAttachment[0]);

                        const weaponSprite = this.spriteComponentStore.get(weaponAttachment[0]);
                        const playerSprite = this.spriteComponentStore.get(playerEntityId);
                        const dx = playerPos.x - weaponPosition.x + playerSprite.width / 2;
                        const dy = playerPos.y - weaponPosition.y + playerSprite.height / 2;
                        const angle = Math.atan2(dy, dx);
                        //offsetShooting to return

                        //By default the isGranade is false, but should change to the bomber guy
                        if (enemyType === EnemyType.SOLDIER || enemyType === EnemyType.SNIPER) {
                            this.intentShotComponentStore.add(aiEntityId, new IntentShotComponent(playerPos.x + playerSprite.width / 2, playerPos.y, false));
                        }
                        if (enemyType === EnemyType.BOMBER) {
                            this.intentGrenadeComponentStore.add(aiEntityId, new IntentShotComponent(playerPos.x + playerSprite.width / 2, playerPos.y, false));
                        }
                        if (enemyType === EnemyType.KAMIKAZE || enemyType === EnemyType.JUGG) {
                            this.intentMeleeComponentStore.add(aiEntityId, new IntentShotComponent(playerPos.x + playerSprite.width / 2, playerPos.y, false));
                        }
                        if (!this.disableAimComponentStore.has(aiEntityId)) {
                            this.aimShootingComponentStore.add(weaponAttachment[0], new AimShootingComponent(angle, weaponSprite.height * 5 / 20));
                        }
                        break;
                    default:
                        break;
                }
                if (attackOrder.endOrderSeconds < CoreManager.timeGlobalSinceStart) {
                    this.aiAttackOrderComponentStore.remove(aiEntityId);
                }
            }


        }
    }





}