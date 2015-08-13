/**
 * @file Animation module.
 * @author Sébastien Robaszkiewicz [hello@robi.me]
 */

'use strict';

const Edge = require('./Edge');
const Vertex = require('./Vertex');
const World = require('./World');

const PIXEL_RATIO = (function() {
  const context = document.createElement('canvas').getContext('2d');
  const dPR = window.devicePixelRatio || 1;
  const bPR = context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1;

  return dPR / bPR;
})();

function distance(vertex1, vertex2) {
  let dx = vertex1.coordinates.x - vertex2.coordinates.x;
  let dy = vertex1.coordinates.y - vertex2.coordinates.y;

  return dx * dx + dy * dy;
}

function getTime() {
  return (window.performance && window.performance.now) ?
    window.performance.now() / 1000 : new Date().getTime() / 1000;
}

/**
 * @class Filter
 * @description Calculates the derivative and applies a low-pass filter.
 */
class Filter {
  constructor(timeConstant) {
    this._dX;
    this._dXFiltered;
    this._previousX;
    this._previousDXFiltered;
    this._previousTimestamp;
    this._timeConstant = timeConstant;
  }

  _decay(dt) {
    return Math.exp(-2 * Math.PI * dt / this._timeConstant);
  }

  input(x) {
    const now = getTime();
    let k;

    if (this._previousTimestamp && this._previousX) {
      const dt = now - this._previousTimestamp;
      k = this._decay(dt);
      this._dX = (x - this._previousX) / dt;
    }

    this._previousTimestamp = now;
    this._previousX = x;

    if (this._dX) {
      if (this._previousDXFiltered)
        this._dXFiltered = k * this._previousDXFiltered + (1 - k) * this._dX;
      else
        this._dXFiltered = this._dX;

      this._previousDXFiltered = this._dXFiltered;

      return this._dXFiltered;
    }

    return;
  }
}

/**
 * @class Animation
 * @extends World
 * @description Calculates and renders the canvas animation.
 */
class Animation extends World {
  constructor() {
    super();

    this._canvas = document.querySelector('#scene');
    this._canvasHeight;
    this._canvasWidth;
    this._edges = [];
    this._elapsedTime = 0;
    this._filter;
    this._vertices = [];
    this._verticesNum;
    this._windowWidth;
    this._windowHeight;

    this.config;
    this.ctx = this._canvas.getContext('2d');

    this._updateCanvasSize = this._updateCanvasSize.bind(this);
  }

  render(dt) {
    this.ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

    for (let i = 0; i < this._vertices.length; i++)
      this._vertices[i].draw(this.ctx, dt);

    for (let i = 0; i < this._edges.length; i++)
      this._edges[i].draw(this.ctx, dt);
  }

  update(dt) {
    this._edges = [];

    for (let i = 0; i < this._vertices.length; i++) {
      // Update the vertex
      let vertex1 = this._vertices[i];
      this._vertices[i].update(
        this._elapsedTime,
        dt,
        this._canvasWidth,
        this._canvasHeight
      );

      // Update the edges array
      for (let j = i; j > 0; j--) {
        let vertex2 = this._vertices[j];
        let dist = distance(vertex1, vertex2);
        const minDistance = this.config.minDistance * this.config.minDistance;

        if (dist < minDistance) {
          let edge = new Edge(vertex1, vertex2, dist, minDistance);
          this._edges.push(edge);
        }
      }
    }

    this._elapsedTime += dt;
  }

  _updateCanvasSize() {
    this._windowWidth = parseInt(window.innerWidth, 10);
    this._windowHeight = parseInt(window.innerHeight, 10);
    this._canvasWidth = this._windowWidth * PIXEL_RATIO;
    this._canvasHeight = this._windowHeight * PIXEL_RATIO;

    this._canvas.width = this._canvasWidth;
    this._canvas.height = this._canvasHeight;
    this._canvas.style.width = this._windowWidth + "px";
    this._canvas.style.height = this._windowHeight + "px";
    this._canvas.getContext("2d")
      .setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);

    this._vertices = [];
    this._verticesNum = Math.round(this._canvasWidth * this._canvasHeight
      * this.config.vertexDensity * 0.00003);

    for (let i = 0; i < this._verticesNum; ++i)
      this._vertices.push(new Vertex(this.config));
  }

  start(worldConfig, gameloopConfig) {
    super.start(worldConfig, gameloopConfig);

    this._updateCanvasSize();
    this._betaFilter = new Filter(this.config.filterTimeConstant);
    this._gammaFilter = new Filter(this.config.filterTimeConstant);
    window.addEventListener('resize', this._updateCanvasSize);
  }

  onOrientation(beta, gamma) {
    const dBetaFiltered = this._betaFilter.input(beta);
    const dGammaFiltered = this._gammaFilter.input(gamma);

    if (dBetaFiltered && dGammaFiltered) {
      for (let i = 0; i < this._vertices.length; i++)
        this._vertices[i].onOrientation(dBetaFiltered, dGammaFiltered);
    }
  }
}

module.exports = new Animation();
