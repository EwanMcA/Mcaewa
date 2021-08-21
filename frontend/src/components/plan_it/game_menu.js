import { Layer } from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Button,
  Control,
  InputText,
  Image,
  ScrollViewer,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui/2D";
import set from "lodash/set";
import { assignIn } from "lodash";

import { createGame, getUserGames, joinGame, leaveGame, startGame } from "./api";
import GAME_STATE from "./game_state";
import styles from "./plan_it.scss";

import thrive from "../../assets/images/thrive.png";
import background from "../../assets/textures/fieldPath.jpg";
import mobileBackgound from "../../assets/textures/fieldPath_mob.jpg";
import woodPanel from "../../assets/images/woodPanel.jpg";
import woodPanelMob from "../../assets/images/woodPanel_mob.jpg";
import woodPanelLong from "../../assets/images/woodPanelLong.jpg";

const MAX_PLAYERS = 4;


class GameMenu {
  constructor(navigate, isDesktop, userId, setUserId, gameState, gameScene, gameId) {
    this.navigate = navigate;
    this.isDesktop = isDesktop;
    this.userId = userId;
    this.setUserId = setUserId;
    this.gameState = gameState;
    this.gameScene = gameScene;
    this.gameId = gameId;
    this.games = [];
    this.background = isDesktop ? background : mobileBackgound;
  }

  async createGame(playerName) {
    assignIn(this.gameState, await createGame(this.userId, playerName));
    if ("user_id" in this.gameState) {
      //console.log("resetting user id");
      this.setUserId(this.gameState["user_id"]);
    }
    this.gameId = this.gameState.id;
    this.navigate(`/planit/${this.gameState.id}`);
  }

  createMainMenu(mobileMenu=false, params={}) {
    const menuPanel = new StackPanel();
    if (mobileMenu) {
      menuPanel.width = 0.85;
    } else {
      menuPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      menuPanel.width = 0.5;
    }
    menuPanel.height = 0.9;

    const titleImage = new Image("title_image", thrive);
    titleImage.height = "200px";
    menuPanel.addControl(titleImage);

    const input = this.getInput("Player 1", { paddingBottom: "60px", height: "100px" });
    menuPanel.addControl(input);
    this.addGUIButton("create_game", menuPanel, {
      text: "Create Game", top: "200px", paddingBottom: "20px", callback: () => this.createGame(input.text),
    });
    this.addGUIButton("join_game", menuPanel, {
      text: "Join Game", top: "300px", paddingBottom: "20px", callback: () => this.goToJoin(input.text),
    });
    this.addGUIButton("options", menuPanel, {
      text: "Options (tbd lol)", top: "400px", paddingBottom: "20px", callback: () => {},
    });
    if (mobileMenu) {
      this.addGUIButton("games_link", menuPanel, {
        text: "Your Games", height: "55px", callback: () => {
          // TODO implement routing which can handle back-nav without refreshing canvas
          this.goToGamesList();
        },
      });
    }

    Object.keys(params).forEach(path => set(menuPanel, path, params[path]));
    return menuPanel;
  }

  createGamesList(params={}) {
    const gamesPanel = new StackPanel();
    const panelBackground = new Image("panel", this.isDesktop ? woodPanel : woodPanelMob);
    gamesPanel.addControl(panelBackground);
    this.addTextBlock(
      gamesPanel, {
        alpha: 1,
        height: this.isDesktop ? "175px" : "250px",
        fontFamily: styles.gameFont,
        fontSize: 32,
        paddingTop: this.isDesktop ? "25px" : "100px",
        text: "Your Games",
        width: 1.0,
      }
    );

    const gamesViewer = new ScrollViewer();
    gamesViewer.thickness = 0;
    gamesViewer.color = "#522";
    gamesViewer.thumbLength = 0.25;
    gamesViewer.barColor = styles.textColor;
    gamesViewer.height = 0.65;
    gamesViewer.width = 0.8;
    const gameList = new StackPanel();
    gamesPanel.addControl(gamesViewer);
    gamesViewer.addControl(gameList);
    this.games.forEach((game) => {
      const gameStatus = game.started ? `Turn ${game.turn}` : "Lobby";
      const yourTurn = game.player_turn === game.player_name;
      const waitingFor = yourTurn ? "Your Turn" : `Waiting for ${game.player_turn}`;
      this.addGUIButton(game.id, gameList, {
        background: yourTurn ? styles.yourTurnColor : styles.buttonColor,
        callback: () => { this.navigate(`/planit/${game.id}`); },
        text:
        `${gameStatus}        ${waitingFor}        ${game.players.join(" vs ")}`,
        "textBlock.fontFamily": styles.gameFont,
        "textBlock.fontSize": 16,
        "textBlock.color": yourTurn ? styles.altTextColor : styles.textColor,
        leftJustify: true,
        paddingBottom: "15px",
        width: 0.8,
        height: "75px"
      });
    });

    Object.keys(params).forEach(path => set(gamesPanel, path, params[path]));
    return gamesPanel;
  }

