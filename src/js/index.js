/**
 * @file Sébastien Robaszkiewicz's personal webpage.
 * @author Sébastien Robaszkiewicz [hello@robi.me]
 */

'use strict';

// Libraries and files
const input = require('motion-input');
const animation = require('./animation');

// Configs
const worldConfig = {
  canvasMargin: 0.1, // relative to max(canvas.width, canvas.height)
  filterTimeConstant: 1.5, // seconds
  fadeinDurationVariance: 2, // seconds
  minDistance: 140, // pixels
  minFadeinDuration: 3, // seconds
  minRadius: 4, // pixels
  radiusVariance: 6, // pixels
  velocityFactor: 7, // pixels per second
  vertexDensity: 3 // arbitrary scale from 1 to 10
};
const gameloopConfig = {
  ctx: animation.ctx,
  buffers: [],
  update: animation.update.bind(animation),
  render: animation.render.bind(animation),
  fps: 60
  // gui: gui.model
};

// Media query function
function onResize(mql, name) {
  if (mql.matches)
    name.innerHTML = 'Sébastien Robaszkiewicz';
  else
    name.innerHTML = 'S. Robaszkiewicz';
}

// Script
(function() {
  document.body.addEventListener('touchmove', (e) => {
    e.preventDefault(); // prevents scrolling
  });

  // Update name on media query
  let name = document.querySelector('.title');
  let mql = window.matchMedia('(min-width: 480px)');
  mql.addListener(() => onResize(mql, name));
  onResize(mql, name);

  // Start canvas animation
  animation.start(worldConfig, gameloopConfig);

  // Start motion input module
  input.init('orientationAlt')
    .then((modules) => {
      const orientation = modules[0];

      if (orientation.isValid) {
        input.addListener('orientationAlt', (val) => {
          animation.onOrientation(val[1], val[2]);
        });
      }
    });
}());
