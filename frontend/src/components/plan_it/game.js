import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector2,
  Vector3,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Image,
  Control,
  StackPanel,
} from "@babylonjs/gui/2D";

import { assignIn } from "lodash";

import { endTurn, fetchGame } from "./api";
import { createBoard } from "./board";
import GAME_STATE from "./game_state";
import GameMenu from "./game_menu";
import GameScene from "./game_scene";
import styles from "./plan_it.scss";

import water_col from "../../assets/textures/Water_002_COLOR.jpg";
import water_norm from "../../assets/textures/Water_002_NORM.jpg";
import water_spec from "../../assets/textures/Water_002_NORM.jpg";
import water_disp from "../../assets/textures/Water_002_DISP.png";
import woodPanel from "../../assets/images/woodPanelLong.jpg";

const createBackground = (scene, isDesktop) => {
  const board = MeshBuilder.CreateGround("board", {
    width: isDesktop ? 300 : 200,
    height: isDesktop ? 200 : 400,
    subdivisions: 500,
    updatable: true
  }, scene);

  board.position = new Vector3(0, 25, 0);
  board.rotation = new Vector3(-Math.PI / 2, 0, 0);
  const oceanMat = new StandardMaterial("oceanMat");
  board.applyDisplacementMap(water_disp, -1, 2, undefined, new Vector2(0,0), new Vector2(5,5));
  oceanMat.diffuseTexture = new Texture(water_col, scene);
  oceanMat.specularTexture = new Texture(water_spec, scene);
  oceanMat.bumpTexture = new Texture(water_norm, scene);

  board.material = oceanMat;
};

// TODO test this out and add it to a button
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}


class PlanItGame {
  constructor(navigate, isDesktop, userId, setUserId, gameId) {
    this.navigate = navigate;
    this.isDesktop = isDesktop;
    this.canvas = document.getElementById("PlanIt");
    this.engine = new Engine(this.canvas, true);
    this.gameScene = new GameScene(this.engine, this.canvas);
    this.gameState = {};
    this.box = {};

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
    console.log("SETTING INTERVAL");
    clearInterval(this.pollId);
    this.pollId = setInterval(() => this.pollGameState(), 3000);

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

    //window.addEventListener("click", () => toggleFullScreen());

    // run the main render loop
    this.gameScene.render();
  }

  destruct() {
    clearInterval(this.pollGameState);
  }

  async pollGameState() {
    console.log("state: ", this.gameState.state);
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

    //scene.onPointerDown = function (evt, pickResult) {
      //if (pickResult.hit) {
          //box.position.x = pickResult.pickedPoint.x;
          //box.position.y = pickResult.pickedPoint.y;
      //}
    //};

    createBackground(scene, this.isDesktop);
    createBoard(scene, this.gameState);

    this.gameMenu.renderDesktopGameUI();

    await scene.whenReadyAsync();
    this.engine.hideLoadingUI();

    this.gameScene.setScene(scene);
    this.gameState.state = GAME_STATE.GAME;
  }
}

export default PlanItGame;
