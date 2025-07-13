import { SoundKey, SoundMap } from "./consts/sound-mapped.values.js";

export class SoundManager {
    private audioContext: AudioContext;
    private buffers: Map<SoundKey, AudioBuffer> = new Map();
    private currentSources: Map<SoundKey, AudioBufferSourceNode> = new Map();

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    async loadMultipleSounds(): Promise<void> {
        const keys = Object.keys(SoundMap) as SoundKey[];
        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(SoundMap, key)) {
                const url = SoundMap[key];
                try {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    this.buffers.set(key as SoundKey, audioBuffer);
                } catch (error) {
                    console.warn(`❌ Falha ao carregar o som "${key}":`, error);
                }
            }
        }
    }

    playSound(key: SoundKey, loop: boolean = false, volume: number = 1): void {
        const buffer = this.buffers.get(key);
        if (!buffer) {
            console.warn(`Sound "${key}" not loaded.`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.loop = loop;

        gainNode.gain.value = 0.05;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();

        this.currentSources.set(key, source);
    }

    stopSound(key: SoundKey): void {
        const source = this.currentSources.get(key);
        if (source) {
            source.stop();
            this.currentSources.delete(key);
        }
    }

    stopAll(): void {
        for (const source of this.currentSources.values()) {
            source.stop();
        }
        this.currentSources.clear();
    }

    public resumeOnUserGesture(): void {
        const resume = () => {
            if (this.audioContext.state === "suspended") {
                this.audioContext.resume().then(() => {
                    console.log("🔊 AudioContext retomado com sucesso.");
                });
            }
            window.removeEventListener("click", resume);
            window.removeEventListener("keydown", resume);
        };

        window.addEventListener("click", resume);
        window.addEventListener("keydown", resume);
    }

    /*setVolume(name: string, volume: number): void {
        // Esse método pode ser estendido para gerenciar volumes individuais via GainNode
    }*/
}