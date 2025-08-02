import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { DisableAimComponent } from "../components/disable-aim.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { GrenadeBeltComponent } from "../components/grenade-belt.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { IntentMeleeComponent } from "../components/intent-melee.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { MeleeIntentProcessedComponent } from "../components/melee-intent-processed.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { WeaponMagazineComponent } from "../components/weapon-magazine.component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

const keys: Record<string, boolean> = {};

export class ShootingSystem implements ISystem {

    private canvas: HTMLCanvasElement;
    private isMouseDown: boolean = false;
    private currentMousePos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private shooterComponentStore: ComponentStore<ShooterComponent>,
        private aimShootingComponentStore: ComponentStore<AimShootingComponent>,
        private weaponAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private weaponMagazineComponentStore: ComponentStore<WeaponMagazineComponent>,
        private grenadeBeltComponentStore: ComponentStore<GrenadeBeltComponent>,
        private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent>,
        private weaponComponentStore: ComponentStore<WeaponComponent>,
        private intentMeleeComponentStore: ComponentStore<IntentMeleeComponent>,
        private disableAimComponentStore: ComponentStore<DisableAimComponent>,
    ) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners();
    };

    update(deltaTime: number): void {
        let isGrenade: boolean = false;
        if (keys["g"]) isGrenade = true;

        if (this.isMouseDown) {
            this.pushShotIntent(true); // isHold = true
        }
        if (isGrenade) {
            this.pushGrenadeIntent();
        }
    }

    private initListeners() {
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.isMouseDown = true;
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener("mouseup", () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener("click", (e: MouseEvent) => {
            this.updateMousePosition(e);
            this.pushShotIntent(false); // isHold = false
        });
    }

    private updateMousePosition = (e: MouseEvent) => {
        const playerIdRes = this.playerComponentStore.getAllEntities();
        const playerId = playerIdRes[0];
        if(this.disableAimComponentStore.has(playerId)) return;
        const weaponAttachments = this.weaponAttachmentComponentStore.getValuesAndEntityId();
        const weaponAttachment = weaponAttachments.find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == playerId)!;
        const weaponPosition = this.positionComponentStore.get(weaponAttachment[0]);
        const weaponSprite = this.spriteComponentStore.get(weaponAttachment[0]);
        const rect = this.canvas.getBoundingClientRect();
        const mousePosX = e.clientX - rect.left;
        const mousePosY = e.clientY - rect.top;
        const dx = mousePosX - weaponPosition.x;
        const dy = mousePosY - weaponPosition.y;
        const angle = Math.atan2(dy, dx);
        this.aimShootingComponentStore.add(weaponAttachment[0], new AimShootingComponent(angle, weaponSprite.height * 5 / 20));
        // THE 5 / 20 ABOVE SHOULD BE CHANGED BY THE WEAPON -- OFFSET AIM ANGLE
        this.currentMousePos = {
            x: mousePosX,
            y: mousePosY,
        };
    }

    private pushShotIntent(isHold: boolean) {
        const playerId = this.playerComponentStore.getAllEntities()[0];
        const weaponWielded = this.weaponComponentStore.get(playerId).spriteName;

        if (weaponWielded === SpriteName.KNIFE) {
            this.pushMeeleIntent(isHold);
            return;
        };

        let playerPos: { x: number, y: number } | undefined;

        playerPos = this.positionComponentStore.get(playerId);


        const magazineConditions =
            !this.weaponMagazineComponentStore.get(playerId).isReloading &&
            this.weaponMagazineComponentStore.get(playerId).magazineInventory > 0;

        if (magazineConditions) {
            this.intentShotComponentStore.add(playerId, new IntentShotComponent(
                this.currentMousePos.x,
                this.currentMousePos.y,
                isHold,
            ))
        }

        if (this.weaponMagazineComponentStore.get(playerId).magazineInventory === 0) {
            // SFX Click sound
        }
    }

    private pushGrenadeIntent() {
        const playerId = this.playerComponentStore.getAllEntities()[0];
        let playerPos: { x: number, y: number } | undefined;

        playerPos = this.positionComponentStore.get(playerId);

        const grenadeConditions =
            this.grenadeBeltComponentStore.get(playerId).grenadeInventory > 0;

        if (grenadeConditions) {
            this.intentGrenadeComponentStore.add(playerId, new IntentGrenadeComponent(
                this.currentMousePos.x,
                this.currentMousePos.y,
            ));
        }

        if (this.grenadeBeltComponentStore.get(playerId).grenadeInventory === 0) {
            //VFX "No granade"
        }
    }

    private pushMeeleIntent(isHold: boolean) {
        const playerId = this.playerComponentStore.getAllEntities()[0];
        let playerPos: { x: number, y: number } | undefined;
        
        if(this.disableAimComponentStore.has(playerId)) return;
        playerPos = this.positionComponentStore.get(playerId);

        this.intentMeleeComponentStore.add(playerId, new IntentMeleeComponent(
            this.currentMousePos.x,
            this.currentMousePos.y,
            isHold,
        ));
    }
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});


