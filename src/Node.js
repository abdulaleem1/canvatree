import Tree from "./Tree.js";

class Node {
  static DEFAULT_WIDTH = 280;
  static DEFAULT_HEIGHT = 50;
  constructor(id, text,parentId,level,order,extendedOrder, x, y, zoomLevel = 1, panX = 0, panY = 0) {
    this.id = id;
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = Node.DEFAULT_WIDTH;
    this.height = Node.DEFAULT_HEIGHT;
    this.connectorRadius = 8;
    this.primaryState = Tree.states.IDLE;
    this.parentId = parentId;
    this.zoomLevel = zoomLevel;
    this.panX = panX;
    this.panY = panY;
    this.level = level;
    this.order = order;
    this.extendedOrder = extendedOrder;
    this.familyWidth = 0;
  }

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

  getNodeX() {
    return (this.x * this.zoomLevel + this.panX) ; ///  ;
  }
  getNodeY() {
    return (this.y * this.zoomLevel + this.panY) ; // /  ;
  }
  getNodeWidth() {
    return this.width * this.zoomLevel;
  }
  getNodeHeight() {
    return this.height * this.zoomLevel;
  }
  getNodeConnectorRadius() {
    return this.connectorRadius * this.zoomLevel;
  }
}

export default Node;
