/**
 * Contains all the helper functions for complex drawing
 *
 *@class DrawHelper
 */
class DrawHelper {
  /**
   * Fills the cirlcle with given color
   * @param {CanvasRenderingContext2D} context
   * @param {Number} x
   * @param {Number} y
   * @param {Number} radius
   * @param {String} fillColor
   * @param {String} strokeColor
   * 
   * @memberof DrawHelper
   */
  static fillCircle(context, x, y, radius, fillColor,strokeColor) {

    const originalFillStyle = context.fillStyle;
    const originalStrokeStyle = context.strokeStyle;
    context.fillStyle = fillColor;

    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
    context.strokeStyle = strokeColor;
    context.stroke();

    context.strokeStyle = originalStrokeStyle;
    context.fillStyle = originalFillStyle;
  }
}

export default DrawHelper;
