//1 TILES LAYER
//2 BELOW ACTOR LAYER
//3 ACTOR LAYER
//4 ABOVE ACTOR LAYER
export class ZLayerComponent {
  public layer : number;
  constructor(layer : number) {
    if(layer < 1 || layer > 4) {
      throw new Error("Layer must be between 1 and 4")
    }
    this.layer = layer;
  }
}