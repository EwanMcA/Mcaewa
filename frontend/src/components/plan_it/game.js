import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector2,
  Vector3,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Control,
  StackPanel,
} from "@babylonjs/gui/2D";

import { assignIn } from "lodash";

import { fetchGame } from "./api";
import { createBoard } from "./board";
import GAME_STATE from "./game_state";
import GameMenu from "./game_menu";
import GameScene from "./game_scene";

import water_col from "../../assets/textures/Water_002_COLOR.jpg";
import water_norm from "../../assets/textures/Water_002_NORM.jpg";
import water_spec from "../../assets/textures/Water_002_NORM.jpg";
import water_disp from "../../assets/textures/Water_002_DISP.png";

const createBackground = (scene) => {
  const board = MeshBuilder.CreateGround("board", {width: 300, height: 200, subdivisions: 500, updatable: true}, scene);
  board.position = new Vector3(0, 25, 0);
  board.rotation = new Vector3(-Math.PI / 2, 0, 0);
  const oceanMat = new StandardMaterial("oceanMat");
  board.applyDisplacementMap(water_disp, -1, 2, undefined, new Vector2(0,0), new Vector2(5,5));
  oceanMat.diffuseTexture = new Texture(water_col, scene);
  oceanMat.specularTexture = new Texture(water_spec, scene);
  oceanMat.bumpTexture = new Texture(water_norm, scene);

  board.material = oceanMat;
};

class PlanItGame {
  constructor(navigate, isDesktop, userId, setUserId, gameId) {
    this.navigate = navigate;
    this.isDesktop = isDesktop;
    this.canvas = document.getElementById("PlanIt");
    this.engine = new Engine(this.canvas, true);
    this.gameScene = new GameScene(this.engine, this.canvas);
    this.gameState = {};

    this.numPlayers = 1;
    this.userId = userId;
    this.setUserId = setUserId;
    this.gameMenu = new GameMenu(
      navigate,
      isDesktop,
      userId,
      setUserId,
      this.gameState,
      this.gameScene,
      gameId,
    );
    setInterval(() => this.pollGameState(), 3000);

    if (gameId) {
      this.navToGame(gameId);
    } else {
      this.gameMenu.goToMenu();
    }

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this.gameScene.toggleDebugMenu()) {
          const input = this.getInput("", { top: "10px", height: "20px" });
          input.onTextChangedObservable.add(() => {
            this.userId = input.text;
            this.setUserId(input.text);
          });
          this.guiMenu.addControl(input);
        }
      }
    });

    // run the main render loop
    this.gameScene.render();
  }

  destruct() {
    clearInterval(this.pollGameState);
  }

  async pollGameState() {
    if (this.gameState.state == GAME_STATE.LOBBY || this.gameState.state == GAME_STATE.GAME) {
      const gameState = await fetchGame(this.userId, this.gameId);
      if (!gameState) {
        this.navigate("/planit");
        return;
      }
      assignIn(this.gameState, gameState);
      //console.log("gameState: ", this.gameState);
      if (this.gameState.state == GAME_STATE.LOBBY && gameState.started) {
        this.goToGame();
      } else if (this.gameState.state == GAME_STATE.LOBBY) {
        // TODO refresh function
        this.gameMenu.goToLobby(this.gameState);
      }
    }
  }

  async navToGame(gameId) {
    this.gameId = gameId;
    const gameState = await fetchGame(this.userId, gameId);
    if (!gameState) {
      this.navigate("/planit");
      return;
    }
    assignIn(this.gameState, gameState);

    if (this.gameState.started) {
      this.goToGame();
    } else {
      this.gameMenu.goToLobby();
    }
  }

  async goToGame() {
    this.engine.displayLoadingUI();
    const scene = this.gameScene.newScene();

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    createBackground(scene);
    createBoard(scene, this.gameState);
    this.gameMenu.addTextBlock(
      this.guiMenu, {
        height: "30px",
        top: "-20px",
        verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
        text: this.gameState.player_name,
        width: 1.0,
      },
    );
    // TODO stack vertically across top
    const playersPanel = new StackPanel();
    this.gameState.players.forEach((name) => {
      this.gameMenu.addTextBlock(
        playersPanel, { height: "30px", paddingLeft: "20px", width: "100px", text: name },
      );
    });
    playersPanel.width = 0.75;
    playersPanel.height = 0.3;
    playersPanel.isVertical = false;
    playersPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.guiMenu.addControl(playersPanel);

    await scene.whenReadyAsync();
    this.engine.hideLoadingUI();

    this.gameScene.setScene(scene);
    this.gameState.state = GAME_STATE.GAME;
  }
}

export default PlanItGame;
