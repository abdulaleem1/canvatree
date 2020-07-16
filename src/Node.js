import Tree from "./Tree.js";

class Node {
  constructor(id, text, x, y, parentId, zoomLevel, panX, panY) {
    this.id = id;
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = 280;
    this.height = 50;
    this.connectorRadius = 8;
    this.primaryState = Tree.states.IDLE;
    this.parentId = parentId;
    this.zoomLevel = zoomLevel || 1;
    this.panX = panX;
    this.panY = panY;
    this.zoomXDirection = "right";
    this.zoomYDirection = "down";
    this.zoomReferencePoint = { x: 0, y: 0 };
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
