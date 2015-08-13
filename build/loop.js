// http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/

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
    this.frame = this.frame.bind(this);
  }

  _createClass(GameLoop, [{
    key: 'frame',
    value: function frame() {
      var slow = this.gui && this.gui.slow ? this.gui.slow : 1; // slow motion scaling factor
      var slowStep = slow * step;

      var now = timestamp();
      this.dt += Math.min(1, (now - this.last) / 1000);

      while (this.dt > slowStep) {
        this.dt -= slowStep;
        this.update(this.step);
      }

      this.render(this.ctx, this.buffers, this.dt / slow);

      this.last = now;
      this.rAFid = requestAnimationFrame(this.frame);
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
      this.rAFid = requestAnimationFrame(this.frame);
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQztLQUNoRDs7O1dBRUcsZ0JBQUc7QUFDTCwwQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEM7OztTQW5ERyxRQUFROzs7QUFzRGQsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDIiwiZmlsZSI6InNyYy9qcy9sb29wLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cDovL2NvZGVpbmNvbXBsZXRlLmNvbS9wb3N0cy8yMDEzLzEyLzQvamF2YXNjcmlwdF9nYW1lX2ZvdW5kYXRpb25zX3RoZV9nYW1lX2xvb3AvXG5cbid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9yQUYnKTsgLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsXG5cbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgcmV0dXJuICh3aW5kb3cucGVyZm9ybWFuY2UgJiYgd2luZG93LnBlcmZvcm1hbmNlLm5vdykgP1xuICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xufVxuXG5jbGFzcyBHYW1lTG9vcCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYnVmZmVycyA9IG51bGw7XG4gICAgdGhpcy5jdHggPSBudWxsO1xuICAgIHRoaXMuZHQgPSAwO1xuICAgIHRoaXMuZ3VpID0gbnVsbDtcbiAgICB0aGlzLmxhc3QgPSBudWxsO1xuICAgIHRoaXMuckFGaWQgPSBudWxsO1xuICAgIHRoaXMucmVuZGVyID0gbnVsbDtcbiAgICB0aGlzLnN0ZXAgPSBudWxsO1xuICAgIHRoaXMudXBkYXRlID0gbnVsbDtcblxuICAgIC8vIE1ldGhvZCBiaW5kaW5nc1xuICAgIHRoaXMuZnJhbWUgPSB0aGlzLmZyYW1lLmJpbmQodGhpcyk7XG4gIH1cblxuICBmcmFtZSgpIHtcbiAgICBjb25zdCBzbG93ID0gKHRoaXMuZ3VpICYmIHRoaXMuZ3VpLnNsb3cpID9cbiAgICAgIHRoaXMuZ3VpLnNsb3cgOiAxOyAvLyBzbG93IG1vdGlvbiBzY2FsaW5nIGZhY3RvclxuICAgIGNvbnN0IHNsb3dTdGVwID0gc2xvdyAqIHN0ZXA7XG5cbiAgICBjb25zdCBub3cgPSB0aW1lc3RhbXAoKTtcbiAgICB0aGlzLmR0ICs9IE1hdGgubWluKDEsIChub3cgLSB0aGlzLmxhc3QpIC8gMTAwMCk7XG5cbiAgICB3aGlsZSAodGhpcy5kdCA+IHNsb3dTdGVwKSB7XG4gICAgICB0aGlzLmR0IC09IHNsb3dTdGVwO1xuICAgICAgdGhpcy51cGRhdGUodGhpcy5zdGVwKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlbmRlcih0aGlzLmN0eCwgdGhpcy5idWZmZXJzLCB0aGlzLmR0IC8gc2xvdyk7XG5cbiAgICB0aGlzLmxhc3QgPSBub3c7XG4gICAgdGhpcy5yQUZpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmZyYW1lKTtcbiAgfVxuXG4gIHN0YXJ0KGNvbmZpZykge1xuICAgIC8vIFVwZGF0ZSBjb25maWdcbiAgICB0aGlzLmJ1ZmZlcnMgPSBjb25maWcuYnVmZmVycztcbiAgICB0aGlzLmN0eCA9IGNvbmZpZy5jdHg7XG4gICAgdGhpcy5ndWkgPSBjb25maWcuZ3VpO1xuICAgIHRoaXMucmVuZGVyID0gY29uZmlnLnJlbmRlcjtcbiAgICB0aGlzLnN0ZXAgPSAxIC8gY29uZmlnLmZwcztcbiAgICB0aGlzLnVwZGF0ZSA9IGNvbmZpZy51cGRhdGU7XG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgdGhpcy5sYXN0ID0gdGltZXN0YW1wKCk7XG4gICAgdGhpcy5yQUZpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmZyYW1lKTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yQUZpZCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR2FtZUxvb3AoKTtcbiJdfQ==