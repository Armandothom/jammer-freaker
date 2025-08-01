export class TravelTimeComponent {
    public totalTravelTime: number
    public travelTime: number = 0;
    constructor(totalTravelTime: number) {
        this.totalTravelTime = totalTravelTime;
    }
}