'use strict';

class Vertex {
  constructor(options = {}) {
    this.canvasMargin = options.canvasMargin || 0;

    this.x = Math.random() * (1 + 2 * this.canvasMargin) - this.canvasMargin; // normalized
    this.y = Math.random() * (1 + 2 * this.canvasMargin) - this.canvasMargin; // normalized
    this.z = Math.random();
    
    this.minRadius = options.minRadius || 4; // in pixels
    this.radiusVariance = options.radiusVariance || 6; // in pixels
    this.radius = this.radiusVariance * this.z + this.minRadius;
    
    this.velocityFactor = options.velocityFactor || 20; // pixels per second
    this.vInitX = Math.random() * 2 - 1;
    this.vInitY = Math.random() * 2 - 1;
    this.dBeta = 0;
    this.dGamma = 0;
    
    this.minFadeinDuration = options.minFadeinDuration || 3;
    this.fadeInDurationVariance = options.fadeInDurationVariance || 2;
    this.fadeInDuration = this.minFadeinDuration + (1 - this.z) * this.fadeInDurationVariance; // in seconds

    this.opacity = 0;

    this.coordinates = {}; // in pixels
  }

  get vx() {
    return this.velocityFactor * (this.vInitX + this.dGamma * this.z * 200);
  }

  get vy() {
    return this.velocityFactor * (this.vInitY + this.dBeta * this.z * 200);
  }

  update(elapsedTime, dt, w, h) {
    this.x += this.vx / w * dt;
    this.y += this.vy / h * dt;

    if (this.x > 1 + this.canvasMargin)
      this.x = -this.canvasMargin;
    else if (this.x < -this.canvasMargin)
      this.x = 1 + this.canvasMargin;

    if (this.y > 1 + this.canvasMargin)
      this.y = -this.canvasMargin;
    else if (this.y < -this.canvasMargin)
      this.y = 1 + this.canvasMargin;

    this.coordinates.x = this.x * w;
    this.coordinates.y = this.y * h;

    this.opacity = 0.04 * Math.min(elapsedTime / this.fadeInDuration, 1);
  }

  draw(ctx, dt) {
    ctx.fillStyle = "rgba(0, 0, 0, " + this.opacity + ")";
    ctx.beginPath();
    ctx.arc(this.coordinates.x, this.coordinates.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }

  onOrientation(dBeta, dGamma) {
    this.dBeta = dBeta;
    this.dGamma = dGamma;
  }
}

module.exports = Vertex;