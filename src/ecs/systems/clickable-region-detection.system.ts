import { ButtonClickIntentComponent } from "../components/button-click-intent.component.js";
import { ClickableRegionComponent } from "../components/clickable-region-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

type Rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

type ScreenPosition = {
    x: number;
    y: number;
};

export class ClickableRegionDetectionSystem implements ISystem {
    private pendingClick: ScreenPosition | null = null;
    private canvas: HTMLCanvasElement;

    constructor(
        private clickableRegionComponentStore: ComponentStore<ClickableRegionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private buttonClickIntentComponentStore: ComponentStore<ButtonClickIntentComponent>,
    ) {
        const canvas = document.querySelector("canvas");

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("ClickableRegionDetectionSystem: canvas não encontrado no DOM.");
        }

        this.canvas = canvas;
        this.initListeners();
    }

    update(_deltaTime: number): void {
        if (!this.pendingClick) return;

        const click = this.pendingClick;
        this.pendingClick = null;

        for (const region of this.clickableRegionComponentStore.getAllEntities()) {
            const clickableRegion = this.clickableRegionComponentStore.get(region);
            const sprite = this.spriteComponentStore.get(region);
            const regionRect = this.getClickableRegion(clickableRegion, sprite);

            if (this.detectClickInRegion(click, regionRect)) {
                this.buttonClickIntentComponentStore.add(region, new ButtonClickIntentComponent());
                return;
            }
        }
    }

    private detectClickInRegion(click: ScreenPosition, regionRect: Rect): boolean {
        return (
            click.x >= regionRect.left &&
            click.x <= regionRect.right &&
            click.y >= regionRect.top &&
            click.y <= regionRect.bottom
        );
    }

    private getClickableRegion(clickableRegion: ClickableRegionComponent, sprite: SpriteComponent): Rect {
        return {
            left: clickableRegion.startX,
            right: clickableRegion.startX + sprite.width,
            top: clickableRegion.startY,
            bottom: clickableRegion.startY + sprite.height,
        };
    }

    private initListeners(): void {
        this.canvas.addEventListener("mousedown", (event: MouseEvent) => {
            this.pendingClick = this.getClickScreenPosition(event);
        });
    }

    private getClickScreenPosition(event: MouseEvent): ScreenPosition {
        const rect = this.canvas.getBoundingClientRect();

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    }
}