import React, { useEffect, useRef } from "react";
import Delaunator from "delaunator";
import PropTypes from "prop-types";

// Import these separately to reduce bundle size
import random from "lodash/random";
import throttle from "lodash/throttle";

import styles from "./tessellate.scss";

const fade = (ctx, cw, ch) => {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-in";
  const fadeOutAmount = 0.9;
  ctx.fillStyle = `rgba(0, 0, 0, ${fadeOutAmount})`;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
};

const sign = (p1, p2, p3) => {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

const pointInTriangle = (pt, v1, v2, v3) => {
  const d1 = sign(pt, v1, v2);
  const d2 = sign(pt, v2, v3);
  const d3 = sign(pt, v3, v1);

  const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

  return !(has_neg && has_pos);
};

const fillTriangle = (ctx, v) => {
  const rg = random(10, 200);
  const b = random(150, 255);
  const colour = `rgba(${rg},${rg},${b})`;
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(v[0][0], v[0][1]);
  ctx.lineTo(v[1][0], v[1][1]);
  ctx.lineTo(v[2][0], v[2][1]);
  ctx.fill();
  ctx.stroke();
};

const generatePoints = (num) => {
  const points = [];
  for (let i = 0; i < num; ++i) {
    points.push([random(0, 1000), random(0, 1000)]);
  }
  return points;
};

const edgesOfTriangle = (t) => { return [3 * t, 3 * t + 1, 3 * t + 2]; };

const pointsOfTriangle = (delaunay, t) => {
  return edgesOfTriangle(t)
    .map(e => delaunay.triangles[e]);
};

const forEachTriangle = (points, delaunay, callback) => {
  for (let t = 0; t < delaunay.triangles.length / 3; t++) {
    callback(t, pointsOfTriangle(delaunay, t).map(p => points[p]));
  }
};

const move = (canvas, points, delaunay, e) => {
  if (e.target.id == "tessellate") {
    const ctx = canvas.getContext("2d");
    const canvasMouseX = Math.round((e.offsetX / canvas.clientWidth) * 1000);
    const canvasMouseY = Math.round((e.offsetY / canvas.clientHeight) * 1000);
    ctx.save();
    ctx.globalAlpha = 0.2;
    forEachTriangle(points, delaunay, (i, v) => {
      if (pointInTriangle({ x: canvasMouseX, y: canvasMouseY}, { x: v[0][0], y: v[0][1] }, { x: v[1][0], y: v[1][1] }, { x: v[2][0], y: v[2][1] })) {
        fillTriangle(ctx, v);
      }
    });
    ctx.restore();
  }
};

const ripple = (canvas, points, delaunay, rippleCounterRef, e) => {
  const ctx = canvas.getContext("2d");
  const canvasMouseX = Math.round((e.x / canvas.clientWidth) * 1000);
  const canvasMouseY = Math.round((e.y / canvas.clientHeight) * 1000);
  const rippleInterval = setInterval(() => {
    if (rippleCounterRef.current > 1000000) {
      clearInterval(rippleInterval);
      rippleCounterRef.current = 0;
      return;
    }
    rippleCounterRef.current = rippleCounterRef.current + 50000;
    ctx.save();
    ctx.globalAlpha = 0.2;
    forEachTriangle(points, delaunay, (i, v) => {
      const dx = ((v[0][0] + v[1][0] + v[2][0])/3 - canvasMouseX);
      const dy = ((v[0][1] + v[1][1] + v[2][1])/3 - canvasMouseY);
      const radius = dx * dx + dy * dy;
      if (radius < rippleCounterRef.current && radius > rippleCounterRef.current - 50000) {
        fillTriangle(ctx, v);
      }
    });
    ctx.restore();
  }, 50);
};

const Tessellate = ({rippleRefs}) => {
  const rippleCounterRef = useRef(0);
  const points = generatePoints(250);
  points.push([0, 0], [1000, 0], [0, 1000], [1000, 1000]);
  const delaunay = Delaunator.from(points);

  useEffect(() => {
    const canvas = document.getElementById("tessellate");
    const ctx = canvas.getContext("2d");
    const bindedMove = (e) => move(canvas, points, delaunay, e);
    const throttledMove = throttle(bindedMove, 50);
    const bindedRipple = (e) => ripple(canvas, points, delaunay, rippleCounterRef, e);
    window.addEventListener("mousemove", throttledMove);
    window.addEventListener("click", bindedRipple);
    rippleRefs.forEach((ref) => {
      ref.current.addEventListener("mouseenter", bindedRipple);
    });
    const fadeInterval = setInterval(() => fade(ctx, canvas.width, canvas.height), 50);
    return () => {
      window.removeEventListener("mousemove", throttledMove);
      window.removeEventListener("click", bindedRipple);
      rippleRefs.forEach((ref) => {
        ref.current.removeEventListener("mouseover", bindedRipple);
      });
      clearInterval(fadeInterval);
    };
  }, []);

  return (<canvas id="tessellate" width="1000" height="1000" className={styles.canvas}/>);
};

Tessellate.propTypes = {
  rippleRefs: PropTypes.arrayOf(PropTypes.object),
};

Tessellate.defaultypes = {
  rippleRefs: {},
};

export default Tessellate;
