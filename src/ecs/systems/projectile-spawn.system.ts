import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { EntityNameComponent } from "../components/entity-name.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityId } from "../core/types/entity-id.type.js";
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
        private entityFactory: EntityFactory
    ) {
        const terrainSpriteSheet = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN);
        this.tileSize = terrainSpriteSheet.afterRenderSpriteSize;
    }

    update(deltaTime: number): void {
        const clicks = this.inputClickSystem.consumeClicks();
        if (clicks.length === 0) return; // Para aqui se não houver clique
        console.log(clicks.length);

        const playerIdRetrievalResponse = this.playerComponentStore.getAllEntities();
        if (playerIdRetrievalResponse.length !== 1) {
            console.warn("Número inesperado de jogadores encontrados:", playerIdRetrievalResponse.length);
            return;
        }
        const playerId = playerIdRetrievalResponse[0];
        const playerPos = this.positionComponentStore.get(playerId);


        for (const click of clicks) {
            const worldClickX = click.x / this.tileSize;
            const worldClickY = click.y / this.tileSize;

            const dx = worldClickX - playerPos.x;
            const dy = worldClickY - playerPos.y;
            const magnitude = Math.hypot(dx, dy); // Distancia do player e do click
            if (magnitude === 0) continue; // Podemos alterar para que não spawne projetil se ele clicar tão perto do sprite do player

            const dir = { x: dx / magnitude, y: dy / magnitude }; // Vetor de direção normalizado
            this.spawnProjectile(playerPos.x, playerPos.y, dir)
        }

    }

    private spawnProjectile(x: number, y: number, dir: { x: number; y: number }): void {
        const entity = this.entityFactory.createProjectile(x, y);

        this.movementIntentComponentStore.add(entity, {
            x: dir.x * 0.2,
            y: dir.y * 0.2, // Velocidades modificaveis (Um velocityComponent depois?)
        });

        console.log("Projectile Spawned");
        //Adição de mais componentes
    }

}