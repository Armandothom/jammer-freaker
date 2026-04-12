import { SoundKey, SoundMap } from "./consts/sound-mapped.values.js";

type ActiveSound = {
    source: AudioBufferSourceNode;
    gainNode: GainNode;
    key: SoundKey;
    loop: boolean;
};

export class SoundManager {
    private audioContext: AudioContext;
    private buffers: Map<SoundKey, AudioBuffer> = new Map();
    private currentSources: Map<string, ActiveSound> = new Map();
    private idCounter = 0;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    async loadMultipleSounds(): Promise<void> {
        const keys = Object.keys(SoundMap) as SoundKey[];

        for (const key of keys) {
            if (!Object.prototype.hasOwnProperty.call(SoundMap, key)) continue;

            const url = SoundMap[key];

            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.buffers.set(key, audioBuffer);
            } catch (error) {
                console.warn(`Falha ao carregar o som "${key}":`, error);
            }
        }
    }

    playSound(
        key: SoundKey,
        loop: boolean = false,
        volume: number = 1,
        onEnded?: (soundId: string) => void,
    ): string | null {
        const buffer = this.buffers.get(key);
        if (!buffer) {
            console.warn(`Sound "${key}" not loaded.`);
            return null;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.loop = loop;
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const soundId = this.generateSoundId();

        source.onended = () => {
            this.currentSources.delete(soundId);
            onEnded?.(soundId);
        };

        this.currentSources.set(soundId, {
            source,
            gainNode,
            key,
            loop,
        });

        source.start();

        return soundId;
    }

    stopSound(soundId: string): void {
        const activeSound = this.currentSources.get(soundId);
        if (!activeSound) return;

        activeSound.source.stop();
        this.currentSources.delete(soundId);
    }

    stopAll(): void {
        for (const activeSound of this.currentSources.values()) {
            activeSound.source.stop();
        }

        this.currentSources.clear();
    }

    stopAllByKey(key: SoundKey): void {
        for (const [soundId, activeSound] of this.currentSources.entries()) {
            if (activeSound.key !== key) continue;

            activeSound.source.stop();
            this.currentSources.delete(soundId);
        }
    }

    public resumeOnUserGesture(): void {
        const resume = () => {
            if (this.audioContext.state === "suspended") {
                this.audioContext.resume().then(() => {
                    console.log("AudioContext retomado com sucesso.");
                });
            }

            window.removeEventListener("click", resume);
            window.removeEventListener("keydown", resume);
        };

        window.addEventListener("click", resume);
        window.addEventListener("keydown", resume);
    }

    private generateSoundId(): string {
        this.idCounter += 1;
        return `sound_${this.idCounter}`;
    }
}
