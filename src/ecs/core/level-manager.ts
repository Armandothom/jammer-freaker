import { AIComponent } from "../components/ai.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { CollisionComponent } from "../components/collision-component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { HealthComponent } from "../components/health.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { SoldierComponent } from "../components/soldier.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ComponentStore } from "./component-store.js";
import { CoreManager } from "./core-manager.js";
import { EntityManager } from "./entity-manager.js";

export class LevelManager {
    private levelNumber: number;
    private spawnInterval: number;
    private nextSpawnTime: number;
    private entityFactory: EntityFactory;



    constructor(
        spawnInterval: number,
        levelNumber: number,
        private entityManager: EntityManager,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private soldierComponentStore: ComponentStore<SoldierComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
        private collisionComponentStore: ComponentStore<CollisionComponent>,
        private aiComponentStore: ComponentStore<AIComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
    ) {
        this.spawnInterval = spawnInterval;
        this.nextSpawnTime = CoreManager.timeGlobalSinceStart + spawnInterval;
        this.levelNumber = levelNumber;
        this.entityFactory = new EntityFactory(
            this.entityManager,
            this.playerComponentStore,
            this.enemyComponentStore,
            this.positionComponentStore,
            this.spriteComponentStore,
            this.projectileComponentStore,
            this.shooterComponentStore,
            this.velocityComponentStore,
            this.movementIntentComponentStore,
            this.soldierComponentStore,
            this.animationComponentStore,
            this.directionAnimComponentStore,
            this.collisionComponentStore,
            this.aiComponentStore,
            this.healthComponentStore,
            this.shotOriginComponentStore
        );
    }

    update(time: number) {
        if (time >= this.nextSpawnTime) {
            const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
            const xPosRand = Math.random() * canvas.width;
            const yPosRand = Math.random() * canvas.height;
            this.entityFactory.createEnemy(xPosRand, yPosRand);
            this.nextSpawnTime += this.spawnInterval / this.levelNumber;
        }
    }

}