import Helper from "./Helper.js";

class Tree {
  static states = {
    NODE_HOVERED: 4,
    CONNECTOR_HOVERED: 5,
    INITIALIZED: 2,
    INITIALIZING: 1,
    RENDERED: 3,
    MOVING_NODE: 6,
    IDLE: 0,
    NONE: -1,
    PANNING: 7,
    ZOOMING: 8,
  };
  constructor(containerId, options) {
    this.canvas = null;
    this.options = options || {};
    this.treeData = options.data || [];
    this.primaryState = Tree.states.INITIALIZING;
    this.secondaryState = Tree.states.NONE;
    this.mouseContext = new MouseContext();
    this.stateBasedCursor = {
      0: "default",
      4: "move",
      5: "grab",
      7: "move",
    };
    this.zoomLevel = 1;
    this.container = document.getElementById(containerId);
    this.panX = 0;
    this.panY = 0;

    if (!this.container) {
      console.error("Element not found!");
    }

    this.initCanvas();

    this.initEvents();

    this.primaryState = Tree.states.INITIALIZED;

    this.startDrawLoop();

    this.primaryState = Tree.states.RENDERED;
  }

  initCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = parseInt(
      window.getComputedStyle(this.container).getPropertyValue("width")
    );
    this.canvas.height = parseInt(
      window.getComputedStyle(this.container).getPropertyValue("height")
    );

    this.container.appendChild(this.canvas);

