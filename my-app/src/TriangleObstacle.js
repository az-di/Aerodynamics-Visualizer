export class TriangleObstacle {
  constructor(cx, cy, size, U, angle = 0) {
    this.cx = cx;
    this.cy = cy;
    this.size = size; // circumradius
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
    // Equilateral triangle with left edge vertical (perpendicular to flow)
    // Point faces right at angle=0
    const sqrt3 = Math.sqrt(3);

    // For equilateral triangle with circumradius r:
    // - Height from center to vertex = r
    // - Vertices 120° apart
    // Rotate standard orientation by 30° so left edge is vertical

    const localVertices = [
      { x: this.size, y: 0 }, // Right point
      { x: -this.size / 2, y: (-this.size * sqrt3) / 2 }, // Top-left
      { x: -this.size / 2, y: (this.size * sqrt3) / 2 }, // Bottom-left
    ];

    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    return localVertices.map((v) => ({
      x: this.cx + v.x * cos - v.y * sin,
      y: this.cy + v.x * sin + v.y * cos,
    }));
  }

  contains(x, y) {
    const vertices = this.getVertices();

    let sign = null;
    for (let i = 0; i < 3; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % 3];

      const cross = (v2.x - v1.x) * (y - v1.y) - (v2.y - v1.y) * (x - v1.x);

      if (sign === null) {
        sign = cross > 0;
      } else if (cross > 0 !== sign) {
        return false;
      }
    }

    return true;
  }

  distanceTo(x, y) {
    const vertices = this.getVertices();

    if (this.contains(x, y)) {
      return 0;
    }

    let minDist = Infinity;

    for (let i = 0; i < 3; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % 3];

      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      const len = Math.hypot(dx, dy);

      const px = x - v1.x;
      const py = y - v1.y;

      let t = (px * dx + py * dy) / (len * len);
      t = Math.max(0, Math.min(1, t));

      const closestX = v1.x + t * dx;
      const closestY = v1.y + t * dy;

      const dist = Math.hypot(x - closestX, y - closestY);
      minDist = Math.min(minDist, dist);
    }

    return minDist;
  }

  velocityAt(x, y) {
    const dist = this.distanceTo(x, y);

    // Only influence particles very close to the surface
    const influenceThickness = 5;

    if (dist > influenceThickness) {
      // Far from triangle - uniform flow
      return { vx: this.U, vy: 0 };
    }

    // Get vertices in world space
    const vertices = this.getVertices();

    // Find the leftmost vertex (most upstream, facing the flow)
    let leftmostVertex = vertices[0];
    for (let i = 1; i < vertices.length; i++) {
      if (vertices[i].x < leftmostVertex.x) {
        leftmostVertex = vertices[i];
      }
    }

    // Check if there are two vertices at the same leftmost x (forming a vertical edge)
    const tolerance = 0.1;
    const leftmostVertices = vertices.filter(
      (v) => Math.abs(v.x - leftmostVertex.x) < tolerance,
    );

    let splitY;
    if (leftmostVertices.length === 2) {
      // Vertical edge - split at the center of the edge (average of two y values)
      splitY = (leftmostVertices[0].y + leftmostVertices[1].y) / 2;
    } else {
      // Single vertex is leftmost - split at that vertex's y position
      splitY = leftmostVertex.y;
    }

    // Determine if particle is above or below the split line
    const deflectionStrength = 0.3;
    if (y < splitY) {
      // Above split line - deflect upward
      return { vx: this.U, vy: -this.U * deflectionStrength };
    } else {
      // Below split line - deflect downward
      return { vx: this.U, vy: this.U * deflectionStrength };
    }
  }

  handleSurfaceSliding(particle, prevX, prevY) {
    if (!this.contains(particle.x, particle.y)) return;

    const vertices = this.getVertices();
    const edges = [
      { start: vertices[0], end: vertices[1] },
      { start: vertices[1], end: vertices[2] },
      { start: vertices[2], end: vertices[0] },
    ];

    let closestEdge = null;
    let minDist = Infinity;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const dx = edge.end.x - edge.start.x;
      const dy = edge.end.y - edge.start.y;
      const len = Math.hypot(dx, dy);

      const nx = -dy / len;
      const ny = dx / len;

      const toParticle = {
        x: particle.x - edge.start.x,
        y: particle.y - edge.start.y,
      };

      const dist = Math.abs(toParticle.x * nx + toParticle.y * ny);

      if (dist < minDist) {
        minDist = dist;
        closestEdge = { edge, nx, ny, dx, dy, len };
      }
    }

    if (!closestEdge) return;

    const toParticle = {
      x: particle.x - closestEdge.edge.start.x,
      y: particle.y - closestEdge.edge.start.y,
    };

    const alongEdge =
      (toParticle.x * closestEdge.dx + toParticle.y * closestEdge.dy) /
      closestEdge.len;

    const clampedAlong = Math.max(0, Math.min(closestEdge.len, alongEdge));

    const tx = closestEdge.dx / closestEdge.len;
    const ty = closestEdge.dy / closestEdge.len;

    if (particle.vx == null) particle.vx = this.U;
    if (particle.vy == null) particle.vy = 0;

    // Determine which side of the split line this particle is on
    const vertices_world = this.getVertices();
    let leftmostVertex = vertices_world[0];
    for (let i = 1; i < vertices_world.length; i++) {
      if (vertices_world[i].x < leftmostVertex.x) {
        leftmostVertex = vertices_world[i];
      }
    }

    const tolerance = 0.1;
    const leftmostVertices = vertices_world.filter(
      (v) => Math.abs(v.x - leftmostVertex.x) < tolerance,
    );

    let splitY;
    if (leftmostVertices.length === 2) {
      splitY = (leftmostVertices[0].y + leftmostVertices[1].y) / 2;
    } else {
      splitY = leftmostVertex.y;
    }

    // Project velocity onto tangent
    const vdot = particle.vx * tx + particle.vy * ty;

    particle.vx = tx * vdot;
    particle.vy = ty * vdot;

    // Add deflection based on which side of split line
    const deflectionStrength = 0.2;
    if (particle.y < splitY) {
      particle.vy += -this.U * deflectionStrength;
    } else {
      particle.vy += this.U * deflectionStrength;
    }

    // Initialize exit velocity with decay tracking
    particle._exitVx = particle.vx;
    particle._exitVy = particle.vy;
    particle._exitTimer = 60; // Total frames for decay
    particle._exitStartFrame = 60; // Store initial value for decay calculation

    // Snap just outside face
    const offset = 2;
    particle.x =
      closestEdge.edge.start.x + tx * clampedAlong + closestEdge.nx * offset;

    particle.y =
      closestEdge.edge.start.y + ty * clampedAlong + closestEdge.ny * offset;
  }

  // Call this method in your particle update loop for particles with _exitTimer > 0
  applyExitVelocity(particle) {
    if (particle._exitTimer <= 0 || !particle._exitStartFrame) {
      return null; // No exit velocity to apply
    }

    // Calculate progress through decay (0 = just left surface, 1 = fully decayed)
    const progress = 1 - particle._exitTimer / particle._exitStartFrame;

    // Logarithmic decay: fast initial decay, then slower
    // Using: 1 / (1 + k * log(1 + t))
    const decayFactor = 1 / (1 + 2.5 * Math.log(1 + progress * 10));

    // Apply decayed exit velocity
    const vx = particle._exitVx; // Keep horizontal velocity constant
    const vy = particle._exitVy * decayFactor; // Decay vertical velocity

    particle._exitTimer--;

    if (particle._exitTimer <= 0) {
      // Clean up when done
      delete particle._exitVx;
      delete particle._exitVy;
      delete particle._exitTimer;
      delete particle._exitStartFrame;
    }

    return { vx, vy };
  }

  draw(ctx, isSelected = false) {
    const vertices = this.getVertices();

    ctx.strokeStyle = isSelected ? "yellow" : "white";
    if (isSelected) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    }
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.closePath();

    ctx.stroke();
  }
}
