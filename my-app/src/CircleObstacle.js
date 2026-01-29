export class CircleObstacle {
  constructor(cx, cy, R, U) {
    this.cx = cx;
    this.cy = cy;
    this.size = R;
    this.U = U;
    this.angle = 0;
  }

  contains(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    return dx * dx + dy * dy < this.size * this.size;
  }

  // CHANGE 8: Added distanceTo method for finding closest obstacle
  distanceTo(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.max(0, dist - this.size); // Distance to surface
  }

  velocityAt(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx);

    // CHANGE 9: Add limits to prevent extreme velocities near the surface
    // This prevents visual artifacts when particles get very close
    const minR = this.size * 1.1; // Minimum distance for calculation
    const effectiveR = Math.max(r, minR);

    const R2_over_r2 = (this.size * this.size) / (effectiveR * effectiveR);

    const ur = this.U * (1 - R2_over_r2) * Math.cos(theta);
    const uθ = -this.U * (1 + R2_over_r2) * Math.sin(theta);

    return {
      vx: ur * Math.cos(theta) - uθ * Math.sin(theta),
      vy: ur * Math.sin(theta) + uθ * Math.cos(theta),
    };
  }

  handleCollision(p) {
    // CHANGE 10: Improved collision - place particle downstream with some spread
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6; // ±30 degrees
    p.x = this.cx + this.size * Math.cos(angle) + 2;
    p.y = this.cy + this.size * Math.sin(angle);
  }

  draw(ctx, isSelected = false) {
    ctx.strokeStyle = isSelected ? "yellow" : "white";
    if (isSelected) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.size, 0, Math.PI * 2);
    ctx.stroke();
  }
}
