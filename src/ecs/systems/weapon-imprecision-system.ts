import { FocusFireIntentComponent } from "../components/focus-fire-intent.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { MovementImprecisionIntentComponent } from "../components/movement-imprecision-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShootingRecoilIntentComponent } from "../components/shooting-recoil-intent.component.js";
import { SpreadRadiusComponent } from "../components/spread-radius.component.js";
import {
    WeaponConfig as WEAPON_CONFIG,
    type WeaponConfig as WeaponConfigValues,
    type WeaponType,
} from "../components/types/weapon-config.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

type Position = {
    x: number,
    y: number
}

type SpreadBounds = {
    max: number,
    min: number
}

type WeaponImprecisionContext = {
    bounds: SpreadBounds,
    equippedWeapon: WeaponType,
    playerEntity: number,
    playerPosition: Position,
    spread: SpreadRadiusComponent,
    weaponConfig: WeaponConfigValues,
}

export class WeaponImprecisionSystem implements ISystem {
    private readonly focusFireMovementRadius = 16;
    private lastEquippedWeapon: WeaponType | null = null;
    private lastPosition: Position | null = null;
    private standingStillTime: number = 0;

    constructor(
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spreadRadiusComponentStore: ComponentStore<SpreadRadiusComponent>,
        private movementImprecisionIntentComponentStore: ComponentStore<MovementImprecisionIntentComponent>,
        private shootingRecoilIntentComponentStore: ComponentStore<ShootingRecoilIntentComponent>,
        private focusFireIntentComponent: ComponentStore<FocusFireIntentComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
    ) { }
    update(deltaTime: number): void {
        const context = this.resolveContext();
        if (!context) {
            this.resetFocusFireState();
            this.lastEquippedWeapon = null;
            return;
        }

        if (this.lastEquippedWeapon !== context.equippedWeapon) {
            this.resetFocusFireState(context.playerEntity);
            this.lastEquippedWeapon = context.equippedWeapon;
        }

        this.processMovementImprecision(context);
        const interruptedFocusFire = this.processShootingImprecision(context);
        if (interruptedFocusFire) {
            this.pauseFocusFireRecovery(context.playerEntity);
            return;
        }

        this.checkFocusFireConditions(context, deltaTime);
        this.recoverImprecision(context, deltaTime);
    }

    private checkFocusFireConditions(context: WeaponImprecisionContext, deltaTime: number) {
        const focusFireTime = context.weaponConfig.focusFireTime;
        if (focusFireTime == null) {
            this.resetFocusFireState(context.playerEntity);
            return;
        }

        if (!this.lastPosition) {
            this.lastPosition = context.playerPosition;
            return;
        }

        const deltaX = context.playerPosition.x - this.lastPosition.x;
        const deltaY = context.playerPosition.y - this.lastPosition.y;
        const distanceFromLastPosition = Math.hypot(deltaX, deltaY);

        if (distanceFromLastPosition > this.focusFireMovementRadius) {
            this.resetFocusFireState(context.playerEntity);
            this.lastPosition = context.playerPosition;
            return;
        }

        this.standingStillTime += deltaTime;

        if (this.standingStillTime >= focusFireTime && !this.focusFireIntentComponent.has(context.playerEntity)) {
            this.focusFireIntentComponent.add(context.playerEntity, new FocusFireIntentComponent());
        }
    }

    private processMovementImprecision(context: WeaponImprecisionContext) {
        if (this.movementImprecisionIntentComponentStore.getAllEntities().length === 0) return;
        const movementImprecision = this.movementImprecisionIntentComponentStore.getOrNull(context.playerEntity);
        if (!movementImprecision) return;

        context.spread.spreadRadius = this.clampSpreadRadius(
            context.spread.spreadRadius + movementImprecision.movementImprecisionPerFrame,
            context.bounds,
        );
        this.movementImprecisionIntentComponentStore.remove(context.playerEntity)
    }

