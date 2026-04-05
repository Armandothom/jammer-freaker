import { DebuggerMoveOrder, DebuggerPaintOrder, DebuggerSpawnerOrder } from "./types/debugger.js";


export class OrderDebuggerOrchestrator {
  private static paintFrameOrder : Array<DebuggerPaintOrder> = [];
  private static spawnOrder : Array<DebuggerSpawnerOrder> = [];
  private static moveOrder : Array<DebuggerMoveOrder> = [];

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

  static insertMoveOrder(orders : DebuggerMoveOrder[]) {
    this.moveOrder.push(...orders)
    return orders;
  }

  static retrieveModeOrder() {
    const orders = this.moveOrder;
    this.moveOrder = [];
    return orders;
  }
}