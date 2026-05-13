export class UIRuntimeElementComponent {
  constructor(
    public nodeId: string,
    public screenId: string,
    public renderOrder: number,
    public opacity: number = 1,
  ) { }
}
