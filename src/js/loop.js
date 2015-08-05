// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                               || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());

// http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/
function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

var loop = {
  run: function(options) {

    var now;
    var dt = 0;
    var last = timestamp();
    var step = 1 / options.fps;
    var ctx = options.ctx;
    var buffers = options.buffers;
    var update = options.update;
    var render = options.render;
    var gui = options.gui;

    (function(that) {
      function loop() {
        var slow     = (gui && gui.slow) ? gui.slow : 1; // slow motion scaling factor
        var slowStep = slow * step;

        now = timestamp();
        dt = dt + Math.min(1, (now - last) / 1000);

        while(dt > slowStep) {
            dt = dt - slowStep;
            update(step);
        }

        render(ctx, buffers, dt/slow);

        last = now;
        that.rAFid = requestAnimationFrame(loop);
      }

      that.rAFid = requestAnimationFrame(loop);
    }(this));
  },

  quit: function() {
    cancelAnimationFrame(this.rAFid);
  }
};

module.exports = exports = loop;
