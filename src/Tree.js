import Helper from "./Helpers/Helper.js";
import Node from "./Node.js";
import TreeData from "./TreeData.js";
import DrawHelper from "./Helpers/DrawHelper.js";
/**
 * Tree Class
 *
 * Contains draw logic
 */
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
    CONTROL_HOVERED: 9,
  };
  constructor(containerId, options) {
    this.canvas = null;
    this.options = options || {};
    this.treeData = new TreeData(options.data);
    this.primaryState = Tree.states.INITIALIZING;
    this.secondaryState = Tree.states.NONE;
    this.mouseContext = new MouseContext();
    this.stateBasedCursor = {
      0: "move",
      9: "pointer",
      5: "grab",
      // 7: "move",
    };
    this.zoomLevel = 1;
    this.container = document.getElementById(containerId);
    this.panX = 0;
    this.panY = 0;
    this.controls = [];
    this.CONTROLS_RADIUS = 10;
    this.ANIMATION_SPEED = 3;

    if (!this.container) {
      console.error("Element not found!");
    }

    this.initCanvas();

    this.treeData.calculateNodePositions(this.canvas.width, this.canvas.height);

    this.initControls();

    this.initEvents();

    this.primaryState = Tree.states.INITIALIZED;



    // this.setupTree(options.data);
    this.zoomToFit();

    this.renderContent(true);

    this.primaryState = Tree.states.RENDERED;
  }

  /**
   * Initialize Canvas and Context 2d
   */
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

    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = "#ffffff";
  }

  /**
   * Add Controls to the canvas
   */
  initControls() {
    this.controls.push({
      title: "Fit to Canvas",
      x: this.canvas.width - 50,
      y: 50,
      action: () => this.zoomToFit(),
    });
  }
  
  /**
   *Draw the controls to the canvas 
   */
  drawControls() {
    this.controls.forEach((c) =>
      DrawHelper.fillCircle(
        this.context,
        c.x,
        c.y,
        this.CONTROLS_RADIUS,
        "white"
      )
    );
  }
  /**
   * Fits the tree in the view port
   */
  zoomToFit() {
    let rightMostNode = this.treeData.getRightMostNodeInFamily(
      this.treeData.getRootNode()
    );

    console.log(
      `x: ${rightMostNode.x}, zoom: ${this.zoomLevel}, width: ${this.canvas.width}`
    );

    this.zoomLevel =
      this.canvas.width /
      (rightMostNode.x +
        rightMostNode.width +
        this.treeData.SPACING_BETWEEN_NODES);

    this.panX = 0;
    this.panY = 0;

    this.renderContent();
  }
  /**
   * Adds new Node to the tree data and adjusts zoomlevels
   * @param {Node} node
   *
   *
   */
  addNodeHandler(node) {
    this.treeData.addNode(node, false);

    this.zoomToFit();
  }

  /**
   * Draw the node and everything connected to it
   *
   * @param {Node} node
   *
   *
   */
  drawNode(node) {



    //draw node body
    this.context.fillStyle =
      node.state === Tree.states.NODE_HOVERED ? "grey" : "#5e6472";
    this.context.fillRect(
      node.getNodeX(),
      node.getNodeY(),
      node.getNodeWidth(),
      node.getNodeHeight()
    );


    this.context.fillStyle = "#ffffff";
    this.context.fillText(`${node.text}`, node.nodeCenter.x, node.nodeCenter.y); //, ${node.level}, ${node.extendedOrder},  ${node.order}

    DrawHelper.fillCircle(
      this.context,
      node.connectorCenter.x,
      node.connectorCenter.y,
      node.getNodeConnectorRadius(),
      node.state === Tree.states.CONNECTOR_HOVERED ? "red" : "lightgreen"
    );

    if (node.parentId > 0) {
      const parent = this.treeData.getParent(node);
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

  /**
   * Draws the debug info on top right corner
   */
  drawDebugInfo() {
    this.context.fillStyle = "#000000";
    this.context.fillText(
      `x: ${this.mouseContext.x}, y: ${this.mouseContext.y},pState:${this.primaryState},sState:${this.secondaryState}`,
      this.canvas.width - 200,
      50
    );
  }

  /**
   * Starts the draw loop using requestAnimationFrame
   *
   * Draws all nodes,debug info and check for mouse and node overlap
   */
  renderContent(animate = false) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.font = 20 * this.zoomLevel + "px Montserrat";



    this.treeData.getData().forEach((node) => {
      node.zoomLevel = this.zoomLevel;
      node.panX = this.panX;
      node.panY = this.panY;
      node.calculateCenter();

      if(animate){
        let rootNode = this.treeData.getRootNode();
        if(node.stepX === null && node.stepY === null){

          let startX = rootNode.getNodeX(),
              startY = rootNode.getNodeY(),
              endX = node.getNodeX(),
              endY = node.getNodeY(),
              dx = endX - startX,
              dy = endY - startY,
              stepX = dx * 0.01 * this.ANIMATION_SPEED,
              stepY = dy * 0.01 * this.ANIMATION_SPEED;
          
          node.dx = dx;
          node.dy = dy;
          node.stepX = stepX;
          node.stepY = stepY;
          node.animating = true;
        }else if(Math.abs(node.dx) > 0 || node.dy > 0){
          // Math.abs(node.dx) > 0 && (node.dx -= node.stepX);
          ((node.dx > 0 && node.stepX > 0) || (node.dx < 0 && node.stepX < 0)) && (node.dx -= node.stepX);
          
          node.dy > 0 && (node.dy -= node.stepY);
        }
        else {
          node.dx = 0;
          node.dy = 0;
          node.stepX = 0;
          node.stepY = 0;
          node.animating = false;
        }

        let animatingNode = this.treeData.getData().find((n) => n.animating);

        this.animating = !!animatingNode;
        
      }


      this.drawNode(node);
    });

    
    this.drawDebugInfo();
    
    this.drawControls();

    if(animate && this.animating)
      requestAnimationFrame(this.renderContent.bind(this,true));
  }

  /**
   * Sets Cusror based on the current state
   */
  setCursor() {
    this.canvas.style.cursor =
      this.stateBasedCursor[this.primaryState] || this.stateBasedCursor[0];
  }

  /**
   * Binds all the events
   */
  initEvents() {
    this.canvas.onmousemove = (ev) => this.mouseMove(ev);

    this.canvas.onmousedown = (ev) => {
      this.primaryState === Tree.states.NODE_HOVERED
        ? (this.secondaryState = Tree.states.MOVING_NODE)
        : ((this.secondaryState = Tree.states.PANNING),
          (this.primaryState = Tree.states.PANNING));

      this.startPanX = ev.x;
      this.startPanY = ev.y;

      const controlClicked = this.controls.find(
        (c) => c.state === Tree.states.CONTROL_HOVERED
      );

      if (controlClicked) {
        console.log("clicked", controlClicked);

        controlClicked.action();
      }
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

    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
  }

  /**
   * Canvas Click handler
   *
   * @param {Event} ev
   *
   *
   */
  handleCanvasClick(ev) {
    // this.addNode.apply(this, [
    //   {
    //     id: 11,
    //     text: "Seventh Node",
    //     parentId: 6,
    //   },true
    // ]);
  }

  /**
   * Mouse Scroll handler
   *
   * @param {WheelEvent} ev
   *
   *
   */
  handleMouseWheel(ev) {
    const MIN_ZOOM = 1,
      MAX_ZOOM = 3;
    let zoomFactor = 0;

    if (ev.wheelDelta > 0) {
      this.zoomLevel += 0.1;
      this.reCenterTreeToCursor(ev, "in");
    } else {
      this.zoomLevel -= 0.1;
      this.reCenterTreeToCursor(ev, "out");
    }

    this.renderContent();
  }

  /**
   * This function facilitates zooming in and out with cursor as a center
   *
   * Substracts mouse zoom offset from panning to center the zoom at the cursor
   *
   * @param {Event} ev
   * @param {*} direction  - Zoom in/ Zoom out
   *
   *
   */
  reCenterTreeToCursor(ev, direction) {
    const mouseAfterZoomX = this.mouseContext.x * 1.1;
    const mouseAfterZoomY = this.mouseContext.y * 1.1;

    const mouseZoomOffsetX = mouseAfterZoomX - this.mouseContext.x;
    const mouseZoomOffsetY = mouseAfterZoomY - this.mouseContext.y;

    console.log(mouseZoomOffsetX, mouseZoomOffsetY);

    if (direction === "in") {
      this.panX -= mouseZoomOffsetX;
      this.panY -= mouseZoomOffsetY;
    } else {
      this.panX += mouseZoomOffsetX;
      this.panY += mouseZoomOffsetY;
    }
  }
  /**
   * Node Drag Handler
   *
   * @param {Event} ev
   *

   */
  moveNode(ev) {
    // let nodeDragged = this.treeData.find(
    //   (node) => node.state === Tree.states.NODE_HOVERED
    // );
    // if (nodeDragged) {
    //   nodeDragged.x += (ev.x - this.mouseContext.x) / this.zoomLevel;
    //   nodeDragged.y += (ev.y - this.mouseContext.y) / this.zoomLevel;
    //   this.setFamilyNodeXY(nodeDragged);
    // }
  }

  /**
   * Mouse Move Handler
   *
   * @param {MouseEvent} ev
   *
   *
   */
  mouseMove(ev) {
    this.secondaryState === Tree.states.MOVING_NODE && this.moveNode(ev);

    this.secondaryState === Tree.states.PANNING && this.pan(ev);

    this.mouseContext.updatePosition(ev.x, ev.y);

    this.mouseNodeOverlapDetection();

    this.setCursor();
  }

  /**
   * This function facilitates the panning on mouse drag
   *
   * @param {MouseEvent} ev
   *
   *
   */
  pan(ev) {
    // const last = { ...this.mouseContext };
    this.dx = ev.x - this.startPanX; /// this.zoomLevel;
    this.dy = ev.y - this.startPanY; /// this.zoomLevel;

    this.startPanX = ev.x;
    this.startPanY = ev.y;

    this.panX += this.dx;
    this.panY += this.dy;

    console.log(this.dx, this.dy, this.panX, this.panY);

    this.renderContent();
  }

  /**
   * This function detects if the cursor is overlapping any element and sets the state accordingly
   */
  mouseNodeOverlapDetection() {
    this.primaryState !== Tree.states.PANNING &&
      (this.primaryState = Tree.states.IDLE);
    this.treeData.getData().forEach((node) => {
      node.state = Tree.states.IDLE;
      if (
        this.mouseContext.x > node.getNodeX() &&
        this.mouseContext.x < node.getNodeX() + node.getNodeWidth() &&
        this.mouseContext.y > node.getNodeY() + node.getNodeConnectorRadius() &&
        this.mouseContext.y <
          node.getNodeY() + node.getNodeConnectorRadius() + node.getNodeHeight()
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

    for (let i = 0; i < this.controls.length; i++) {
      const control = this.controls[i];
      control.state = Tree.states.IDLE;
      // this.primaryState = Tree.states.IDLE;
      if (
        this.mouseContext.x > control.x - this.CONTROLS_RADIUS &&
        this.mouseContext.x < control.x + this.CONTROLS_RADIUS &&
        this.mouseContext.y > control.y - this.CONTROLS_RADIUS &&
        this.mouseContext.y < control.y + this.CONTROLS_RADIUS
      ) {
        control.state = Tree.states.CONTROL_HOVERED;
        this.primaryState = Tree.states.CONTROL_HOVERED;
      }
    }
  }
}

/**
 * MouseContext Class
 *
 * Contains the Mouse position information
 */
class MouseContext {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Updates the x and y position
   *
   * @param {Number} x
   * @param {Number} y
   */
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }
}

export default Tree;
