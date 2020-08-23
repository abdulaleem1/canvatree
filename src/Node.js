import Tree from "./Tree.js";

/**
 * @class Node
 *
 * @property {Number} id - Unique Identifier
 * @property {String} text - Node Text
 * @property {Number} x - X co-ordinate in pixels
 * @property {Number} y - y co-ordinate in pixels
 * @property {Number} width - Width in pixels
 * @property {Number} height - Height in pixels
 * @property {Number} connectorRadius - Radius of the connector circle
 * @property {Tree.states} state - State of the node
 * @property {Number} parentId - Unique identifier of the parent
 * @property {Number} zoomLevel - Zoom level
 * @property {Number} panX - Pan X in pixels
 * @property {Number} panY - Pan Y in pixels
 * @property {Number} level - Level to which the node belongs
 * @property {Number} order - Order among the siblings
 * @property {Object} nodeCenter - Contains of the X,Y co-ordinates of the center of the node
 * @property {Object} connectorCenter - Contains of the X,Y co-ordinates of the center of the connector
 *
 */
class Node {
  static DEFAULT_WIDTH = 280;
  static DEFAULT_HEIGHT = 50;
  constructor(
    id,
    text,
    parentId,
    level,
    order,
    x,
    y,
    zoomLevel = 1,
    panX = 0,
    panY = 0
  ) {
    this.id = id;
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = Node.DEFAULT_WIDTH;
    this.height = Node.DEFAULT_HEIGHT;
    this.connectorRadius = 8;
    this.state = Tree.states.IDLE;
    this.parentId = parentId;
    this.zoomLevel = zoomLevel;
    this.panX = panX;
    this.panY = panY;
    this.level = level;
    this.order = order;
    this.nodeCenter = null;
    this.connectorCenter = null;
    this.dx = 0;
    this.dy = 0;
    this.stepX = null;
    this.stepY = null;
  }

  /**
   * Calculate the Node Center and Connector Center
   */
  calculateCenter() {
    this.nodeCenter = {
      x: this.getNodeX() + this.getNodeWidth() / 2,
      y: this.getNodeY() + this.getNodeHeight() / 2,
    };
    this.connectorCenter = {
      x:
        this.getNodeX() +
        this.getNodeWidth() / 2 -
        this.getNodeConnectorRadius() / 2,
      y: this.getNodeY() + this.getNodeHeight(),
    };
  }

  //#region Getters
  /**
   * Returns Node X
   *
   * @returns {Number} - X co-ordinate of a Node
   */
  getNodeX() {
    const canvasRelativeX = this.x * this.zoomLevel + this.panX;
    return  canvasRelativeX - this.dx; ///  ;
  }
  /**
   * Returns Node Y
   *
   * @returns {Number} - Y co-ordinate of a Node
   */
  getNodeY() {
    return this.y * this.zoomLevel + this.panY - this.dy; // /  ;
  }
  /**
   * Returns Node Width
   *
   * @returns {Number} - Width of a Node
   */
  getNodeWidth() {
    return this.width * this.zoomLevel;
  }
  /**
   * Returns Node Height
   *
   * @returns {Number} - Height of a Node
   */
  getNodeHeight() {
    return this.height * this.zoomLevel;
  }
  /**
   * Returns Node Connector Radius
   *
   * @returns {Number} - Connector Radius of a Node
   */
  getNodeConnectorRadius() {
    return this.connectorRadius * this.zoomLevel;
  }
  //#endregion Getters
}

export default Node;
