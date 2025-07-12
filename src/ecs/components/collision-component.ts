export class CollisionComponent {
    static data: Map<number, boolean> = new Map();

    static set(entity: number, value: boolean) {
        this.data.set(entity, value);
    }

    static get(entity: number): boolean | undefined {
        return this.data.get(entity);
    }

    static has(entity: number): boolean {
        return this.data.has(entity) && this.data.get(entity) === true;
    }

    static remove(entity: number) {
        this.data.delete(entity);
    }
}