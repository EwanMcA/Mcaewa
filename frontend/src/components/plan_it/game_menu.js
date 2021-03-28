import { Layer } from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Button,
  Control,
  InputText,
  ScrollViewer,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui/2D";
import noop from "lodash/noop";

import { createGame, getUserGames, joinGame, leaveGame, startGame } from "./api";
import GAME_STATE from "./game_state";
import styles from "./plan_it.scss";

import background from "../../assets/textures/fieldPath.jpg";

const MAX_PLAYERS = 4;


class GameMenu {
  constructor(userId, setUserId, gameScene, gameId) {
    this.userId = userId;
    this.setUserId = setUserId;
    this.gameScene = gameScene;
    this.gameId = gameId;
    this.games = [];
  }

  async createGame(playerName) {
    this.gameState = await createGame(this.userId, playerName);
    if ("user_id" in this.gameState) {
      console.log("resetting user id");
      this.setUserId(this.gameState["user_id"]);
    }
    this.gameId = this.gameState.id;
    window.location.href = `planit/${this.gameState.id}`;
  }

  async goToMenu() {
    const scene = this.gameScene.newScene();
    scene.__background = new Layer("menuBackground", background, scene, true);
    this.games = (await getUserGames(this.userId))["games"];

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    const menuPanel = new StackPanel();
    menuPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    menuPanel.width = 0.5;
    menuPanel.height = 0.9;
    this.guiMenu.addControl(menuPanel);
    const title = this.addTextBlock(
      menuPanel, {
        height: "150px", top: "0px", fontSize: 48, text: "Title"
      },
    );
    title.paddingBottom = "50px";

    const input = this.getInput("Player 1", { paddingBottom: "60px", height: "100px" });
    menuPanel.addControl(input);
    this.addGUIButton("create_game", menuPanel, {
      text: "Create Game", top: "200px", padding: "20px", callback: () => this.createGame(input.text),
    });
    this.addGUIButton("join_game", menuPanel, {
      text: "Join Game", top: "300px", padding: "20px", callback: () => this.goToJoin(input.text),
    });
    this.addGUIButton("options", menuPanel, {
      text: "Options (tbd lol)", top: "400px", padding: "20px", callback: () => {},
    });

    const gamesHeader = this.addTextBlock(
      this.guiMenu, {
        top: "0px",
        fontSize: 32,
        text: "Your Games",
        left: "-150px",
        width: "500px",
      }
    );
    gamesHeader.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

    const gamesViewer = new ScrollViewer();
    gamesViewer.thickness = 0;
    gamesViewer.height = 0.7;
    gamesViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    gamesViewer.width = "500px";
    gamesViewer.left = "-150px";
    const gamesPanel = new StackPanel();
    this.guiMenu.addControl(gamesViewer);
    gamesViewer.addControl(gamesPanel);
    this.games.forEach((game) => {
      const gameStatus = game.started ? `Turn ${game.turn}` : "Lobby";
      const waitingFor = game.player_turn === game.player_name ? "Your Turn" : `Waiting for ${game.player_turn}`;
      this.addGUIButton(game.id, gamesPanel, {
        background: game.player_turn === game.player_name ? styles.yourTurnColor : styles.buttonColor,
        callback: () => { window.location.href = `planit/${game.id}`; },
        text:
        `${gameStatus}        ${waitingFor}        ${game.players.join(" vs ")}`,
        fontSize: 16,
        leftJustify: true,
        padding: "15px",
        thickness: 1,
        width: 0.9,
        height: "75px"
      });
    });

    this.gameScene.setScene(scene);
    this.state = GAME_STATE.MENU;
  }

  async goToLobby(gameState=this.gameState) {
    this.gameState = gameState;
    const scene = this.gameScene.newScene();
    scene.__background = new Layer("menuBackground", background, scene, true);

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    this.addBackButton(async () => {
      window.location.href = "../planit";
    });
    const leaveButton = this.addGUIButton(
      "leave_game", this.guiMenu, {
        text: "Leave Game", top: "75px", callback: async () => {
          await leaveGame(
            this.userId, this.gameState.id, this.gameState.player_name
          );
          window.location.href = "../planit";
        }, fontSize: 20, thickness: 1, width: 0.1, height: "40px"
      }
    );
    leaveButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    leaveButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    leaveButton.left = "-20px";
    leaveButton.top = "-20px";

    this.addGUIButton("game_link", this.guiMenu, {
      text: "Copy Game Link",
      top: "75px",
      thickness: 1,
      width: 0.3,
      height: "40px"
    });
    this.addTextBlock(
      this.guiMenu, {
        top: "150px",
        fontSize: 36,
        text: `~   ${this.gameState.players[0]}   ~`,
        width: 0.5,
      },
    );
    for (let i = 0; i < MAX_PLAYERS - 1; ++i) {
      const label = i >= this.gameState.players.length - 1
        ? "~                   ~"
        : `~   ${this.gameState.players[i + 1]}   ~`;
      this.addTextBlock(
        this.guiMenu, {
          height: `${225 + i * 125}px`,
          top: "150px",
          fontSize: 36,
          text: label,
          width: 0.5,
        }
      );
    }
    //for (let i = 0; i < 4 - this.numPlayers; ++i) { //this.addGUIButton( //`add_player${i}`, //"+", //`${400 - i * 70}px`, //() => { this.numPlayers = this.numPlayers + 1; this.goToLobby(playerName); }, //3, //0.03, //"30px", //); //}
    this.addGUIButton("start", this.guiMenu, {
      text: "Start", top: "500px", callback: () => {
        startGame(this.userId, this.gameState.id);
      },
    });

    this.gameScene.setScene(scene);
    this.state = GAME_STATE.LOBBY;
  }

