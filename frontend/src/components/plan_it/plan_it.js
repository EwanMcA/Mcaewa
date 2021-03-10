import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";

import water_col from "../../assets/textures/Water_001_SD/Water_001_COLOR.jpg";
import water_norm from "../../assets/textures/Water_001_SD/Water_001_NORM.jpg";
import water_spec from "../../assets/textures/Water_001_SD/Water_001_SPEC.jpg";
import water_disp from "../../assets/textures/Water_001_SD/Water_001_DISP.png";

import styles from "./plan_it.scss";

const { Content, Sider } = Layout;

const TILES = [
  [-20, 34], [0, 34], [20, 34],
  [-30, 17], [-10, 17], [10, 17], [30, 17],
  [-40, 0], [-20, 0], [0, 0], [20, 0], [40, 0],
  [-30, -17], [-10, -17], [10, -17], [30, -17],
  [-20, -34], [0, -34], [20, -34],
];

const PlanIt = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const canvas = document.getElementById("PlanIt");
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera(
      "Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, -50, -150), scene
    );
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    const light1 = new HemisphericLight("light1", new Vector3(1, 1, -1), scene);
    light1.intensity = 0.75;
    const board = MeshBuilder.CreateGround("board", {width: 300, height: 300, subdivisions: 500, updatable: true}, scene);
    board.rotation = new Vector3(-Math.PI / 2, 0, 0);
    const oceanMat = new StandardMaterial("oceanMat");
    board.applyDisplacementMap(water_disp, -5, 4);
    oceanMat.diffuseTexture = new Texture(water_col, scene);
    oceanMat.specularTexture = new Texture(water_spec, scene);
    oceanMat.bumpTexture = new Texture(water_norm, scene);

    board.material = oceanMat; //Place the material property of the ground

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    for (let i = 0; i < 19; ++i) {
      const tile = MeshBuilder.CreateDisc("disc", {radius: 11, tessellation: 6});
      const tileMat = new StandardMaterial("tile", scene);
      tileMat.diffuseColor = new Color3(0, 0.8, 0.2);
      tile.position = new Vector3(TILES[i][0], TILES[i][1], -5);
      tile.rotation = new Vector3(0, 0, Math.PI / 2);
      tile.material = tileMat;
    }

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }, []);

  return (
    <Layout>
      <Sider collapsible collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}/>
      <Content className={styles.gamePane}>
        <canvas id="PlanIt" width="1000" height="1000" className={styles.canvas}/>;
      </Content>
    </Layout>
  );
};

export default PlanIt;

