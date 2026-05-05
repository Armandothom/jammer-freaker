import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { EmitSoundEvent } from "../../game/asset-manager/types/sound-event.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { ISystem } from "./system.interface.js";

export class AudioSystem implements ISystem {
    private requestSoundInstance: Map<string, string> = new Map();
    private requestLastPlayedAtMs: Map<string, number> = new Map();

    constructor(
        private soundManager: SoundManager,
        private soundEventBus: SoundEventBus,
    ) {

    }
    update(deltaTime: number): void {
        const events = this.soundEventBus.consume();
        const nowMs = performance.now();

        for (const event of events) {
            if (event.type === "emit") {
                if (this.shouldSkipEmit(event, nowMs)) {
                    continue;
                }

                const requestId = event.requestId;
                const soundId = this.soundManager.playSound(
                    event.key,
                    event.loop ?? false,
                    event.volume ?? 1,
                    (finishedSoundId) => {
                        if (!requestId) return;

                        this.releaseFinishedRequestSound(requestId, finishedSoundId);
                    },
                    event.playbackRate ?? 1,
                );

                if (soundId && requestId) {
                    this.requestSoundInstance.set(requestId, soundId);
                    this.requestLastPlayedAtMs.set(requestId, nowMs);
                }
                continue;
            }

            if (event.type === "stop") {
                this.soundManager.stopSound(event.soundId);
            }
        }
    }

    stopByRequestId(requestId: string): void {
        const soundId = this.requestSoundInstance.get(requestId);
        if (!soundId) return;

        this.soundManager.stopSound(soundId);
        this.requestSoundInstance.delete(requestId);
    }

    private shouldSkipEmit(event: EmitSoundEvent, nowMs: number): boolean {
        const mode = event.mode ?? "always";
        const requestId = event.requestId;
        if (!requestId || mode === "always") {
            return false;
        }

        if (mode === "if-not-playing") {
            return this.requestSoundInstance.has(requestId);
        }

        const cooldownMs = event.cooldownMs ?? 0;
        if (cooldownMs <= 0) {
            return false;
        }

        const lastPlayedAtMs = this.requestLastPlayedAtMs.get(requestId);
        if (lastPlayedAtMs == null) {
            return false;
        }

        return nowMs - lastPlayedAtMs < cooldownMs;
    }

    private releaseFinishedRequestSound(requestId: string, soundId: string): void {
        if (this.requestSoundInstance.get(requestId) !== soundId) {
            return;
        }

        this.requestSoundInstance.delete(requestId);
    }
}
