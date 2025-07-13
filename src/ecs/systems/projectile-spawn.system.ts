import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { IntentClickComponent } from "../components/intent-click.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ProjectileShooterComponent } from "../components/projectile-shooter.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { InputClickSystem } from "./input-click.system.js";
import { ISystem } from "./system.interface.js";

export class ProjectileSpawnSystem implements ISystem {
    private readonly tileSize: number;
    private fireCooldown = 0;

    constructor(
        private spriteManager: SpriteManager,
        private soundManager: SoundManager,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private entityFactory: EntityFactory,
        private projectileShooterComponentStore: ComponentStore<ProjectileShooterComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private intentClickComponentStore: ComponentStore<IntentClickComponent>,
        private fireRateMs: number = 200
    ) {
        const terrainSpriteSheet = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN);
        this.tileSize = terrainSpriteSheet.afterRenderSpriteCellSize;
    }

    update(deltaTime: number): void {

        const players = this.playerComponentStore.getAllEntities();
        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        const canvasWidthHeightInTiles = canvas.width / this.tileSize;

        for (const entity of players) {
            const playerPos = this.positionComponentStore.get(entity);
            const intent = this.intentClickComponentStore.getOrNull(entity);

            if (!playerPos || !intent) continue;

            let playerPosXConverted = playerPos.x / canvas.width * canvasWidthHeightInTiles;
            let playerPosYConverted = playerPos.y / canvas.height * canvasWidthHeightInTiles;

            let intentXConverted = intent.x / canvas.width * canvasWidthHeightInTiles;
            let intentYConverted = intent.y / canvas.height * canvasWidthHeightInTiles;

            const dx = intentXConverted - (playerPosXConverted);
            const dy = intentYConverted - (playerPosYConverted);
            const magnitude = Math.hypot(dx, dy); // Distancia do player e do click
            if (magnitude === 0) continue; // Podemos alterar para que não spawne projetil se ele clicar tão perto do sprite do player

            const dir = { x: dx / magnitude, y: dy / magnitude }; // Vetor de direção normalizado
            this.spawnProjectile(playerPos.x, playerPos.y, dir, entity);

            // Remove intent APENAS se for clique único
            if (!intent.isHold) {
                this.intentClickComponentStore.remove(entity);
            }

        }
    }

    private spawnProjectile(x: number, y: number, dir: { x: number; y: number }, playerId: number): void {
        const spritePlayerComponent = this.spriteComponentStore.get(playerId);
        const spriteProperties = this.spriteManager.getSpriteProperties(spritePlayerComponent.spriteName, spritePlayerComponent.spriteSheetName)
        const spriteSize = spriteProperties.spriteSheet.afterRenderSpriteCellSize;
        this.soundManager.playSound("SMG_FIRE");

        const projectileId = this.entityFactory.createProjectile(
            x + spriteSize,
            y + 9,
            playerId, // por enquanto player ID
            dir.x * 120, // cte --> pode mudar
            dir.y * 120
        );

        console.log("Projectile Spawned");
        //Adição de mais componentes
    }

}