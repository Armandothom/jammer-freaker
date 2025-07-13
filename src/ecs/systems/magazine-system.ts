import { MagazineComponent } from "../components/magazine.component.js";
import { ISystem } from "./system.interface.js";

export class MagazineSystem implements ISystem {
    constructor(
        private magazineComponentStore: MagazineComponent,
    ) {
    }

    update(deltaTime: number): void {
        
    }

}