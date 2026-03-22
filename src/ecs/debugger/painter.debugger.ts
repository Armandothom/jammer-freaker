import { DebuggerPaintOrder } from "./types/debugger.js";


export class DebuggerPainter {
  private static paintFrameOrder : Array<DebuggerPaintOrder> = [];

  static insertPaintOrder(orders : DebuggerPaintOrder[]) {
    this.paintFrameOrder.push(...orders);
  }

  static retrievePaintOrders() {
    const orders = this.paintFrameOrder;
    this.paintFrameOrder = [];
    return orders;
  }
}