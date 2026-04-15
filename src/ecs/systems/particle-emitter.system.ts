import { PARTICLE_TYPE_BLOOD, ParticleType, RendererEngine } from "../../game/renderer/renderer-engine.js";
import { DeathParticleBurstComponent } from "../components/death-particle-burst-component.js";
import { DeathParticlesIntentComponent } from "../components/death-particles-intent.component.js";
import { ParticlesComponent } from "../components/particles.component.js";
import { ParticleBurstPlan, ParticleStepConfig, ScheduledParticleStep } from "../components/types/particle-burst-config.js";
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
        private deathParticlesIntentComponentStore: ComponentStore<DeathParticlesIntentComponent>,
        private deathParticleBurstComponentStore: ComponentStore<DeathParticleBurstComponent>,
    ) {
    }

    update(deltaTime: number): void {
        this.hitParticlesEmission();
        this.deathParticlesEmission();
        this.updateDeathParticlesBurst(deltaTime);
    }

    private hitParticlesEmission() {
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

    private deathParticlesEmission() {
        const deathParticlesSets = this.deathParticlesIntentComponentStore.getAllEntities();
        if (deathParticlesSets.length === 0) {
            return;
        }

        for (const deathParticlesSet of this.deathParticlesIntentComponentStore.getAllEntities()) {
            const deathParticlesSetInfo = this.deathParticlesIntentComponentStore.get(deathParticlesSet);
            const particleSet = this.generateParticlesBurst(
                Math.PI,
                2 * Math.PI,
                Math.PI * 18 / 180,
                3,
                9,
                "random",
            );

            const burstPlan = this.buildBurstPlan(particleSet, 20);

            this.deathParticleBurstComponentStore.add(deathParticlesSet, new DeathParticleBurstComponent(deathParticlesSetInfo.startX, deathParticlesSetInfo.startY, 0, [...burstPlan.steps]));
            this.deathParticlesIntentComponentStore.remove(deathParticlesSet);
        }
    }

    private updateDeathParticlesBurst(deltaTime: number) {
        const burstEntities = this.deathParticleBurstComponentStore.getAllEntities();
        if (burstEntities.length === 0) {
            return;
        }

        const spawns: SpawnEvent[] = [];
        const deltaTimeMs = deltaTime * 1000;

        for (const entity of burstEntities) {
            const burst = this.deathParticleBurstComponentStore.get(entity);
            burst.elapsedMs += deltaTimeMs;

            while (
                burst.pendingSteps.length > 0 &&
                burst.pendingSteps[0].delayMs <= burst.elapsedMs
            ) {
                const scheduledStep = burst.pendingSteps.shift()!;

                this.emitParticleStep(
                    burst.originX,
                    burst.originY,
                    scheduledStep.config,
                    spawns,
                );
            }

            if (burst.pendingSteps.length === 0) {
                this.deathParticleBurstComponentStore.remove(entity);
            }
        }

        if (spawns.length > 0) {
            this.rendererEngine.enqueueSpawns(spawns);
        }
    }

    private emitParticleStep(
        originX: number,
        originY: number,
        config: ParticleStepConfig,
        spawns: SpawnEvent[],
    ): void {
        for (let i = 0; i < config.particleCount; i++) {
            const angleJitter = this.randomBetween(-0.10, 0.10);
            const finalAngle = config.angle + angleJitter;

            const speed = this.randomBetween(40, 140);
            const life = PARTICLE_PRESETS[PARTICLE_TYPE_BLOOD].life
            const size = PARTICLE_PRESETS[PARTICLE_TYPE_BLOOD].size

            spawns.push({
                position: {
                    x: originX,
                    y: originY,
                },
                velocity: {
                    x: Math.cos(finalAngle) * speed,
                    y: Math.sin(finalAngle) * speed,
                },
                life,
                size,
                color: PARTICLE_PRESETS[PARTICLE_TYPE_BLOOD].color,
                trajectoryType: config.trajectoryType,
                particleType: PARTICLE_TYPE_BLOOD,
            });
        }
    }

    private generateParticlesBurst(
        startAngle: number,
        endAngle: number,
        step: number,
        minParticles: number,
        maxParticles: number,
        trajectoryMode: TrajectoryType | "random"
    ): ParticleStepConfig[] {
        if (step <= 0) {
            throw new Error("step must be greater than 0");
        }

        if (minParticles > maxParticles) {
            throw new Error("minParticles cannot be greater than maxParticles");
        }

        const result: ParticleStepConfig[] = [];

        for (let angle = startAngle; angle <= endAngle; angle += step) {
            const trajectoryType: TrajectoryType =
                trajectoryMode === "random"
                    ? (Math.random() < 0.5 ? 0 : 1)
                    : trajectoryMode;

            const particleCount =
                Math.floor(Math.random() * (maxParticles - minParticles + 1)) + minParticles;

            result.push({
                angle,
                trajectoryType,
                particleCount,
            });
        }

        return result;
    }

    private buildBurstPlan(
        configs: ParticleStepConfig[],
        intervalMs: number
    ): ParticleBurstPlan {
        const steps: ScheduledParticleStep[] = [];
        const maxParticlesPerJet = configs.reduce(
            (currentMax, config) => Math.max(currentMax, config.particleCount),
            0,
        );

        // Interleaves the jets by wave so the burst expands together instead of sweeping angle by angle.
        for (let waveIndex = 0; waveIndex < maxParticlesPerJet; waveIndex++) {
            const delayMs = waveIndex * intervalMs;

            for (const config of configs) {
                if (waveIndex >= config.particleCount) {
                    continue;
                }

                steps.push({
                    delayMs,
                    config: {
                        ...config,
                        particleCount: 1,
                    },
                });
            }
        }

        return {
            elapsedMs: 0,
            steps,
        };
    }

    private randomBetween(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
