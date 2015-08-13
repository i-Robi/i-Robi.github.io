/**
 * @file World base class.
 * @author Sébastien Robaszkiewicz [hello@robi.me]
 */

'use strict'

const gameloop = require('./gameloop');

class World {
  constructor() {
    this.config = null;
  }

  update(dt) {
    // Update the world state
  }

  render(dt) {
    // Render the world
  }

  start(worldConfig, gameloopConfig) {
    this.config = worldConfig;
    gameloop.start(gameloopConfig);
  }
}

module.exports = World;
