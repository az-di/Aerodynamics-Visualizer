export class DiamondObstacle {
  constructor(cx, cy, size, U, angle = 0) {
    this.cx = cx;
    this.cy = cy;
    this.size = size; // width/height of diamond
    this.U = U;
    this.angle = angle;
  }

  rotatePoint(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return {
      x: this.cx + (dx * cos - dy * sin),
      y: this.cy + (dx * sin + dy * cos),
    };
  }

  inverseRotatePoint(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    const cos = Math.cos(-this.angle);
    const sin = Math.sin(-this.angle);
    return {
      x: this.cx + (dx * cos - dy * sin),
      y: this.cy + (dx * sin + dy * cos),
    };
  }

  getVertices() {
    const h = this.size / 2;

    // Diamond vertices (rotated square at 45 degrees in local space)
    const localVertices = [
      { x: this.cx, y: this.cy - h }, // top
      { x: this.cx + h, y: this.cy }, // right
      { x: this.cx, y: this.cy + h }, // bottom
      { x: this.cx - h, y: this.cy }, // left
    ];

    return localVertices.map((v) => this.rotatePoint(v.x, v.y));
  }

  contains(x, y) {
    const local = this.inverseRotatePoint(x, y);
    const dx = Math.abs(local.x - this.cx);
    const dy = Math.abs(local.y - this.cy);
    const h = this.size / 2;

    // Point is inside diamond if sum of normalized distances < 1
    return dx / h + dy / h < 1;
  }

  distanceTo(x, y) {
    const local = this.inverseRotatePoint(x, y);
    const dx = local.x - this.cx;
    const dy = local.y - this.cy;
    return Math.sqrt(dx * dx + dy * dy) - this.size / 2;
  }

  velocityAt(x, y) {
    // Work in local space
    const local = this.inverseRotatePoint(x, y);
    const dx = local.x - this.cx;
    const dy = local.y - this.cy;
    const h = this.size / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const influenceRadius = h * 2.5;

    if (dist > influenceRadius) {
      // Far from obstacle - uniform flow
      return { vx: this.U, vy: 0 };
    }

    // Use smooth transition based on angle
    const localAngle = Math.atan2(dy, dx);

    // Smooth transition function: 0 at front (angle=0), 1 at back (angle=±π)
    // Use cosine for smooth C^∞ transition
    const upstreamness = (1 - Math.cos(localAngle)) / 2; // 0 at front, 1 at back

    const factor = 1 - dist / influenceRadius;
    const wakeFactor = dist / influenceRadius;

    // Upstream behavior (diverging flow)
    const upstreamVx = this.U * (0.5 + 0.5 * wakeFactor);
    const upstreamVy =
      Math.sign(dy) * Math.abs(dy / dist) * this.U * factor * 1.5;

    // Downstream behavior (converging flow)
    const downstreamVx = this.U * (0.3 + 0.7 * wakeFactor);
    const downstreamVy =
      -Math.sign(dy) * Math.abs(dy / dist) * this.U * (1 - wakeFactor) * 0.3;

    // Blend smoothly between upstream and downstream
    const localVx =
      upstreamVx * (1 - upstreamness) + downstreamVx * upstreamness;
    const localVy =
      upstreamVy * (1 - upstreamness) + downstreamVy * upstreamness;

    // Calculate perturbation and rotate to world space
    const perturbVx = localVx - this.U;
    const perturbVy = localVy;

    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    return {
      vx: this.U + (perturbVx * cos - perturbVy * sin),
      vy: perturbVx * sin + perturbVy * cos,
    };
  }

  handleSurfaceSliding(particle, prevX, prevY) {
    const vertices = this.getVertices();
    const edges = [
      { start: vertices[0], end: vertices[1], name: "top-right" },
      { start: vertices[1], end: vertices[2], name: "bottom-right" },
      { start: vertices[2], end: vertices[3], name: "bottom-left" },
      { start: vertices[3], end: vertices[0], name: "top-left" },
    ];

    let closestEdge = null;
    let minDist = Infinity;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const dx = edge.end.x - edge.start.x;
      const dy = edge.end.y - edge.start.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      const nx = -dy / len;
      const ny = dx / len;

      const toParticle = {
        x: particle.x - edge.start.x,
        y: particle.y - edge.start.y,
      };

      const dist = Math.abs(toParticle.x * nx + toParticle.y * ny);

      if (dist < minDist) {
        minDist = dist;
        closestEdge = { edge, nx, ny, dx, dy, len, index: i, name: edge.name };
      }
    }

    if (closestEdge) {
      // Left edges (top-left and bottom-left) face upstream
      if (
        closestEdge.name === "top-left" ||
        closestEdge.name === "bottom-left"
      ) {
        particle.x = -10;
        particle.y = Math.random() * window.innerHeight;
      } else {
        const toParticle = {
          x: particle.x - closestEdge.edge.start.x,
          y: particle.y - closestEdge.edge.start.y,
        };

        const alongEdge =
          (toParticle.x * closestEdge.dx + toParticle.y * closestEdge.dy) /
          closestEdge.len;
        const clampedAlong = Math.max(0, Math.min(closestEdge.len, alongEdge));

        particle.x =
          closestEdge.edge.start.x +
          (closestEdge.dx / closestEdge.len) * clampedAlong +
          closestEdge.nx * 2;
        particle.y =
          closestEdge.edge.start.y +
          (closestEdge.dy / closestEdge.len) * clampedAlong +
          closestEdge.ny * 2;
      }
    }
  }

  draw(ctx) {
    const vertices = this.getVertices();

    ctx.strokeStyle = "white";
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.lineTo(vertices[3].x, vertices[3].y);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }
}
