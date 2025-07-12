export interface ISystem {
    /**
     * Updates the system.
     * @param deltaTime The time since the last update in seconds.
     */
    update(deltaTime: number): void;
}