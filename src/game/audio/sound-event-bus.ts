import { EmitSoundEvent, SoundEvent } from "../asset-manager/types/sound-event.js";

export class SoundEventBus {
    private queue: SoundEvent[] = [];

    emitSound(event: Omit<EmitSoundEvent, "type">): void {
        this.queue.push({
            type: "emit",
            ...event,
        });
    }

    stopSound(soundId: string): void {
        this.queue.push({
            type: "stop",
            soundId,
        });
    }

    consume(): SoundEvent[] {
        const events = this.queue;
        this.queue = [];
        return events;
    }
}