import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { AttackSpeedComponent } from "../components/attack-speed.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { DisableAimComponent } from "../components/disable-aim.component.js";
import { DisableAttachmentComponent } from "../components/disable-attachment.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { InitialAimAngleComponent } from "../components/initial-aim-angle.component.js";
import { IntentMeleeComponent } from "../components/intent-melee.component.js";
import { MeleeIntentProcessedComponent } from "../components/melee-intent-processed.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShapeComponent } from "../components/shape-component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { EnemyType } from "../components/types/enemy-type.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class MeleeAttackSystem implements ISystem {

    constructor(
        private intentMeleeComponentStore: ComponentStore<IntentMeleeComponent>,
        private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private weaponComponentStore: ComponentStore<WeaponComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private aimShootingComponentStore: ComponentStore<AimShootingComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private attackSpeedComponentStore: ComponentStore<AttackSpeedComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private disableAimComponentStore: ComponentStore<DisableAimComponent>,
        private meleeIntentProcessedComponentStore: ComponentStore<MeleeIntentProcessedComponent>,
        private initialAimAngleComponentStore: ComponentStore<InitialAimAngleComponent>,
        private entityFactory: EntityFactory,
        private shapeComponentStore: ComponentStore<ShapeComponent>,
    ) {
    }

    update(deltaTime: number): void {
        for (const shooter of this.shooterComponentStore.getAllEntities()) {
            if (this.playerComponentStore.has(shooter)) {
                if (this.weaponComponentStore.get(shooter).spriteName != SpriteName.KNIFE) continue;
            }
            if (this.enemyComponentStore.has(shooter)) {
                if (this.enemyComponentStore.get(shooter).enemyType != EnemyType.KAMIKAZE) continue;
            }

            const shooterPos = this.positionComponentStore.get(shooter);
            const intent = this.intentMeleeComponentStore.getOrNull(shooter);

            if (!shooterPos || !intent) continue;

            const weaponAttachments = this.weaponSpriteAttachmentComponentStore.getValuesAndEntityId();
            const weaponAttachment = weaponAttachments.find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == shooter)!;
            const weaponEntityId = weaponAttachment[0];
            const weaponSprite = this.spriteComponentStore.get(weaponEntityId);
            const shooterSprite = this.spriteComponentStore.get(shooter);
            const aimShooting = this.aimShootingComponentStore.get(weaponEntityId);
            let shapeId: number;
            let attackEnded: boolean = false;
            const isAimingLeft = Math.cos(aimShooting.aimAngle) < 0 ? true : false;
            const isAimingUp = Math.sin(aimShooting.aimAngle) < 0.45 ? true : false;

            if (!this.attackSpeedComponentStore.has(shooter)) {
                this.attackSpeedComponentStore.add(shooter, new AttackSpeedComponent(WeaponConfig[WeaponType.KNIFE].shootingCooldown));
                this.initialAimAngleComponentStore.add(weaponEntityId, new InitialAimAngleComponent(aimShooting.aimAngle));
                this.disableAimComponentStore.add(shooter, new DisableAimComponent());
                const shapeProperties = this.getShapeProperties(isAimingLeft, isAimingUp, shooterPos, shooterSprite, weaponSprite, aimShooting.aimAngle);

                shapeId = this.entityFactory.createCollisionShape(shooter, shapeProperties.shapePosition.x, shapeProperties.shapePosition.y, shapeProperties.shapeDimension.width, shapeProperties.shapeDimension.height);

                // disable angle change component
            } else {
                const totalAttackFrames = Math.round(this.attackSpeedComponentStore.get(shooter).attackSpeed / deltaTime);
                const initialAngle = this.initialAimAngleComponentStore.get(weaponEntityId).initialAimAngle;

                let swingAngle = Math.PI * (5 / 6);

                const angleStep = swingAngle / totalAttackFrames;
                const angle = initialAngle + angleStep * this.attackSpeedComponentStore.get(shooter).attackFrame - swingAngle / 2;
                this.aimShootingComponentStore.get(weaponEntityId).aimAngle = angle;
                this.attackSpeedComponentStore.get(shooter).attackFrame++;

                attackEnded = this.attackSpeedComponentStore.get(shooter).attackFrame >= totalAttackFrames;
            }

            if (attackEnded) {
                this.aimShootingComponentStore.get(weaponEntityId).aimAngle = this.initialAimAngleComponentStore.get(weaponEntityId).initialAimAngle;
                this.meleeIntentProcessedComponentStore.add(shooter, new MeleeIntentProcessedComponent());
                this.attackSpeedComponentStore.remove(shooter);
                this.initialAimAngleComponentStore.remove(weaponEntityId);
                this.disableAimComponentStore.remove(shooter);
                const shapes = this.shapeComponentStore.getAllEntities();
                for (const shape of shapes) {
                    if (this.shapeComponentStore.get(shape).shapeSource === shooter) {
                        this.entityFactory.destroyCollisionShape(shape);
                    }
                }
            }
        }
    }

    private getShapeProperties(
        isAimingLeft: boolean,
        isAimingUp: boolean,
        shooterPos: { x: number, y: number },
        shooterSprite: { width: number, height: number },
        weaponSprite: { width: number, height: number },
        aimAngle: number
    ): { shapePosition: { x: number, y: number }, shapeDimension: { width: number, height: number } } {
        let shapePosition: { x: number, y: number } = { x: 0, y: 0 };
        let shapeDimension: { width: number, height: number } = { width: weaponSprite.width/2, height: shooterSprite.height } // This is right for rn and can be tweaked
        let shapeProperties = { shapePosition, shapeDimension };

        if (aimAngle >= -Math.PI / 4 && aimAngle < Math.PI / 4) {
            //right

            shapePosition.x = shooterPos.x + shooterSprite.width;
            shapePosition.y = shooterPos.y + shooterSprite.height / 2 - shapeDimension.height * (1 - Math.sin(aimAngle)) / 2;
        }
        else if (aimAngle >= Math.PI / 4 && aimAngle < 3 * Math.PI / 4) {
            //down
            let temp = shapeDimension.height;
            shapeDimension.height = shapeDimension.width;
            shapeDimension.width = temp;
            temp = 
            shapePosition.x = shooterPos.x + shooterSprite.width / 2 - shapeDimension.width * (1 - Math.cos(aimAngle)) / 2
            shapePosition.y = shooterPos.y + shooterSprite.height;
        }
        else if (aimAngle <= -Math.PI / 4 && aimAngle > -3 * Math.PI / 4) {
            //up

            const temp = shapeDimension.height;
            shapeDimension.height = shapeDimension.width;
            shapeDimension.width = temp;

            shapePosition.x = shooterPos.x + shooterSprite.width / 2 - shapeDimension.width * (1 - Math.cos(aimAngle)) / 2
            shapePosition.y = shooterPos.y - shapeDimension.height;
        }
        else {
            //left
            shapePosition.x = shooterPos.x - shapeDimension.width;
            shapePosition.y = shooterPos.y + shooterSprite.height / 2 - shapeDimension.height * (1 - Math.sin(aimAngle)) / 2;
        }

        return shapeProperties;
    }
}