import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { EntityNameComponent } from "../components/entity-name.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";
import { InputClickSystem } from "./input-click.system.js";
import { ISystem } from "./system.interface.js";

export class ProjectileSpawnSystem implements ISystem {
    private readonly tileSize : number;
    constructor(
        private inputClickSystem: InputClickSystem,
        private spriteManager: SpriteManager,
        private entityNameComponentStore: ComponentStore<EntityNameComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private entityManager: EntityManager
    ) { 
        const terrainSpriteSheet = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN);
        this.tileSize = terrainSpriteSheet.afterRenderSpriteSize;
    }

    update(deltaTime: number): void {
        const clicks = this.inputClickSystem.consumeClicks();
        if (clicks.length === 0) return; // Para aqui se não houver clique

        const playerId = this.findShootingEntity();
        if (!playerId) return;

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

    private findShootingEntity(): EntityId | undefined {
        // Devemos usar um ShooterComponent?
        const shooters = ["player", "enemy"];
        return this.entityNameComponentStore.getAllEntities().filter(id => {
            const nameComp = this.entityNameComponentStore.get(id);
            return shooters.indexOf(nameComp.name) > -1 && this.positionComponentStore.has(id);
        });
    }

    private spawnProjectile(x: number, y: number, dir: { x: number; y: number }): void {
        const entity = this.entityManager.registerEntity()

        this.positionComponentStore.add(entity, { x, y });

        this.movementIntentComponentStore.add(entity, {
            x: dir.x * 0.2,
            y: dir.y * 0.2, // Velocidades modificaveis (Um velocityComponent depois?)
        });

        //Adição de mais componentes
    }

}