import { CameraManager } from "../../game/world/camera-manager.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { DisableAimComponent } from "../components/disable-aim.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { IntentMeleeComponent } from "../components/intent-melee.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ReloadIntentComponent } from "../components/reload-intent.component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { WeaponConfig } from "../components/types/weapon-type.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { ComponentStore } from "../core/component-store.js";
import { DebugManager } from "../core/debug-manager.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { ISystem } from "./system.interface.js";

const keys: Record<string, boolean> = {};

export class ShootingSystem implements ISystem {

    private canvas: HTMLCanvasElement;
    private isMouseDown: boolean = false;
    private pendingMouseDownShot: boolean = false;
    private currentMousePos: { x: number, y: number } = { x: 0, y: 0 };
    private lastMouseEvent?: MouseEvent;
    constructor(
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
        private weaponAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent>,
        private weaponComponentStore: ComponentStore<WeaponComponent>,
        private intentMeleeComponentStore: ComponentStore<IntentMeleeComponent>,
        private disableAimComponentStore: ComponentStore<DisableAimComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private reloadIntentComponentStore: ComponentStore<ReloadIntentComponent>,
        private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
        private cameraManager: CameraManager,
        private debugManager: DebugManager,
        private inventoryManager: InventoryManager,
    ) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners();
    };

    update(deltaTime: number): void {
        let isGrenade: boolean = false;
        let isMelee: boolean = false;
        if (keys["g"] || keys["G"]) isGrenade = true;
        if (keys["f"] || keys["F"]) isMelee = true;


        if (this.lastMouseEvent) {
            this.updateMousePosition(this.lastMouseEvent);
        }

        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        const canAttemptShot = this.canAttemptShot(playerEntity);

        if (this.pendingMouseDownShot) {
            this.pendingMouseDownShot = false;
            if (canAttemptShot) {
                this.pushShotIntent(false); // first shot from a mouse press
            }
        } else if (this.isMouseDown && canAttemptShot) {
            this.pushShotIntent(true); // isHold = true
        }
        if (isGrenade) {
            this.pushGrenadeIntent();
        }
        if (isMelee == true && this.isMouseDown == false) {
            this.pushMeeleIntent();
        }
    }

    private initListeners() {
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.isMouseDown = true;
            this.pendingMouseDownShot = true;
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener("mouseup", () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            this.updateMousePosition(e);
        });
    }

    private canAttemptShot(playerEntity: number) {
        return !this.shootingCooldownComponentStore.has(playerEntity)
            && !this.reloadIntentComponentStore.has(playerEntity);
    }

    private updateMousePosition = (e: MouseEvent) => {
        this.lastMouseEvent = e;
        const playerIdRes = this.playerComponentStore.getAllEntities();
        const playerId = playerIdRes[0];
        if (this.disableAimComponentStore.has(playerId)) {
            return;
        }
        const weaponAttachments = this.weaponAttachmentComponentStore.getValuesAndEntityId();
        const weaponComponent = this.weaponComponentStore.get(playerId);
        const weaponAttachment = weaponAttachments.find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == playerId)!;
        const weaponEntityId = weaponAttachment[0];
        const weaponPosition = this.positionComponentStore.get(weaponEntityId);
        const rect = this.canvas.getBoundingClientRect();
        const mousePosX = e.clientX - rect.left;
        const mousePosY = e.clientY - rect.top;
        const mouseWorldPosition = this.cameraManager.screenToWorld(
            mousePosX,
            mousePosY,
            rect.width,
            rect.height,
        );
        const dx = mouseWorldPosition.x - weaponPosition.x;
        const dy = mouseWorldPosition.y - weaponPosition.y;
        const angle = Math.atan2(dy, dx);
        this.aimShootingComponentStore.add(weaponEntityId, new AimRotationShootingComponent(angle, weaponComponent.configuredPivotRotation));
        this.currentMousePos = {
            x: mouseWorldPosition.x,
            y: mouseWorldPosition.y,
        };
    }

    private pushShotIntent(isHold: boolean) {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        const weaponWielded = this.inventoryComponentStore.get(playerEntity).equippedWeaponType;
        const inventory = this.inventoryComponentStore.get(playerEntity)
        if (weaponWielded == null) return;
        if (!this.inventoryManager.hasRoundsInMag(inventory, weaponWielded)) {
            if (this.reloadIntentComponentStore.has(playerEntity)) {
                return;
            }
            const reloadTime = WeaponConfig[weaponWielded].reloadTime;
            this.reloadIntentComponentStore.add(playerEntity, new ReloadIntentComponent(reloadTime, weaponWielded));
            return;
        }

        // if (weaponWielded === SpriteName.KNIFE) {
        //     this.pushMeeleIntent(isHold);
        //     return;
        // };

        let playerPos: { x: number, y: number } | undefined;

        playerPos = this.positionComponentStore.get(playerEntity);

        //here
        if (!this.debugManager.isSpawnerActive) {
            this.intentShotComponentStore.add(playerEntity, new IntentShotComponent(
                this.currentMousePos.x,
                this.currentMousePos.y,
                isHold,
                weaponWielded,
            ))
        }
    }

    private pushGrenadeIntent() {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        let playerPos: { x: number, y: number } | undefined;
        const inventory = this.inventoryComponentStore.get(playerEntity)
        if (this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Grenade) == 0) return;

        playerPos = this.positionComponentStore.get(playerEntity);

        this.intentGrenadeComponentStore.add(playerEntity, new IntentGrenadeComponent(
            this.currentMousePos.x,
            this.currentMousePos.y,
        ));

    }

    private pushMeeleIntent() {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        let playerPos: { x: number, y: number } | undefined;

        if (this.disableAimComponentStore.has(playerEntity)) return;
        playerPos = this.positionComponentStore.get(playerEntity);

        this.intentMeleeComponentStore.add(playerEntity, new IntentMeleeComponent(
            this.currentMousePos.x,
            this.currentMousePos.y,
        ));
    }
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});


