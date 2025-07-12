import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
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
    constructor(
        private inputClickSystem: InputClickSystem,
        private spriteManager: SpriteManager,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private entityFactory: EntityFactory,
        private projectileShooterComponentStore: ComponentStore<ProjectileShooterComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>
    ) {
        const terrainSpriteSheet = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN);
        this.tileSize = terrainSpriteSheet.afterRenderSpriteSize;
    }

    update(deltaTime: number): void {
        const clicks = this.inputClickSystem.consumeClicks();
        if (clicks.length === 0) return; // Para aqui se não houver clique
        //console.log(clicks.length);

        const playerIdRetrievalResponse = this.playerComponentStore.getAllEntities();
        if (playerIdRetrievalResponse.length !== 1) {
            console.warn("Número inesperado de jogadores encontrados:", playerIdRetrievalResponse.length);
            return;
        }
        const playerId = playerIdRetrievalResponse[0];
        const playerPos = this.positionComponentStore.get(playerId);


        for (const click of clicks) {
            const canvasClickX = click.x / this.tileSize;
            const canvasClickY = click.y / this.tileSize;

            const canvasWidthHeightInPixels = 640;
            const canvasWidthHeightInTiles = 20;

            let playerPosXConverted = playerPos.x / canvasWidthHeightInPixels * canvasWidthHeightInTiles;
            let playerPosYConverted = playerPos.y / canvasWidthHeightInPixels * canvasWidthHeightInTiles

            console.log(canvasClickX, canvasClickY);
            console.log(playerPosXConverted, playerPosYConverted);

            const dx = canvasClickX - (playerPosXConverted);
            const dy = canvasClickY - (playerPosYConverted);
            const magnitude = Math.hypot(dx, dy); // Distancia do player e do click
            if (magnitude === 0) continue; // Podemos alterar para que não spawne projetil se ele clicar tão perto do sprite do player

            const dir = { x: dx / magnitude, y: dy / magnitude }; // Vetor de direção normalizado
            this.spawnProjectile(playerPos.x, playerPos.y, dir, playerId)
        }

    }

    private spawnProjectile(x: number, y: number, dir: { x: number; y: number }, playerId: number): void {
        const spritePlayerComponent = this.spriteComponentStore.get(playerId);
        const spriteProperties = this.spriteManager.getSpriteProperties(spritePlayerComponent.spriteName, spritePlayerComponent.spriteSheetName)
        const spriteSize = spriteProperties.spriteSheet.afterRenderSpriteSize;
        //console.log(dir.x, dir.y);

        const projectileId = this.entityFactory.createProjectile(
            x + spriteSize,
            y,
            playerId, // por enquanto player ID
            dir.x,
            dir.y
        );
        //console.log(projectileId);

        console.log("Projectile Spawned");
        //Adição de mais componentes
    }

}