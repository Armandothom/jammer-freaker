export class DialogComponent {
  constructor(
    public sourceEntityId: number,
    public dialogType: string,
    public text: string,
    public followSource: boolean,
    public destroyOnExpire: boolean,
  ) {
  }
}