  async goToMenu() {
    const scene = this.gameScene.newScene();
    scene.__background = new Layer("menuBackground", this.background, scene, true);

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    if (this.isDesktop) {
      this.games = (await getUserGames(this.userId))["games"];
      this.guiMenu.addControl(this.createMainMenu(false, {
        horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
        left: "10%",
        width: 0.3,
      }));
      this.guiMenu.addControl(this.createGamesList({
        height: 1.0,
        horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_RIGHT,
        width: 0.5,
      }));
    } else {
      this.guiMenu.addControl(this.createMainMenu(true));
    }

    this.gameScene.setScene(scene);
    this.gameState.state = GAME_STATE.MENU;
  }

  async goToGamesList() {
    const scene = this.gameScene.newScene();
    scene.__background = new Layer("menuBackground", this.background, scene, true);
    this.games = (await getUserGames(this.userId))["games"];

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    this.guiMenu.addControl(this.createGamesList({
      height: 1.2,
      width: 1.2,
    }));
    this.addBackButton(async () => { this.goToMenu(); });

    this.gameScene.setScene(scene);
    this.gameState.state = GAME_STATE.GAMES_LIST;
  }

  async goToLobby() {
    const scene = this.gameScene.newScene();
    scene.__background = new Layer("menuBackground", this.background, scene, true);

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    this.addBackButton(async () => {
      this.gameState.state = GAME_STATE.MENU;
      this.navigate("/planit");
    });

    this.addGUIButton(
      "leave_game", this.guiMenu, {
        text: "Quit",
        horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_RIGHT,
        left: "-20px",
        top: "20px",
        textBlock: { fontSize: 16 },
        thickness: 1,
        width: "120px",
        height: "40px",
        callback: async () => {
          await leaveGame(
            this.userId, this.gameState.id, this.gameState.player_name
          );
          this.gameState.state = GAME_STATE.MENU;
          this.navigate("/planit");
        },
      }
    );

    const lobbyPanel = new StackPanel();
    lobbyPanel.width = this.isDesktop ? 0.5 : 0.9;
    lobbyPanel.top = "40px";
    this.guiMenu.addControl(lobbyPanel);

    this.addGUIButton("game_link", lobbyPanel, {
      text: "Copy Game Link",
      thickness: 1,
      width: this.isDesktop ? 0.5 : 0.7,
      height: "120px",
      paddingBottom: "60px",
    });
    for (let i = 0; i < MAX_PLAYERS; ++i) {
      const label = i >= this.gameState.players.length
        ? "~                   ~"
        : `~   ${this.gameState.players[i]}   ~`;
      this.addTextBlock(
        lobbyPanel, {
          height: "90px",
          fontSize: 36,
          paddingBottom: "30px",
          text: label,
          width: 0.75,
        }
      );
    }
    //for (let i = 0; i < 4 - this.numPlayers; ++i) { //this.addGUIButton( //`add_player${i}`, //"+", //`${400 - i * 70}px`, //() => { this.numPlayers = this.numPlayers + 1; this.goToLobby(playerName); }, //3, //0.03, //"30px", //); //}
    this.addGUIButton("start", lobbyPanel, {
      text: "Start", height: "90px", paddingTop: "20px", width: 0.75, callback: () => {
        startGame(this.userId, this.gameState.id);
      },
    });

    this.gameScene.setScene(scene);
    this.gameState.state = GAME_STATE.LOBBY;
  }

