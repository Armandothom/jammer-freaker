import { GrenadeCooldownComponent } from "../components/grenade-cooldown.component.js";
import { GrenadeFiredComponent } from "../components/grenade-fired.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class GrenadeSpawnSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private attachedSpriteComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private entityFactory: EntityFactory,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private grenadeCooldownComponentStore: ComponentStore<GrenadeCooldownComponent>,
        private grenadeFiredComponentStore: ComponentStore<GrenadeFiredComponent>,
        private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.intentGrenadeConversion();
    }

    private intentGrenadeConversion() {
        const shooters = this.shooterComponentStore.getAllEntities();
        const attachedWeapons = this.attachedSpriteComponent.getValuesAndEntityId();

        for (const entity of shooters) {
            const shooterPos = this.positionComponentStore.getOrNull(entity);
            const attachedWeaponEntry = attachedWeapons.find((value) => value[1].parentEntityId == entity);
            if (!attachedWeaponEntry) {
                throw new Error("No weapon entry found");
            }

            const attachedWeapon = attachedWeaponEntry[1];
            const grenadeIntent = this.intentGrenadeComponentStore.getOrNull(entity);
            if (!shooterPos || !grenadeIntent) continue;

            const dx = grenadeIntent.x - attachedWeapon.barrelX;
            const dy = grenadeIntent.y - attachedWeapon.barrelY;
            const travelDistance = { x: dx, y: dy };
            const angle = Math.atan2(dy, dx);
            const dir = { x: Math.cos(angle), y: Math.sin(angle) };

            const cooldownConfig = this.shooterComponentStore.get(entity);
            const grenadeCooldown = this.grenadeCooldownComponentStore.has(entity);
            if (!grenadeCooldown) {
                this.spawnGrenade(dir, attachedWeapon, travelDistance);
                this.grenadeCooldownComponentStore.add(entity, new GrenadeCooldownComponent(cooldownConfig.grenadeCooldown));
                if (this.playerComponentStore.has(entity)) {
                    this.grenadeFiredComponentStore.add(entity, new GrenadeFiredComponent());
                }
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
