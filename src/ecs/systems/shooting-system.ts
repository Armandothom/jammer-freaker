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
import { ShootingRecoilIntentComponent } from "../components/shooting-recoil-intent.component.js";
import { SpreadRadiusComponent } from "../components/spread-radius.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-config.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { WeaponStatsComponent } from "../components/weapon-stats.component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { ComponentStore } from "../core/component-store.js";
import { DebugManager } from "../core/debug-manager.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { resolveWeaponAttachmentBaseAnchor } from "../core/weapon-attachment-pose-resolver.js";
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
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
        private weaponAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
        private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent>,
        private weaponComponentStore: ComponentStore<WeaponComponent>,
        private intentMeleeComponentStore: ComponentStore<IntentMeleeComponent>,
        private disableAimComponentStore: ComponentStore<DisableAimComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private reloadIntentComponentStore: ComponentStore<ReloadIntentComponent>,
        private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
        private weaponStatsComponentStore: ComponentStore<WeaponStatsComponent>,
        private shootingRecoilIntentComponentStore: ComponentStore<ShootingRecoilIntentComponent>,
        private spreadRadiusComponentStore: ComponentStore<SpreadRadiusComponent>,
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
        if (this.shootingCooldownComponentStore.has(playerEntity)) {
            return false;
        }

        if (!this.reloadIntentComponentStore.has(playerEntity)) {
            return true;
        }

        return this.canCancelShotgunReload(playerEntity);
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
        const baseAnchor = resolveWeaponAttachmentBaseAnchor(
            this.positionComponentStore.get(playerId),
            this.spriteComponentStore.get(playerId),
            weaponAttachment[1],
        );
        const rect = this.canvas.getBoundingClientRect();
        const mousePosX = e.clientX - rect.left;
        const mousePosY = e.clientY - rect.top;
        const mouseWorldPosition = this.cameraManager.screenToWorld(
            mousePosX,
            mousePosY,
            rect.width,
            rect.height,
        );
        const dx = mouseWorldPosition.x - baseAnchor.x;
        const dy = mouseWorldPosition.y - baseAnchor.y;
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

        if (this.canCancelShotgunReload(playerEntity)) {
            this.reloadIntentComponentStore.remove(playerEntity);
        }

        if (!this.inventoryManager.hasRoundsInMag(inventory, weaponWielded)) {
            if (this.reloadIntentComponentStore.has(playerEntity)) {
                return;
            }
            const reloadTime = this.weaponStatsComponentStore.has(playerEntity)
                ? this.weaponStatsComponentStore.get(playerEntity).reloadTime
                : WeaponConfig[weaponWielded].reloadTime;
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
        if (!this.debugManager.isDebugPointerActive) {
            const weaponConfig = WeaponConfig[weaponWielded]
            this.shootingRecoilIntentComponentStore.add(playerEntity, new ShootingRecoilIntentComponent(weaponConfig.shootingRecoil!))
            const spreadRadius = this.spreadRadiusComponentStore.get(playerEntity).spreadRadius;
            let shotTarget = this.randomShotWithinSpread(spreadRadius);
            if (weaponWielded === WeaponType.SHOTGUN) {
                shotTarget = this.currentMousePos;
            }
            this.intentShotComponentStore.add(playerEntity, new IntentShotComponent(
                shotTarget.x,
                shotTarget.y,
                isHold,
                weaponWielded,
            ));
        }
    }

    private randomShotWithinSpread(spreadRadius: number): { x: number; y: number } {
        if (spreadRadius <= 8) {
            return {
                x: this.currentMousePos.x,
                y: this.currentMousePos.y,
            };
        }

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * spreadRadius;

        return {
            x: this.currentMousePos.x + Math.cos(angle) * radius,
            y: this.currentMousePos.y + Math.sin(angle) * radius,
        };
    }

    private canCancelShotgunReload(playerEntity: number): boolean {
        if (!this.reloadIntentComponentStore.has(playerEntity)) {
            return false;
        }

        const inventory = this.inventoryComponentStore.getOrNull(playerEntity);
        if (!inventory || inventory.equippedWeaponType !== WeaponType.SHOTGUN) {
            return false;
        }

        return this.inventoryManager.hasRoundsInMag(inventory, WeaponType.SHOTGUN);
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


