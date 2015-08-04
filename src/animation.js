'use strict';

const loop = require('./loop');
const Vertex = require('./Vertex');
const Edge = require('./Edge');

// Canvas parameters
var canvasWidth;
var canvasHeight;
var windowWidth;
var windowHeight;
var canvas;
var ctx;

// Game loop options
var options = {
  ctx: ctx,
  buffers: [],
  update: update,
  render: render,
  fps: 60
    // gui: gui.model
};

var edges = [];
var elapsedTime = 0;

// Game loop main functions
function update(dt) {
  edges = [];

  for (let i = 0; i < vertices.length; i++) {
    let vertex1 = vertices[i];
    vertices[i].update(elapsedTime, dt, canvasWidth, canvasHeight);

    for (let j = i; j > 0; j--) {
      let vertex2 = vertices[j];
      let dist = distance(vertex1, vertex2);

      if (dist < minDist)
        edges.push(new Edge(vertex1, vertex2, dist, minDist));
    }
  }

  elapsedTime += dt;
}

function render(dt) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < vertices.length; i++)
    vertices[i].draw(ctx, dt);

  for (let i = 0; i < edges.length; i++)
    edges[i].draw(ctx, dt);
}

function start() {
  windowWidth = parseInt(window.innerWidth, 10);
  windowHeight = parseInt(window.innerHeight, 10);

  canvas = document.querySelector('#scene');
  ctx = canvas.getContext('2d');

  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize);

  loop.run(options);
}

// Animation
var minDist = 20000; // square distance
var verticesNum;
var vertices = [];

var PIXEL_RATIO = (function() {
  var context = document.createElement("canvas").getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    bsr = context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1;

  return dpr / bsr;
})();

function updateCanvasSize() {
  windowWidth = parseInt(window.innerWidth, 10);
  windowHeight = parseInt(window.innerHeight, 10);
  canvasWidth = windowWidth * PIXEL_RATIO;
  canvasHeight = windowHeight * PIXEL_RATIO;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = windowWidth + "px";
  canvas.style.height = windowHeight + "px";
  canvas.getContext("2d").setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);

  vertices = [];
  verticesNum = Math.round(canvasWidth * canvasHeight / 12000);

  for (let i = 0; i < verticesNum; i++) {
    vertices.push(new Vertex({
      canvasMargin: 0.1,
      velocityFactor: 7,
      minRadius: 4,
      radiusVariance: 6,
      minFadeinDuration: 3,
      fadeinDurationVariance: 2
    }));
  }
}

function distance(vertex1, vertex2) {
  let dx = vertex1.coordinates.x - vertex2.coordinates.x;
  let dy = vertex1.coordinates.y - vertex2.coordinates.y;

  return dx * dx + dy * dy;
}

function drawEdge(vertex1, vertex2, dist) {
  ctx.beginPath();
  ctx.strokeStyle = "rgba(0, 0, 0, " + (1.2 - dist / minDist) * Math.max(vertex1.opacity, vertex2.opacity) + ")";
  ctx.moveTo(vertex1.coordinates.x, vertex1.coordinates.y);
  ctx.lineTo(vertex2.coordinates.x, vertex2.coordinates.y);
  ctx.stroke();
  ctx.closePath();
}

function onOrientation(beta, gamma) {
  let now = timestamp();
  let k = 0.8;

  if (previousTimestamp && previousBeta && previousGamma)  {
    let dt = now - previousTimestamp;
    dBeta = (beta - previousBeta) / dt;
    dGamma = (gamma - previousGamma) / dt;
  }

  previousTimestamp = now;
  previousBeta = beta;
  previousGamma = gamma;

  if (dBeta && dGamma) {
    if (previousDBetaFiltered && previousDGammaFiltered) {
      dBetaFiltered = k * previousDBetaFiltered + (1 - k) * dBeta;
      dGammaFiltered = k * previousDGammaFiltered + (1 - k) * dGamma;
    } else {
      dBetaFiltered = dBeta;
      dGammaFiltered = dGamma;
    }

    previousDBetaFiltered = dBetaFiltered;
    previousDGammaFiltered = dGammaFiltered;

    for (let i = 0; i < vertices.length; i++)
      vertices[i].onOrientation(dBetaFiltered, dGammaFiltered);
  }
}

function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

var previousTimestamp;
var previousBeta;
var previousGamma;
var dBeta;
var dGamma;
var dBetaFiltered;
var dGammaFiltered;
var previousDBetaFiltered;
var previousDGammaFiltered;

module.exports = {
  start: start,
  onOrientation: onOrientation
};