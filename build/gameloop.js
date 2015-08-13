/**
 * @file Game loop.
 *   Based on [Jake Gordon's article on the game loop]{@link
 *   http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/}
 * @author Sébastien Robaszkiewicz [hello@robi.me]
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

require('./rAF'); // requestAnimationFrame polyfill

function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

var GameLoop = (function () {
  function GameLoop() {
    _classCallCheck(this, GameLoop);

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

  _createClass(GameLoop, [{
    key: '_frame',
    value: function _frame() {
      var slow = this.gui && this.gui.slow ? this.gui.slow : 1; // slow motion scaling factor
      var slowStep = slow * this.step;

      var now = timestamp();
      this.dt += Math.min(1, (now - this.last) / 1000);

      while (this.dt > slowStep) {
        this.dt -= slowStep;
        this.update(this.step);
      }

      this.render(this.ctx, this.buffers, this.dt / slow);

      this.last = now;
      this.rAFid = requestAnimationFrame(this._frame);
    }
  }, {
    key: 'start',
    value: function start(config) {
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
  }, {
    key: 'stop',
    value: function stop() {
      cancelAnimationFrame(this.rAFid);
    }
  }]);

  return GameLoop;
})();

module.exports = new GameLoop();
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDakQ7OztXQUVHLGdCQUFHO0FBQ0wsMEJBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xDOzs7U0FuREcsUUFBUTs7O0FBc0RkLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQyIsImZpbGUiOiJzcmMvanMvZ2FtZWxvb3AuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIEdhbWUgbG9vcC5cbiAqICAgQmFzZWQgb24gW0pha2UgR29yZG9uJ3MgYXJ0aWNsZSBvbiB0aGUgZ2FtZSBsb29wXXtAbGlua1xuICogICBodHRwOi8vY29kZWluY29tcGxldGUuY29tL3Bvc3RzLzIwMTMvMTIvNC9qYXZhc2NyaXB0X2dhbWVfZm91bmRhdGlvbnNfdGhlX2dhbWVfbG9vcC99XG4gKiBAYXV0aG9yIFPDqWJhc3RpZW4gUm9iYXN6a2lld2ljeiBbaGVsbG9Acm9iaS5tZV1cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vckFGJyk7IC8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwb2x5ZmlsbFxuXG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHJldHVybiAod2luZG93LnBlcmZvcm1hbmNlICYmIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpID9cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn1cblxuY2xhc3MgR2FtZUxvb3Age1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmJ1ZmZlcnMgPSBudWxsO1xuICAgIHRoaXMuY3R4ID0gbnVsbDtcbiAgICB0aGlzLmR0ID0gMDtcbiAgICB0aGlzLmd1aSA9IG51bGw7XG4gICAgdGhpcy5sYXN0ID0gbnVsbDtcbiAgICB0aGlzLnJBRmlkID0gbnVsbDtcbiAgICB0aGlzLnJlbmRlciA9IG51bGw7XG4gICAgdGhpcy5zdGVwID0gbnVsbDtcbiAgICB0aGlzLnVwZGF0ZSA9IG51bGw7XG5cbiAgICAvLyBNZXRob2QgYmluZGluZ3NcbiAgICB0aGlzLl9mcmFtZSA9IHRoaXMuX2ZyYW1lLmJpbmQodGhpcyk7XG4gIH1cblxuICBfZnJhbWUoKSB7XG4gICAgY29uc3Qgc2xvdyA9ICh0aGlzLmd1aSAmJiB0aGlzLmd1aS5zbG93KSA/XG4gICAgICB0aGlzLmd1aS5zbG93IDogMTsgLy8gc2xvdyBtb3Rpb24gc2NhbGluZyBmYWN0b3JcbiAgICBjb25zdCBzbG93U3RlcCA9IHNsb3cgKiB0aGlzLnN0ZXA7XG5cbiAgICBjb25zdCBub3cgPSB0aW1lc3RhbXAoKTtcbiAgICB0aGlzLmR0ICs9IE1hdGgubWluKDEsIChub3cgLSB0aGlzLmxhc3QpIC8gMTAwMCk7XG5cbiAgICB3aGlsZSAodGhpcy5kdCA+IHNsb3dTdGVwKSB7XG4gICAgICB0aGlzLmR0IC09IHNsb3dTdGVwO1xuICAgICAgdGhpcy51cGRhdGUodGhpcy5zdGVwKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlbmRlcih0aGlzLmN0eCwgdGhpcy5idWZmZXJzLCB0aGlzLmR0IC8gc2xvdyk7XG5cbiAgICB0aGlzLmxhc3QgPSBub3c7XG4gICAgdGhpcy5yQUZpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9mcmFtZSk7XG4gIH1cblxuICBzdGFydChjb25maWcpIHtcbiAgICAvLyBVcGRhdGUgY29uZmlnXG4gICAgdGhpcy5idWZmZXJzID0gY29uZmlnLmJ1ZmZlcnM7XG4gICAgdGhpcy5jdHggPSBjb25maWcuY3R4O1xuICAgIHRoaXMuZ3VpID0gY29uZmlnLmd1aTtcbiAgICB0aGlzLnJlbmRlciA9IGNvbmZpZy5yZW5kZXI7XG4gICAgdGhpcy5zdGVwID0gMSAvIGNvbmZpZy5mcHM7XG4gICAgdGhpcy51cGRhdGUgPSBjb25maWcudXBkYXRlO1xuXG4gICAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICAgIHRoaXMubGFzdCA9IHRpbWVzdGFtcCgpO1xuICAgIHRoaXMuckFGaWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZnJhbWUpO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJBRmlkKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHYW1lTG9vcCgpO1xuIl19