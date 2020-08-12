import Helper from "./Helpers/Helper.js";
import Node from "./Node.js";

/**
 * TreeData Class
 *
 * Contains all the logic related to the tree data structure
 */
class TreeData {
  constructor(rawData) {
    this.data = [];
    this.SPACE_BETWEEN_LEVELS = 200;
    this.SPACING_BETWEEN_NODES = 100;

    rawData = rawData.sort((a, b) => a.parentId - b.parentId);

    for (let i = 0; i < rawData.length; i++) {
      this.addNode.apply(this, [rawData[i]]);
    }
  }

  //#region Non Mutating Functions

  /**
   * Returns the tree data structure
   * 
   *  @returns {Node[]} - Tree Data
   */
  getData() {
    return this.data;
  }

  /**
   * Returns the children of a node
   *
   * @param {Node} parent
   * 
   *  @returns {Node[]} - Children
   */
  getChildren(parent) {
    return this.data.filter((node) => node.parentId === parent.id);
  }

  /**
   * Returns the parent of a node
   *
   * @param {Node} child
   * 
   *  @returns {Node} - Parent Node
   */
  getParent(child) {
    return this.data.find((node) => node.id === child.parentId);
  }
  /**
   * Returns all the siblings of a node
   *
   * @param {Node} child
   * 
   *  @returns {Node[]} - Siblings
   */
  getSiblings(child) {
    return this.data.filter((node) => node.parentId === child.parentId);
  }

  /**
   * Returns the immediate left sibling of a node
   *
   * @param {Node} child
   * 
   *  @returns {Node} node
   */
  getLeftSibling(child) {
    let siblings = this.getSiblings(child);
    return siblings.find((s) => s.order === child.order - 1);
  }
  /**
   * Returns the immediate right sibling of a node
   *
   * @param {Node} child
   * 
   *  @returns {Node} - The Right Sibling
   */
  getRightSibling(child) {
    let siblings = this.getSiblings(child);
    return siblings.find((s) => s.order === child.order + 1);
  }

  /**
   * Returns Returns the left most node among the child family
   *
   * @param {Node} node
   * 
   *  @returns {Node} - The left most node in the family
   */
  getLeftMostNodeInFamily(node) {
    let family = this.getFamily.apply(this, [node]);

    return Helper.minObjectBy(family, "x");
  }
  /**
   * Returns Returns the right most node among the child family
   *
   * @param {Node} node
   * 
   * @returns {Node} The right most node in the family
   */
  getRightMostNodeInFamily(node) {
    let family = this.getFamily.apply(this, [node]);

    return Helper.maxObjectBy(family, "x");
  }
  /**
   * Returns the root node
   * 
   * @returns {Node} - Root node
   */
  getRootNode() {
    return this.rootNode;
  }

  /**
   * Returns the child family(List of all the nodes) of a node
   * 
   * @param {Node} node 
   * 
   * @returns {Node[]} Family members
   */
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
  //#endregion Non Mutating Functions



  //#region  Mutating functions

  /**
   * 
   * @param {Number} x - Root Node's X Co-ordinate
   * @param {Number} y - Root Node's Y Co-ordinate
   */
  setRootNodePosition(x, y) {
    this.rootNode.x = x;
    this.rootNode.y = y;
  }

  /**
   * 
   * @param {Node} child - Node object to add to the tree
   * @param {Boolean} invalidate - Boolean to recaculate the positions of all the nodes
   */
  addNode(child, invalidate) {
    if (child.parentId === 0) {
      child.level = 0;

      const node = new Node(
        child.id,
        child.text,
        child.parentId,
        child.level,
        0,
        null,
        null
      );
      this.rootNode = node;
      this.data.push(node);
    } else {
      const parent = this.data.find((n) => n.id === child.parentId);

      child.nodeX = null;
      child.nodeY = null;
      child.level = parent.level + 1;

      const node = new Node(
        child.id,
        child.text,
        child.parentId,
        child.level,
        child.order,
        child.nodeX,
        child.nodeY
      );

      this.data.push(node);
    }

    if (invalidate) {
      this.calculateNodePositions();

      // this.zoomToFit();
    }
  }

  /**
   * 
   * Sets the X and Y Co-ordinates of all child the nodes of the parent 
   * 
   * @param {Node} parent - Node for which the family positions need to be set
   * @param {Number} offsetLeft - Pixels to move left
   * @param {Number} offsetRight - Pixels to move right
   */
  setFamilyNodeXY(parent, offsetLeft = 0, offsetRight = 0) {
    /**
     * Logic:
     * 
     * The logic below sets the positions of node and its children
     *
     * if the children are odd numbered then the the center one remains exactly below the parent
     *  with older nodes on left and yonger nodes on right.
     *
     * if the children are even numbered then the children are distributed evenly on either side of the parent node.
     *
     * Checks collision with left nodes and returns the offset to re-adjust the position while re excecuting the method with new offset
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

        if (rightMostNode.x === null || leftMostNode.x === null) {
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

  /**
   * Set X and Y co-ordinates of all the nodes in the tree
   * 
   * @param {Number} canvasWidth - Canvas width in pixels
   * @param {Number} canvasHeight - Canvas height in pixels
   */
  calculateNodePositions(canvasWidth, canvasHeight) {
    if (canvasWidth)
      this.setRootNodePosition(canvasWidth / 2 - Node.DEFAULT_WIDTH / 2, 100);

    //Level based calculations
    let maxLevel = Helper.maxValueBy(this.data, "level");

    this.setFamilyNodeXY(this.rootNode);

    // //start with level 2 as root not x and y are already set.
    for (let i = 1; i < maxLevel; i++) {
      let levelINodes = this.data.filter((node) => node.level === i);
      let nextRightOffset = 0;

      for (let j = 0; j < levelINodes.length; j++) {
        const node = levelINodes[j];

        nextRightOffset = this.setFamilyNodeXY(node, 0, nextRightOffset);
      }
    }
  }

  //#endregion Mutating functions
}

export default TreeData;
