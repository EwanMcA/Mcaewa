import {
  ArcRotateCamera,
  HemisphericLight,
  Scene,
  Vector3,
} from "@babylonjs/core";

export const createScene = (engine, canvas) => {
  const scene = new Scene(engine);
  // TODO might want to swap this to an orthographic camera
  const camera = new ArcRotateCamera(
    "Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, -50, -150), scene
  );
  camera.zoomToMouseLocation = true;
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true, false, 0);
  camera.panningSensibility = 20;
  camera.panningInertia = 0.75;
  const light = new HemisphericLight("light1", new Vector3(-1, 2, -1), scene);
  light.intensity = 1.25;

  return scene;
};
