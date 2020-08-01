import Tree from "./Tree.js";
import Node from "./Node.js";

let options = {
  data: [
    {
      id: 1,
      text: "First Node",
      parentId: 0,
    },
    {
      id: 2,
      text: "Second Node",
      parentId: 1,
    },
    {
      id: 3,
      text: "Third Node",
      parentId: 1,
    },
    {
      id: 4,
      text: "Fourth Node",
      parentId: 1,
    },
    {
      id: 5,
      text: "Fifth Node",
      parentId: 3,
    },
    {
      id: 6,
      text: "Sixth Node",
      parentId: 1,
    },
    {
      id: 7,
      text: "Seventh Node",
      parentId: 6,
    },
    {
      id: 8,
      text: "Eighth Node",
      parentId: 1,
    },
    {
      id: 9,
      text: "Ninth Node",
      parentId: 4,
    },
    {
      id: 10,
      text: "Tenth Node",
      parentId: 6,
    },
    {
      id: 11,
      text: "Eleventh Node",
      parentId: 6,
    },
    {
      id: 12,
      text: "Twelth Node",
      parentId: 8,
    },
    {
      id: 13,
      text: "Twelth Node",
      parentId: 8,
    },
    {
      id: 14,
      text: "Twelth Node",
      parentId: 5,
    },
    {
      id: 15,
      text: "Twelth Node",
      parentId: 4,
    },
    {
      id: 16,
      text: "Twelth Node",
      parentId: 4,
    }
  ],
  zoomControl: true,
};
new Tree("tree", options);
