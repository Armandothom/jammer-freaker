import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { IntentClickComponent } from "../components/intent-click.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class ProjectileSpawnSystem implements ISystem {
    private readonly tileSize: number;

    constructor(
        private spriteManager: SpriteManager,
        private soundManager: SoundManager,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private entityFactory: EntityFactory,
        private projectileShooterComponentStore: ComponentStore<ShooterComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
        private intentClickComponentStore: ComponentStore<IntentClickComponent>,
        private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private fireRateMs: number = 200
    ) {
        const terrainSpriteSheet = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN);
        this.tileSize = terrainSpriteSheet.afterRenderSpriteCellSize;
    }

    update(deltaTime: number): void {

        const shooters = this.shooterComponentStore.getAllEntities();
        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        const canvasWidthHeightInTiles = canvas.width / this.tileSize;

        for (const entity of shooters) {
            const shooterPos = this.positionComponentStore.get(entity);
            if (this.playerComponentStore.has(entity)) {
                const intent = this.intentClickComponentStore.getOrNull(entity);

                if (!shooterPos || !intent) continue;

                let shooterPosXConverted = shooterPos.x / canvas.width * canvasWidthHeightInTiles;
                let shooterPosYConverted = shooterPos.y / canvas.height * canvasWidthHeightInTiles;

                let intentXConverted = intent.x / canvas.width * canvasWidthHeightInTiles;
                let intentYConverted = intent.y / canvas.height * canvasWidthHeightInTiles;

                const dx = intentXConverted - (shooterPosXConverted);
                const dy = intentYConverted - (shooterPosYConverted);
                const magnitude = Math.hypot(dx, dy); // Distancia do player e do click
                if (magnitude === 0) continue; // Podemos alterar para que não spawne projetil se ele clicar tão perto do sprite do player

                const dir = { x: dx / magnitude, y: dy / magnitude }; // Vetor de direção normalizado


                const cooldown = this.shootingCooldownComponentStore.has(entity);
                if (!cooldown) {
                    this.spawnProjectile(shooterPos.x, shooterPos.y, dir, entity);
                    const cooldownAdd = this.shootingCooldownComponentStore.add(entity, new ShootingCooldownComponent(0.2));
                }
            }

            // Adicionar lógica de criar projectile a partir do this.enemyComponentStore.has(entity)
            // bem similar da estrutura acima
        }
    }

    private spawnProjectile(x: number, y: number, dir: { x: number; y: number }, shooterId: number): void {
        const spritePlayerComponent = this.spriteComponentStore.get(shooterId);
        const animPlayerDirectionComponent = this.directionAnimComponentStore.get(shooterId);
        const spriteProperties = this.spriteManager.getSpriteProperties(spritePlayerComponent.spriteName, spritePlayerComponent.spriteSheetName)
        const spriteSize = spriteProperties.spriteSheet.afterRenderSpriteCellSize;
        const offsetX = animPlayerDirectionComponent.direction == AnimDirection.RIGHT ? spriteProperties.spriteSheet.afterRenderSpriteCellSize + 5 : -5;
        this.soundManager.playSound("SMG_FIRE");

        const entity = this.entityFactory.createProjectile(
            x + offsetX,
            y + 9,
            shooterId, // por enquanto player ID
            dir.x * 120, // cte --> pode mudar
            dir.y * 120
        );
        //Adição de mais componentes
    }

}