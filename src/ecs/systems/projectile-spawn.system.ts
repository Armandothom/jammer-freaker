import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
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
import { LevelManager } from "../core/level-manager.js";

export class ProjectileSpawnSystem implements ISystem {
    constructor(
        private spriteManager: SpriteManager,
        private soundManager: SoundManager,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private attachedSpriteComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private projectileComponentStore: ComponentStore<ProjectileComponent>,
        private entityFactory: EntityFactory,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
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
    }

    update(deltaTime: number): void {
        this.intentShotConversion();
        this.intentGrenadeConversion();
    }

    private intentShotConversion() {
        const shooters = this.shooterComponentStore.getAllEntities();
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();

        for (const entity of shooters) {
            const shooterPos = this.positionComponentStore.get(entity);
            const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == entity);
            if (!attachedWeaponEntry) {
                throw new Error("No weapon entry found");
            }

            const attachedWeapon = attachedWeaponEntry[1];
            const attachedWeaponEntityId = attachedWeaponEntry[0];
            const weaponPosition = this.positionComponentStore.get(attachedWeaponEntityId);
            const intent = this.intentShotComponentStore.getOrNull(entity);
            if (!shooterPos || !intent) continue;

            let intentXConverted = intent.x;
            let intentYConverted = intent.y;
            const dx = intentXConverted - weaponPosition.x;
            const dy = intentYConverted - weaponPosition.y;
            const angle = Math.atan2(dy, dx);
            let dir = { x: Math.cos(angle), y: Math.sin(angle) }; // Vetor de direção normalizado

            const cooldownConfig = this.shooterComponentStore.get(entity);
            const shootingCooldown = this.shootingCooldownComponentStore.has(entity);
            if (!shootingCooldown) {
                this.spawnProjectile(dir, attachedWeapon, false, { x: 640, y: 640 });
                this.shootingCooldownComponentStore.add(entity, new ShootingCooldownComponent(cooldownConfig.shootingCooldown));
                if (this.playerComponentStore.has(entity)) {
                    this.bulletFiredComponentStore.add(entity, new BulletFiredComponent());
                }
            }
        }
    }

    private intentGrenadeConversion() {
        const shooters = this.shooterComponentStore.getAllEntities();
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();

        for (const entity of shooters) {
            const shooterPos = this.positionComponentStore.get(entity);
            const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == entity);
            if (!attachedWeaponEntry) {
                throw new Error("No weapon entry found");
            }

            const attachedWeapon = attachedWeaponEntry[1];
            const grenadeIntent = this.intentGrenadeComponentStore.getOrNull(entity);
            if (!shooterPos || !grenadeIntent) continue;

            const dx = grenadeIntent.x - attachedWeapon.barrelX;
            const dy = grenadeIntent.y - attachedWeapon.barrelY;
            const travelDistance = {
                x: grenadeIntent.x - attachedWeapon.barrelX,
                y: grenadeIntent.y - attachedWeapon.barrelY,
            };
            const angle = Math.atan2(dy, dx);
            const dir = { x: Math.cos(angle), y: Math.sin(angle) };

            const cooldownConfig = this.shooterComponentStore.get(entity);
            const grenadeCooldown = this.grenadeCooldownComponentStore.has(entity);
            if (!grenadeCooldown) {
                this.spawnProjectile(dir, attachedWeapon, true, travelDistance);
                this.grenadeCooldownComponentStore.add(entity, new GrenadeCooldownComponent(cooldownConfig.grenadeCooldown));
                if (this.playerComponentStore.has(entity)) {
                    this.grenadeFiredComponentStore.add(entity, new GrenadeFiredComponent());
                }
            }
        }
    }

    private spawnProjectile(dir: { x: number; y: number }, shootingWeapon: WeaponSpriteAttachmentComponent, isGrenade: boolean, travelDistance: { x: number, y: number }): void {
        if (isGrenade) {
            this.entityFactory.createProjectile(
                shootingWeapon.barrelX,
                shootingWeapon.barrelY,
                shootingWeapon.parentEntityId,
                dir.x,
                dir.y,
                240,
                SpriteName.GRENADE_1,
                SpriteSheetName.PROJECTILE,
                AnimationName.GRENADE_FIRED,
                isGrenade,
                travelDistance,
            );
        } else {
            this.soundManager.playSound("SMG_FIRE");
            const bulletSpriteProperties = this.spriteManager.getSpriteProperties(SpriteName.BULLET_1, SpriteSheetName.PROJECTILE)!;
            const bulletWidth = bulletSpriteProperties.sprite.originalRenderSpriteWidth;
            const bulletHeight = bulletSpriteProperties.sprite.originalRenderSpriteHeight;

            //Calculate the scalar distance/offset that we want the bullet to spawn, from the barrelPoint
            const offsetFromBarrelPointX = (bulletWidth - 15) / 2;
            const offsetFromBarrelPointY = (bulletHeight - 15) / 2;
            const forwardOffset = Math.abs(dir.x) * (offsetFromBarrelPointX) + Math.abs(dir.y) * (offsetFromBarrelPointY);
            //Apply scalar distance proportionally for each direction, depending on the angle
            const bulletCenterX = shootingWeapon.barrelX + dir.x * forwardOffset;
            const bulletCenterY = shootingWeapon.barrelY + dir.y * forwardOffset;
            //Align to the center of the bullet
            const startX = bulletCenterX - (bulletWidth / 2);
            const startY = bulletCenterY - (bulletHeight / 2);

            const entity = this.entityFactory.createProjectile(
                startX,
                startY,
                shootingWeapon.parentEntityId,
                dir.x,
                dir.y,
                320,
                SpriteName.BULLET_1,
                SpriteSheetName.PROJECTILE,
                AnimationName.BULLET_FIRED,
                isGrenade,
                travelDistance,
            );
        }
    }
}
