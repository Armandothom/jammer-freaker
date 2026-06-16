export class MathUtils {

  static roundNumber(number : number, decimals = 2) {
    const mod = Math.pow(10, decimals);
    return Math.round(number * mod) / mod;
  }

  static floorNumber(number : number, decimals = 2) {
    const mod = Math.pow(10, decimals);
    return Math.floor(number * mod) / mod;
  }

  static radToDegreeNormalized(rad : number) {
    return (((rad * (180/Math.PI)) % 360) + 360) % 360
  }

  static degreeToRad(deg: number) {
    return deg * (Math.PI / 180);
  }

  static randomIntBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}