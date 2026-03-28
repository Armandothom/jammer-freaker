import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { BulletFiredComponent } from "../components/bullet-fired.component.js";
import { DamageDealtComponent } from "../components/damage-dealt.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class ProjectileSpawnSystem implements ISystem {
    constructor(
        private spriteManager: SpriteManager,
        private soundManager: SoundManager,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private attachedSpriteComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private entityFactory: EntityFactory,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private damageDealtComponentStore: ComponentStore<DamageDealtComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private bulletFiredComponentStore: ComponentStore<BulletFiredComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.intentShotConversion();
    }

    private intentShotConversion() {
        const shooters = this.shooterComponentStore.getAllEntities();
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();

        for (const entity of shooters) {
            const shooterPos = this.positionComponentStore.getOrNull(entity);
            const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == entity);
            if (!attachedWeaponEntry) {
                throw new Error("No weapon entry found");
            }

            const attachedWeapon = attachedWeaponEntry[1];
            const attachedWeaponEntityId = attachedWeaponEntry[0];
            const weaponPosition = this.positionComponentStore.getOrNull(attachedWeaponEntityId);
            const intent = this.intentShotComponentStore.getOrNull(entity);
            if (!shooterPos || !weaponPosition || !intent) continue;

            const dx = intent.x - weaponPosition.x;
            const dy = intent.y - weaponPosition.y;
            const angle = Math.atan2(dy, dx);
            const dir = { x: Math.cos(angle), y: Math.sin(angle) };

            const cooldownConfig = this.shooterComponentStore.get(entity);
            const shootingCooldown = this.shootingCooldownComponentStore.has(entity);
            if (!shootingCooldown) {
                const damage = this.damageDealtComponentStore.get(entity).damage;
                const firedByPlayer = this.playerComponentStore.has(entity);
                this.spawnProjectile(dir, attachedWeapon, damage, firedByPlayer);
                this.shootingCooldownComponentStore.add(entity, new ShootingCooldownComponent(cooldownConfig.shootingCooldown));
                if (firedByPlayer) {
                    this.bulletFiredComponentStore.add(entity, new BulletFiredComponent());
                }
            }
        }
    }

    private spawnProjectile(
        dir: { x: number; y: number },
        shootingWeapon: WeaponSpriteAttachmentComponent,
        damage: number,
        firedByPlayer: boolean,
    ): void {
        this.soundManager.playSound("SMG_FIRE");
        const bulletSpriteProperties = this.spriteManager.getSpriteProperties(SpriteName.BULLET_1, SpriteSheetName.PROJECTILE)!;
        const bulletWidth = bulletSpriteProperties.sprite.originalRenderSpriteWidth;
        const bulletHeight = bulletSpriteProperties.sprite.originalRenderSpriteHeight;

        const offsetFromBarrelPointX = (bulletWidth - 15) / 2;
        const offsetFromBarrelPointY = (bulletHeight - 15) / 2;
        const forwardOffset = Math.abs(dir.x) * offsetFromBarrelPointX + Math.abs(dir.y) * offsetFromBarrelPointY;
        const bulletCenterX = shootingWeapon.barrelX + dir.x * forwardOffset;
        const bulletCenterY = shootingWeapon.barrelY + dir.y * forwardOffset;
        const startX = bulletCenterX - bulletWidth / 2;
        const startY = bulletCenterY - bulletHeight / 2;

        this.entityFactory.createProjectile(
            startX,
            startY,
            shootingWeapon.parentEntityId,
            damage,
            firedByPlayer,
            dir.x,
            dir.y,
            720,
            SpriteName.BULLET_1,
            SpriteSheetName.PROJECTILE,
            AnimationName.BULLET_FIRED,
        );
    }
}
