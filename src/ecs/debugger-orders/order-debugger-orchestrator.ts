import { DebuggerPaintOrder, DebuggerSpawnerOrder } from "./types/debugger.js";


export class OrderDebuggerOrchestrator {
  private static paintFrameOrder : Array<DebuggerPaintOrder> = [];
  private static spawnOrder : Array<DebuggerSpawnerOrder> = [];

  static insertPaintOrder(orders : DebuggerPaintOrder[]) {
    this.paintFrameOrder.push(...orders);
  }

  static retrievePaintOrders() {
    const orders = this.paintFrameOrder;
    this.paintFrameOrder = [];
    return orders;
  }

  static insertSpawnOrder(orders : DebuggerSpawnerOrder[]) {
    this.spawnOrder.push(...orders)
    return orders;
  }

  static retrieveSpawnOrder() {
    const orders = this.spawnOrder;
    this.spawnOrder = [];
    return orders;
  }
}