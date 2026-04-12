import {
    ParticleType,
    RendererEngine
} from "../../game/renderer/renderer-engine.js";
import { ParticlesComponent } from "../components/particles.component.js";
import { PARTICLE_PRESETS } from "../components/types/particle-preset.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export type TrajectoryType = 0 | 1; // 0 = linear, 1 = parabólico
export type RGB = [number, number, number]; // 0..255

export type SpawnEvent = {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    life: number;
    size: number;
    color: RGB;
    trajectoryType: TrajectoryType;
    particleType?: ParticleType;
};


export class ParticleEmitterSystem implements ISystem {
    constructor(
        private rendererEngine: RendererEngine,
        private particlesComponentStore: ComponentStore<ParticlesComponent>,
    ) {
    }

    update(_: number): void {
        const particleEntities = this.particlesComponentStore.getAllEntities();
        if (particleEntities.length === 0) {
            return;
        }

        const spawns: SpawnEvent[] = [];

        for (const entity of particleEntities) {
            const particleSet = this.particlesComponentStore.get(entity);
            const preset = PARTICLE_PRESETS[particleSet.particleType];
            if (!preset) {
                this.particlesComponentStore.remove(entity);
                continue;
            }

            const emissionOrigin = {
                x: particleSet.particleOriginX,
                y: particleSet.particleOriginY,
            };
            const emissionDirectionMagnitude = Math.hypot(
                particleSet.originDirection.x,
                particleSet.originDirection.y,
            );
            const emissionDirection = emissionDirectionMagnitude > 0.0001
                ? {
                    x: particleSet.originDirection.x / emissionDirectionMagnitude,
                    y: particleSet.originDirection.y / emissionDirectionMagnitude,
                }
                : { x: 1, y: 0 };
            const emissionAngle = Math.atan2(emissionDirection.y, emissionDirection.x);
            const maxParticlesEmitted = Math.max(1, particleSet.maxParticlesEmitted);

            for (let i = 0; i < maxParticlesEmitted; i++) {
                const angleJitter = ((Math.random() * 2) - 1) * (preset.spreadAngle * 0.5);
                const finalAngle = emissionAngle + angleJitter;
                const spreadDirection = {
                    x: Math.cos(finalAngle),
                    y: Math.sin(finalAngle),
                };

                spawns.push({
                    position: { x: emissionOrigin.x, y: emissionOrigin.y },
                    velocity: {
                        x: spreadDirection.x * preset.speed,
                        y: spreadDirection.y * preset.speed,
                    },
                    life: preset.life,
                    color: preset.color,
                    size: preset.size,
                    trajectoryType: preset.trajectoryType,
                    particleType: preset.particleType,
                });
            }

            this.particlesComponentStore.remove(entity);
        }

        if (spawns.length !== 0) {
            this.rendererEngine.enqueueSpawns(spawns);
        }
    }
}
