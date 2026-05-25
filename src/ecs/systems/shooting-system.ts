import { CameraManager } from "../../game/world/camera-manager.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { CombatStimActiveComponent } from "../components/combat-stim-active-component.js";
import { DisableAimComponent } from "../components/disable-aim.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { IntentMeleeComponent } from "../components/intent-melee.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
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
import { PlayerFovComponent } from "../components/player-fov.component.js";

const keys: Record<string, boolean> = {};

type ShotTarget = {
    x: number;
    y: number;
};

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
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private combatStimActiveComponentStore: ComponentStore<CombatStimActiveComponent>,
        private playerFovComponentStore : ComponentStore<PlayerFovComponent>,
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

        const playerEntity = this.getPlayerEntity();
        if (playerEntity == null) {
            this.clearMouseShotState();
            return;
        }

        if (this.lastMouseEvent && !this.updateMousePosition(this.lastMouseEvent)) {
            this.pendingMouseDownShot = false;
            return;
        }

        const canAttemptShot = this.canAttemptShot(playerEntity);

        if (this.pendingMouseDownShot) {
            this.pendingMouseDownShot = false;
            if (canAttemptShot) {
                this.pushShotIntent(deltaTime, false); // first shot from a mouse press
            }
        } else if (this.isMouseDown && canAttemptShot) {
            this.pushShotIntent(deltaTime, true); // isHold = true
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
            this.pendingMouseDownShot = this.updateMousePosition(e);
            if (!this.pendingMouseDownShot) {
                this.isMouseDown = false;
            }
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

    private updateMousePosition = (e: MouseEvent): boolean => {
        this.lastMouseEvent = e;
        const playerId = this.getPlayerEntity();
        if (playerId == null) {
            return false;
        }

        if (this.disableAimComponentStore.has(playerId)) {
            return false;
        }

        const effectiveShooterPosition = this.resolveEffectiveShooterPositionOrNull(playerId);
        const playerSprite = this.spriteComponentStore.getOrNull(playerId);
        const weaponComponent = this.weaponComponentStore.getOrNull(playerId);
        const weaponAttachments = this.weaponAttachmentComponentStore.getValuesAndEntityId();
        const weaponAttachment = weaponAttachments.find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == playerId);
        if (!effectiveShooterPosition || !playerSprite || !weaponComponent || !weaponAttachment) {
            return false;
        }

        const weaponEntityId = weaponAttachment[0];
        const baseAnchor = resolveWeaponAttachmentBaseAnchor(
            effectiveShooterPosition,
            playerSprite,
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
        this.playerFovComponentStore.add(playerId, new PlayerFovComponent(angle));
        this.currentMousePos = {
            x: mouseWorldPosition.x,
            y: mouseWorldPosition.y,
        };
        return true;
    }

    private pushShotIntent(deltaTime: number, isHold: boolean) {
        const playerEntity = this.getPlayerEntity();
        if (playerEntity == null) return;

        const inventory = this.inventoryComponentStore.getOrNull(playerEntity)
        if (!inventory) return;

        const weaponWielded = inventory.equippedWeaponType;
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

        if (!this.debugManager.isDebugPointerActive) {
            const weaponConfig = WeaponConfig[weaponWielded]
            const weaponStats = this.weaponStatsComponentStore.getOrNull(playerEntity);
            this.shootingRecoilIntentComponentStore.add(playerEntity, new ShootingRecoilIntentComponent(weaponConfig.shootingRecoil!))
            const spreadRadius = this.resolveSpreadRadius(playerEntity, weaponWielded);
            let shotTarget = this.randomShotWithinSpread(spreadRadius);
            if (weaponWielded === WeaponType.SHOTGUN) {
                shotTarget = this.currentMousePos;
            }
            shotTarget = this.resolveShotTargetWithCombatStimPrecision(
                playerEntity,
                shotTarget,
                weaponStats?.projectileVelocity ?? weaponConfig.projectileVelocity,
                deltaTime,
            );
            this.intentShotComponentStore.add(playerEntity, new IntentShotComponent(
                shotTarget.x,
                shotTarget.y,
                isHold,
                weaponWielded,
            ));
        }
    }

    private resolveShotTargetWithCombatStimPrecision(
        playerEntity: number,
        shotTarget: ShotTarget,
        projectileVelocity: number | null,
        deltaTime: number,
    ): ShotTarget {
        const combatStim = this.combatStimActiveComponentStore.getOrNull(playerEntity);
        if (!combatStim?.runnningPrecision) {
            return shotTarget;
        }

        const followFactor = this.clamp01(combatStim.runAndGunCrosshairFollowFactor);
        if (followFactor <= 0) {
            return shotTarget;
        }

        const crosshairTarget = {
            x: shotTarget.x + (this.currentMousePos.x - shotTarget.x) * followFactor,
            y: shotTarget.y + (this.currentMousePos.y - shotTarget.y) * followFactor,
        };

        const leadFactor = this.clampNonNegative(combatStim.runAndGunCameraLeadFactor);
        if (leadFactor <= 0 || projectileVelocity == null || projectileVelocity <= 0 || deltaTime <= 0) {
            return crosshairTarget;
        }

        const movementDelta = this.resolveShooterMovementDelta(playerEntity);
        if (movementDelta.x === 0 && movementDelta.y === 0) {
            return crosshairTarget;
        }

        const aimOrigin = this.resolvePlayerAimBaseAnchor(playerEntity);
        const cameraVelocity = {
            x: movementDelta.x / deltaTime,
            y: movementDelta.y / deltaTime,
        };
        const travelTime = this.resolveProjectileTravelTime(
            aimOrigin,
            crosshairTarget,
            cameraVelocity,
            projectileVelocity,
        );

        if (travelTime <= 0) {
            return crosshairTarget;
        }

        return {
            x: crosshairTarget.x + cameraVelocity.x * travelTime * leadFactor,
            y: crosshairTarget.y + cameraVelocity.y * travelTime * leadFactor,
        };
    }

    private resolveSpreadRadius(playerEntity: number, weaponType: WeaponType): number {
        const spread = this.spreadRadiusComponentStore.getOrNull(playerEntity);
        if (spread) {
            return spread.spreadRadius;
        }

        const fallbackRadius = WeaponConfig[weaponType].spreadMinRadius ?? 0;
        this.spreadRadiusComponentStore.add(
            playerEntity,
            new SpreadRadiusComponent(fallbackRadius),
        );

        return fallbackRadius;
    }

    private resolveEffectiveShooterPositionOrNull(playerEntity: number): PositionComponent | null {
        return this.movementIntentComponentStore.getOrNull(playerEntity)
            ?? this.positionComponentStore.getOrNull(playerEntity);
    }

    private resolveShooterMovementDelta(playerEntity: number): ShotTarget {
        const movementIntent = this.movementIntentComponentStore.getOrNull(playerEntity);
        const currentPosition = this.positionComponentStore.getOrNull(playerEntity);

        if (!movementIntent || !currentPosition) {
            return { x: 0, y: 0 };
        }

        return {
            x: movementIntent.x - currentPosition.x,
            y: movementIntent.y - currentPosition.y,
        };
    }

    private resolvePlayerAimBaseAnchor(playerEntity: number): ShotTarget {
        const effectiveShooterPosition = this.resolveEffectiveShooterPositionOrNull(playerEntity);
        if (!effectiveShooterPosition) {
            return this.currentMousePos;
        }

        const weaponAttachment = this.weaponAttachmentComponentStore
            .getValuesAndEntityId()
            .find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == playerEntity);
        const playerSprite = this.spriteComponentStore.getOrNull(playerEntity);

        if (!weaponAttachment || !playerSprite) {
            return effectiveShooterPosition;
        }

        return resolveWeaponAttachmentBaseAnchor(
            effectiveShooterPosition,
            playerSprite,
            weaponAttachment[1],
        );
    }

    private resolveProjectileTravelTime(
        aimOrigin: ShotTarget,
        target: ShotTarget,
        targetVelocity: ShotTarget,
        projectileVelocity: number,
    ): number {
        const targetDelta = {
            x: target.x - aimOrigin.x,
            y: target.y - aimOrigin.y,
        };
        const a = targetVelocity.x * targetVelocity.x
            + targetVelocity.y * targetVelocity.y
            - projectileVelocity * projectileVelocity;
        const b = 2 * (targetDelta.x * targetVelocity.x + targetDelta.y * targetVelocity.y);
        const c = targetDelta.x * targetDelta.x + targetDelta.y * targetDelta.y;

        if (Math.abs(a) < 0.0001) {
            return b !== 0
                ? Math.max(0, -c / b)
                : Math.sqrt(c) / projectileVelocity;
        }

        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            return Math.sqrt(c) / projectileVelocity;
        }

        const sqrtDiscriminant = Math.sqrt(discriminant);
        const timeA = (-b - sqrtDiscriminant) / (2 * a);
        const timeB = (-b + sqrtDiscriminant) / (2 * a);
        const positiveTimes = [timeA, timeB].filter((time) => time > 0);

        return positiveTimes.length > 0
            ? Math.min(...positiveTimes)
            : Math.sqrt(c) / projectileVelocity;
    }

    private clamp01(value: number): number {
        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.max(0, Math.min(value, 1));
    }

    private clampNonNegative(value: number): number {
        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.max(0, value);
    }

    private randomShotWithinSpread(spreadRadius: number): ShotTarget {
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
        const playerEntity = this.getPlayerEntity();
        if (playerEntity == null) return;

        const inventory = this.inventoryComponentStore.getOrNull(playerEntity)
        if (!inventory) return;
        if (this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Grenade) == 0) return;
        if (!this.positionComponentStore.has(playerEntity)) return;

        this.intentGrenadeComponentStore.add(playerEntity, new IntentGrenadeComponent(
            this.currentMousePos.x,
            this.currentMousePos.y,
        ));
    }

    private pushMeeleIntent() {
        const playerEntity = this.getPlayerEntity();
        if (playerEntity == null) return;

        if (this.disableAimComponentStore.has(playerEntity)) return;
        if (!this.positionComponentStore.has(playerEntity)) return;

        this.intentMeleeComponentStore.add(playerEntity, new IntentMeleeComponent(
            this.currentMousePos.x,
            this.currentMousePos.y,
        ));
    }

    private getPlayerEntity(): number | null {
        return this.playerComponentStore.getAllEntities()[0] ?? null;
    }

    private clearMouseShotState(): void {
        this.isMouseDown = false;
        this.pendingMouseDownShot = false;
    }
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});


