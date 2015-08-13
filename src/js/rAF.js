/**
 * @file requestAnimationFrame polyfill by Erik Möller.
 *   Fixes from Paul Irish and Tino Zijdel.
 *   {@link http://paulirish.com/2011/requestanimationframe-for-smart-animating/}
 *   {@link http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating}
 *   (Modularization and ES6 conversion by Sébastien Robaszkiewicz.)
 * @author Erik Möller, Paul Irish, Tino Zijdel
 * @license MIT
 */

module.exports = (function() {
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  let lastTime = 0;

  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
      || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = (callback, element) => {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(
        () => callback(currTime + timeToCall),
        timeToCall
      );
      lastTime = currTime + timeToCall;

      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };
}());
