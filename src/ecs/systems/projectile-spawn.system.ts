import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { PlayerComponent } from "../components/player.component.js";
import { BulletFiredComponent } from "../components/bullet-fired.component.js";
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { GrenadeCooldownComponent } from "../components/grenade-cooldown.component.js";
import { GrenadeFiredComponent } from "../components/grenade-fired.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";

export class ProjectileSpawnSystem implements ISystem {
    private readonly tileSize: number;

    constructor(
        private spriteManager: SpriteManager,
        private soundManager: SoundManager,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private attachedSpriteComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private entityFactory: EntityFactory,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private bulletFiredComponentStore: ComponentStore<BulletFiredComponent>,
        private grenadeCooldownComponentStore: ComponentStore<GrenadeCooldownComponent>,
        private grenadeFiredComponentStore: ComponentStore<GrenadeFiredComponent>,
        private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent>,
    ) {
        const terrainSpriteSheet = this.spriteManager.getSpriteProperties(SpriteName.METAL_1, SpriteSheetName.TERRAIN);
        this.tileSize = terrainSpriteSheet.sprite.originalRenderSpriteWidth;
    }

    update(deltaTime: number): void {
        this.intentShotConversion();
        this.intentGrenadeConversion();
    }

    private intentShotConversion() {
        const shooters = this.shooterComponentStore.getAllEntities();
        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        const canvasWidthHeightInTiles = canvas.width / this.tileSize;
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();
        const playerId = this.playerComponentStore.getAllEntities()[0];

        for (const entity of shooters) {
            const shooterPos = this.positionComponentStore.get(entity);
            const spriteBullet = this.spriteManager.getSpriteProperties(SpriteName.BULLET_1, SpriteSheetName.PROJECTILE);
            const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == entity);
            if (!attachedWeaponEntry) {
                throw new Error("No weapon entry found");
            }
            const attachedWeapon = attachedWeaponEntry[1];
            const intent = this.intentShotComponentStore.getOrNull(entity);
            if (!shooterPos || !intent) continue;

            let shooterPosXConverted = attachedWeapon.barrelX / canvas.width * canvasWidthHeightInTiles;
            let shooterPosYConverted = attachedWeapon.barrelY / canvas.height * canvasWidthHeightInTiles;

            let intentXConverted = (intent.x - (spriteBullet.sprite.originalRenderSpriteWidth / 2)) / canvas.width * canvasWidthHeightInTiles;
            let intentYConverted = (intent.y - (spriteBullet.sprite.originalRenderSpriteHeight / 2)) / canvas.height * canvasWidthHeightInTiles;

            const dx = intentXConverted - (shooterPosXConverted);
            const dy = intentYConverted - (shooterPosYConverted);
            const magnitude = Math.hypot(dx, dy);  // Player and click distance --> In Tiles
            const angle = Math.atan2(dy, dx);
            //if (magnitude === 0) continue; // Podemos alterar para que não spawne projetil se ele clicar tão perto do sprite do player
            //let dir = { x: dx / magnitude, y: dy / magnitude };
            let dir = { x: Math.cos(angle), y: Math.sin(angle) }; // Vetor de direção normalizado

            const cooldownConfig = this.shooterComponentStore.get(entity);
            const shootingCooldown = this.shootingCooldownComponentStore.has(entity);
            if (!shootingCooldown) {
                this.spawnProjectile(dir, attachedWeapon, false, { x: 640, y: 640 });
                const cooldownAdd = this.shootingCooldownComponentStore.add(entity, new ShootingCooldownComponent(cooldownConfig.shootingCooldown));
                if (this.playerComponentStore.has(entity)) {
                    this.bulletFiredComponentStore.add(entity, new BulletFiredComponent());
                }
            }
        }
    }

    private intentGrenadeConversion() {
        const shooters = this.shooterComponentStore.getAllEntities();
        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        const canvasWidthHeightInTiles = canvas.width / this.tileSize;
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();
        const playerId = this.playerComponentStore.getAllEntities()[0];

        for (const entity of shooters) {
            const shooterPos = this.positionComponentStore.get(entity);
            const spriteBullet = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.PROJECTILE);
            const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == entity);
            if (!attachedWeaponEntry) {
                throw new Error("No weapon entry found");
            }
            const attachedWeapon = attachedWeaponEntry[1];
            const grenadeIntent = this.intentGrenadeComponentStore.getOrNull(entity);
            if (!shooterPos || !grenadeIntent) continue;

            let shooterPosXConverted = attachedWeapon.barrelX / canvas.width * canvasWidthHeightInTiles;
            let shooterPosYConverted = attachedWeapon.barrelY / canvas.height * canvasWidthHeightInTiles;

            let intentXConverted = (grenadeIntent.x - (spriteBullet.width / 2)) / canvas.width * canvasWidthHeightInTiles;
            let intentYConverted = (grenadeIntent.y - (spriteBullet.height / 2)) / canvas.height * canvasWidthHeightInTiles;

            const dx = intentXConverted - (shooterPosXConverted);
            const dy = intentYConverted - (shooterPosYConverted);
            const magnitudeInTiles = Math.hypot(dx, dy);  // Player and click distance --> In Tiles
            const travelDistance = {
                x: (grenadeIntent.x - (spriteBullet.width / 2)) - attachedWeapon.barrelX,
                y: (grenadeIntent.y - (spriteBullet.height / 2)) - attachedWeapon.barrelY,
            }
            const angle = Math.atan2(dy, dx);
            //if (magnitude === 0) continue; // Podemos alterar para que não spawne projetil se ele clicar tão perto do sprite do player
            //let dir = { x: dx / magnitude, y: dy / magnitude };
            let dir = { x: Math.cos(angle), y: Math.sin(angle) }; // Vetor de direção normalizado

            const cooldownConfig = this.shooterComponentStore.get(entity);
            const grenadeCooldown = this.grenadeCooldownComponentStore.has(entity);
            if (!grenadeCooldown) {
                this.spawnProjectile(dir, attachedWeapon, true, travelDistance);
                const cooldownAdd = this.grenadeCooldownComponentStore.add(entity, new GrenadeCooldownComponent(cooldownConfig.grenadeCooldown));
                if (this.playerComponentStore.has(entity)) {
                    this.grenadeFiredComponentStore.add(entity, new GrenadeFiredComponent());
                }
            }
        }
    }

    private spawnProjectile(dir: { x: number; y: number }, shootingWeapon: WeaponSpriteAttachmentComponent, isGrenade: boolean, travelDistance: { x: number, y: number }): void {
        if (isGrenade) {
            //SFX
            const entity = this.entityFactory.createProjectile(
                shootingWeapon.barrelX, // maybe change this to 0?
                shootingWeapon.barrelY,
                shootingWeapon.parentEntityId,
                dir.x,
                dir.y,
                240, // Standard velocity ----> Must be changed by the shooting entity
                SpriteName.GRENADE_1,
                SpriteSheetName.PROJECTILE,
                AnimationName.GRENADE_FIRED,
                isGrenade,
                travelDistance,
            );
        } else {
            this.soundManager.playSound("SMG_FIRE");
            const entity = this.entityFactory.createProjectile(
                shootingWeapon.barrelX,
                shootingWeapon.barrelY,
                shootingWeapon.parentEntityId,
                dir.x,
                dir.y,
                240, // Standard velocity ----> Must be changed by the shooting entity
                SpriteName.BULLET_1,
                SpriteSheetName.PROJECTILE,
                AnimationName.BULLET_FIRED,
                isGrenade,
                travelDistance,
            );
        }
    }
}