  async goToJoin(playerName, gameId="Your game code...") {
    const scene = this.gameScene.newScene();
    scene.__background = new Layer("menuBackground", this.background, scene, true);

    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    this.addBackButton(async () => {
      this.goToMenu();
    });
    const joinPanel = new StackPanel();
    joinPanel.width = this.isDesktop ? 0.5 : 0.9;
    this.guiMenu.addControl(joinPanel);

    const nameInput = this.getInput(playerName, { height: "100px", paddingBottom: "50px" });
    joinPanel.addControl(nameInput);
    const gameIdInput = this.getInput(gameId, { height: "100px", paddingBottom: "50px" });
    joinPanel.addControl(gameIdInput);
    const errorText = this.addTextBlock(
      joinPanel, {
        color: styles.errorTextColor, fontSize: 18, text: "", width: 0.9,
      },
    );

    this.addGUIButton("join", joinPanel, {
      text: "Join",
      width: "300px",
      callback: async () => {
        assignIn(this.gameState, await joinGame(this.userId, gameIdInput.text, nameInput.text));
        if (!this.gameState) {
          errorText.text = "Cannot find a game with the given code";
        } else if ("error" in this.gameState) {
          errorText.text = this.gameState["msg"];
        } else {
          if ("user_id" in this.gameState) {
            //console.log("resetting user id");
            this.setUserId(this.gameState["user_id"]);
            this.userId = this.gameState["user_id"];
          }
          this.gameId = this.gameState.id;
          this.navigate(`/planit/${this.gameState.id}`);
        }
      }
    });

    this.gameScene.setScene(scene);
    this.gameState.state = GAME_STATE.JOIN;
  }

  renderDesktopGameUI() {
    this.guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.guiMenu.idealHeight = 720;

    const infoPanelTop = new Image("panel_top", woodPanelLong);
    infoPanelTop.height = 0.1;
    infoPanelTop.width = this.isDesktop ? 0.9 : 1;
    infoPanelTop.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    const infoPanelBottom = new Image("panel_bottom", woodPanelLong);
    infoPanelBottom.height = 0.1;
    infoPanelBottom.width = this.isDesktop ? 0.9 : 1;
    infoPanelBottom.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

    this.guiMenu.addControl(infoPanelTop);
    this.guiMenu.addControl(infoPanelBottom);
    this.addTextBlock(
      this.guiMenu, {
        color: styles.altTextColor,
        height: 0.1,
        verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
        horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
        text: this.isDesktop
          ? `${this.gameState.player_name}  Wood: 0  Brick: 0  Wheat: 0  Sheep: 0  Ore: 0`
          : `${this.gameState.player_name}  W: 0  B: 0  Wh: 0  S: 0  O: 0`,
        width: 1,
      },
    );
    const playersPanel = new StackPanel();
    playersPanel.width = this.isDesktop ? 0.9 : 1;
    playersPanel.height = 0.1;
    playersPanel.isVertical = false;
    playersPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.gameState.players.forEach((name) => {
      this.addTextBlock(
        playersPanel, {
          color: styles.altTextColor,
          paddingLeft: this.isDesktop ? "20px" : "0px",
          width: "200px",
          text: name
        },
      );
    });
    this.guiMenu.addControl(playersPanel);

    this.addGUIButton("undo", this.guiMenu, {
      left: "10%",
      top: "-10px",
      height: "50px",
      width: "50px",
      text: "⎌",
      disabledColor: "blue",
      isEnabled: false,
      callback: () => {},
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
    });

    this.addGUIButton("end_turn", this.guiMenu, {
      left: "-10%",
      top: "-10px",
      height: "50px",
      width: "50px",
      text: "✓",
      callback: () => endTurn(this.userId, this.gameState.id),
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_RIGHT,
      verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
    });
  }

  addGUIButton(name, parent, params={}) {
    const button = Button.CreateSimpleButton(name, params.text);

    // Defaults
    //button.alpha = 0.8;
    button.background = styles.buttonColor;
    button.cornerRadius = 10;
    button.height = "75px";
    button.thickness = 0;
    button.textBlock.color = styles.textColor;
    button.textBlock.fontFamily = styles.gameFont;
    button.textBlock.fontSize = 26;

    button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    button.opacity = 0.5;

    if (params.leftJustify) {
      button.textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      button.textBlock.paddingLeft = "20px";
    }

    button.onPointerUpObservable.add(params.callback);

    delete params["callback"];
    delete params["leftJustify"];

    Object.keys(params).forEach(path => set(button, path, params[path]));
    parent.addControl(button);
    return button;
  }

  addTextBlock(parent, params) {
    const textBlock = new TextBlock();
    textBlock.color = styles.textColor,
    textBlock.fontSize = 24;

    Object.keys(params).forEach(key => textBlock[key] = params[key]);
    parent.addControl(textBlock);
    return textBlock;
  }

  addBackButton(callback) {
    const button = this.addGUIButton("back", this.guiMenu, {
      text: this.isDesktop ? "Back" : "<",
      top: "20px",
      callback,
      fontSize: 18,
      horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
      left: "20px",
      width: this.isDesktop ? "120px" : "40px",
      height: "40px",
    });
    return button;
  }

  getInput(text="Player 1", params={}) {
    const {
      width = 1.0,
      maxWidth = 1.0,
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
