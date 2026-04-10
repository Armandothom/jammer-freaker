import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { BulletFiredComponent } from "../components/bullet-fired.component.js";
import { DamageDealtComponent } from "../components/damage-dealt.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { EnemyConfig } from "../components/types/enemy-type.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-config.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { WeaponStatsComponent } from "../components/weapon-stats.component.js";
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
        private bulletFiredComponentStore: ComponentStore<BulletFiredComponent>,
        private damageDealtComponentStore: ComponentStore<DamageDealtComponent>,
        private weaponStatsComponentStore: ComponentStore<WeaponStatsComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.playerIntentShotConversion();
        this.enemyIntentShotConversion();
    }

    private playerIntentShotConversion() {
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        if (this.intentShotComponentStore.has(playerEntity)) {
            const playerPos = this.positionComponentStore.getOrNull(playerEntity);
            const intent = this.intentShotComponentStore.get(playerEntity);
            const weaponWielded = intent.weaponWielded;
            const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == playerEntity);
            if (!attachedWeaponEntry) {
                throw new Error("No weapon entry found");
            }
            const attachedWeapon = attachedWeaponEntry[1];
            const attachedWeaponEntityId = attachedWeaponEntry[0];
            const weaponPosition = this.positionComponentStore.getOrNull(attachedWeaponEntityId);
            if (!weaponPosition) return;

            const dx = intent.x - weaponPosition.x;
            const dy = intent.y - weaponPosition.y;
            const angle = Math.atan2(dy, dx);
            let dir = { x: Math.cos(angle), y: Math.sin(angle) };

            const weaponFireRate = this.weaponStatsComponentStore.has(playerEntity)
                ? this.weaponStatsComponentStore.get(playerEntity).fireRate
                : WeaponConfig[weaponWielded].fireRate;
            const shotsPerSecond = weaponFireRate / 60;
            const fireCooldown = 1 / shotsPerSecond;

            const weaponStats = this.weaponStatsComponentStore.get(playerEntity);
            const shootingCooldown = this.shootingCooldownComponentStore.has(playerEntity);
            if (!shootingCooldown) {
                const damage = this.damageDealtComponentStore.get(playerEntity).damage;
                if (weaponWielded === WeaponType.SHOTGUN) {
                    const projectileAnglesResult = this.generateRandomProjectileDirections(
                        weaponStats.projectilesFired!,
                        weaponStats.spreadAngle!,
                        0.05, // hardcoded minimum angle step
                        angle,
                    );
                    for (const projectile of projectileAnglesResult) {
                        const projectileVelocity = this.randomizeProjectileVelocity(weaponStats.projectileVelocity!, 10);
                        this.spawnProjectile(projectile.dir, attachedWeapon, damage, projectileVelocity, true);
                    }
                } else {
                    this.spawnProjectile(dir, attachedWeapon, damage, weaponStats.projectileVelocity!, true); // last variable: fired by player, check if it is used
                }
                this.bulletFiredComponentStore.add(playerEntity, new BulletFiredComponent());
                this.shootingCooldownComponentStore.add(playerEntity, new ShootingCooldownComponent(fireCooldown));
            }

        }
    }

    private enemyIntentShotConversion() {
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();

        for (const entity of this.intentShotComponentStore.getAllEntities()) {
            if (!this.enemyComponentStore.has(entity)) continue;
            const enemyType = this.enemyComponentStore.get(entity).enemyType
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

            const cooldownConfig = EnemyConfig[enemyType].attackCooldownInSeconds;
            const shootingCooldown = this.shootingCooldownComponentStore.has(entity);
            if (!shootingCooldown) {
                const damage = this.damageDealtComponentStore.get(entity).damage;
                this.spawnProjectile(dir, attachedWeapon, damage, 720, false); // Projectile velocity hard coded 720 - add to the EnemyConfig later;
                this.shootingCooldownComponentStore.add(entity, new ShootingCooldownComponent(cooldownConfig));
            }
        }
    }

    private spawnProjectile(
        dir: { x: number; y: number },
        shootingWeapon: WeaponSpriteAttachmentComponent,
        damage: number,
        projectileVelocity: number,
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
            projectileVelocity,
            SpriteName.BULLET_1,
            SpriteSheetName.PROJECTILE,
            AnimationName.BULLET_FIRED,
        );
    }

    private generateRandomProjectileDirections(
        projectileCount: number,
        spreadAngle: number,
        step: number,
        baseAngle: number
    ): { angle: number; dir: { x: number; y: number } }[] {
        if (projectileCount % 2 === 0) {
            throw new Error("projectileCount must be odd");
        }

        if (spreadAngle <= 0) {
            throw new Error("spreadAngle must be greater than 0");
        }

        if (step <= 0) {
            throw new Error("step must be greater than 0");
        }

        const half = (projectileCount - 1) / 2;

        const possibleOffsets: number[] = [];
        for (let offset = step; offset <= spreadAngle / 2; offset += step) {
            possibleOffsets.push(offset);
        }

        if (possibleOffsets.length < half) {
            throw new Error(
                `invalid step: need ${half} offsets, got ${possibleOffsets.length}`
            );
        }

        // shuffle
        for (let i = possibleOffsets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleOffsets[i], possibleOffsets[j]] = [possibleOffsets[j], possibleOffsets[i]];
        }

        const selectedOffsets = possibleOffsets.slice(0, half);

        const result: { angle: number; dir: { x: number; y: number } }[] = [];

        // projétil central
        result.push({
            angle: baseAngle,
            dir: {
                x: Math.cos(baseAngle),
                y: Math.sin(baseAngle),
            },
        });

        // pares simétricos
        for (const offset of selectedOffsets) {
            const leftAngle = baseAngle - offset;
            const rightAngle = baseAngle + offset;

            result.push({
                angle: leftAngle,
                dir: {
                    x: Math.cos(leftAngle),
                    y: Math.sin(leftAngle),
                },
            });

            result.push({
                angle: rightAngle,
                dir: {
                    x: Math.cos(rightAngle),
                    y: Math.sin(rightAngle),
                },
            });
        }

        return result.sort((a, b) => a.angle - b.angle);
    }

    private randomizeProjectileVelocity(
        projectileMaxVelocity: number,
        lowerPercent: number,

    ): number {
        if (lowerPercent < 0 || lowerPercent > 100) {
            throw new Error("lowerPercent must be between 0 and 100");
        }

        const min = projectileMaxVelocity * (1 - lowerPercent / 100);
        const max = projectileMaxVelocity;

        return Math.random() * (max - min) + min;
    }
}
