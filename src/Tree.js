import Helper from "./Helper.js";
import Node from "./Node.js";

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
    this.treeData = [];
    this.primaryState = Tree.states.INITIALIZING;
    this.secondaryState = Tree.states.NONE;
    this.mouseContext = new MouseContext();
    this.stateBasedCursor = {
      0: "default",
      // 4: "move",
      5: "grab",
      // 7: "move",
    };
    this.zoomLevel = 1;
    this.container = document.getElementById(containerId);
    this.panX = 0;
    this.panY = 0;
    this.SPACE_BETWEEN_LEVELS = 200;
    this.SPACING_BETWEEN_NODES = 100;

    if (!this.container) {
      console.error("Element not found!");
    }

    this.initCanvas();

    this.initEvents();

    this.primaryState = Tree.states.INITIALIZED;

    this.startDrawLoop();

    this.setupTree(options.data);

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
    this.ROOT_NODE_X = this.canvas.width / 2 - Node.DEFAULT_WIDTH / 2;
    this.ROOT_NODE_Y = 100;

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

  setupTree(data) {
    //sort by parentId
    data = data.sort((a, b) => a.parentId - b.parentId);

    let nodeX, nodeY, level;
    for (let i = 0; i < data.length; i++) {
      this.addNode.apply(this, [data[i]]);
    }

    //delayed insertion
    // let i = 0,
    //   that = this;
    // (function timeout() {
    //   setTimeout(function () {
    //     // Do Something Here
    //     // Then recall the parent function to
    //     // create a recursive loop.

    //     that.addNode.apply(that, [data[i]]);
    //     i++;
    //     if (i < data.length) timeout();
    //   }, 1000);
    // })();

    // let children = this.treeData.filter(node => node.parentId === this.rootNode.id);
    // this.calculateNodePositions(children,this.rootNode);

    this.calculateNodePositions();

    this.zoomToFit();
  }

  zoomToFit() {
    let rightMostNode = this.getRightMostNodeInFamily(this.rootNode);

    console.log(
      `x: ${rightMostNode.x}, zoom: ${this.zoomLevel}, width: ${this.canvas.width}`
    );

    this.zoomLevel =
      this.canvas.width /
      (rightMostNode.x + rightMostNode.width + this.SPACING_BETWEEN_NODES);
  }

  getChildren(parent) {
    return this.treeData.filter((node) => node.parentId === parent.id);
  }
  getParent(child) {
    return this.treeData.find((node) => node.id === child.parentId);
  }
  getSiblings(child) {
    return this.treeData.filter((node) => node.parentId === child.parentId);
  }
  getLeftSibling(child) {
    let siblings = this.getSiblings(child);
    return siblings.find((s) => s.order === child.order - 1);
  }
  getRightSibling(child) {
    let siblings = this.getSiblings(child);
    return siblings.find((s) => s.order === child.order + 1);
  }

  /**
   *
   * @param {JSON} child
   */
  addNode(child, invalidate) {
    // let nodeX, nodeY, level;
    if (child.parentId === 0) {
      child.nodeX = this.ROOT_NODE_X;
      child.nodeY = this.ROOT_NODE_Y;
      child.level = 0;

      const node = new Node(
        child.id,
        child.text,
        child.parentId,
        child.level,
        0,
        0,
        child.nodeX,
        child.nodeY
      );
      this.rootNode = node;
      this.treeData.push(node);
    } else {
      const parent = this.treeData.find((n) => n.id === child.parentId);

      child.nodeX = null;
      child.nodeY = null;
      // parent.familyWidth += Node.DEFAULT_WIDTH;
      // child.nodeY = parent.y + this.SPACE_BETWEEN_LEVELS;
      child.level = parent.level + 1;
      //For each added node the postions of its siblings are recalculated.
      // child.nodeX = adjustSpacingAndGetNodeX.call(this, child, parent);

      const node = new Node(
        child.id,
        child.text,
        child.parentId,
        child.level,
        child.order,
        child.extendedOrder,
        child.nodeX,
        child.nodeY
      );

      this.treeData.push(node);
    }

    if (invalidate) {
      this.calculateNodePositions();

      this.zoomToFit();
    }
  }

  setFamilyNodeXY(parent, offsetLeft = 0, offsetRight = 0) {
    /**
     * The log below sets the positions of node and its children
     *
     * if the children are odd numbered then the the center one remains exactly below the parent
     *  with older nodes on left and yonger nodes on right.
     *
     * if the children are even numbered then the children are distributed evenly on either side of the parent node.
     *
     * TODO: avoid overlapping of cousins
     */
    let offset = offsetRight - offsetLeft;
    parent.x += offset;

    let children = this.getChildren(parent);

    if (children.length > 0) {
      const midIndex = (children.length + 1) / 2 - 1;

      if (children.length % 2 === 0) {
        //even
        let midX = parent.x + parent.width / 2;
        children[midIndex - 0.5].x =
          midX - Node.DEFAULT_WIDTH - this.SPACING_BETWEEN_NODES;
        children[midIndex - 0.5].y = parent.y + this.SPACE_BETWEEN_LEVELS;
        children[midIndex - 0.5].order = midIndex - 0.5;

        for (let i = midIndex - 1.5; i >= 0; i--) {
          children[i].x =
            children[i + 1].x - Node.DEFAULT_WIDTH - this.SPACING_BETWEEN_NODES;
          children[i].y = parent.y + this.SPACE_BETWEEN_LEVELS;
          children[i].order = i;
        }

        children[midIndex + 0.5].x = midX + this.SPACING_BETWEEN_NODES;
        children[midIndex + 0.5].y = parent.y + this.SPACE_BETWEEN_LEVELS;
        children[midIndex + 0.5].order = midIndex + 0.5;

        for (let i = midIndex + 1.5; i < children.length; i++) {
          children[i].x =
            children[i - 1].x + Node.DEFAULT_WIDTH + this.SPACING_BETWEEN_NODES;
          children[i].y = parent.y + this.SPACE_BETWEEN_LEVELS;
          children[i].order = i;
        }
      } else {
        //odd
        let mid = children[midIndex];
        mid.x = parent.x; //- offsetLeft + offsetRight;
        mid.y = parent.y + this.SPACE_BETWEEN_LEVELS;
        mid.order = midIndex;

        if (midIndex > 0) {
          children[midIndex - 1].x =
            mid.x - Node.DEFAULT_WIDTH - this.SPACING_BETWEEN_NODES;
          children[midIndex - 1].y = parent.y + this.SPACE_BETWEEN_LEVELS;
          children[midIndex - 1].order = midIndex - 1;

          for (let i = midIndex - 2; i >= 0; i--) {
            children[i].x =
              children[i + 1].x -
              Node.DEFAULT_WIDTH -
              this.SPACING_BETWEEN_NODES;
            children[i].y = parent.y + this.SPACE_BETWEEN_LEVELS;
            children[i].order = i;
          }

          children[midIndex + 1].x =
            mid.x + Node.DEFAULT_WIDTH + this.SPACING_BETWEEN_NODES;
          children[midIndex + 1].y = parent.y + this.SPACE_BETWEEN_LEVELS;
          children[midIndex + 1].order = midIndex + 1;

          for (let i = midIndex + 2; i < children.length; i++) {
            children[i].x =
              children[i - 1].x +
              Node.DEFAULT_WIDTH +
              this.SPACING_BETWEEN_NODES;
            children[i].y = parent.y + this.SPACE_BETWEEN_LEVELS;
            children[i].order = i;
          }
        }
      }

      //check for collistion with parent's left sibling

      if (parent.parentId !== 0) {
        let leftSibling = this.getLeftSibling(parent);

        if (!leftSibling) {
          return 0;
        }

        let rightMostNode = this.getRightMostNodeInFamily(leftSibling);
        let leftMostNode = this.getLeftMostNodeInFamily(parent);

        if(rightMostNode.x === null || leftMostNode.x === null){
          return 0;
        }

        if (rightMostNode.x + rightMostNode.width > leftMostNode.x) {
          console.log(
            "there was a colision between",
            leftMostNode,
            rightMostNode
          );

          let offsetRightParentBy =
            rightMostNode.x +
            rightMostNode.width -
            leftMostNode.x +
            this.SPACING_BETWEEN_NODES;

          this.setFamilyNodeXY(parent, 0, offsetRightParentBy);

          return offsetRightParentBy;
        }
      }
      return 0;
    }
  }

  getLeftMostNodeInFamily(node) {
    let family = this.getFamily.apply(this, [node]);

    return Helper.minObjectBy(family, "x");
  }
  getRightMostNodeInFamily(node) {
    let family = this.getFamily.apply(this, [node]);

    return Helper.maxObjectBy(family, "x");
  }

  getFamily(node) {
    let familyMembers = [];

    addFamilyMember.apply(this, [node]);

    return familyMembers;

    function addFamilyMember(member) {
      familyMembers.push(member);

      let children = this.getChildren(member);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        addFamilyMember.apply(this, [child]);
      }
    }
  }
  calculateNodePositions() {
    

    //Level based calculations
    let maxLevel = Helper.maxValueBy(this.treeData, "level");

    this.setFamilyNodeXY(this.rootNode);

    // //start with level 2 as root not x and y are already set.
    for (let i = 1; i < maxLevel; i++) {
      let levelINodes = this.treeData.filter((node) => node.level === i);
      let nextRightOffset = 0;

      for (let j = 0; j < levelINodes.length; j++) {
        const node = levelINodes[j];

        nextRightOffset = this.setFamilyNodeXY(node, 0, nextRightOffset);
      }
    }

    //delayed adjustments
    // let i = 0,
    //     that = this;
    //   (function timeout0() {
    //     setTimeout(function () {
    //       // Do Something Here
    //       // Then recall the parent function to
    //       // create a recursive loop.
    //       let levelINodes = that.treeData.filter(node=>node.level === i);

    //       let j = 0;
    //       let thatj = that;
    //       (function timeout(that) {
    //         setTimeout(function () {
    //           // Do Something Here
    //           // Then recall the parent function to
    //           // create a recursive loop.
    //           const node = levelINodes[j];

    //           nextRightOffset = thatj.setFamilyNodeXY(node,0,nextRightOffset);
    //           j++;
    //           if (j < levelINodes.length) timeout();
    //         }, 1000);
    //       })();

    //       i++;
    //       if (i < maxLevel) timeout0();
    //     }, 1000);
    //   })();

    //BFS based calcuation

    // this.setFamilyNodeXY(this.rootNode);

    //DFS based caluclation Trail #1
    //params: children,parent
    // for (let i = 0; i < children.length; i++) {
    //   const child = children[i];

    //   child.y = parent.y + this.SPACE_BETWEEN_LEVELS;

    //   child.x = parent.x;

    //   //calculate x

    //   let grandChildren = this.treeData.filter(node => node.parentId === child.id);

    //   if(grandChildren.length > 0 )

    //   this.calculateNodePositions(grandChildren,child);

    // }
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
      `${node.text}, ${node.order}`,
      node.nodeCenter.x,
      node.nodeCenter.y
    ); //, ${node.level}, ${node.extendedOrder},  ${node.order}

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
      this.canvas.width - 200,
      50
    );
  }

  startDrawLoop() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.font = 20 * this.zoomLevel + "px Montserrat";

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

    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
  }

  handleCanvasClick(ev) {
    // this.addNode.apply(this, [
    //   {
    //     id: 11,
    //     text: "Seventh Node",
    //     parentId: 6,
    //   },true
    // ]);
  }

  handleMouseWheel(ev) {
    const MIN_ZOOM = 1,
      MAX_ZOOM = 3;
    let zoomFactor = 0;
    if (event.wheelDelta > 0) {
      this.zoomLevel += 0.1;
      this.reCenterTreeToCursor(ev, "in");
    } else {
      this.zoomLevel -= 0.1;
      this.reCenterTreeToCursor(ev, "out");
    }
  }

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
