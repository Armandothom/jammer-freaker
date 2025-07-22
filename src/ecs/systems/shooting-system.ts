import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

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
    ) {
        this.canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        this.initListeners();
    };

    update(deltaTime: number): void {
        if (this.isMouseDown) {
            this.pushShotIntent(true); // isHold = true
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
        const weaponAttachments = this.weaponAttachmentComponentStore.getValuesAndEntityId();
        const weaponAttachment = weaponAttachments.find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == playerId)!;
        const weaponPosition = this.positionComponentStore.get(weaponAttachment[0]);
        const sprite = this.spriteComponentStore.get(weaponAttachment[0]);
        const rect = this.canvas.getBoundingClientRect();
        const mousePosX = e.clientX - rect.left;
        const mousePosY = e.clientY - rect.top;
        const dx = mousePosX - weaponPosition.x;
        const dy = mousePosY - weaponPosition.y;
        const angle = Math.atan2(dy, dx);
        this.aimShootingComponentStore.add(weaponAttachment[0], new AimShootingComponent(angle, sprite.height * 5 / 20));
        this.currentMousePos = {
            x: mousePosX,
            y: mousePosY,
        };
    }

    private pushShotIntent(isHold: boolean) {
        const playerIds = this.playerComponentStore.getAllEntities();
        let playerPos: { x: number, y: number } | undefined;
        for (const playerId of playerIds) {
            playerPos = this.positionComponentStore.get(playerId);
            this.intentShotComponentStore.add(playerId, new IntentShotComponent(
                this.currentMousePos.x,
                this.currentMousePos.y,
                isHold
            ))
        }
    }
}
