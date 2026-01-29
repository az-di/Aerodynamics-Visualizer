// Check if particle is in wake region (behind cylinder)
const behindCylinder =
  dx > 0 && dx < wake.width && Math.abs(dy) < wake.height / 2;
if (behindCylinder) {
  // Calculate distance from cylinder edge
  const distFromEdge = dx;
  const normalizedDist = distFromEdge / wake.width;

  // Create separation region immediately behind cylinder
  if (distFromEdge < 30) {
    // Strong recirculation near cylinder
    const recirculationStrength = (30 - distFromEdge) / 30;
    vx = -0.5 * recirculationStrength; // reverse flow

    // Add vortex-like motion
    const vortexRadius = Math.abs(dy);
    const vortexDirection = dy > 0 ? -1 : 1;
    vy += vortexDirection * 0.8 * recirculationStrength;
  } else {
    // Transition zone - slow forward flow
    vx *= 0.3 * normalizedDist;
  }

  // Add turbulent fluctuations throughout wake
  const swirl = 1.5 * (Math.random() - 0.5);
  vy += swirl;
}

function updateSquare() {
  const dx = this.x - square.cx;
  const dy = this.y - square.cy;
  let vx = 2;
  let vy = 0;

  let collisionPoint = square.cx - square.width / 2 - 2;

  if (this.inSquare(this.x, this.y, square.width, square.cx, square.cy)) {
    console.log("in square");
    this.reset();
    this.x = square.cx + square.width / 2 + 1;
    this.y = square.cy;
    return;
  }

  if (
    this.x >= collisionPoint - 2 &&
    this.x <= collisionPoint &&
    this.y < square.cy + square.width / 2 + 2 &&
    this.y > square.cy - square.width / 2 - 2
  ) {
    if (this.y > square.cy) {
      vy = 1;
    } else {
      vy = -1;
    }
    vx = 0;
  } else {
    vx = 2;
    vy = 0;
  }

  this.x += vx;
  this.y += vy;

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

function updateCircle() {
  // Convert particle position to cylinder-centered coordinates
  const dx = this.x - cylinder.cx;
  const dy = this.y - cylinder.cy;

  const r = Math.sqrt(dx * dx + dy * dy); // distance to cylinder center
  const theta = Math.atan2(dy, dx); // angle from center

  let vx, vy;

  if (r < cylinder.R) {
    // Particle inside cylinder → reset outside
    this.reset();
    this.x = cylinder.cx + cylinder.R + 1;
    this.y = cylinder.cy;
    return;
  }

  // Base potential flow
  const R2_over_r2 = (cylinder.R * cylinder.R) / (r * r);
  let ur = cylinder.U * (1 - R2_over_r2) * Math.cos(theta);
  let utheta = -cylinder.U * (1 + R2_over_r2) * Math.sin(theta);

  // Convert polar to Cartesian
  vx = ur * Math.cos(theta) - utheta * Math.sin(theta);
  vy = ur * Math.sin(theta) + utheta * Math.cos(theta);

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

function inSquare(x, y, width, cx, cy) {
  if (x > cx - width / 2 && x < cx + width / 2) {
    if (y > cy - width / 2 && y < cy + width / 2) {
      return true;
    } else {
      return false;
    }
  }
}

function drawCircle() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cylinder.cx, cylinder.cy, 40, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSquare() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  const h = square.width / 2;
  ctx.strokeRect(square.cx - h, square.cy - h, square.width, square.width);
}
