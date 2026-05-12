export enum DeathIntentReason {
    HealthDepleted = "health-depleted",
    MedicalOverdose = "medical-overdose",
}

export class DeathIntentComponent {
    constructor(
        public killingBlowEntity: number,
        public reason: DeathIntentReason = DeathIntentReason.HealthDepleted,
    ) { }
}
