import { SOUND_KEYS } from "../../game/asset-manager/consts/sound-mapped.values.js";
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AnimationComponent } from "../components/animation.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class FootstepAudioSystem implements ISystem {
    private static readonly minFootstepVolume = 0.04;
    private static readonly maxFootstepVolume = 0.08;
    private static readonly minFootstepPlaybackRate = 0.96;
    private static readonly maxFootstepPlaybackRate = 1.04;

    private static readonly footstepFrameSet = new Set<SpriteName>([
        SpriteName.PLAYER_RUNNING_1,
        SpriteName.PLAYER_RUNNING_4,
    ]);

    private static readonly footstepSounds = [
        SOUND_KEYS.FOOTSTEP_1,
        SOUND_KEYS.FOOTSTEP_2,
        SOUND_KEYS.FOOTSTEP_3,
        SOUND_KEYS.FOOTSTEP_4,
    ] as const;

    private previousSpriteByEntity = new Map<number, SpriteName>();
    private lastFootstepSoundIndexByEntity = new Map<number, number>();

    constructor(
        private soundEventBus: SoundEventBus,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
    ) { }

    update(_: number): void {
        const playerEntities = this.playerComponentStore.getAllEntities();
        const activePlayerEntitySet = new Set(playerEntities);

        this.removeDetachedEntities(activePlayerEntitySet);

        for (const entityId of playerEntities) {
            const animation = this.animationComponentStore.getOrNull(entityId);
            const sprite = this.spriteComponentStore.getOrNull(entityId);
            const hasMovementIntent = this.movementIntentComponentStore.has(entityId);

            if (!animation || !sprite || !hasMovementIntent || animation.animationName !== AnimationName.PLAYER_RUN) {
                this.previousSpriteByEntity.delete(entityId);
                continue;
            }

            const currentSprite = sprite.spriteName;
            const previousSprite = this.previousSpriteByEntity.get(entityId);

            if (
                currentSprite !== previousSprite
                && FootstepAudioSystem.footstepFrameSet.has(currentSprite)
            ) {
                this.emitFootstep(entityId);
            }

            this.previousSpriteByEntity.set(entityId, currentSprite);
        }
    }

    private emitFootstep(entityId: number): void {
        const soundIndex = this.getNextFootstepSoundIndex(entityId);
        const soundKey = FootstepAudioSystem.footstepSounds[soundIndex];

        this.soundEventBus.emitSound({
            key: soundKey,
            volume: this.randomInRange(
                FootstepAudioSystem.minFootstepVolume,
                FootstepAudioSystem.maxFootstepVolume,
            ),
            playbackRate: this.randomInRange(
                FootstepAudioSystem.minFootstepPlaybackRate,
                FootstepAudioSystem.maxFootstepPlaybackRate,
            ),
        });
    }

    private getNextFootstepSoundIndex(entityId: number): number {
        const soundCount = FootstepAudioSystem.footstepSounds.length;
        const lastSoundIndex = this.lastFootstepSoundIndexByEntity.get(entityId);

        if (soundCount <= 1) {
            this.lastFootstepSoundIndexByEntity.set(entityId, 0);
            return 0;
        }

        let nextSoundIndex = Math.floor(Math.random() * soundCount);
        while (lastSoundIndex != null && nextSoundIndex === lastSoundIndex) {
            nextSoundIndex = Math.floor(Math.random() * soundCount);
        }

        this.lastFootstepSoundIndexByEntity.set(entityId, nextSoundIndex);
        return nextSoundIndex;
    }

    private removeDetachedEntities(activePlayerEntitySet: Set<number>): void {
        for (const entityId of this.previousSpriteByEntity.keys()) {
            if (activePlayerEntitySet.has(entityId)) {
                continue;
            }

            this.previousSpriteByEntity.delete(entityId);
            this.lastFootstepSoundIndexByEntity.delete(entityId);
        }
    }

    private randomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