    this.canvasCenter = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };

    this.context = this.canvas.getContext("2d");
    this.context.font = "18px Montserrat";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = "#ffffff";
  }

  drawNode(node) {
    node.zoomLevel = this.zoomLevel;
    node.panX = this.panX;
    node.panY = this.panY;

    //draw node body
    this.context.fillStyle =
      node.state === Tree.states.NODE_HOVERED ? "grey" : "#5e6472";
    this.context.fillRect(
      node.getNodeX(),
      node.getNodeY(),
      node.getNodeWidth(),
      node.getNodeHeight()
    );

    node.calculateCenter();

    this.context.fillStyle = "#ffffff";
    this.context.fillText(
      node.text ,
      node.nodeCenter.x,
      node.nodeCenter.y
    );

    this.context.fillStyle =
      node.state === Tree.states.CONNECTOR_HOVERED ? "red" : "lightgreen";

    this.context.beginPath();
    this.context.arc(
      node.connectorCenter.x,
      node.connectorCenter.y,
      node.getNodeConnectorRadius(),
      0,
      2 * Math.PI
    );
    this.context.fill();
    this.context.stroke();

    if (node.parentId > 0) {
      const parent = this.treeData.find((n) => n.id === node.parentId);
      const p1 = [
        parent.connectorCenter.x,
        (node.getNodeY() + node.getNodeHeight() + parent.connectorCenter.y) / 2,
      ];
      const p2 = [node.connectorCenter.x, parent.getNodeY()];

      this.context.beginPath();
      this.context.moveTo(node.connectorCenter.x, node.getNodeY());

      this.context.bezierCurveTo(
        p2[0],
        p2[1],
        p1[0],
        p1[1],
        parent.connectorCenter.x,
        parent.connectorCenter.y
      );
      this.context.stroke();
    }
  }

  drawDebugInfo() {
    this.context.fillStyle = "#000000";
    this.context.fillText(
      `x: ${this.mouseContext.x}, y: ${this.mouseContext.y},pState:${this.primaryState},sState:${this.secondaryState}`,
      this.mouseContext.x,
      this.mouseContext.y
    );
  }

  startDrawLoop() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);


    this.mouseNodeOverlapDetection();

    this.treeData.forEach((node) => this.drawNode(node));

    this.drawDebugInfo();

    this.setCursor();

    requestAnimationFrame(this.startDrawLoop.bind(this));
  }

  setCursor() {
    this.canvas.style.cursor =
      this.stateBasedCursor[this.primaryState] || this.stateBasedCursor[0];
  }

  initEvents() {
    this.canvas.onmousemove = (ev) => this.mouseMove(ev);

    this.canvas.onmousedown = (ev) => {
      this.primaryState === Tree.states.NODE_HOVERED
        ? (this.secondaryState = Tree.states.MOVING_NODE)
        : ((this.secondaryState = Tree.states.PANNING),
          (this.primaryState = Tree.states.PANNING));

      this.startPanX = ev.x;
      this.startPanY = ev.y;
    };

    this.canvas.onmouseup = (ev) => (
      (this.secondaryState = Tree.states.NONE),
      (this.primaryState = Tree.states.IDLE)
    );

    this.canvas.addEventListener(
      "mousewheel",
      this.handleMouseWheel.bind(this),
      false
    );
    this.canvas.addEventListener(
      "DOMMouseScroll",
      this.handleMouseWheel.bind(this),
      false
    ); // for Firefox
  }

  handleMouseWheel(ev) {
    const MIN_ZOOM = 1,
      MAX_ZOOM = 3;
    let zoomFactor = 0;
    if (event.wheelDelta > 0) {
      this.zoomLevel += 0.1;
    } else {
      this.zoomLevel -= 0.1;
    }

  }

  reCenterTreeToCursor(ev) {
    for (let index = 0; index < this.treeData.length; index++) {
      const node = this.treeData[index];
      const { x, y } = ev;
      node.zoomReferencePoint = { x, y };
      ev.x > node.getNodeX()
        ? (node.zoomXDirection = "left")
        : (node.zoomXDirection = "right");
      ev.y > node.getNodeY()
        ? (node.zoomYDirection = "up")
        : (node.zoomYDirection = "down");
    }
  }

  moveNode(ev) {
    let nodeDragged = this.treeData.find(
      (node) => node.state === Tree.states.NODE_HOVERED
    );

    if (nodeDragged) {
      nodeDragged.x += (ev.x - this.mouseContext.x) / this.zoomLevel;
      nodeDragged.y += (ev.y - this.mouseContext.y) / this.zoomLevel;
    }
  }

  mouseMove(ev) {
    this.secondaryState === Tree.states.MOVING_NODE && this.moveNode(ev);

    this.secondaryState === Tree.states.PANNING && this.pan(ev);

    this.mouseContext.updatePosition(ev.x, ev.y);
  }

  pan(ev) {
    // const last = { ...this.mouseContext };
    this.dx = ev.x - this.startPanX; /// this.zoomLevel;
    this.dy = ev.y - this.startPanY; /// this.zoomLevel;

    this.startPanX = ev.x;
    this.startPanY = ev.y;

    this.panX += this.dx;
    this.panY += this.dy;

    console.log(this.dx, this.dy, this.panX, this.panY);
  }

  mouseNodeOverlapDetection() {
    this.primaryState !== Tree.states.PANNING &&
      (this.primaryState = Tree.states.IDLE);
    this.treeData.forEach((node) => {
      node.state = Tree.states.IDLE;
      if (
        this.mouseContext.x > node.getNodeX() &&
        this.mouseContext.x <
          node.getNodeX() + node.getNodeWidth() &&
        this.mouseContext.y >
          node.getNodeY() + node.getNodeConnectorRadius() &&
        this.mouseContext.y <
          node.getNodeY() +
            node.getNodeConnectorRadius() +
            node.getNodeHeight()
      ) {
        node.state = Tree.states.NODE_HOVERED;
        this.primaryState = Tree.states.NODE_HOVERED;
        const distance = Helper.distance(
          this.mouseContext.x,
          this.mouseContext.y,
          node.connectorCenter.x,
          node.connectorCenter.y
        );

        distance <= node.connectorRadius &&
          ((node.state = Tree.states.CONNECTOR_HOVERED),
          (this.primaryState = Tree.states.CONNECTOR_HOVERED));
      }
    });
  }
}

class MouseContext {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }
}

export default Tree;
