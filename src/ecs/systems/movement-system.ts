import { InventoryComponent } from "../components/inventory-component.js";
import { MovementImprecisionIntentComponent } from "../components/movement-imprecision-intent.component.js";
import { MovementInputComponent } from "../components/movement-input.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { WeaponConfig } from "../components/types/weapon-config.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

const MOVEMENT_ACCELERATION_SECONDS = 0.12;
const MOVEMENT_DECELERATION_SECONDS = 0.16;
const MIN_MOVEMENT_SPEED = 0.001;

export class MovementSystem implements ISystem {
    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private movementInputComponentStore: ComponentStore<MovementInputComponent>,
        private velocityComponentStore: ComponentStore<VelocityComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private movementImprecisionIntentComponent: ComponentStore<MovementImprecisionIntentComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
    ) { }

    prepareMovementIntents(deltaTime: number): void {
        for (const playerEntity of this.playerComponentStore.getAllEntities()) {
            const position = this.positionComponentStore.getOrNull(playerEntity);
            const velocity = this.velocityComponentStore.getOrNull(playerEntity);

            if (!position || !velocity) continue;

            const input = this.movementInputComponentStore.getOrNull(playerEntity);
            const maxSpeed = this.getMaxSpeed(velocity);

            if (maxSpeed <= 0) {
                velocity.currentMovementVelocityX = 0;
                velocity.currentMovementVelocityY = 0;
                this.movementIntentComponentStore.remove(playerEntity);
                continue;
            }

            this.clampCurrentMovementVelocity(velocity, maxSpeed);

            const targetVelocity = input
                ? {
                    x: input.dx * maxSpeed,
                    y: input.dy * maxSpeed,
                }
                : {
                    x: 0,
                    y: 0,
                };

            const timeToTarget = input
                ? MOVEMENT_ACCELERATION_SECONDS
                : MOVEMENT_DECELERATION_SECONDS;
            const velocityStep = (maxSpeed / timeToTarget) * deltaTime;
            const nextVelocity = this.moveVelocityTowards(
                velocity.currentMovementVelocityX,
                velocity.currentMovementVelocityY,
                targetVelocity.x,
                targetVelocity.y,
                velocityStep,
            );

            velocity.currentMovementVelocityX = nextVelocity.x;
            velocity.currentMovementVelocityY = nextVelocity.y;

            const currentSpeed = Math.hypot(
                velocity.currentMovementVelocityX,
                velocity.currentMovementVelocityY,
            );

            if (currentSpeed <= MIN_MOVEMENT_SPEED) {
                velocity.currentMovementVelocityX = 0;
                velocity.currentMovementVelocityY = 0;
                this.movementIntentComponentStore.remove(playerEntity);
                continue;
            }

            this.movementIntentComponentStore.add(
                playerEntity,
                new MovementIntentComponent(
                    position.x + velocity.currentMovementVelocityX,
                    position.y + velocity.currentMovementVelocityY,
                ),
            );
        }
    }

    update(deltaTime: number): void {
        const entities = this.movementIntentComponentStore.getAllEntities();
        const playerEntity = this.playerComponentStore.getAllEntities()[0];


        for (const entity of entities) {

            const intent = this.movementIntentComponentStore.getOrNull(entity);
            //console.log("entity, intent", entity, intent);

            if (!intent) continue;

            this.positionComponentStore.add(entity, new PositionComponent(intent.x, intent.y));

            if (entity === playerEntity) {
                const equippedWeapon = this.inventoryComponentStore.get(entity).equippedWeaponType;
                if (equippedWeapon === null) continue;
                const movementImprecision = WeaponConfig[equippedWeapon].walkingRecoil
                this.movementImprecisionIntentComponent.add(entity, new MovementImprecisionIntentComponent(movementImprecision!));
            }

            //We remove the intent after moving the entity.
            this.movementIntentComponentStore.remove(entity);
        }
    }

    private getMaxSpeed(velocity: VelocityComponent): number {
        return Math.max(
            Math.abs(velocity.currentVelocityX),
            Math.abs(velocity.currentVelocityY),
        );
    }

    private clampCurrentMovementVelocity(velocity: VelocityComponent, maxSpeed: number): void {
        const currentSpeed = Math.hypot(
            velocity.currentMovementVelocityX,
            velocity.currentMovementVelocityY,
        );

        if (currentSpeed <= maxSpeed || currentSpeed <= 0) {
            return;
        }

        const scale = maxSpeed / currentSpeed;
        velocity.currentMovementVelocityX *= scale;
        velocity.currentMovementVelocityY *= scale;
    }

    private moveVelocityTowards(
        currentX: number,
        currentY: number,
        targetX: number,
        targetY: number,
        maxDelta: number,
    ): { x: number; y: number } {
        const deltaX = targetX - currentX;
        const deltaY = targetY - currentY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance <= maxDelta || distance <= 0) {
            return { x: targetX, y: targetY };
        }

        const scale = maxDelta / distance;
        return {
            x: currentX + deltaX * scale,
            y: currentY + deltaY * scale,
        };
    }
}
