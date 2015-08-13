/**
 * @file Game loop.
 *   Based on [Jake Gordon's article on the game loop]{@link
 *   http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/}
 * @author Sébastien Robaszkiewicz [hello@robi.me]
 */

'use strict';

require('./rAF'); // requestAnimationFrame polyfill

function timestamp() {
  return (window.performance && window.performance.now) ?
    window.performance.now() : new Date().getTime();
}

class GameLoop {
  constructor() {
    this.buffers = null;
    this.ctx = null;
    this.dt = 0;
    this.gui = null;
    this.last = null;
    this.rAFid = null;
    this.render = null;
    this.step = null;
    this.update = null;

    // Method bindings
    this._frame = this._frame.bind(this);
  }

  _frame() {
    const slow = (this.gui && this.gui.slow) ?
      this.gui.slow : 1; // slow motion scaling factor
    const slowStep = slow * this.step;

    const now = timestamp();
    this.dt += Math.min(1, (now - this.last) / 1000);

    while (this.dt > slowStep) {
      this.dt -= slowStep;
      this.update(this.step);
    }

    this.render(this.ctx, this.buffers, this.dt / slow);

    this.last = now;
    this.rAFid = requestAnimationFrame(this._frame);
  }

  start(config) {
    // Update config
    this.buffers = config.buffers;
    this.ctx = config.ctx;
    this.gui = config.gui;
    this.render = config.render;
    this.step = 1 / config.fps;
    this.update = config.update;

    // Start the game loop
    this.last = timestamp();
    this.rAFid = requestAnimationFrame(this._frame);
  }

  stop() {
    cancelAnimationFrame(this.rAFid);
  }
}

module.exports = new GameLoop();
