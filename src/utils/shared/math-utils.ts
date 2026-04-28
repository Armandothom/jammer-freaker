export class MathUtils {

  static roundNumber(number : number, decimals = 2) {
    const mod = Math.pow(10, decimals);
    return Math.round(number * mod) / mod;
  }

  static floorNumber(number : number, decimals = 2) {
    const mod = Math.pow(10, decimals);
    return Math.floor(number * mod) / mod;
  }
}