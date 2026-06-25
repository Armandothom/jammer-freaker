import { SOUND_KEYS, type SoundKey } from "../../game/asset-manager/consts/sound-mapped.values.js";
import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { WorldGroundTileType } from "../../game/world-map/types/tilemap-tile.js";
import { WorldTilemapManager } from "../../game/world-map/world-tilemap-manager.js";
import { AnimationComponent } from "../components/animation.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
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

    private static readonly defaultFootstepSounds = [
        SOUND_KEYS.FOOTSTEP_1,
        SOUND_KEYS.FOOTSTEP_2,
        SOUND_KEYS.FOOTSTEP_3,
        SOUND_KEYS.FOOTSTEP_4,
    ] as const satisfies readonly SoundKey[];

    // Swap these as soon as terrain-specific assets exist
    private static readonly softGroundFootstepSounds = FootstepAudioSystem.defaultFootstepSounds;
    private static readonly streetFootstepSounds = FootstepAudioSystem.defaultFootstepSounds;
    private static readonly sidewalkFootstepSounds = FootstepAudioSystem.defaultFootstepSounds;
    private static readonly buildingFootstepSounds = FootstepAudioSystem.defaultFootstepSounds;
    private static readonly waterFootstepSounds = FootstepAudioSystem.defaultFootstepSounds;

    private previousSpriteByEntity = new Map<number, SpriteName>();
    private lastFootstepSoundByEntity = new Map<number, SoundKey>();

    constructor(
        private soundEventBus: SoundEventBus,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private animationComponentStore: ComponentStore<AnimationComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private worldTilemapManager: WorldTilemapManager,
    ) { }

    update(_: number): void {
        const playerEntities = this.playerComponentStore.getAllEntities();
        const activePlayerEntitySet = new Set(playerEntities);

        this.removeDetachedEntities(activePlayerEntitySet);

        for (const entityId of playerEntities) {
            const animation = this.animationComponentStore.getOrNull(entityId);
            const position = this.positionComponentStore.getOrNull(entityId);
            const sprite = this.spriteComponentStore.getOrNull(entityId);
            const movementIntent = this.movementIntentComponentStore.getOrNull(entityId);

            if (!animation || !position || !sprite || !movementIntent || animation.animationName !== AnimationName.PLAYER_RUN) {
                this.previousSpriteByEntity.delete(entityId);
                continue;
            }

            const currentSprite = sprite.spriteName;
            const previousSprite = this.previousSpriteByEntity.get(entityId);

            if (
                currentSprite !== previousSprite
                && FootstepAudioSystem.footstepFrameSet.has(currentSprite)
            ) {
                this.emitFootstep(entityId, movementIntent, sprite);
            }

            this.previousSpriteByEntity.set(entityId, currentSprite);
        }
    }

    private emitFootstep(entityId: number, position: Pick<PositionComponent, "x" | "y">, sprite: SpriteComponent): void {
        const tileType = this.resolveFootstepTileType(position, sprite);
        const soundKeys = this.resolveFootstepSounds(tileType);
        const soundKey = this.getNextFootstepSoundKey(entityId, soundKeys);

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

    private resolveFootstepTileType(
        position: Pick<PositionComponent, "x" | "y">,
        sprite: SpriteComponent,
    ): WorldGroundTileType | null {
        const footstepX = position.x + sprite.width / 2;
        const footstepY = position.y + Math.max(0, sprite.height - 1);

        return this.worldTilemapManager.getTileTypeAtWorldPosition(footstepX, footstepY);
    }

    private resolveFootstepSounds(tileType: WorldGroundTileType | null): readonly SoundKey[] {
        switch (tileType) {
            case "ground":
            case "ground_green":
            case "plot":
            case "player_spawn":
            case "extraction_area":
                return FootstepAudioSystem.softGroundFootstepSounds;

            case "street":
            case "street_middle":
                return FootstepAudioSystem.streetFootstepSounds;

            case "sidewalk":
            case "sidewalk_curb":
            case "sidewalk_curb_north":
            case "sidewalk_curb_south":
            case "sidewalk_curb_west":
            case "sidewalk_curb_east":
            case "sidewalk_curb_corner_north_west":
            case "sidewalk_curb_corner_north_east":
            case "sidewalk_curb_corner_south_west":
            case "sidewalk_curb_corner_south_east":
            case "sidewalk_curb_corner_single_north_west":
            case "sidewalk_curb_corner_single_north_east":
            case "sidewalk_curb_corner_single_south_west":
            case "sidewalk_curb_corner_single_south_east":
                return FootstepAudioSystem.sidewalkFootstepSounds;

            case "building_floor":
            case "building_door":
                return FootstepAudioSystem.buildingFootstepSounds;

            case "river":
                return FootstepAudioSystem.waterFootstepSounds;

            case "map_wall_visible":
            case "map_wall_visible_north":
            case "map_wall_visible_south":
            case "map_wall_visible_west":
            case "map_wall_visible_east":
            case "map_wall_visible_corner_north_west":
            case "map_wall_visible_corner_north_east":
            case "map_wall_visible_corner_south_west":
            case "map_wall_visible_corner_south_east":
            case "out_of_bounds":
            case null:
            default:
                return FootstepAudioSystem.defaultFootstepSounds;
        }
    }

    private getNextFootstepSoundKey(entityId: number, soundKeys: readonly SoundKey[]): SoundKey {
        const soundCount = soundKeys.length;
        const lastSoundKey = this.lastFootstepSoundByEntity.get(entityId);

        if (soundCount <= 1) {
            const onlySoundKey = soundKeys[0] ?? SOUND_KEYS.FOOTSTEP_1;
            this.lastFootstepSoundByEntity.set(entityId, onlySoundKey);
            return onlySoundKey;
        }

        let nextSoundIndex = Math.floor(Math.random() * soundCount);
        while (lastSoundKey != null && soundKeys[nextSoundIndex] === lastSoundKey) {
            nextSoundIndex = Math.floor(Math.random() * soundCount);
        }

        const nextSoundKey = soundKeys[nextSoundIndex];
        this.lastFootstepSoundByEntity.set(entityId, nextSoundKey);
        return nextSoundKey;
    }

    private removeDetachedEntities(activePlayerEntitySet: Set<number>): void {
        for (const entityId of this.previousSpriteByEntity.keys()) {
            if (activePlayerEntitySet.has(entityId)) {
                continue;
            }

            this.previousSpriteByEntity.delete(entityId);
            this.lastFootstepSoundByEntity.delete(entityId);
        }
    }

    private randomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
