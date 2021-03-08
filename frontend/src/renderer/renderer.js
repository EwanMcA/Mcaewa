
class Stack {
  constructor() {
    this.items = [];
    this.top = 0;
  }

  push(item) {
    this.items.push(item);
    this.top = this.top + 1;
  }

  pop() {
    this.top = this.top > 0 ? this.top - 1 : 0;

    return this.items.pop();
  }

  peek() {
    return this.items.slice(-1)[0];
  }
}

class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.transform = new Stack();
    this.scale = new Stack();
  }

  draw(vertices) {
    const scale = this.getScale();
    const transform = this.getTransform();
    this.ctx.beginPath();
    this.ctx.moveTo(
      transform[0] + vertices[0][0] * scale,
      transform[1] + vertices[0][1] * scale,
    );
    for (let i = 1; i < vertices.length; ++i) {
      this.ctx.lineTo(
        transform[0] + vertices[i][0] * scale,
        transform[1] + vertices[i][1] * scale,
      );
    }
    this.ctx.lineTo(
      transform[0] + vertices[0][0] * scale,
      transform[1] + vertices[0][1] * scale,
    );
    this.ctx.fill();
    this.ctx.stroke();
  }

  getTransform() {
    let transform = this.transform.peek();
    if (!transform) {
      return [0,0];
    }
    return transform;
  }

  pushTransform(x,y) {
    this.transform.push([x,y]);
  }

  popTransform() {
    return this.transform.pop();
  }

  getScale() {
    let scale = this.scale.pop();
    if (!scale) {
      return 1;
    }
    return scale;
  }

  pushScale(f) {
    this.scale.push(f);
  }

  popScale() {
    return this.scale.pop();
  }
}

export default Renderer;
