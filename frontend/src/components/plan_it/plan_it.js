import React, { useEffect } from "react";
import { Layout } from "antd";

import Renderer from "../../renderer";
import styles from "./plan_it.scss";

const { Content, Sider } = Layout;

const BOARD_OUTLINE = [
  [375, 100], [250, 295], [375, 500], [625, 500], [750, 295], [625, 100]
];

const HEX = [[0, 0], [-40, 25], [-40, 65], [0, 90], [40, 65], [40, 25]];

const drawShapeAt = (r, loc, vertices, fill, stroke) => {
  r.ctx.save();
  if (fill) {
    r.ctx.fillStyle = fill;
  }
  if (stroke) {
    r.ctx.strokeStyle = stroke;
  }

  r.pushTransform(loc[0], loc[1]);
  r.draw(vertices);
  r.popTransform();

  r.ctx.restore();
};

const drawBoard = (r) => {
  r.ctx.fillStyle = "#26e";
  r.ctx.fillRect(0, 0, r.ctx.canvas.width, r.ctx.canvas.height);
  r.ctx.fillStyle = "#d2b280";
  r.ctx.strokeStyle = "#d2b280";
  r.draw(BOARD_OUTLINE);
  r.ctx.fillStyle = "darkgreen";
  drawShapeAt(r, [420, 120], HEX);
  drawShapeAt(r, [500, 120], HEX);
  drawShapeAt(r, [580, 120], HEX);

  drawShapeAt(r, [380, 185], HEX);
  drawShapeAt(r, [460, 185], HEX);
  drawShapeAt(r, [540, 185], HEX);
  drawShapeAt(r, [620, 185], HEX);

  drawShapeAt(r, [340, 250], HEX);
  drawShapeAt(r, [420, 250], HEX);
  drawShapeAt(r, [500, 250], HEX);
  drawShapeAt(r, [580, 250], HEX);
  drawShapeAt(r, [660, 250], HEX);

  drawShapeAt(r, [380, 315], HEX);
  drawShapeAt(r, [460, 315], HEX);
  drawShapeAt(r, [540, 315], HEX);
  drawShapeAt(r, [620, 315], HEX);

  drawShapeAt(r, [420, 380], HEX);
  drawShapeAt(r, [500, 380], HEX);
  drawShapeAt(r, [580, 380], HEX);
};

const PlanIt = () => {

  useEffect(() => {
    var canvas = document.getElementById("PlanIt");
    var ctx = canvas.getContext("2d");
    const r = new Renderer(ctx);
    drawBoard(r);
  }, []);

  return (
    <Layout>
      <Sider>abc</Sider>
      <Content>
        <canvas id="PlanIt" width="1000" height="1000" className={styles.canvas}/>;
      </Content>
    </Layout>
  );
};

export default PlanIt;