  async goToJoin(playerName, gameId="Your game code...") {
    const scene = this.gameScene.newScene();
    scene.__background = new Layer("menuBackground", background, scene, true);

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    this.addBackButton(async () => {
      this.goToMenu();
    });
    const nameInput = this.getInput(playerName);
    this.guiMenu.addControl(nameInput);
    const gameIdInput = this.getInput(gameId);
    gameIdInput.top = "250px";
    this.guiMenu.addControl(gameIdInput);
    const errorText = this.addTextBlock(
      this.guiMenu, {
        top: "500px", color: styles.errorTextColor, fontSize: 18, text: "", width: 0.9,
      },
    );

    this.addGUIButton("join", this.guiMenu, {
      text: "Join", top: "400px",
      callback: async () => {
        this.gameState = await joinGame(this.userId, gameIdInput.text, nameInput.text);
        if (!this.gameState) {
          errorText.text = "Cannot find a game with the given code";
        } else if ("error" in this.gameState) {
          errorText.text = this.gameState["msg"];
        } else {
          if ("user_id" in this.gameState) {
            console.log("resetting user id");
            this.setUserId(this.gameState["user_id"]);
            this.userId = this.gameState["user_id"];
          }
          this.gameId = this.gameState.id;
          window.location.href = `planit/${this.gameState.id}`;
        }
      }
    });

    this.gameScene.setScene(scene);
    this.state = GAME_STATE.JOIN;
  }

  addGUIButton(name, parent, params) {
    const {
      text = "",
      top = "100px",
      background = styles.buttonColor,
      callback = noop,
      fontSize = 26,
      padding = "0px",
      thickness = 1,
      width = 0.4,
      color = "white",
      textColor=styles.textColor,
      height="80px",
      leftJustify=false,
    } = params;

    const button = Button.CreateSimpleButton(name, text);
    button.width = width;
    button.height = height;
    button.color = color;
    button.background = background;
    button.cornerRadius = 10;
    button.textBlock.color = textColor;
    button.textBlock.fontSize = fontSize;
    button.paddingBottom = padding;
    button.thickness = thickness;
    button.top = top;
    button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    if (leftJustify) {
      button.textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      button.textBlock.paddingLeft = "20px";
    }

    button.onPointerUpObservable.add(() => {
      callback();
    });

    parent.addControl(button);
    return button;
  }

  addTextBlock(parent, params) {
    const {
      height="100px",
      top="100px",
      color=styles.textColor,
      fontSize=24,
      text="",
      left="0px",
      width= "100px",
    } = params;

    const textBlock = new TextBlock();
    textBlock.height = height;
    textBlock.top = top;
    textBlock.color = color;
    textBlock.fontSize = fontSize;
    textBlock.text = text;
    textBlock.left = left;
    textBlock.width = width;
    textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    parent.addControl(textBlock);
    return textBlock;
  }

  addBackButton(callback) {
    const button = this.addGUIButton("back", this.guiMenu, {
      text: "Back", top: "20px", callback, fontSize: 18, thickness: 1, width: 0.1, height: "20px",
    });
    button.left = "20px";
    button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    return button;
  }

  getInput(text="Player 1", params={}) {
    const {
      width = 0.4,
      maxWidth = 0.4,
      paddingBottom = "0px",
      height = "50px",
      color = "white",
      top = "100px",
    } = params;
    const input = new InputText();
    input.width = width;
    input.maxWidth = maxWidth;
    input.paddingBottom = paddingBottom;
    input.text = text;
    input.height = height;
    input.color = color;
    input.top = top;
    input.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    input.onFocusSelectAll = true;
    return input;
  }
}

export default GameMenu;