    private processShootingImprecision(context: WeaponImprecisionContext): boolean {
        if (this.shootingRecoilIntentComponentStore.getAllEntities().length === 0) return false;
        const shootingRecoil = this.shootingRecoilIntentComponentStore.getOrNull(context.playerEntity);
        if (!shootingRecoil) return false;

        context.spread.spreadRadius = this.clampSpreadRadius(
            context.spread.spreadRadius + shootingRecoil.shootingRecoilPerShot,
            context.bounds,
        );
        this.shootingRecoilIntentComponentStore.remove(context.playerEntity);
        return true;
    }

    private recoverImprecision(context: WeaponImprecisionContext, deltaTime: number) {
        if (this.focusFireIntentComponent.getAllEntities().length === 0) return;
        if (!this.focusFireIntentComponent.has(context.playerEntity)) return;

        const recoilRecoverVelocity = context.weaponConfig.recoilRecoverVelocity;
        if (recoilRecoverVelocity == null) return;

        const recoverPrecisionScaled = recoilRecoverVelocity * deltaTime;

        context.spread.spreadRadius = this.clampSpreadRadius(
            context.spread.spreadRadius - recoverPrecisionScaled,
            context.bounds,
        );
    }

    private resolveContext(): WeaponImprecisionContext | null {
        const playerEntity = this.playerComponentStore.getAllEntities()[0];
        if (playerEntity == null) {
            return null;
        }

        const playerPosition = this.positionComponentStore.getOrNull(playerEntity);
        const inventory = this.inventoryComponentStore.getOrNull(playerEntity);
        const equippedWeapon = inventory?.equippedWeaponType;
        if (!playerPosition || equippedWeapon == null) {
            this.spreadRadiusComponentStore.remove(playerEntity);
            return null;
        }

        const weaponConfig = WEAPON_CONFIG[equippedWeapon];
        const bounds = this.resolveSpreadBounds(weaponConfig);
        if (!bounds) {
            this.spreadRadiusComponentStore.remove(playerEntity);
            return null;
        }

        const spread = this.resolveSpreadRadiusComponent(playerEntity, bounds);

        return {
            bounds,
            equippedWeapon,
            playerEntity,
            playerPosition: {
                x: playerPosition.x,
                y: playerPosition.y,
            },
            spread,
            weaponConfig,
        };
    }

    private resolveSpreadRadiusComponent(
        playerEntity: number,
        bounds: SpreadBounds,
    ): SpreadRadiusComponent {
        const spread = this.spreadRadiusComponentStore.getOrNull(playerEntity);
        if (spread) {
            spread.spreadRadius = this.clampSpreadRadius(spread.spreadRadius, bounds);
            return spread;
        }

        const nextSpread = new SpreadRadiusComponent(bounds.min);
        this.spreadRadiusComponentStore.add(playerEntity, nextSpread);
        return nextSpread;
    }

    private resolveSpreadBounds(weaponConfig: WeaponConfigValues): SpreadBounds | null {
        if (weaponConfig.spreadMinRadius == null || weaponConfig.spreadMaxRadius == null) {
            return null;
        }

        return {
            max: Math.max(weaponConfig.spreadMinRadius, weaponConfig.spreadMaxRadius),
            min: Math.min(weaponConfig.spreadMinRadius, weaponConfig.spreadMaxRadius),
        };
    }

    private clampSpreadRadius(value: number, bounds: SpreadBounds): number {
        return Math.max(bounds.min, Math.min(value, bounds.max));
    }

    private resetFocusFireState(playerEntity?: number): void {
        this.lastPosition = null;
        this.standingStillTime = 0;

        if (playerEntity == null) {
            for (const focusFireEntity of this.focusFireIntentComponent.getAllEntities()) {
                this.focusFireIntentComponent.remove(focusFireEntity);
            }
            return;
        }

        if (this.focusFireIntentComponent.has(playerEntity)) {
            this.focusFireIntentComponent.remove(playerEntity);
        }
    }

    private pauseFocusFireRecovery(playerEntity: number): void {
        if (this.focusFireIntentComponent.has(playerEntity)) {
            this.focusFireIntentComponent.remove(playerEntity);
        }
    }
}
