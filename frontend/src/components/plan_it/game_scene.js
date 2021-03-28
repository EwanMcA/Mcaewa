
import { createScene } from "./game_utils";

class GameScene {
  constructor(engine, canvas) {
    this.scene = createScene(engine, canvas);
    this.engine = engine;
    this.canvas = canvas;
  }

  render() {
    // run the main render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  toggleDebugMenu() {
    if (this.scene.debugLayer.isVisible()) {
      this.scene.debugLayer.hide();
      return false;
    } else {
      this.scene.debugLayer.show();
      return true;
    }
  }

  newScene() {
    this.scene.detachControl();
    return createScene(this.engine, this.scene);
  }

  setScene(scene) {
    this.scene.dispose();
    this.scene = scene;
  }
}

export default GameScene;
