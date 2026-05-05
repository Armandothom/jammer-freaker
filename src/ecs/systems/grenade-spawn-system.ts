import { SOUND_KEYS, SOUND_VOLUME } from "../../game/asset-manager/consts/sound-mapped.values.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { GrenadeCooldownComponent } from "../components/grenade-cooldown.component.js";
import { GrenadeFiredComponent } from "../components/grenade-fired.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterCooldownComponent } from "../components/shooter-cooldown-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-config.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { resolveWeaponAttachmentBaseAnchor, resolveWeaponAttachmentPose } from "../core/weapon-attachment-pose-resolver.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class GrenadeSpawnSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private attachedSpriteComponent: ComponentStore<WeaponSpriteAttachmentComponent>,
        private entityFactory: EntityFactory,
        private shooterCooldownComponentStore: ComponentStore<ShooterCooldownComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private grenadeCooldownComponentStore: ComponentStore<GrenadeCooldownComponent>,
        private grenadeFiredComponentStore: ComponentStore<GrenadeFiredComponent>,
        private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent>,
        private soundEventBus: SoundEventBus,
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
            const attachedWeaponEntityId = attachedWeaponEntry[0];
            const attachmentBaseAnchor = resolveWeaponAttachmentBaseAnchor(
                this.positionComponentStore.get(playerEntity),
                this.spriteComponentStore.get(playerEntity),
                attachedWeapon,
            );
            const weaponAngle = Math.atan2(
                grenadeIntent.y - attachmentBaseAnchor.y,
                grenadeIntent.x - attachmentBaseAnchor.x,
            );
            const attachmentPose = resolveWeaponAttachmentPose(
                attachmentBaseAnchor,
                this.spriteComponentStore.get(attachedWeaponEntityId),
                weaponAngle,
            );
            const dx = grenadeIntent.x - attachmentPose.barrelX;
            const dy = grenadeIntent.y - attachmentPose.barrelY;
            const travelDistance = { x: dx, y: dy };
            const angle = Math.atan2(dy, dx);
            const dir = { x: Math.cos(angle), y: Math.sin(angle) };

            const cooldownConfig = this.resolveGrenadeCooldownSeconds();
            const grenadeCooldown = this.grenadeCooldownComponentStore.has(playerEntity);
            if (!grenadeCooldown) {
                this.soundEventBus.emitSound({
                    key: SOUND_KEYS.GRENADE_PIN_PULL,
                    volume: SOUND_VOLUME.GRENADE_PIN_PULL,
                }
                )
                this.spawnGrenade(dir, attachedWeapon, attachmentPose.barrelX, attachmentPose.barrelY, travelDistance);
                this.grenadeCooldownComponentStore.add(playerEntity, new GrenadeCooldownComponent(cooldownConfig));
                this.grenadeFiredComponentStore.add(playerEntity, new GrenadeFiredComponent());
            }
        }
    }

    private spawnGrenade(
        dir: { x: number; y: number },
        shootingWeapon: WeaponSpriteAttachmentComponent,
        barrelX: number,
        barrelY: number,
        travelDistance: { x: number; y: number },
    ): void {
        this.entityFactory.createGrenade(
            barrelX,
            barrelY,
            shootingWeapon.parentEntityId,
            dir.x,
            dir.y,
            240,
            travelDistance,
        );
    }

    private resolveGrenadeCooldownSeconds(): number {
        const grenadeFireRate = WeaponConfig[WeaponType.GRENADE].fireRate;
        const shotsPerSecond = grenadeFireRate / 60;

        if (shotsPerSecond <= 0) {
            return 0;
        }

        return 1 / shotsPerSecond;
    }
}
