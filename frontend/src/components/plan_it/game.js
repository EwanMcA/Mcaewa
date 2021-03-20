import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  ArcRotateCamera,
  Engine,
  Color3,
  DynamicTexture,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector2,
  Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui/2D";

import { fetchGame } from "./fetches";

import water_col from "../../assets/textures/Water_001_SD/Water_001_COLOR.jpg";
import water_norm from "../../assets/textures/Water_001_SD/Water_001_NORM.jpg";
import water_spec from "../../assets/textures/Water_001_SD/Water_001_SPEC.jpg";
import water_disp from "../../assets/textures/Water_001_SD/Water_001_DISP.png";
import clayMountains from "../../assets/textures/clayMountains.png";
import desert from "../../assets/textures/desert.jpg";
import forest from "../../assets/textures/forest.png";
import mountains from "../../assets/textures/mountains.png";
import pasture from "../../assets/textures/pasture.png";
import wheat from "../../assets/textures/wheat.png";


const GAME_STATE = {
  MENU: 0,
  GAME: 1,
  LOSE: 2,
  WIN: 3,
};

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
  [-8, 5, -1, 0, 0, 1], // Bottom Left
  [-8, -5, -1, 0, 0, -1], // Bottom Right
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

const createBackground = (scene) => {
  const board = MeshBuilder.CreateGround("board", {width: 300, height: 200, subdivisions: 500, updatable: true}, scene);
  board.position = new Vector3(0, 25, 0);
  board.rotation = new Vector3(-Math.PI / 2, 0, 0);
  const oceanMat = new StandardMaterial("oceanMat");
  //board.applyDisplacementMap(water_disp, -1, 2, undefined, new Vector2(0,0), new Vector2(5,5));
  oceanMat.diffuseTexture = new Texture(water_col, scene);
  oceanMat.diffuseTexture.uScale = 5;
  oceanMat.diffuseTexture.vScale = 5;
  // TODO decide between cartoonish and realistic textures
  //oceanMat.specularTexture = new Texture(water_spec, scene);
  //oceanMat.specularTexture.uScale = 5;
  //oceanMat.specularTexture.vScale = 5;
  //oceanMat.bumpTexture = new Texture(water_norm, scene);
  //oceanMat.bumpTexture.uScale = 5;
  //oceanMat.bumpTexture.vScale = 5;

  board.material = oceanMat;
};

const isDesert = (i, gameState) => gameState.hex_list[i] === "D";

const createBoard = (scene, gameState) => {
  const tileEntities = [];
  //const tileTypes = TILE_TYPES.slice(0);
  for (let i = 0; i < 19; ++i) {
    // Hex tile
    const tile = MeshBuilder.CreateDisc("disc", {radius: 11.5, tessellation: 6}, scene);
    const tileMat = new StandardMaterial("tile", scene);
    tileMat.diffuseTexture = new Texture(TILE_TEXTURES[gameState.hex_list[i]], scene);
    tile.position = new Vector3(TILES[i][0], TILES[i][1], -3);
    tile.rotation = new Vector3(0, 0, Math.PI / 2);
    tile.material = tileMat;

    // Sand under hex
    //if (![4,5,8,9,10,13,14].includes(i)) {
      //const sand = MeshBuilder.CreateDisc("disc", {radius: 12.5, tessellation: 6});
      //sand.position = new Vector3(TILES[i][0], TILES[i][1], -2);
      //sand.rotation = new Vector3(0, 0, Math.PI / 2);
      //const sandMat = new StandardMaterial("tile", scene);
      //sandMat.diffuseColor = new Color3(0.9, 0.7, 0.5);
      //sand.material = sandMat;
    //}

    // Number tile
    if (!isDesert(i, gameState)) {
      const num = gameState.nums[i];
      const numMesh = MeshBuilder.CreateDisc("num", {radius: 2}, scene);
      const numTexture = new DynamicTexture("dynamic texture", {width:512, height:256}, scene);
      const numMat = new StandardMaterial("numMat", scene);
      numMat.diffuseTexture = numTexture;
      numMat.diffuseColor = new Color3(0.9, 0.8, 0.4);
      numMesh.material = numMat;
      var font = "bold 186px monospace";
      numTexture.drawText(num, num > 9 ? 150 : 200, 200, font, "green", "white", false, true);
      numMesh.position = new Vector3(TILES[i][0], TILES[i][1], -5);
    }

    tileEntities.push(tile);
  }

  // Roads
  ROADS.forEach((road) => {
    const roadMesh = MeshBuilder.CreateBox("road", { height: 1, width: 6 }, scene);
    roadMesh.parent = tileEntities[road[0]];
    const tf = ROAD_TRANSFORMS[road[1]];
    roadMesh.position = new Vector3(tf[0], tf[1], tf[2]);
    roadMesh.rotation = new Vector3(tf[3], tf[4], tf[5]);
  });

  return tileEntities;
};

const createScene = (canvas, engine) => {
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera(
    "Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, -50, -150), scene
  );
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);
  const light1 = new HemisphericLight("light1", new Vector3(1, 1, -1), scene);
  light1.specular = new Color3(0.5,0.5,1.0);
  light1.intensity = 0.95;

  return scene;
};

class PlanItGame {
  constructor() {
    this.canvas = document.getElementById("PlanIt");
    this.engine = new Engine(this.canvas, true);
    this.scene = createScene(this.canvas, this.engine);
    this.state = GAME_STATE.MENU;
    //this.engine.displayLoadingUI();
    //this.engine.hideLoadingUI();

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;
    this.addGUIButton("create_game", "Create Game", "200px", () => this.goToGame());
    this.addGUIButton("join_game", "Join Game", "300px", () => this.goToGame());
    this.addGUIButton("options", "Options (tbd lol)", "400px", () => this.goToGame());

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this.scene.debugLayer.isVisible()) {
          this.scene.debugLayer.hide();
        } else {
          this.scene.debugLayer.show();
        }
      }
      if (ev.keyCode === 13) {
        this.goToGame();
      }
    });

    // run the main render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  async goToGame() {
    this.engine.displayLoadingUI();
    this.scene.detachControl();

    const scene = createScene(this.canvas, this.engine);
    this.gameState = await fetchGame();
    if (this.gameState) {
      createBackground(scene);
      createBoard(scene, this.gameState);
    }

    await scene.whenReadyAsync();
    this.engine.hideLoadingUI();
    this.scene.dispose();
    this.scene = scene;
    this.state = GAME_STATE.GAME;
  }

  addGUIButton(name, text, top, callback) {
    const button = Button.CreateSimpleButton(name, text);
    button.width = 0.4;
    button.height = "80px";
    button.color = "white";
    button.thickness = 3;
    button.top = top;
    button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    button.onPointerDownObservable.add(() => {
      callback();
    });

    this.guiMenu.addControl(button);
  }
}

export default PlanItGame;
