import { CircleObstacle } from "./CircleObstacle.js";
import { SquareObstacle } from "./SquareObstacle.js";
import { TriangleObstacle } from "./TriangleObstacle.js";
import { DiamondObstacle } from "../../DiamondObstacle.js";

console.log("JavaScript is loading!");

const canvas = document.getElementById("flowCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_PARTICLES = 2000;
const particles = [];
const flow_speed = 2;

const obstacles = [
  new CircleObstacle(canvas.width / 2, canvas.height / 2, 60, flow_speed),
  new SquareObstacle(
    canvas.width / 4,
    canvas.height / 4,
    120,
    flow_speed,
    Math.PI / 6,
  ),
  new TriangleObstacle(
    canvas.width * 0.75,
    canvas.height * 0.6,
    60,
    flow_speed,
    Math.PI,
  ),
  new DiamondObstacle(
    canvas.width * 0.25,
    canvas.height * 0.8,
    100,
    flow_speed,
    0,
  ),
];

// Resize handler
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  /* cylinder.cx = canvas.width / 2;
  cylinder.cy = canvas.height / 2; */
});

// Particle class
class Particle {
  constructor() {
    this.slideEdge = null;
    this._exitVx = 0;
    this._exitVy = 0;
    this._exitTimer = 0;
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.speed = 1 + Math.random() * 1.5;
    this.slideEdge = null;
    this._exitTimer = 0; // ← Should be 0, not 12
  }

  update() {
    let vx = 2,
      vy = 0;

    // Find the closest obstacle and use only its velocity field
    let closestObs = null;
    let minDist = Infinity;

    for (const obs of obstacles) {
      const dist = obs.distanceTo(this.x, this.y);
      if (dist < minDist) {
        minDist = dist;
        closestObs = obs;
      }
    }

    // Only apply velocity from the closest obstacle
    if (closestObs) {
      const v = closestObs.velocityAt(this.x, this.y, this);
      if (this._exitTimer > 0) {
        vx = this._exitVx;
        vy = this._exitVy;
        this._exitTimer--;
      } else {
        vx = v.vx;
        vy = v.vy;
      }
    }

    // Store previous position for collision detection
    const prevX = this.x;
    const prevY = this.y;

    this.x += vx;
    this.y += vy;

    // Check collision and handle surface sliding
    for (const obs of obstacles) {
      if (obs.contains(this.x, this.y)) {
        // If obstacle has surface sliding, use it; otherwise reset
        if (obs.handleSurfaceSliding) {
          obs.handleSurfaceSliding(this, prevX, prevY);
        } else {
          this.x = -10;
          this.y = Math.random() * canvas.height;
        }
        return;
      }
    }

    // Reset particles that go off screen to the left edge
    if (
      this.x < -20 ||
      this.x > canvas.width + 20 ||
      this.y < -20 ||
      this.y > canvas.height + 20
    ) {
      this.x = -10;
      this.y = Math.random() * canvas.height;
    }
  }

  draw() {
    ctx.fillStyle = "rgba(120, 180, 255, 0.6)";
    ctx.fillRect(this.x, this.y, 1.5, 1.5);
  }
}

// Initialize particles
for (let i = 0; i < NUM_PARTICLES; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.fillStyle = "rgba(11, 16, 32, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const obs of obstacles) obs.draw(ctx);

  for (const p of particles) {
    p.update();
    p.draw();
  }

  requestAnimationFrame(animate);
}

animate();
