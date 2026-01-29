export class Particle {
  constructor(canvas, obstaclesRef) {
    this.canvas = canvas;
    this.obstaclesRef = obstaclesRef;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.speed = 1 + Math.random() * 1.5;
    this.slideEdge = null;
    this._exitVx = 0;
    this._exitVy = 0;
    this._exitTimer = 0;
  }

  update() {
    let vx = 2;
    let vy = 0;

    const obstacles = this.obstaclesRef.current;

    let closestObs = null;
    let minDist = Infinity;

    for (const obs of obstacles) {
      const dist = obs.distanceTo(this.x, this.y);
      if (dist < minDist) {
        minDist = dist;
        closestObs = obs;
      }
    }

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

    const prevX = this.x;
    const prevY = this.y;

    this.x += vx;
    this.y += vy;

    for (const obs of obstacles) {
      if (obs.contains(this.x, this.y)) {
        if (obs.handleSurfaceSliding) {
          obs.handleSurfaceSliding(this, prevX, prevY);
        } else {
          this.x = -10;
          this.y = Math.random() * this.canvas.height;
        }
        return;
      }
    }

    if (
      this.x < -20 ||
      this.x > this.canvas.width + 20 ||
      this.y < -20 ||
      this.y > this.canvas.height + 20
    ) {
      this.x = -10;
      this.y = Math.random() * this.canvas.height;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "rgba(120, 180, 255, 0.6)";
    ctx.fillRect(this.x, this.y, 1.5, 1.5);
  }
}
