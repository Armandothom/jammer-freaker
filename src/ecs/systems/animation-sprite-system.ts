
import { ANIMATION_MAPPED } from "../../game/asset-manager/consts/animation-mapped.values.js";
import { AnimationComponent } from "../components/animation.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { CoreManager } from "../core/core-manager.js";
import { ISystem } from "./system.interface.js";


export class AnimationSpriteSystem implements ISystem {
    constructor(
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
    ) { }

    update(deltaTime: number): void {
        const entitiesWithAnim = this.animationComponentStore.getAllEntities();
        for (const entityId of entitiesWithAnim) {
            const animComponent = this.animationComponentStore.get(entityId);
            const keyframes = ANIMATION_MAPPED.get(animComponent.animationName);

            if (!keyframes) {
                continue
            };

            // We limit the loopedTime with modulos operator to the max of the totalDuration, then we find the current frame
            const sortedFrames = Array.from(keyframes.values())
                .sort((a, b) => a.order - b.order);
            const timePassed = CoreManager.timeGlobalSinceStart - animComponent.startAnimationTime;
            const totalDuration = sortedFrames.reduce((sum, frame) => sum + frame.durationKeyFrame, 0);
            const effectiveTime = animComponent.loop ? timePassed % totalDuration : Math.min(timePassed, totalDuration);
            let accumulator = 0;
            let currentFrame = sortedFrames[0];
            for (const frame of sortedFrames) {
                accumulator += frame.durationKeyFrame;
                if (effectiveTime <= accumulator) {
                    currentFrame = frame;
                    break;
                }
            }

            //console.log("currentSprite", currentFrame.spriteName, currentFrame.spriteSheetName);            
            this.spriteComponentStore.add(entityId, new SpriteComponent(
                currentFrame.spriteName,
                currentFrame.spriteSheetName
            ));
        }
    }

}