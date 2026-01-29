const canvas = document.getElementById("flowCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_PARTICLES = 3000;
const particles = [];

// 🔁 Cylinder → Square (minimal rename)
const square = {
  cx: canvas.width / 2,
  cy: canvas.height / 2,
  size: 120, // side length
  U: 2, // free-stream velocity
};

const wake = {
  width: 150, // distance behind square
  height: 100, // vertical size of wake (slightly bigger for square)
};

// Resize handler
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  square.cx = canvas.width / 2;
  square.cy = canvas.height / 2;
});

// Particle class
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.speed = 1 + Math.random() * 1.5;
  }

  update() {
    // Square-centered coordinates
    const dx = this.x - square.cx;
    const dy = this.y - square.cy;
    const h = square.size / 2;

    let vx = square.U;
    let vy = 0;

    // Signed distance to square (cheap version)
    const distX = Math.abs(dx) - h;
    const distY = Math.abs(dy) - h;

    // Inside square → reset
    if (distX < 0 && distY < 0) {
      this.reset();
      this.x = square.cx - h - 1;
      this.y = square.cy;
      return;
    }

    // Influence zone around square
    const influence = 30;
    if (distX < influence && distY < influence) {
      // Determine closest face normal
      let nx = 0,
        ny = 0;
      if (Math.abs(distX) > Math.abs(distY)) {
        nx = Math.sign(dx);
      } else {
        ny = Math.sign(dy);
      }

      // Remove velocity normal to surface (no penetration)
      const dot = vx * nx + vy * ny;
      vx -= dot * nx;
      vy -= dot * ny;

      // Corner acceleration
      const cornerFactor =
        1 + 0.6 / Math.max(6, Math.min(Math.abs(distX), Math.abs(distY)));
      vx *= cornerFactor;
      vy *= cornerFactor;
    }

    // Wake region (behind square)
    const behindSquare =
      dx > h && dx < h + wake.width && Math.abs(dy) < wake.height / 2;

    if (behindSquare) {
      const distFromEdge = dx - h;
      const normalizedDist = distFromEdge / wake.width;

      if (distFromEdge < 30) {
        const recirculationStrength = (30 - distFromEdge) / 30;
        vx = -0.6 * recirculationStrength;

        const vortexDirection = dy > 0 ? -1 : 1;
        vy += vortexDirection * 0.9 * recirculationStrength;
      } else {
        vx *= 0.3 * normalizedDist;
      }

      // Turbulent wake
      vy += 1.5 * (Math.random() - 0.5);
    }

    // Update particle position
    this.x += vx;
    this.y += vy;

    // Reset if particle leaves screen
    if (
      this.x > canvas.width ||
      this.y < 0 ||
      this.y > canvas.height ||
      this.x < 0
    ) {
      this.reset();
      this.x = 0;
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

function drawObstacle() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  const h = square.size / 2;
  ctx.strokeRect(square.cx - h, square.cy - h, square.size, square.size);
}

function animate() {
  ctx.fillStyle = "rgba(11, 16, 32, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawObstacle();

  for (const p of particles) {
    p.update();
    p.draw();
  }

  requestAnimationFrame(animate);
}

animate();
