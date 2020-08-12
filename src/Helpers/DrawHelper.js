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
   * 
   * @memberof DrawHelper
   */
  static fillCircle(context, x, y, radius, fillColor) {

    const originalFillStyle = context.fillStyle;
    context.fillStyle = fillColor;

    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();

    context.fillStyle = originalFillStyle;
  }
}

export default DrawHelper;
