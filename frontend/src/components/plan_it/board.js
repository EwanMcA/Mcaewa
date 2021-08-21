import {
  Color3,
  DynamicTexture,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";

import clayMountains from "../../assets/textures/clayMountains.png";
import desert from "../../assets/textures/desert.jpg";
import forest from "../../assets/textures/forest.png";
import mountains from "../../assets/textures/mountains.png";
import pasture from "../../assets/textures/pasture.png";
import wheat from "../../assets/textures/wheat.png";


const TILE_TEXTURES = {
  "B": clayMountains,
  "L": forest,
  "O": mountains,
  "P": pasture,
  "W": wheat,
  "D": desert,
};

const TILES = [
  [-20, 34], [0, 34], [20, 34],
  [-30, 17], [-10, 17], [10, 17], [30, 17],
  [-40, 0], [-20, 0], [0, 0], [20, 0], [40, 0],
  [-30, -17], [-10, -17], [10, -17], [30, -17],
  [-20, -34], [0, -34], [20, -34],
];

const ROAD_TRANSFORMS = [
  [0, 10, -1, 0, 0, 0], // Left
  [8, 5, -1, 0, 0, -1], // Top Left
  [8, -5, -1, 0, 0, 1], // Top Right
  [0, -9, -1, 0, 0, 0], // Right
  [-8.5, 5, -1, 0, 0, 1], // Bottom Left
  [-8.5, -5, -1, 0, 0, -1], // Bottom Right
];

// [ [tileIndex, roadTransform] ]
const ROADS = [
  [0, 1], [0, 2], [1, 1], [1, 2], [2, 1], [2, 2],
  [0, 0], [1, 0], [2, 0], [2, 3],
  [3, 1], [3, 2], [4, 1], [4, 2], [5, 1], [5, 2], [6, 1], [6, 2],
  [3, 0], [4, 0], [5, 0], [6, 0], [6, 3],
  [7, 1], [7, 2], [8, 1], [8, 2], [9, 1], [9, 2], [10, 1], [10, 2], [11, 1], [11, 2],
  [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [11, 3],
  [7, 4], [12, 1], [12, 2], [13, 1], [13, 2], [14, 1], [14, 2], [15, 1], [15, 2], [11, 5],
  [12, 0], [13, 0], [14, 0], [15, 0], [15, 3],
  [12, 4], [16, 1], [16, 2], [17, 1], [17, 2], [18, 1], [18, 2], [15, 5],
  [16, 0], [17, 0], [18, 0], [18, 3],
  [16, 4], [16, 5], [17, 4], [17, 5], [18, 4], [18, 5],
];

const STRUCTURE_TRANSFORMS = [
  [5.5, 10, -1], // Top Left
  [10, 0, -1], // Top
  [5.5, -9, -1], // Top Right
  [-6, 10, -1], // Bottom Left
  [-11, 0, -1], // Bottom
  [-6, -9, -1], // Bottom Right
];

const STRUCTURES = [
  [0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2],
  [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1], [6, 0], [6, 1], [6, 2],
  [7, 0], [7, 1], [8, 0], [8, 1], [9, 0], [9, 1], [10, 0], [10, 1], [11, 0], [11, 1], [11, 2],
  [12, 0], [12, 1], [13, 0], [13, 1], [14, 0], [14, 1], [15, 0], [15, 1], [15, 2],
  [16, 0], [16, 1], [17, 0], [17, 1], [18, 0], [18, 1], [18, 2],
  [16, 3], [16, 4], [17, 3], [17, 4], [18, 3], [18, 4], [18, 5],
];


const isDesert = (i, gameState) => gameState.hex_list[i] === "D";

export const createBoard = (scene, gameState) => {
  const tileEntities = [];

  for (let i = 0; i < 19; ++i) {
    // Hex tile
    const tile = MeshBuilder.CreateDisc("disc", {radius: 11.4, tessellation: 6}, scene);
    const tileMat = new StandardMaterial("tile", scene);
    tileMat.diffuseTexture = new Texture(TILE_TEXTURES[gameState.hex_list[i]], scene);
    tile.position = new Vector3(TILES[i][0], TILES[i][1], -3);
    tile.rotation = new Vector3(0, 0, Math.PI / 2);
    tile.material = tileMat;

    // Sand under hex
    //if (![4,5,8,9,10,13,14].includes(i)) { //const sand = MeshBuilder.CreateDisc("disc", {radius: 12.5, tessellation: 6}); //sand.position = new Vector3(TILES[i][0], TILES[i][1], -2); //sand.rotation = new Vector3(0, 0, Math.PI / 2); //const sandMat = new StandardMaterial("tile", scene); //sandMat.diffuseColor = new Color3(0.9, 0.7, 0.5); //sand.material = sandMat; //}

    // Number tile
    if (!isDesert(i, gameState)) {
      const num = gameState.num_list[i];
      const numMesh = MeshBuilder.CreateDisc("num", {radius: 2}, scene);
      const numTexture = new DynamicTexture("dynamic texture", {width:512, height:256}, scene);
      const numMat = new StandardMaterial("numMat", scene);
      numMat.diffuseTexture = numTexture;
      numMat.diffuseColor = new Color3(1.0, 0.9, 0.6);
      numMesh.material = numMat;
      var font = "bold 186px monospace";
      numTexture.drawText(num,
        num > 9 ? 150 : 200,
        200,
        font,
        num == 6 || num == 8 ? "red" : "green",
        "white",
        false,
        true);
      numMesh.position = new Vector3(TILES[i][0], TILES[i][1], -5);
    }

    tileEntities.push(tile);
  }

  // Roads
  ROADS.forEach((road, ix) => {
    if (gameState.roads[ix] !== "0") {
      const roadMesh = MeshBuilder.CreateBox("road", { height: 1, width: 5 }, scene);
      roadMesh.parent = tileEntities[road[0]];
      const tf = ROAD_TRANSFORMS[road[1]];
      roadMesh.position = new Vector3(tf[0], tf[1], tf[2]);
      roadMesh.rotation = new Vector3(tf[3], tf[4], tf[5]);
    }
  });

  // Structures
  STRUCTURES.forEach((structure, ix) => {
    if (gameState.towns[ix] !== "0" || gameState.castles[ix] !== "0") {
      const structureMesh = gameState.towns[ix] !== "0"
        ?  MeshBuilder.CreateBox("town", { height: 1.5, width: 1.5 }, scene)
        : MeshBuilder.CreateBox("castle", { height: 2.5, width: 2 }, scene);

      structureMesh.parent = tileEntities[structure[0]];
      const tf = STRUCTURE_TRANSFORMS[structure[1]];
      structureMesh.position = new Vector3(tf[0], tf[1], tf[2]);
    }
  });

  return tileEntities;
};

