import Tree from "./Tree.js";
import Node from "./Node.js";

let options = {
  data: [
    new Node(1, "First Node", 500, 200, 0),
    new Node(2, "Second Node", 300, 400, 1),
    new Node(3, "Third Node", 700, 400, 1),
    // new Node(4, "Third Node", 700, 500, 1),
    // new Node(5, "Third Node", 700, 600, 1),
    // new Node(6, "Third Node", 700, 700, 2),
    // new Node(7, "Third Node", 700, 800, 2),
    // new Node(8, "Third Node", 700, 900, 1),
    // new Node(9, "Third Node", 700, 1000, 6),
    // new Node(10, "Third Node", 700, 1100, 9),
    // new Node(11, "Third Node", 700, 1200, 1),
    // new Node(12, "Third Node", 700, 1300, 11),
  ],
  zoomControl: true,
};
new Tree("tree", options);
