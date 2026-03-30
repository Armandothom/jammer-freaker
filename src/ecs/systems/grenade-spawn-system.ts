import { GrenadeCooldownComponent } from "../components/grenade-cooldown.component.js";
import { GrenadeFiredComponent } from "../components/grenade-fired.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterCooldownComponent } from "../components/shooter-cooldown-component.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class GrenadeSpawnSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private attachedSpriteComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private entityFactory: EntityFactory,
        private shooterCooldownComponentStore: ComponentStore<ShooterCooldownComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private grenadeCooldownComponentStore: ComponentStore<GrenadeCooldownComponent>,
        private grenadeFiredComponentStore: ComponentStore<GrenadeFiredComponent>,
        private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.playerIntentGrenadeConversion();

        //lacking intent grenade from enemies TO-DO
    }

    private playerIntentGrenadeConversion() {
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        if (this.intentGrenadeComponentStore.has(playerEntity)) {
            const grenadeIntent = this.intentGrenadeComponentStore.get(playerEntity);
            const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == playerEntity);
            if (!attachedWeaponEntry) {
                throw new Error("No weapon entry found");
            }

            const attachedWeapon = attachedWeaponEntry[1];


            const dx = grenadeIntent.x - attachedWeapon.barrelX;
            const dy = grenadeIntent.y - attachedWeapon.barrelY;
            const travelDistance = { x: dx, y: dy };
            const angle = Math.atan2(dy, dx);
            const dir = { x: Math.cos(angle), y: Math.sin(angle) };

            const cooldownConfig = WeaponConfig[WeaponType.GRENADE].fireRate;
            const grenadeCooldown = this.grenadeCooldownComponentStore.has(playerEntity);
            if (!grenadeCooldown) {
                this.spawnGrenade(dir, attachedWeapon, travelDistance);
                this.grenadeCooldownComponentStore.add(playerEntity, new GrenadeCooldownComponent(cooldownConfig));
                this.grenadeFiredComponentStore.add(playerEntity, new GrenadeFiredComponent());
            }

        }
    }

    private spawnGrenade(
        dir: { x: number; y: number },
        shootingWeapon: WeaponSpriteAttachmentComponent,
        travelDistance: { x: number; y: number },
    ): void {
        this.entityFactory.createGrenade(
            shootingWeapon.barrelX,
            shootingWeapon.barrelY,
            shootingWeapon.parentEntityId,
            dir.x,
            dir.y,
            240,
            travelDistance,
        );
    }
}
