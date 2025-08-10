import { BloodParticlesComponent } from "../components/blood-particles.component.js";
import { DustParticlesComponent } from "../components/dust-particles.component.js";
import { SparkParticlesComponent } from "../components/spark-particles.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";

export type TrajectoryType = 0 | 1; // 0 = linear, 1 = parabólico
export type RGB = [number, number, number]; // 0..255

export type SpawnEvent = {
    position: { x: number; y: number };   // pixels no mesmo espaço do worldToState01
    velocity: { x: number; y: number };   // unidades/seg (interpretação fica no renderer)
    life: number;                          // em segundos (ex.: 1.0)
    size: number;                          // em pixels (ex.: 20)
    color: RGB;                            // [R,G,B] 0..255
    trajectoryType: TrajectoryType;        // 0 linear, 1 parabólico
};

export class ParticleEmitterSystem implements ISystem {
    constructor(
        private rendererEngine: RendererEngine,
        private bloodParticlesComponentStore: ComponentStore<BloodParticlesComponent>,
        private dustParticlesComponentStore: ComponentStore<DustParticlesComponent>,
        private sparkParticlesComponentStore: ComponentStore<SparkParticlesComponent>,
    ) {
    }

    update(deltaTime: number): void {

        const bloodParticleSets = this.bloodParticlesComponentStore.getAllEntities();
        const dustParticleSets = this.dustParticlesComponentStore.getAllEntities();
        const sparkParticleSets = this.sparkParticlesComponentStore.getAllEntities();

        const spawns: SpawnEvent[] = [];


        //velX, velY -> px/s;
        //life -> s

        if (bloodParticleSets.length !== 0) {
            for (const bloodParticleSet of bloodParticleSets) {
                const particleSetProperties = this.bloodParticlesComponentStore.get(bloodParticleSet);
                const maxParticlesEmitted = particleSetProperties.maxParticlesEmitted;
                const emissionOrigin = { x: particleSetProperties.particleOriginX, y: particleSetProperties.particleOriginY };
                const emissionDirection = { x: particleSetProperties.originDirection.x * -1, y: particleSetProperties.originDirection.y * -1 };
                const emissionLeft = emissionDirection.x < -1 ? true : false;
                const emissionAngle = Math.atan2(emissionDirection.y, emissionDirection.x);
                const velX = 60;
                const velY = -30;

                for (let i = 0; i < maxParticlesEmitted; i++) {
                    const splatterAngle = Math.PI / 4;
                    const progress = i / maxParticlesEmitted;
                    const angleOffset = (progress - 0.5) * splatterAngle;
                    const finalAngle = emissionAngle + (emissionLeft ? -angleOffset : angleOffset);
                    spawns.push({
                        position: { x: emissionOrigin.x, y: emissionOrigin.y },
                        velocity: { x: Math.cos(finalAngle) * velX, y: Math.sin(finalAngle) * velY },
                        life: 1,
                        color: [145, 24, 32],
                        size: 5,
                        trajectoryType: 1,
                    })
                }
                this.bloodParticlesComponentStore.remove(bloodParticleSet);
            }
        }

        if (dustParticleSets.length !== 0) {
            for (const dustParticleSet of dustParticleSets) {
                const particleSetProperties = this.dustParticlesComponentStore.get(dustParticleSet);
                const maxParticlesEmitted = particleSetProperties.maxParticlesEmitted;
                const emissionOrigin = { x: particleSetProperties.particleOriginX, y: particleSetProperties.particleOriginY };
                const emissionDirection = { x: particleSetProperties.originDirection.x * -1, y: particleSetProperties.originDirection.y * -1 };
                const emissionLeft = emissionDirection.x < -1 ? true : false;
                const emissionAngle = Math.atan2(emissionDirection.y, emissionDirection.x);
                const velX = 60;
                const velY = -30;

                for (let i = 0; i < maxParticlesEmitted; i++) {
                    const splatterAngle = Math.PI / 4;
                    const progress = i / maxParticlesEmitted;
                    const angleOffset = (progress - 0.5) * splatterAngle;
                    const finalAngle = emissionAngle + (emissionLeft ? -angleOffset : angleOffset);
                    spawns.push({
                        position: { x: emissionOrigin.x, y: emissionOrigin.y },
                        velocity: { x: Math.cos(finalAngle) * velX, y: Math.sin(finalAngle) * velY },
                        life: 1,
                        color: [170, 170, 170],
                        size: 5,
                        trajectoryType: 0,
                    })
                }
                this.dustParticlesComponentStore.remove(dustParticleSet);
            }
        }

        if (sparkParticleSets.length !== 0) {
            for (const sparkParticleSet of sparkParticleSets) {
                const particleSetProperties = this.sparkParticlesComponentStore.get(sparkParticleSet);
                const maxParticlesEmitted = particleSetProperties.maxParticlesEmitted;
                const emissionOrigin = { x: particleSetProperties.particleOriginX, y: particleSetProperties.particleOriginY };
                const emissionDirection = { x: particleSetProperties.originDirection.x * -1, y: particleSetProperties.originDirection.y * -1 };
                const emissionLeft = emissionDirection.x < -1 ? true : false;
                const emissionAngle = Math.atan2(emissionDirection.y, emissionDirection.x);
                const velX = 60;
                const velY = -30;

                for (let i = 0; i < maxParticlesEmitted; i++) {
                    const splatterAngle = Math.PI / 4;
                    const progress = i / maxParticlesEmitted;
                    const angleOffset = (progress - 0.5) * splatterAngle;
                    const finalAngle = emissionAngle + (emissionLeft ? -angleOffset : angleOffset);
                    spawns.push({
                        position: { x: emissionOrigin.x, y: emissionOrigin.y },
                        velocity: { x: Math.cos(finalAngle) * velX, y: Math.sin(finalAngle) * velY },
                        life: 1,
                        color: [255, 214, 72],
                        size: 5,
                        trajectoryType: 0,
                    })
                }
                this.sparkParticlesComponentStore.remove(sparkParticleSet);
            }
        }

        if (spawns.length !== 0) {
            this.rendererEngine.enqueueSpawns(spawns)
        }

    }
}