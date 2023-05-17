const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const colormap = require("colormap");

const settings = {
  dimensions: [1080, 1080],
  animate: false
};

const sketch = ({ width, height }) => {
  const cols = 50;
  const rows = 120;
  const numCells = cols * rows;

  // grid
  const gw = width * 1.5;
  const gh = height * 1.5;
  // cell
  const cw = gw / cols;
  const ch = gh / rows;
  // margin
  const mx = (width - gw) * 0.4;
  const my = (height - gh) * -.6;

  const points = [];

  let x, y, n, lineWidth, color, blend;
  let freq = 0.002;
  let amp = 300;

  const colors = colormap({
    colormap: "cubehelix",
    nshades: amp,
    alpha: 0
  });

  for (let i = 0; i < numCells; i++) {
    x = (i % cols) * cw;
    y = Math.floor(i / cols) * ch;

    n = random.noise2D(x, y, freq, amp);

    lineWidth = 1.5;

    color = colors[Math.floor(math.mapRange(n, -amp, amp, 0, amp))];

    blend = random.pick(["source-over", "screen"]);

    points.push(new Point({ x, y, lineWidth, color, blend }));
  }

  return ({ context, width, height, frame }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(mx, my);
    context.translate(cw * 0.5, ch * 0.5);

    points.forEach((point) => {
      n = random.noise2D(point.ix + frame * 2, point.iy + frame * 1.5, freq, amp);
      point.x = point.ix + n;
      point.y = point.iy + n;
    });

    let lastX, lastY;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const curr = points[r * cols + c + 0];
        const next = points[r * cols + c + 1];

        const mx = curr.x + (next.x - curr.x) * 0.5;
        const my = curr.y + (next.y - curr.y) * 0.5;

        if (!c) {
          lastX = curr.x;
          lastY = curr.y;
        }

        context.beginPath();
        context.lineWidth = curr.lineWidth;
        context.strokeStyle = curr.color;
        context.globalCompositeOperation = curr.blend;

        context.moveTo(lastX, lastY);
        context.quadraticCurveTo(curr.x, curr.y, mx, my);

        context.stroke();

        lastX = mx;
        lastY = my;
      }
    }

    context.restore();
  };
};

canvasSketch(sketch, settings);

class Point {
  constructor({ x, y, lineWidth, color, blend }) {
    this.x = x;
    this.y = y;
    this.lineWidth = lineWidth;
    this.color = color;
    this.blend = blend;

    this.ix = x;
    this.iy = y;
  }
}
