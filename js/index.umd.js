(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.script = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
// blah bl

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var Edge = (function () {
  function Edge(node1, node2, distance, minDistance) {
    _classCallCheck(this, Edge);

    this.node1 = node1;
    this.node2 = node2;
    this.distance = distance;
    this.minDistance = minDistance;
  }

  _createClass(Edge, [{
    key: "draw",
    value: function draw(ctx, dt) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 0, 0, " + this.opacity + ")";
      ctx.moveTo(this.node1.coordinates.x, this.node1.coordinates.y);
      ctx.lineTo(this.node2.coordinates.x, this.node2.coordinates.y);
      ctx.stroke();
      ctx.closePath();
    }
  }, {
    key: "opacity",
    get: function get() {
      return 2 * (1.2 - this.distance / this.minDistance) * Math.max(this.node1.opacity, this.node2.opacity);
    }
  }]);

  return Edge;
})();

module.exports = Edge;

},{"babel-runtime/helpers/class-call-check":7,"babel-runtime/helpers/create-class":8}],2:[function(require,module,exports){
'use strict';

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var Vertex = (function () {
  function Vertex() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Vertex);

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

  _createClass(Vertex, [{
    key: "update",
    value: function update(elapsedTime, dt, w, h) {
      this.x += this.vx / w * dt;
      this.y += this.vy / h * dt;

      if (this.x > 1 + this.canvasMargin) this.x = -this.canvasMargin;else if (this.x < -this.canvasMargin) this.x = 1 + this.canvasMargin;

      if (this.y > 1 + this.canvasMargin) this.y = -this.canvasMargin;else if (this.y < -this.canvasMargin) this.y = 1 + this.canvasMargin;

      this.coordinates.x = this.x * w;
      this.coordinates.y = this.y * h;

      this.opacity = 0.04 * Math.min(elapsedTime / this.fadeInDuration, 1);
    }
  }, {
    key: "draw",
    value: function draw(ctx, dt) {
      ctx.fillStyle = "rgba(0, 0, 0, " + this.opacity + ")";
      ctx.beginPath();
      ctx.arc(this.coordinates.x, this.coordinates.y, this.radius, 0, Math.PI * 2, false);
      ctx.fill();
    }
  }, {
    key: "onOrientation",
    value: function onOrientation(dBeta, dGamma) {
      this.dBeta = dBeta;
      this.dGamma = dGamma;
    }
  }, {
    key: "vx",
    get: function get() {
      return this.velocityFactor * (this.vInitX + this.dGamma * this.z * 200);
    }
  }, {
    key: "vy",
    get: function get() {
      return this.velocityFactor * (this.vInitY + this.dBeta * this.z * 200);
    }
  }]);

  return Vertex;
})();

module.exports = Vertex;

},{"babel-runtime/helpers/class-call-check":7,"babel-runtime/helpers/create-class":8}],3:[function(require,module,exports){
'use strict';

var loop = require('./loop');
var Vertex = require('./Vertex');
var Edge = require('./Edge');

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

  for (var i = 0; i < vertices.length; i++) {
    var vertex1 = vertices[i];
    vertices[i].update(elapsedTime, dt, canvasWidth, canvasHeight);

    for (var j = i; j > 0; j--) {
      var vertex2 = vertices[j];
      var dist = distance(vertex1, vertex2);

      if (dist < minDist) edges.push(new Edge(vertex1, vertex2, dist, minDist));
    }
  }

  elapsedTime += dt;
}

function render(dt) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (var i = 0; i < vertices.length; i++) {
    vertices[i].draw(ctx, dt);
  }for (var i = 0; i < edges.length; i++) {
    edges[i].draw(ctx, dt);
  }
}

function start() {
  windowWidth = parseInt(window.innerWidth, 10);
  windowHeight = parseInt(window.innerHeight, 10);

  canvas = document.querySelector('#scene');
  ctx = canvas.getContext('2d');

  updateCanvasSize();
  window.addEventListener('resize', updateCanvasSize);

  loop.run(options);
}

// Animation
var minDist = 20000; // square distance
var verticesNum;
var vertices = [];

var PIXEL_RATIO = (function () {
  var context = document.createElement("canvas").getContext("2d"),
      dpr = window.devicePixelRatio || 1,
      bsr = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

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

  for (var i = 0; i < verticesNum; i++) {
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
  var dx = vertex1.coordinates.x - vertex2.coordinates.x;
  var dy = vertex1.coordinates.y - vertex2.coordinates.y;

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
  var now = timestamp();
  var k = 0.8;

  if (previousTimestamp && previousBeta && previousGamma) {
    var dt = now - previousTimestamp;
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

    for (var i = 0; i < vertices.length; i++) {
      vertices[i].onOrientation(dBetaFiltered, dGammaFiltered);
    }
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

},{"./Edge":1,"./Vertex":2,"./loop":5}],4:[function(require,module,exports){
/**
 * @fileoverview Sébastien Robaszkiewicz's personal webpage
 * @author <a href='mailto:hello@robi.me'>Sébastien Robaszkiewicz</a>
 */

'use strict';

var input = require('motion-input');
var animation = require('./animation');

(function () {
  document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
  });

  animation.start();

  input.init('orientationAlt').then(function (modules) {
    var orientation = modules[0];

    if (orientation.isValid) {
      input.addListener('orientationAlt', function (val) {
        animation.onOrientation(val[1], val[2]);
      });
    }
  });
})();

},{"./animation":3,"motion-input":18}],5:[function(require,module,exports){
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
'use strict';

(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
})();

// http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/
function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

var loop = {
  run: function run(options) {

    var now;
    var dt = 0;
    var last = timestamp();
    var step = 1 / options.fps;
    var ctx = options.ctx;
    var buffers = options.buffers;
    var update = options.update;
    var render = options.render;
    var gui = options.gui;

    (function (that) {
      function loop() {
        var slow = gui && gui.slow ? gui.slow : 1; // slow motion scaling factor
        var slowStep = slow * step;

        now = timestamp();
        dt = dt + Math.min(1, (now - last) / 1000);

        while (dt > slowStep) {
          dt = dt - slowStep;
          update(step);
        }

        render(ctx, buffers, dt / slow);

        last = now;
        that.rAFid = requestAnimationFrame(loop);
      }

      that.rAFid = requestAnimationFrame(loop);
    })(this);
  },

  quit: function quit() {
    cancelAnimationFrame(this.rAFid);
  }
};

module.exports = exports = loop;

},{}],6:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":9}],7:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],8:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":6}],9:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":11}],10:[function(require,module,exports){
module.exports = function($){
  $.FW   = false;
  $.path = $.core;
  return $;
};
},{}],11:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  each: [].forEach
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":10}],12:[function(require,module,exports){
/**
 * @fileoverview `DOMEventSubmodule` module
 * @author <a href='mailto:sebastien@robaszkiewicz.com'>Sébastien Robaszkiewicz</a>, <a href='mailto:Norbert.Schnell@ircam.fr'>Norbert Schnell</a>
 */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var InputModule = require('./InputModule');

/**
 * `DOMEventSubmodule` class.
 * The `DOMEventSubmodule` class allows to instantiate modules that provide
 * unified values (such as `AccelerationIncludingGravity`, `Acceleration`,
 * `RotationRate`, `Orientation`, `OrientationAlt) from the `devicemotion`
 * or `deviceorientation` DOM events.
 *
 * @class DOMEventSubmodule
 * @extends InputModule
 */

var DOMEventSubmodule = (function (_InputModule) {
  _inherits(DOMEventSubmodule, _InputModule);

  /**
   * Creates a `DOMEventSubmodule` module instance.
   *
   * @constructor
   * @param {DeviceMotionModule|DeviceOrientationModule} DOMEventModule - The parent DOM event module.
   * @param {string} eventType - The name of the submodule / event (*e.g.* 'acceleration' or 'orientationAlt').
   * @see DeviceMotionModule
   * @see DeviceOrientationModule
   */

  function DOMEventSubmodule(DOMEventModule, eventType) {
    _classCallCheck(this, DOMEventSubmodule);

    _get(Object.getPrototypeOf(DOMEventSubmodule.prototype), 'constructor', this).call(this, eventType);

    /**
     * The DOM event parent module from which this module gets the raw values.
     *
     * @this DOMEventSubmodule
     * @type {DeviceMotionModule|DeviceOrientationModule}
     * @constant
     */
    this.DOMEventModule = DOMEventModule;

    /**
     * Raw values coming from the `devicemotion` event sent by this module.
     *
     * @this DOMEventSubmodule
     * @type {number[]}
     * @default [0, 0, 0]
     */
    this.event = [0, 0, 0];

    /**
     * Compass heading reference (iOS devices only, `Orientation` and `OrientationAlt` submodules only).
     *
     * @this DOMEventSubmodule
     * @type {number}
     * @default null
     */
    this._webkitCompassHeadingReference = null;
  }

  /**
   * Starts the module.
   */

  _createClass(DOMEventSubmodule, [{
    key: 'start',
    value: function start() {
      this.DOMEventModule._addListener();
    }

    /**
     * Stops the module.
     */
  }, {
    key: 'stop',
    value: function stop() {
      this.DOMEventModule._removeListener();
    }

    /**
     * Initializes of the module.
     *
     * @return {Promise}
     */
  }, {
    key: 'init',
    value: function init() {
      var _this = this;

      // Indicate to the parent module that this event is required
      this.DOMEventModule.required[this.eventType] = true;

      // If the parent event has not been initialized yet, initialize it
      var DOMEventPromise = this.DOMEventModule.promise;
      if (!DOMEventPromise) DOMEventPromise = this.DOMEventModule.init();

      return DOMEventPromise.then(function (module) {
        return _this;
      });
    }
  }]);

  return DOMEventSubmodule;
})(InputModule);

module.exports = DOMEventSubmodule;

},{"./InputModule":16,"babel-runtime/helpers/class-call-check":26,"babel-runtime/helpers/create-class":27,"babel-runtime/helpers/get":28,"babel-runtime/helpers/inherits":29}],13:[function(require,module,exports){
/**
 * @fileoverview `DeviceMotion` module
 * @author <a href='mailto:sebastien@robaszkiewicz.com'>Sébastien Robaszkiewicz</a>, <a href='mailto:Norbert.Schnell@ircam.fr'>Norbert Schnell</a>
 */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var InputModule = require('./InputModule');
var DOMEventSubmodule = require('./DOMEventSubmodule');
var MotionInput = require('./MotionInput');
var platform = require('platform');

/**
 * Gets the current local time in seconds.
 * Uses `window.performance.now()` if available, and `Date.now()` otherwise.
 * 
 * @return {number}
 */
function getLocalTime() {
  if (window.performance) return window.performance.now() / 1000;
  return Date.now() / 1000;
}

/**
 * `DeviceMotion` module singleton.
 * The `DeviceMotionModule` singleton provides the raw values
 * of the acceleration including gravity, acceleration, and rotation
 * rate provided by the `DeviceMotion` event.
 * It also instantiate the `AccelerationIncludingGravity`,
 * `Acceleration` and `RotationRate` submodules that unify those values
 * across platforms by making them compliant with {@link
 * http://www.w3.org/TR/orientation-event/|the W3C standard}.
 * When raw values are not provided by the sensors, this modules tries
 * to recalculate them from available values:
 * - `acceleration` is calculated from `accelerationIncludingGravity`
 *   with a high-pass filter;
 * - (coming soon — waiting for a bug on Chrome to be resolved)
 *   `rotationRate` is calculated from `orientation`.
 *
 * @class DeviceMotionModule
 * @extends InputModule
 */

var DeviceMotionModule = (function (_InputModule) {
  _inherits(DeviceMotionModule, _InputModule);

  /**
   * Creates the `DeviceMotion` module instance.
   *
   * @constructor
   */

  function DeviceMotionModule() {
    _classCallCheck(this, DeviceMotionModule);

    _get(Object.getPrototypeOf(DeviceMotionModule.prototype), 'constructor', this).call(this, 'devicemotion');

    /**
     * Raw values coming from the `devicemotion` event sent by this module.
     *
     * @this DeviceMotionModule
     * @type {number[]}
     * @default [null, null, null, null, null, null, null, null, null]
     */
    this.event = [null, null, null, null, null, null, null, null, null];

    /**
     * The `AccelerationIncludingGravity` module.
     * Provides unified values of the acceleration including gravity.
     *
     * @this DeviceMotionModule
     * @type {DOMEventSubmodule}
     */
    this.accelerationIncludingGravity = new DOMEventSubmodule(this, 'accelerationIncludingGravity');

    /**
     * The `Acceleration` submodule.
     * Provides unified values of the acceleration.
     * Estimates the acceleration values from `accelerationIncludingGravity`
     * raw values if the acceleration raw values are not available on the
     * device.
     *
     * @this DeviceMotionModule
     * @type {DOMEventSubmodule}
     */
    this.acceleration = new DOMEventSubmodule(this, 'acceleration');

    /**
     * The `RotationRate` submodule.
     * Provides unified values of the rotation rate.
     * (coming soon, waiting for a bug on Chrome to be resolved)
     * Estimates the rotation rate values from `orientation` values if
     * the rotation rate raw values are not available on the device.
     *
     * @this DeviceMotionModule
     * @type {DOMEventSubmodule}
     */
    this.rotationRate = new DOMEventSubmodule(this, 'rotationRate');

    /**
     * Required submodules / events.
     *
     * @this DeviceMotionModule
     * @type {object}
     * @property {bool} accelerationIncludingGravity - Indicates whether the `accelerationIncludingGravity` unified values are required or not (defaults to `false`).
     * @property {bool} acceleration - Indicates whether the `acceleration` unified values are required or not (defaults to `false`).
     * @property {bool} rotationRate - Indicates whether the `rotationRate` unified values are required or not (defaults to `false`).
     */
    this.required = {
      accelerationIncludingGravity: false,
      acceleration: false,
      rotationRate: false
    };

    /**
     * Number of listeners subscribed to the `DeviceMotion` module.
     *
     * @this DeviceMotionModule
     * @type {number}
     */
    this._numListeners = 0;

    /**
     * Resolve function of the module's promise.
     *
     * @this DeviceMotionModule
     * @type {function}
     * @default null
     * @see DeviceMotionModule#init
     */
    this._promiseResolve = null;

    /**
     * Unifying factor of the motion data values (`1` on Android, `-1` on iOS).
     *
     * @this DeviceMotionModule
     * @type {number}
     */
    this._unifyMotionData = platform.os.family === 'iOS' ? -1 : 1;

    /**
     * Unifying factor of the period (`0.001` on Android, `1` on iOS).
     *
     * @this DeviceMotionModule
     * @type {number}
     */
    this._unifyPeriod = platform.os.family === 'Android' ? 0.001 : 1;

    /**
     * Acceleration calculated from the `accelerationIncludingGravity` raw values.
     *
     * @this DeviceMotionModule
     * @type {number[]}
     * @default [0, 0, 0]
     */
    this._calculatedAcceleration = [0, 0, 0];

    /**
     * Time constant (half-life) of the high-pass filter used to smooth the acceleration values calculated from the acceleration including gravity raw values (in seconds).
     *
     * @this DeviceMotionModule
     * @type {number}
     * @default 0.1
     * @constant
     */
    this._calculatedAccelerationTimeConstant = 0.1;

    /**
     * Latest `accelerationIncludingGravity` raw value, used in the high-pass filter to calculate the acceleration (if the `acceleration` values are not provided by `'devicemotion'`).
     *
     * @this DeviceMotionModule
     * @type {number[]}
     * @default [0, 0, 0]
     */
    this._lastAccelerationIncludingGravity = [0, 0, 0];

    /**
     * Rotation rate calculated from the orientation values.
     *
     * @this DeviceMotionModule
     * @type {number[]}
     * @default [0, 0, 0]
     */
    this._calculatedRotationRate = [0, 0, 0];

    /**
     * Latest orientation value, used to calculate the rotation rate  (if the `rotationRate` values are not provided by `'devicemotion'`).
     *
     * @this DeviceMotionModule
     * @type {number[]}
     * @default [0, 0, 0]
     */
    this._lastOrientation = [0, 0, 0];

    /**
     * Latest orientation timestamps, used to calculate the rotation rate (if the `rotationRate` values are not provided by `'devicemotion'`).
     *
     * @this DeviceMotionModule
     * @type {number[]}
     * @default [0, 0, 0]
     */
    this._lastOrientationTimestamp = null;

    /**
     * Method binding of the sensor check.
     *
     * @this DeviceMotionModule
     * @type {function}
     */
    this._devicemotionCheck = this._devicemotionCheck.bind(this);

    /**
     * Method binding of the `'devicemotion'` event callback.
     *
     * @this DeviceMotionModule
     * @type {function}
     */
    this._devicemotionListener = this._devicemotionListener.bind(this);
  }

  /**
   * Decay factor of the high-pass filter used to calculate the acceleration from the `accelerationIncludingGravity` raw values.
   *
   * @type {number}
   * @readonly
   */

  _createClass(DeviceMotionModule, [{
    key: '_devicemotionCheck',

    /**
     * Sensor check on initialization of the module.
     * This method:
     * - checks whether the `accelerationIncludingGravity`, the `acceleration`,
     *   and the `rotationRate` values are valid or not;
     * - gets the period of the `'devicemotion'` event and sets the period of
     *   the `AccelerationIncludingGravity`, `Acceleration`, and `RotationRate`
     *   submodules;
     * - (in the case where acceleration raw values are not provided)
     *   indicates whether the acceleration can be calculated from the
     *   `accelerationIncludingGravity` unified values or not.
     *
     * @param {DeviceMotionEvent} e - The first `'devicemotion'` event caught.
     */
    value: function _devicemotionCheck(e) {
      this.isProvided = true;
      this.period = e.interval / 1000;

      // Sensor availability for the acceleration including gravity
      this.accelerationIncludingGravity.isProvided = e.accelerationIncludingGravity && typeof e.accelerationIncludingGravity.x === 'number' && typeof e.accelerationIncludingGravity.y === 'number' && typeof e.accelerationIncludingGravity.z === 'number';
      this.accelerationIncludingGravity.period = e.interval * this._unifyPeriod;

      // Sensor availability for the acceleration
      this.acceleration.isProvided = e.acceleration && typeof e.acceleration.x === 'number' && typeof e.acceleration.y === 'number' && typeof e.acceleration.z === 'number';
      this.acceleration.period = e.interval * this._unifyPeriod;

      // Sensor availability for the rotation rate
      this.rotationRate.isProvided = e.rotationRate && typeof e.rotationRate.alpha === 'number' && typeof e.rotationRate.beta === 'number' && typeof e.rotationRate.gamma === 'number';
      this.rotationRate.period = e.interval * this._unifyPeriod;

      // We only need to listen to one event (=> remove the listener)
      window.removeEventListener('devicemotion', this._devicemotionCheck, false);

      // If acceleration is not provided by raw sensors, indicate whether it
      // can be calculated with `accelerationIncludingGravity` or not
      if (!this.acceleration.isProvided) this.acceleration.isCalculated = this.accelerationIncludingGravity.isProvided;

      // WARNING
      // The lines of code below are commented because of a bug of Chrome
      // on some Android devices, where 'devicemotion' events are not sent
      // or caught if the listener is set up after a 'deviceorientation'
      // listener. Here, the _tryOrientationFallback method would add a
      // 'deviceorientation' listener and block all subsequent 'devicemotion'
      // events on these devices. Comments will be removed once the bug of
      // Chrome is corrected.

      // if (this.required.rotationRate && !this.rotationRate.isProvided)
      //   this._tryOrientationFallback();
      // else
      this._promiseResolve(this);
    }

    /**
     * `'devicemotion'` event callback.
     * This method emits an event with the raw `'devicemotion'` values, and emits
     * events with the unified `accelerationIncludingGravity`, `acceleration`, 
     * and / or `rotationRate` values if they are required.
     *
     * @param {DeviceMotionEvent} e - `'devicemotion'` event the values are calculated from.
     */
  }, {
    key: '_devicemotionListener',
    value: function _devicemotionListener(e) {
      // 'devicemotion' event (raw values)
      this._emitDeviceMotionEvent(e);

      // 'acceleration' event (unified values)
      if (this.required.accelerationIncludingGravity && this.accelerationIncludingGravity.isValid) this._emitAccelerationIncludingGravityEvent(e);

      // 'accelerationIncludingGravity' event (unified values)
      if (this.required.acceleration && this.acceleration.isValid) // the fallback calculation of the acceleration happens in the `_emitAcceleration` method, so we check if this.acceleration.isValid
        this._emitAccelerationEvent(e);

      // 'rotationRate' event (unified values)
      if (this.required.rotationRate && this.rotationRate.isProvided) // the fallback calculation of the rotation rate does NOT happen in the `_emitRotationRate` method, so we only check if this.rotationRate.isProvided
        this._emitRotationRateEvent(e);
    }

    /**
     * Emits the `'devicemotion'` raw values.
     *
     * @param {DeviceMotionEvent} e - `'devicemotion'` event the values are calculated from.
     */
  }, {
    key: '_emitDeviceMotionEvent',
    value: function _emitDeviceMotionEvent(e) {
      var outEvent = this.event;

      if (e.accelerationIncludingGravity) {
        outEvent[0] = e.accelerationIncludingGravity.x;
        outEvent[1] = e.accelerationIncludingGravity.y;
        outEvent[2] = e.accelerationIncludingGravity.z;
      }

      if (e.acceleration) {
        outEvent[3] = e.acceleration.x;
        outEvent[4] = e.acceleration.y;
        outEvent[5] = e.acceleration.z;
      }

      if (e.rotationRate) {
        outEvent[6] = e.rotationRate.alpha;
        outEvent[7] = e.rotationRate.beta;
        outEvent[8] = e.rotationRate.gamma;
      }

      this.emit(outEvent);
    }

    /**
     * Emits the `accelerationIncludingGravity` unified values.
     *
     * @param {DeviceMotionEvent} e - `'devicemotion'` event the values are calculated from.
     */
  }, {
    key: '_emitAccelerationIncludingGravityEvent',
    value: function _emitAccelerationIncludingGravityEvent(e) {
      var outEvent = this.accelerationIncludingGravity.event;

      outEvent[0] = e.accelerationIncludingGravity.x * this._unifyMotionData;
      outEvent[1] = e.accelerationIncludingGravity.y * this._unifyMotionData;
      outEvent[2] = e.accelerationIncludingGravity.z * this._unifyMotionData;

      this.accelerationIncludingGravity.emit(outEvent);
    }

    /**
     * Emits the `acceleration` unified values.
     * When the `acceleration` raw values are not available, the method
     * also calculates the acceleration from the
     * `accelerationIncludingGravity` raw values.
     *
     * @param {DeviceMotionEvent} e - The `'devicemotion'` event.
     */
  }, {
    key: '_emitAccelerationEvent',
    value: function _emitAccelerationEvent(e) {
      var outEvent = this.acceleration.event;

      if (this.acceleration.isProvided) {
        // If raw acceleration values are provided
        outEvent[0] = e.acceleration.x * this._unifyMotionData;
        outEvent[1] = e.acceleration.y * this._unifyMotionData;
        outEvent[2] = e.acceleration.z * this._unifyMotionData;
      } else if (this.accelerationIncludingGravity.isValid) {
        // Otherwise, if accelerationIncludingGravity values are provided,
        // estimate the acceleration with a high-pass filter
        var accelerationIncludingGravity = [e.accelerationIncludingGravity.x * this._unifyMotionData, e.accelerationIncludingGravity.y * this._unifyMotionData, e.accelerationIncludingGravity.z * this._unifyMotionData];
        var k = this._calculatedAccelerationDecay;

        // High-pass filter to estimate the acceleration (without the gravity)
        this._calculatedAcceleration[0] = (1 + k) * 0.5 * accelerationIncludingGravity[0] - (1 + k) * 0.5 * this._lastAccelerationIncludingGravity[0] + k * this._calculatedAcceleration[0];
        this._calculatedAcceleration[1] = (1 + k) * 0.5 * accelerationIncludingGravity[1] - (1 + k) * 0.5 * this._lastAccelerationIncludingGravity[1] + k * this._calculatedAcceleration[1];
        this._calculatedAcceleration[2] = (1 + k) * 0.5 * accelerationIncludingGravity[2] - (1 + k) * 0.5 * this._lastAccelerationIncludingGravity[2] + k * this._calculatedAcceleration[2];

        this._lastAccelerationIncludingGravity[0] = accelerationIncludingGravity[0];
        this._lastAccelerationIncludingGravity[1] = accelerationIncludingGravity[1];
        this._lastAccelerationIncludingGravity[2] = accelerationIncludingGravity[2];

        outEvent[0] = this._calculatedAcceleration[0];
        outEvent[1] = this._calculatedAcceleration[1];
        outEvent[2] = this._calculatedAcceleration[2];
      }

      this.acceleration.emit(outEvent);
    }

    /**
     * Emits the `rotationRate` unified values.
     *
     * @param {DeviceMotionEvent} e - `'devicemotion'` event the values are calculated from.
     */
  }, {
    key: '_emitRotationRateEvent',
    value: function _emitRotationRateEvent(e) {
      var outEvent = this.rotationRate.event;

      outEvent[0] = e.rotationRate.alpha;
      outEvent[1] = e.rotationRate.beta;
      outEvent[2] = e.rotationRate.gamma;

      // TODO(?): unify

      this.rotationRate.emit(outEvent);
    }

    /**
     * Calculates and emits the `rotationRate` unified values from the `orientation` values.
     *
     * @param {number[]} orientation - Latest `orientation` raw values.
     */
  }, {
    key: '_calculateRotationRateFromOrientation',
    value: function _calculateRotationRateFromOrientation(orientation) {
      var now = getLocalTime();
      var k = 0.8; // TODO: improve low pass filter (frames are not regular)
      var alphaIsValid = typeof orientation[0] === 'number';

      if (this._lastOrientationTimestamp) {
        var rAlpha = null;
        var rBeta = undefined;
        var rGamma = undefined;

        var alphaDiscontinuityFactor = 0;
        var betaDiscontinuityFactor = 0;
        var gammaDiscontinuityFactor = 0;

        var deltaT = now - this._lastOrientationTimestamp;

        if (alphaIsValid) {
          // alpha discontinuity (+360 -> 0 or 0 -> +360)
          if (this._lastOrientation[0] > 320 && orientation[0] < 40) alphaDiscontinuityFactor = 360;else if (this._lastOrientation[0] < 40 && orientation[0] > 320) alphaDiscontinuityFactor = -360;
        }

        // beta discontinuity (+180 -> -180 or -180 -> +180)
        if (this._lastOrientation[1] > 140 && orientation[1] < -140) betaDiscontinuityFactor = 360;else if (this._lastOrientation[1] < -140 && orientation[1] > 140) betaDiscontinuityFactor = -360;

        // gamma discontinuities (+180 -> -180 or -180 -> +180)
        if (this._lastOrientation[2] > 50 && orientation[2] < -50) gammaDiscontinuityFactor = 180;else if (this._lastOrientation[2] < -50 && orientation[2] > 50) gammaDiscontinuityFactor = -180;

        if (deltaT > 0) {
          // Low pass filter to smooth the data
          if (alphaIsValid) rAlpha = k * this._calculatedRotationRate[0] + (1 - k) * (orientation[0] - this._lastOrientation[0] + alphaDiscontinuityFactor) / deltaT;
          rBeta = k * this._calculatedRotationRate[1] + (1 - k) * (orientation[1] - this._lastOrientation[1] + betaDiscontinuityFactor) / deltaT;
          rGamma = k * this._calculatedRotationRate[2] + (1 - k) * (orientation[2] - this._lastOrientation[2] + gammaDiscontinuityFactor) / deltaT;

          this._calculatedRotationRate[0] = rAlpha;
          this._calculatedRotationRate[1] = rBeta;
          this._calculatedRotationRate[2] = rGamma;
        }

        // TODO: resample the emission rate to match the devicemotion rate
        this.rotationRate.emit(this._calculatedRotationRate);
      }

      this._lastOrientationTimestamp = now;
      this._lastOrientation[0] = orientation[0];
      this._lastOrientation[1] = orientation[1];
      this._lastOrientation[2] = orientation[2];
    }

    /**
     * Checks whether the rotation rate can be calculated from the `orientation` values or not.
     */
  }, {
    key: '_tryOrientationFallback',
    value: function _tryOrientationFallback() {
      var _this = this;

      MotionInput.requireModule('orientation').then(function (orientation) {
        if (orientation.isValid) {
          console.log("WARNING (motion-input): The 'devicemotion' event does not exists or does not provide rotation rate values in your browser, so the rotation rate of the device is estimated from the 'orientation', calculated from the 'deviceorientation' event. Since the compass might not be available, only `beta` and `gamma` angles may be provided (`alpha` would be null).");

          _this.rotationRate.isCalculated = true;

          MotionInput.addListener('orientation', function (orientation) {
            _this._calculateRotationRateFromOrientation(orientation);
          });
        }

        _this._promiseResolve(_this);
      });
    }

    /**
     * Increases the number of listeners to this module (either because someone listens
     * to this module, or one of the three `DOMEventSubmodules`
     * (`AccelerationIncludingGravity`, `Acceleration`, `RotationRate`).
     * When the number of listeners reaches `1`, adds a `'devicemotion'` event listener.
     *
     * @see DeviceMotionModule#addListener
     * @see DOMEventSubmodule#start
     */
  }, {
    key: '_addListener',
    value: function _addListener() {
      this._numListeners++;

      if (this._numListeners === 1) window.addEventListener('devicemotion', this._devicemotionListener, false);
    }

    /**
     * Decreases the number of listeners to this module (either because someone stops
     * listening to this module, or one of the three `DOMEventSubmodules`
     * (`AccelerationIncludingGravity`, `Acceleration`, `RotationRate`).
     * When the number of listeners reaches `0`, removes the `'devicemotion'` event listener.
     *
     * @see DeviceMotionModule#removeListener
     * @see DOMEventSubmodule#stop
     */
  }, {
    key: '_removeListener',
    value: function _removeListener() {
      this._numListeners--;

      if (this._numListeners === 0) window.removeEventListener('devicemotion', this._devicemotionListener, false);
    }

    /**
     * Initializes of the module.
     *
     * @return {promise}
     */
  }, {
    key: 'init',
    value: function init() {
      var _this2 = this;

      return _get(Object.getPrototypeOf(DeviceMotionModule.prototype), 'init', this).call(this, function (resolve) {
        _this2._promiseResolve = resolve;

        if (window.DeviceMotionEvent) window.addEventListener('devicemotion', _this2._devicemotionCheck, false);

        // WARNING
        // The lines of code below are commented because of a bug of Chrome
        // on some Android devices, where 'devicemotion' events are not sent
        // or caught if the listener is set up after a 'deviceorientation'
        // listener. Here, the _tryOrientationFallback method would add a
        // 'deviceorientation' listener and block all subsequent 'devicemotion'
        // events on these devices. Comments will be removed once the bug of
        // Chrome is corrected.

        // else if (this.required.rotationRate)
        // this._tryOrientationFallback();

        else resolve(_this2);
      });
    }

    /**
     * Adds a listener to this module.
     * 
     * @param {function} listener - Listener to add.
     */
  }, {
    key: 'addListener',
    value: function addListener(listener) {
      _get(Object.getPrototypeOf(DeviceMotionModule.prototype), 'addListener', this).call(this, listener);
      this._addListener();
    }

    /**
     * Removes a listener from this module.
     *
     * @param {function} listener - Listener to remove.
     */
  }, {
    key: 'removeListener',
    value: function removeListener(listener) {
      _get(Object.getPrototypeOf(DeviceMotionModule.prototype), 'removeListener', this).call(this, listener);
      this._removeListener();
    }
  }, {
    key: '_calculatedAccelerationDecay',
    get: function get() {
      return Math.exp(-2 * Math.PI * this.accelerationIncludingGravity.period / this._calculatedAccelerationTimeConstant);
    }
  }]);

  return DeviceMotionModule;
})(InputModule);

module.exports = new DeviceMotionModule();

},{"./DOMEventSubmodule":12,"./InputModule":16,"./MotionInput":17,"babel-runtime/helpers/class-call-check":26,"babel-runtime/helpers/create-class":27,"babel-runtime/helpers/get":28,"babel-runtime/helpers/inherits":29,"platform":71}],14:[function(require,module,exports){
/**
 * @fileoverview `DeviceOrientation` module
 * @author <a href='mailto:sebastien@robaszkiewicz.com'>Sébastien Robaszkiewicz</a>, <a href='mailto:Norbert.Schnell@ircam.fr'>Norbert Schnell</a>
 */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var DOMEventSubmodule = require('./DOMEventSubmodule');
var InputModule = require('./InputModule');
var MotionInput = require('./MotionInput');
var platform = require('platform');

/**
 * Converts degrees to radians.
 * 
 * @param {number} deg - Angle in degrees.
 * @return {number}
 */
function degToRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * Converts radians to degrees.
 * 
 * @param {number} rad - Angle in radians.
 * @return {number}
 */
function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

/**
 * Normalizes a 3 x 3 matrix.
 * 
 * @param {number[]} m - Matrix to normalize, represented by an array of length 9.
 * @return {number[]}
 */
function normalize(m) {
  var det = m[0] * m[4] * m[8] + m[1] * m[5] * m[6] + m[2] * m[3] * m[7] - m[0] * m[5] * m[7] - m[1] * m[3] * m[8] - m[2] * m[4] * m[6];

  for (var i = 0; i < m.length; i++) {
    m[i] /= det;
  }return m;
}

/**
 * Converts a Euler angle `[alpha, beta, gamma]` to the W3C specification, where:
 * - `alpha` is in [0; +360[;
 * - `beta` is in [-180; +180[;
 * - `gamma` is in [-90; +90[.
 * 
 * @param {number[]} eulerAngle - Euler angle to unify, represented by an array of length 3 (`[alpha, beta, gamma]`).
 * @see {@link http://www.w3.org/TR/orientation-event/}
 */
function unify(eulerAngle) {
  // Cf. W3C specification (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
  // and Euler angles Wikipedia page (http://en.wikipedia.org/wiki/Euler_angles).
  //
  // W3C convention: Tait–Bryan angles Z-X'-Y'', where:
  //   alpha is in [0; +360[,
  //   beta is in [-180; +180[,
  //   gamma is in [-90; +90[.

  var alphaIsValid = typeof eulerAngle[0] === 'number';

  var _alpha = alphaIsValid ? degToRad(eulerAngle[0]) : 0;
  var _beta = degToRad(eulerAngle[1]);
  var _gamma = degToRad(eulerAngle[2]);

  var cA = Math.cos(_alpha);
  var cB = Math.cos(_beta);
  var cG = Math.cos(_gamma);
  var sA = Math.sin(_alpha);
  var sB = Math.sin(_beta);
  var sG = Math.sin(_gamma);

  var alpha = undefined,
      beta = undefined,
      gamma = undefined;

  var m = [cA * cG - sA * sB * sG, -cB * sA, cA * sG + cG * sA * sB, cG * sA + cA * sB * sG, cA * cB, sA * sG - cA * cG * sB, -cB * sG, sB, cB * cG];
  normalize(m);

  // Since we want gamma in [-90; +90[, cG >= 0.
  if (m[8] > 0) {
    // Case 1: m[8] > 0 <=> cB > 0                 (and cG != 0)
    //                  <=> beta in ]-pi/2; +pi/2[ (and cG != 0)
    alpha = Math.atan2(-m[1], m[4]);
    beta = Math.asin(m[7]); // asin returns a number between -pi/2 and +pi/2 => OK
    gamma = Math.atan2(-m[6], m[8]);
  } else if (m[8] < 0) {
    // Case 2: m[8] < 0 <=> cB < 0                            (and cG != 0)
    //                  <=> beta in [-pi; -pi/2[ U ]+pi/2; +pi] (and cG != 0)

    // Since cB < 0 and cB is in m[1] and m[4], the point is flipped by 180 degrees.
    // Hence, we have to multiply both arguments of atan2 by -1 in order to revert
    // the point in its original position (=> another flip by 180 degrees).
    alpha = Math.atan2(m[1], -m[4]);
    beta = -Math.asin(m[7]);
    beta += beta >= 0 ? -Math.PI : Math.PI; // asin returns a number between -pi/2 and pi/2 => make sure beta in [-pi; -pi/2[ U ]+pi/2; +pi]
    gamma = Math.atan2(m[6], -m[8]); // same remark as for alpha, multiplication by -1
  } else {
      // Case 3: m[8] = 0 <=> cB = 0 or cG = 0
      if (m[6] > 0) {
        // Subcase 1: cG = 0 and cB > 0
        //            cG = 0 <=> sG = -1 <=> gamma = -pi/2 => m[6] = cB
        //            Hence, m[6] > 0 <=> cB > 0 <=> beta in ]-pi/2; +pi/2[
        alpha = Math.atan2(-m[1], m[4]);
        beta = Math.asin(m[7]); // asin returns a number between -pi/2 and +pi/2 => OK
        gamma = -Math.PI / 2;
      } else if (m[6] < 0) {
        // Subcase 2: cG = 0 and cB < 0
        //            cG = 0 <=> sG = -1 <=> gamma = -pi/2 => m[6] = cB
        //            Hence, m[6] < 0 <=> cB < 0 <=> beta in [-pi; -pi/2[ U ]+pi/2; +pi]
        alpha = Math.atan2(m[1], -m[4]); // same remark as for alpha in a case above
        beta = -Math.asin(m[7]);
        beta += beta >= 0 ? -Math.PI : Math.PI; // asin returns a number between -pi/2 and +pi/2 => make sure beta in [-pi; -pi/2[ U ]+pi/2; +pi]
        gamma = -Math.PI / 2;
      } else {
        // Subcase 3: cB = 0
        // In the case where cos(beta) = 0 (i.e. beta = -pi/2 or beta = pi/2),
        // we have the gimbal lock problem: in that configuration, only the angle
        // alpha + gamma (if beta = +pi/2) or alpha - gamma (if beta = -pi/2)
        // are uniquely defined: alpha and gamma can take an infinity of values.
        // For convenience, let's set gamma = 0 (and thus sin(gamma) = 0).
        // (As a consequence of the gimbal lock problem, there is a discontinuity
        // in alpha and gamma.)
        alpha = Math.atan2(m[3], m[0]);
        beta = m[7] > 0 ? Math.PI / 2 : -Math.PI / 2;
        gamma = 0;
      }
    }

  // atan2 returns a number between -pi and pi => make sure that alpha is in [0, 2*pi[.
  alpha += alpha < 0 ? 2 * Math.PI : 0;

  eulerAngle[0] = alphaIsValid ? radToDeg(alpha) : null;
  eulerAngle[1] = radToDeg(beta);
  eulerAngle[2] = radToDeg(gamma);
}

/**
 * Converts a Euler angle `[alpha, beta, gamma]` to a Euler angle where:
 * - `alpha` is in [0; +360[;
 * - `beta` is in [-90; +90[;
 * - `gamma` is in [-180; +180[.
 * 
 * @param {number[]} eulerAngle - Euler angle to convert, represented by an array of length 3 (`[alpha, beta, gamma]`).
 */
function unifyAlt(eulerAngle) {
  // Convention here: Tait–Bryan angles Z-X'-Y'', where:
  //   alpha is in [0; +360[,
  //   beta is in [-90; +90[,
  //   gamma is in [-180; +180[.

  var alphaIsValid = typeof eulerAngle[0] === 'number';

  var _alpha = alphaIsValid ? degToRad(eulerAngle[0]) : 0;
  var _beta = degToRad(eulerAngle[1]);
  var _gamma = degToRad(eulerAngle[2]);

  var cA = Math.cos(_alpha);
  var cB = Math.cos(_beta);
  var cG = Math.cos(_gamma);
  var sA = Math.sin(_alpha);
  var sB = Math.sin(_beta);
  var sG = Math.sin(_gamma);

  var alpha = undefined,
      beta = undefined,
      gamma = undefined;

  var m = [cA * cG - sA * sB * sG, -cB * sA, cA * sG + cG * sA * sB, cG * sA + cA * sB * sG, cA * cB, sA * sG - cA * cG * sB, -cB * sG, sB, cB * cG];
  normalize(m);

  alpha = Math.atan2(-m[1], m[4]);
  alpha += alpha < 0 ? 2 * Math.PI : 0; // atan2 returns a number between -pi and +pi => make sure alpha is in [0, 2*pi[.
  beta = Math.asin(m[7]); // asin returns a number between -pi/2 and pi/2 => OK
  gamma = Math.atan2(-m[6], m[8]); // atan2 returns a number between -pi and +pi => OK

  eulerAngle[0] = alphaIsValid ? radToDeg(alpha) : null;
  eulerAngle[1] = radToDeg(beta);
  eulerAngle[2] = radToDeg(gamma);
}

/**
 * `DeviceOrientationModule` singleton.
 * The `DeviceOrientationModule` singleton provides the raw values
 * of the orientation provided by the `DeviceMotion` event.
 * It also instantiate the `Orientation` submodule that unifies those
 * values across platforms by making them compliant with {@link
 * http://www.w3.org/TR/orientation-event/|the W3C standard} (*i.e.*
 * the `alpha` angle between `0` and `360` degrees, the `beta` angle
 * between `-180` and `180` degrees, and `gamma` between `-90` and
 * `90` degrees), as well as the `OrientationAlt` submodules (with
 * the `alpha` angle between `0` and `360` degrees, the `beta` angle
 * between `-90` and `90` degrees, and `gamma` between `-180` and
 * `180` degrees).
 * When the `orientation` raw values are not provided by the sensors,
 * this modules tries to recalculate `beta` and `gamma` from the
 * `AccelerationIncludingGravity` module, if available (in that case,
 * the `alpha` angle is impossible to retrieve since the compass is
 * not available).
 *
 * @class DeviceMotionModule
 * @extends InputModule
 */

var DeviceOrientationModule = (function (_InputModule) {
  _inherits(DeviceOrientationModule, _InputModule);

  /**
   * Creates the `DeviceOrientation` module instance.
   *
   * @constructor
   */

  function DeviceOrientationModule() {
    _classCallCheck(this, DeviceOrientationModule);

    _get(Object.getPrototypeOf(DeviceOrientationModule.prototype), 'constructor', this).call(this, 'deviceorientation');

    /**
     * Raw values coming from the `deviceorientation` event sent by this module.
     *
     * @this DeviceOrientationModule
     * @type {number[]}
     * @default [null, null, null]
     */
    this.event = [null, null, null];

    /**
     * The `Orientation` module.
     * Provides unified values of the orientation compliant with {@link
     * http://www.w3.org/TR/orientation-event/|the W3C standard}
     * (`alpha` in `[0, 360]`, beta in `[-180, +180]`, `gamma` in `[-90, +90]`).
     *
     * @this DeviceOrientationModule
     * @type {DOMEventSubmodule}
     */
    this.orientation = new DOMEventSubmodule(this, 'orientation');

    /**
     * The `OrientationAlt` module.
     * Provides alternative values of the orientation
     * (`alpha` in `[0, 360]`, beta in `[-90, +90]`, `gamma` in `[-180, +180]`).
     *
     * @this DeviceOrientationModule
     * @type {DOMEventSubmodule}
     */
    this.orientationAlt = new DOMEventSubmodule(this, 'orientationAlt');

    /**
     * Required submodules / events.
     *
     * @this DeviceOrientationModule
     * @type {object}
     * @property {bool} orientation - Indicates whether the `orientation` unified values are required or not (defaults to `false`).
     * @property {bool} orientationAlt - Indicates whether the `orientationAlt` values are required or not (defaults to `false`).
     */
    this.required = {
      orientation: false,
      orientationAlt: false
    };

    /**
     * Number of listeners subscribed to the `DeviceOrientation` module.
     *
     * @this DeviceOrientationModule
     * @type {number}
     */
    this._numListeners = 0;

    /**
     * Resolve function of the module's promise.
     *
     * @this DeviceOrientationModule
     * @type {function}
     * @default null
     * @see DeviceOrientationModule#init
     */
    this._promiseResolve = null;

    /**
     * Gravity vector calculated from the `accelerationIncludingGravity` unified values.
     *
     * @this DeviceOrientationModule
     * @type {number[]}
     * @default [0, 0, 0]
     */
    this._estimatedGravity = [0, 0, 0];

    /**
     * Method binding of the sensor check.
     *
     * @this DeviceOrientationModule
     * @type {function}
     */
    this._deviceorientationCheck = this._deviceorientationCheck.bind(this);

    /**
     * Method binding of the `'deviceorientation'` event callback.
     *
     * @this DeviceOrientationModule
     * @type {function}
     */
    this._deviceorientationListener = this._deviceorientationListener.bind(this);
  }

  /**
   * Sensor check on initialization of the module.
   * This method:
   * - checks whether the `orientation` values are valid or not;
   * - (in the case where orientation raw values are not provided)
   *   tries to calculate the orientation from the
   *   `accelerationIncludingGravity` unified values.
   *
   * @param {DeviceMotionEvent} e - First `'devicemotion'` event caught, on which the check is done.
   */

  _createClass(DeviceOrientationModule, [{
    key: '_deviceorientationCheck',
    value: function _deviceorientationCheck(e) {
      this.isProvided = true;

      // Sensor availability for the orientation and alternative orientation
      var rawValuesProvided = typeof e.alpha === 'number' && typeof e.beta === 'number' && typeof e.gamma === 'number';
      this.orientation.isProvided = rawValuesProvided;
      this.orientationAlt.isProvided = rawValuesProvided;

      // TODO(?): get pseudo-period

      // We only need to listen to one event (=> remove the listener)
      window.removeEventListener('deviceorientation', this._deviceorientationCheck, false);

      // If orientation or alternative orientation are not provided by raw sensors but required,
      // try to calculate them with `accelerationIncludingGravity` unified values
      if (this.required.orientation && !this.orientation.isProvided || this.required.orientationAlt && !this.orientationAlt.isProvided) this._tryAccelerationIncludingGravityFallback();else this._promiseResolve(this);
    }

    /**
     * `'deviceorientation'` event callback.
     * This method emits an event with the raw `'deviceorientation'` values,
     * and emits events with the unified `orientation` and / or the
     * `orientationAlt` values if they are required.
     *
     * @param {DeviceOrientationEvent} e - `'deviceorientation'` event the values are calculated from.
     */
  }, {
    key: '_deviceorientationListener',
    value: function _deviceorientationListener(e) {
      // 'deviceorientation' event (raw values)
      var outEvent = this.event;

      outEvent[0] = e.alpha;
      outEvent[1] = e.beta;
      outEvent[2] = e.gamma;

      this.emit(outEvent);

      // 'orientation' event (unified values)
      if (this.required.orientation && this.orientation.isProvided) {
        // On iOS, the `alpha` value is initialized at `0` on the first `deviceorientation` event
        // so we keep that reference in memory to calculate the North later on
        if (!this.orientation._webkitCompassHeadingReference && e.webkitCompassHeading && platform.os.family === 'iOS') this.orientation._webkitCompassHeadingReference = e.webkitCompassHeading;

        var _outEvent = this.orientation.event;

        _outEvent[0] = e.alpha;
        _outEvent[1] = e.beta;
        _outEvent[2] = e.gamma;

        // On iOS, replace the `alpha` value by the North value and unify the angles
        // (the default representation of the angles on iOS is not compliant with the W3C specification)
        if (this.orientation._webkitCompassHeadingReference && platform.os.family === 'iOS') {
          _outEvent[0] += 360 - this.orientation._webkitCompassHeadingReference;
          unify(_outEvent);
        }

        this.orientation.emit(_outEvent);
      }

      // 'orientationAlt' event
      if (this.required.orientationAlt && this.orientationAlt.isProvided) {
        // On iOS, the `alpha` value is initialized at `0` on the first `deviceorientation` event
        // so we keep that reference in memory to calculate the North later on
        if (!this.orientationAlt._webkitCompassHeadingReference && e.webkitCompassHeading && platform.os.family === 'iOS') this.orientationAlt._webkitCompassHeadingReference = e.webkitCompassHeading;

        var _outEvent2 = this.orientationAlt.event;

        _outEvent2[0] = e.alpha;
        _outEvent2[1] = e.beta;
        _outEvent2[2] = e.gamma;

        // On iOS, replace the `alpha` value by the North value but do not convert the angles
        // (the default representation of the angles on iOS is compliant with the alternative representation)
        if (this.orientationAlt._webkitCompassHeadingReference && platform.os.family === 'iOS') {
          _outEvent2[0] -= this.orientationAlt._webkitCompassHeadingReference;
          _outEvent2[0] += _outEvent2[0] < 0 ? 360 : 0; // make sure `alpha` is in [0, +360[
        }

        // On Android, transform the angles to the alternative representation
        // (the default representation of the angles on Android is compliant with the W3C specification)
        if (platform.os.family === 'Android') unifyAlt(_outEvent2);

        this.orientationAlt.emit(_outEvent2);
      }
    }

    /**
     * Checks whether `beta` and `gamma` can be calculated from the `accelerationIncludingGravity` values or not.
     */
  }, {
    key: '_tryAccelerationIncludingGravityFallback',
    value: function _tryAccelerationIncludingGravityFallback() {
      var _this = this;

      MotionInput.requireModule('accelerationIncludingGravity').then(function (accelerationIncludingGravity) {
        if (accelerationIncludingGravity.isValid) {
          console.log("WARNING (motion-input): The 'deviceorientation' event does not exist or does not provide values in your browser, so the orientation of the device is estimated from DeviceMotion's 'accelerationIncludingGravity' event. Since the compass is not available, only the `beta` and `gamma` angles are provided (`alpha` is null).");

          if (_this.required.orientation) {
            _this.orientation.isCalculated = true;
            _this.orientation.period = accelerationIncludingGravity.period;

            MotionInput.addListener('accelerationIncludingGravity', function (accelerationIncludingGravity) {
              _this._calculateBetaAndGammaFromAccelerationIncludingGravity(accelerationIncludingGravity);
            });
          }

          if (_this.required.orientationAlt) {
            _this.orientationAlt.isCalculated = true;
            _this.orientationAlt.period = accelerationIncludingGravity.period;

            MotionInput.addListener('accelerationIncludingGravity', function (accelerationIncludingGravity) {
              _this._calculateBetaAndGammaFromAccelerationIncludingGravity(accelerationIncludingGravity, true);
            });
          }
        }

        _this._promiseResolve(_this);
      });
    }

    /**
     * Calculates and emits `beta` and `gamma` values as a fallback of the `orientation` and / or `orientationAlt` events, from the `accelerationIncludingGravity` unified values.
     *
     * @param {number[]} accelerationIncludingGravity - Latest `accelerationIncludingGravity raw values.
     * @param {bool} [alt=false] - Indicates whether we need the alternate representation of the angles or not.
     */
  }, {
    key: '_calculateBetaAndGammaFromAccelerationIncludingGravity',
    value: function _calculateBetaAndGammaFromAccelerationIncludingGravity(accelerationIncludingGravity) {
      var alt = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var k = 0.8;

      // Low pass filter to estimate the gravity
      this._estimatedGravity[0] = k * this._estimatedGravity[0] + (1 - k) * accelerationIncludingGravity[0];
      this._estimatedGravity[1] = k * this._estimatedGravity[1] + (1 - k) * accelerationIncludingGravity[1];
      this._estimatedGravity[2] = k * this._estimatedGravity[2] + (1 - k) * accelerationIncludingGravity[2];

      var _gX = this._estimatedGravity[0];
      var _gY = this._estimatedGravity[1];
      var _gZ = this._estimatedGravity[2];

      var norm = Math.sqrt(_gX * _gX + _gY * _gY + _gZ * _gZ);

      _gX /= norm;
      _gY /= norm;
      _gZ /= norm;

      // Adopting the following conventions:
      // - each matrix operates by pre-multiplying column vectors,
      // - each matrix represents an active rotation,
      // - each matrix represents the composition of intrinsic rotations,
      // the rotation matrix representing the composition of a rotation
      // about the x-axis by an angle beta and a rotation about the y-axis
      // by an angle gamma is:
      //
      // [ cos(gamma)               ,  0          ,  sin(gamma)              ,
      //   sin(beta) * sin(gamma)   ,  cos(beta)  ,  -cos(gamma) * sin(beta) ,
      //   -cos(beta) * sin(gamma)  ,  sin(beta)  ,  cos(beta) * cos(gamma)  ].
      //
      // Hence, the projection of the normalized gravity g = [0, 0, 1]
      // in the device's reference frame corresponds to:
      //
      // gX = -cos(beta) * sin(gamma),
      // gY = sin(beta),
      // gZ = cos(beta) * cos(gamma),
      //
      // so beta = asin(gY) and gamma = atan2(-gX, gZ).

      // Beta & gamma equations (we approximate [gX, gY, gZ] by [_gX, _gY, _gZ])
      var beta = radToDeg(Math.asin(_gY)); // beta is in [-pi/2; pi/2[
      var gamma = radToDeg(Math.atan2(-_gX, _gZ)); // gamma is in [-pi; pi[

      if (alt) {
        // In that case, there is nothing to do since the calculations above gave the angle in the right ranges
        var outEvent = this.orientationAlt.event;
        outEvent[0] = null;
        outEvent[1] = beta;
        outEvent[2] = gamma;

        this.orientationAlt.emit(outEvent);
      } else {
        // Here we have to unify the angles to get the ranges compliant with the W3C specification
        var outEvent = this.orientation.event;
        outEvent[0] = null;
        outEvent[1] = beta;
        outEvent[2] = gamma;
        unify(outEvent);

        this.orientation.emit(outEvent);
      }
    }

    /**
     * Increases the number of listeners to this module (either because someone listens
     * to this module, or one of the two `DOMEventSubmodules` (`Orientation`,
     * `OrientationAlt`).
     * When the number of listeners reaches `1`, adds a `'deviceorientation'`
     * event listener.
     *
     * @see DeviceOrientationModule#addListener
     * @see DOMEventSubmodule#start
     */
  }, {
    key: '_addListener',
    value: function _addListener() {
      this._numListeners++;

      if (this._numListeners === 1) window.addEventListener('deviceorientation', this._deviceorientationListener, false);
    }

    /**
     * Decreases the number of listeners to this module (either because someone stops
     * listening to this module, or one of the three `DOMEventSubmodules`
     * (`Orientation`, `OrientationAlt`).
     * When the number of listeners reaches `0`, removes the `'deviceorientation'`
     * event listener.
     *
     * @see DeviceOrientationModule#removeListener
     * @see DOMEventSubmodule#stop
     */
  }, {
    key: '_removeListener',
    value: function _removeListener() {
      this._numListeners--;

      if (this._numListeners === 0) {
        window.removeEventListener('deviceorientation', this._deviceorientationListener, false);
        this.orientation._webkitCompassHeadingReference = null; // don't forget to reset the compass reference since this reference is set each time we start listening to a `'deviceorientation'` event
      }
    }

    /**
     * Initializes of the module.
     *
     * @return {Promise}
     */
  }, {
    key: 'init',
    value: function init() {
      var _this2 = this;

      return _get(Object.getPrototypeOf(DeviceOrientationModule.prototype), 'init', this).call(this, function (resolve) {
        _this2._promiseResolve = resolve;

        if (window.DeviceOrientationEvent) window.addEventListener('deviceorientation', _this2._deviceorientationCheck, false);else if (_this2.required.orientation) _this2._tryAccelerationIncludingGravityFallback();else resolve(_this2);
      });
    }

    /**
     * Adds a listener to this module.
     * 
     * @param {function} listener - Listener to add.
     */
  }, {
    key: 'addListener',
    value: function addListener(listener) {
      _get(Object.getPrototypeOf(DeviceOrientationModule.prototype), 'addListener', this).call(this, listener);
      this._addListener();
    }

    /**
     * Removes a listener from this module.
     *
     * @param {function} listener - Listener to remove.
     */
  }, {
    key: 'removeListener',
    value: function removeListener(listener) {
      _get(Object.getPrototypeOf(DeviceOrientationModule.prototype), 'removeListener', this).call(this, listener);
      this._removeListener();
    }
  }]);

  return DeviceOrientationModule;
})(InputModule);

module.exports = new DeviceOrientationModule();

},{"./DOMEventSubmodule":12,"./InputModule":16,"./MotionInput":17,"babel-runtime/helpers/class-call-check":26,"babel-runtime/helpers/create-class":27,"babel-runtime/helpers/get":28,"babel-runtime/helpers/inherits":29,"platform":71}],15:[function(require,module,exports){
/**
 * @fileoverview Energy module
 * @author <a href='mailto:sebastien@robaszkiewicz.com'>Sébastien Robaszkiewicz</a>, <a href='mailto:Norbert.Schnell@ircam.fr'>Norbert Schnell</a>
 */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var InputModule = require('./InputModule');
var MotionInput = require('./MotionInput');

/**
 * Energy module singleton.
 * The energy module singleton provides energy values (between 0 and 1)
 * based on the acceleration and the rotation rate of the device.
 * The period of the energy values is the same as the period of the
 * acceleration and the rotation rate values.
 *
 * @class EnergyModule
 * @extends InputModule
 */

var EnergyModule = (function (_InputModule) {
  _inherits(EnergyModule, _InputModule);

  /**
   * Creates the energy module instance.
   *
   * @constructor
   */

  function EnergyModule() {
    _classCallCheck(this, EnergyModule);

    _get(Object.getPrototypeOf(EnergyModule.prototype), 'constructor', this).call(this, 'energy');

    /**
     * Event containing the value of the energy, sent by the energy module.
     *
     * @this EnergyModule
     * @type {number}
     * @default 0
     */
    this.event = 0;

    /**
     * The acceleration module, used in the calculation of the energy.
     *
     * @this EnergyModule
     * @type {DOMEventSubmodule}
     * @default null
     * @see DevicemotionModule
     */
    this._accelerationModule = null;

    /**
     * Latest acceleration value sent by the acceleration module.
     *
     * @this EnergyModule
     * @type {number[]}
     * @default null
     */
    this._accelerationValues = null;

    /**
     * Maximum value reached by the acceleration magnitude, clipped at `this._accelerationMagnitudeThreshold`.
     *
     * @this EnergyModule
     * @type {number}
     * @default 9.81
     */
    this._accelerationMagnitudeCurrentMax = 9.81;

    /**
     * Clipping value of the acceleration magnitude.
     *
     * @this EnergyModule
     * @type {number}
     * @default 20
     * @constant
     */
    this._accelerationMagnitudeThreshold = 20;

    /**
     * The rotation rate module, used in the calculation of the energy.
     *
     * @this EnergyModule
     * @type {DOMEventSubmodule}
     * @default null
     * @see DevicemotionModule
     */
    this._rotationRateModule = null;

    /**
     * Latest rotation rate value sent by the rotation rate module.
     *
     * @this EnergyModule
     * @type {number[]}
     * @default null
     */
    this._rotationRateValues = null;

    /**
     * Maximum value reached by the rotation rate magnitude, clipped at `this._rotationRateMagnitudeThreshold`.
     *
     * @this EnergyModule
     * @type {number}
     * @default 200
     */
    this._rotationRateMagnitudeCurrentMax = 200;

    /**
     * Clipping value of the rotation rate magnitude.
     *
     * @this EnergyModule
     * @type {number}
     * @default 600
     * @constant
     */
    this._rotationRateMagnitudeThreshold = 600;

    /**
     * Time constant (half-life) of the low-pass filter used to smooth the energy values (in seconds).
     *
     * @this EnergyModule
     * @type {number}
     * @default 0.1
     * @constant
     */
    this._energyTimeConstant = 0.1;

    /**
     * Method binding of the acceleration values callback.
     *
     * @this EnergyModule
     * @type {function}
     */
    this._onAcceleration = this._onAcceleration.bind(this);

    /**
     * Method binding of the rotation rate values callback.
     *
     * @this EnergyModule
     * @type {function}
     */
    this._onRotationRate = this._onRotationRate.bind(this);
  }

  /**
   * Decay factor of the low-pass filter used to smooth the energy values.
   *
   * @type {number}
   * @readonly
   */

  _createClass(EnergyModule, [{
    key: 'init',

    /**
     * Initializes of the module.
     *
     * @return {Promise}
     */
    value: function init() {
      var _this = this;

      return _get(Object.getPrototypeOf(EnergyModule.prototype), 'init', this).call(this, function (resolve) {
        // The energy module requires the acceleration and the rotation rate modules
        _Promise.all([MotionInput.requireModule('acceleration'), MotionInput.requireModule('rotationRate')]).then(function (modules) {
          var _modules = _slicedToArray(modules, 2);

          var acceleration = _modules[0];
          var rotationRate = _modules[1];

          _this._accelerationModule = acceleration;
          _this._rotationRateModule = rotationRate;
          _this.isCalculated = _this._accelerationModule.isValid || _this._rotationRateModule.isValid;

          if (_this._accelerationModule.isValid) _this.period = _this._accelerationModule.period;else if (_this._rotationRateModule.isValid) _this.period = _this._rotationRateModule.period;

          resolve(_this);
        });
      });
    }

    /**
     * Start the module.
     */
  }, {
    key: 'start',
    value: function start() {
      // TODO(?): make this method private
      if (this._accelerationModule.isValid) MotionInput.addListener('acceleration', this._onAcceleration);
      if (this._rotationRateModule.isValid) MotionInput.addListener('rotationRate', this._onRotationRate);
    }

    /**
     * Stop the module.
     */
  }, {
    key: 'stop',
    value: function stop() {
      // TODO(?): make this method private
      if (this._accelerationModule.isValid) MotionInput.removeListener('acceleration', this._onAcceleration);
      if (this._rotationRateModule.isValid) MotionInput.removeListener('rotationRate', this._onRotationRate);
    }

    /**
     * Acceleration values handler.
     *
     * @param {number[]} acceleration - Latest acceleration value.
     */
  }, {
    key: '_onAcceleration',
    value: function _onAcceleration(acceleration) {
      this._accelerationValues = acceleration;

      // If the rotation rate values are not available, we calculate the energy right away.
      if (!this._rotationRateModule.isValid) this._calculateEnergy();
    }

    /**
     * Rotation rate values handler.
     *
     * @param {number[]} rotationRate - Latest rotation rate value.
     */
  }, {
    key: '_onRotationRate',
    value: function _onRotationRate(rotationRate) {
      this._rotationRateValues = rotationRate;

      // We know that the acceleration and rotation rate values coming from the
      // same `devicemotion` event are sent in that order (acceleration > rotation rate)
      // so when the rotation rate is provided, we calculate the energy value of the
      // latest `devicemotion` event when we receive the rotation rate values.
      this._calculateEnergy();
    }

    /**
     * Energy calculation: emits an energy value between 0 and 1.
     *
     * This method checks if the acceleration modules is valid. If that is the case,
     * it calculates an estimation of the energy (between 0 and 1) based on the ratio
     * of the current acceleration magnitude and the maximum acceleration magnitude
     * reached so far (clipped at the `this._accelerationMagnitudeThreshold` value).
     * (We use this trick to get uniform behaviors among devices. If we calculated
     * the ratio based on a fixed value independent of what the device is capable of
     * providing, we could get inconsistent behaviors. For instance, the devices
     * whose accelerometers are limited at 2g would always provide very low values
     * compared to devices with accelerometers capable of measuring 4g accelerations.)
     * The same checks and calculations are made on the rotation rate module.
     * Finally, the energy value is the maximum between the energy value estimated
     * from the acceleration, and the one estimated from the rotation rate. It is
     * smoothed through a low-pass filter.
     */
  }, {
    key: '_calculateEnergy',
    value: function _calculateEnergy() {
      var accelerationEnergy = 0;
      var rotationRateEnergy = 0;

      // Check the acceleration module and calculate an estimation of the energy value from the latest acceleration value
      if (this._accelerationModule.isValid) {
        var aX = this._accelerationValues[0];
        var aY = this._accelerationValues[1];
        var aZ = this._accelerationValues[2];
        var accelerationMagnitude = Math.sqrt(aX * aX + aY * aY + aZ * aZ);

        // Store the maximum acceleration magnitude reached so far, clipped at `this._accelerationMagnitudeThreshold`
        if (this._accelerationMagnitudeCurrentMax < accelerationMagnitude) this._accelerationMagnitudeCurrentMax = Math.min(accelerationMagnitude, this._accelerationMagnitudeThreshold);
        // TODO(?): remove ouliers --- on some Android devices, the magnitude is very high on a few isolated datapoints,
        // which make the threshold very high as well => the energy remains around 0.5, even when you shake very hard.

        accelerationEnergy = Math.min(accelerationMagnitude / this._accelerationMagnitudeCurrentMax, 1);
      }

      // Check the rotation rate module and calculate an estimation of the energy value from the latest rotation rate value
      if (this._rotationRateModule.isValid) {
        var rA = this._rotationRateValues[0];
        var rB = this._rotationRateValues[1];
        var rG = this._rotationRateValues[2];
        var rotationRateMagnitude = Math.sqrt(rA * rA + rB * rB + rG * rG);

        // Store the maximum rotation rate magnitude reached so far, clipped at `this._rotationRateMagnitudeThreshold`
        if (this._rotationRateMagnitudeCurrentMax < rotationRateMagnitude) this._rotationRateMagnitudeCurrentMax = Math.min(rotationRateMagnitude, this._rotationRateMagnitudeThreshold);

        rotationRateEnergy = Math.min(rotationRateMagnitude / this._rotationRateMagnitudeCurrentMax, 1);
      }

      var energy = Math.max(accelerationEnergy, rotationRateEnergy);

      // Low-pass filter to smooth the energy values
      var k = this._energyDecay;
      this.event = k * this.event + (1 - k) * energy;

      // Emit the energy value
      this.emit(this.event);
    }
  }, {
    key: '_energyDecay',
    get: function get() {
      return Math.exp(-2 * Math.PI * this.period / this._energyTimeConstant);
    }
  }]);

  return EnergyModule;
})(InputModule);

module.exports = new EnergyModule();

},{"./InputModule":16,"./MotionInput":17,"babel-runtime/core-js/promise":25,"babel-runtime/helpers/class-call-check":26,"babel-runtime/helpers/create-class":27,"babel-runtime/helpers/get":28,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/sliced-to-array":30}],16:[function(require,module,exports){
/**
 * @fileoverview `InputModule` module
 * @author <a href='mailto:sebastien@robaszkiewicz.com'>Sébastien Robaszkiewicz</a>, <a href='mailto:Norbert.Schnell@ircam.fr'>Norbert Schnell</a>
 */

'use strict';

/**
 * `InputModule` class.
 * The `InputModule` class allows to instantiate modules that are part of the
 * motion input module, and that provide values (for instance, `deviceorientation`,
 * `acceleration`, `energy`).
 *
 * @class InputModule
 */

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var InputModule = (function () {

  /**
   * Creates an `InputModule` module instance.
   *
   * @constructor
   * @param {string} eventType - Name of the module / event (*e.g.* `deviceorientation, 'acceleration', 'energy').
   */

  function InputModule(eventType) {
    _classCallCheck(this, InputModule);

    /**
     * Event type of the module.
     *
     * @this InputModule
     * @type {string}
     * @constant
     */
    this.eventType = eventType;

    /**
     * Array of listeners attached to this module / event.
     *
     * @this InputModule
     * @type {function[]}
     * @default []
     */
    this.listeners = [];

    /**
     * Event sent by this module.
     *
     * @this InputModule
     * @type {number|number[]}
     * @default null
     */
    this.event = null;

    /**
     * Module promise (resolved when the module is initialized).
     *
     * @this InputModule
     * @type {Promise}
     * @default null
     */
    this.promise = null;

    /**
     * Indicates if the module's event values are calculated from parent modules / events.
     *
     * @this InputModule
     * @type {bool}
     * @default false
     */
    this.isCalculated = false;

    /**
     * Indicates if the module's event values are provided by the device's sensors.
     * (*I.e.* indicates if the `'devicemotion'` or `'deviceorientation'` events provide the required raw values.)
     *
     * @this InputModule
     * @type {bool}
     * @default false
     */
    this.isProvided = false;

    /**
     * Period at which the module's events are sent (`undefined` if the events are not sent at regular intervals).
     *
     * @this InputModule
     * @type {number}
     * @default undefined
     */
    this.period = undefined;
  }

  /**
   * Indicates whether the module can provide values or not.
   *
   * @type {bool}
   * @readonly
   */

  _createClass(InputModule, [{
    key: 'init',

    /**
     * Initializes the module.
     *
     * @param {function} promiseFun - Promise function that takes the `resolve` and `reject` functions as arguments.
     * @return {Promise}
     */
    value: function init(promiseFun) {
      this.promise = new _Promise(promiseFun);
      return this.promise;
    }

    /**
     * Starts the module.
     */
  }, {
    key: 'start',
    value: function start() {}
    // abstract method

    /**
     * Stops the module.
     */

  }, {
    key: 'stop',
    value: function stop() {}
    // abstract method

    /**
     * Adds a listener to the module.
     *
     * @param {function} listener - Listener to add.
     */

  }, {
    key: 'addListener',
    value: function addListener(listener) {
      this.listeners.push(listener);

      // Start the module as soon as there is a listener
      if (this.listeners.length === 1) this.start();
    }

    /**
     * Removes a listener from the module.
     *
     * @param {function} listener - Listener to remove.
     */
  }, {
    key: 'removeListener',
    value: function removeListener(listener) {
      var index = this.listeners.indexOf(listener);
      this.listeners.splice(index, 1);

      // Stop the module id there are no listeners
      if (this.listeners.length === 0) this.stop();
    }

    /**
     * Propagates an event to all the module's listeners.
     *
     * @param {number|number[]} [event=this.event] - Event values to propagate to the module's listeners.
     */
  }, {
    key: 'emit',
    value: function emit() {
      var event = arguments.length <= 0 || arguments[0] === undefined ? this.event : arguments[0];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _getIterator(this.listeners), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var listener = _step.value;

          listener(event);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'isValid',
    get: function get() {
      return this.isProvided || this.isCalculated;
    }
  }]);

  return InputModule;
})();

module.exports = InputModule;

},{"babel-runtime/core-js/get-iterator":19,"babel-runtime/core-js/promise":25,"babel-runtime/helpers/class-call-check":26,"babel-runtime/helpers/create-class":27}],17:[function(require,module,exports){
/**
 * @fileoverview `MotionInput` module
 * @author <a href='mailto:sebastien@robaszkiewicz.com'>Sébastien Robaszkiewicz</a>, <a href='mailto:Norbert.Schnell@ircam.fr'>Norbert Schnell</a>
 */

'use strict';

/**
 * `MotionInput` singleton.
 * The `MotionInput` singleton allows to initialize motion events
 * and to listen to them.
 * 
 * @class MotionInput
 */

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var MotionInput = (function () {

  /**
   * Creates the `MotionInput` module instance.
   *
   * @constructor
   */

  function MotionInput() {
    _classCallCheck(this, MotionInput);

    /**
     * Pool of all available modules.
     *
     * @this MotionInput
     * @type {object}
     * @default {}
     */
    this.modules = {};
  }

  /**
   * Adds a module to the `MotionInput` module.
   *
   * @param {string} eventType - Name of the event type.
   * @param {InputModule} module - Module to add to the `MotionInput` module.
   */

  _createClass(MotionInput, [{
    key: 'addModule',
    value: function addModule(eventType, module) {
      this.modules[eventType] = module;
    }

    /**
     * Gets a module.
     *
     * @param {string} eventType - Name of the event type (module) to retrieve.
     * @return {InputModule}
     */
  }, {
    key: 'getModule',
    value: function getModule(eventType) {
      return this.modules[eventType];
    }

    /**
     * Requires a module.
     * If the module has been initialized alread, returns its promise. Otherwise,
     * initializes the module.
     *
     * @param {string} eventType - Name of the event type (module) to require.
     * @return {Promise}
     */
  }, {
    key: 'requireModule',
    value: function requireModule(eventType) {
      var module = this.getModule(eventType);

      if (module.promise) return module.promise;

      return module.init();
    }

    /**
     * Initializes the `MotionInput` module.
     *
     * @param {string[]} ...eventTypes - Array of the event types to initialize.
     * @return {Promise}
     */
  }, {
    key: 'init',
    value: function init() {
      var _this = this;

      for (var _len = arguments.length, eventTypes = Array(_len), _key = 0; _key < _len; _key++) {
        eventTypes[_key] = arguments[_key];
      }

      var modulePromises = eventTypes.map(function (value) {
        var module = _this.getModule(value);
        return module.init();
      });

      return _Promise.all(modulePromises);
    }

    /**
     * Adds a listener.
     *
     * @param {string} eventType - Name of the event type (module) to add a listener to.
     * @param {function} listener - Listener to add.
     */
  }, {
    key: 'addListener',
    value: function addListener(eventType, listener) {
      var module = this.getModule(eventType);
      module.addListener(listener);
    }

    /**
     * Removes a listener.
     *
     * @param {string} eventType - Name of the event type (module) to add a listener to.
     * @param {function} listener - Listener to remove.
     */
  }, {
    key: 'removeListener',
    value: function removeListener(eventType, listener) {
      var module = this.getModule(eventType);
      module.removeListener(listener);
    }
  }]);

  return MotionInput;
})();

module.exports = new MotionInput();

},{"babel-runtime/core-js/promise":25,"babel-runtime/helpers/class-call-check":26,"babel-runtime/helpers/create-class":27}],18:[function(require,module,exports){
/**
 * @fileoverview Motion input index file
 * @author <a href='mailto:sebastien@robaszkiewicz.com'>Sébastien Robaszkiewicz</a>, <a href='mailto:Norbert.Schnell@ircam.fr'>Norbert Schnell</a>
 * @description The motion input module can be used as follows:
 * ```
 * const input = require('motion-input');
 * const requiredEvents = ['acceleration', 'orientation', 'energy'];
 * 
 * input
 *  .init(requiredEvents)
 *  .then((modules) => {
 *    const [acceleration, orientation, energy] = modules;
 *
 *    if (acceleration.isValid) {
 *      input.addListener('acceleration', (val) => {
 *        console.log('acceleration', val);
 *        // do something with the acceleration values
 *      });
 *    }
 *
 *    // do something else with the other modules
 *  });
 * ```
 */

'use strict';

var motionInput = require('./dist/MotionInput');
var deviceorientationModule = require('./dist/DeviceOrientationModule');
var devicemotionModule = require('./dist/DeviceMotionModule');
var energy = require('./dist/EnergyModule');

motionInput.addModule('devicemotion', devicemotionModule);
motionInput.addModule('deviceorientation', deviceorientationModule);
motionInput.addModule('accelerationIncludingGravity', devicemotionModule.accelerationIncludingGravity);
motionInput.addModule('acceleration', devicemotionModule.acceleration);
motionInput.addModule('rotationRate', devicemotionModule.rotationRate);
motionInput.addModule('orientation', deviceorientationModule.orientation);
motionInput.addModule('orientationAlt', deviceorientationModule.orientationAlt);
motionInput.addModule('energy', energy);

module.exports = motionInput;
},{"./dist/DeviceMotionModule":13,"./dist/DeviceOrientationModule":14,"./dist/EnergyModule":15,"./dist/MotionInput":17}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":31}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":32}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":33}],22:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"core-js/library/fn/object/define-property":34,"dup":6}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":35}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":36}],25:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":37}],26:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],27:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"babel-runtime/core-js/object/define-property":22,"dup":8}],28:[function(require,module,exports){
"use strict";

var _Object$getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor")["default"];

exports["default"] = function get(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;
    desc = parent = getter = undefined;
    _again = false;
    if (object === null) object = Function.prototype;

    var desc = _Object$getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
        _x2 = property;
        _x3 = receiver;
        _again = true;
        continue _function;
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  }
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/get-own-property-descriptor":23}],29:[function(require,module,exports){
"use strict";

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

var _Object$setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of")["default"];

exports["default"] = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = _Object$create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/create":21,"babel-runtime/core-js/object/set-prototype-of":24}],30:[function(require,module,exports){
"use strict";

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _isIterable = require("babel-runtime/core-js/is-iterable")["default"];

exports["default"] = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = _getIterator(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (_isIterable(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/get-iterator":19,"babel-runtime/core-js/is-iterable":20}],31:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
require('../modules/core.iter-helpers');
module.exports = require('../modules/$').core.getIterator;
},{"../modules/$":51,"../modules/core.iter-helpers":63,"../modules/es6.string.iterator":69,"../modules/web.dom.iterable":70}],32:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
require('../modules/core.iter-helpers');
module.exports = require('../modules/$').core.isIterable;
},{"../modules/$":51,"../modules/core.iter-helpers":63,"../modules/es6.string.iterator":69,"../modules/web.dom.iterable":70}],33:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":51}],34:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"../../modules/$":51,"dup":9}],35:[function(require,module,exports){
var $ = require('../../modules/$');
require('../../modules/es6.object.statics-accept-primitives');
module.exports = function getOwnPropertyDescriptor(it, key){
  return $.getDesc(it, key);
};
},{"../../modules/$":51,"../../modules/es6.object.statics-accept-primitives":66}],36:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/$').core.Object.setPrototypeOf;
},{"../../modules/$":51,"../../modules/es6.object.set-prototype-of":65}],37:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$').core.Promise;
},{"../modules/$":51,"../modules/es6.object.to-string":67,"../modules/es6.promise":68,"../modules/es6.string.iterator":69,"../modules/web.dom.iterable":70}],38:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":51}],39:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":51,"./$.wks":62}],40:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":38}],41:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp.prototype = C.prototype;
    }(out);
    else exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
    // export
    exports[key] = exp;
    if(isProto)(exports.prototype || (exports.prototype = {}))[key] = out;
  }
}
module.exports = $def;
},{"./$":51}],42:[function(require,module,exports){
var $        = require('./$')
  , document = $.g.document
  , isObject = $.isObject
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$":51}],43:[function(require,module,exports){
var ctx  = require('./$.ctx')
  , get  = require('./$.iter').get
  , call = require('./$.iter-call');
module.exports = function(iterable, entries, fn, that){
  var iterator = get(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done){
    if(call(iterator, f, step.value, entries) === false){
      return call.close(iterator);
    }
  }
};
},{"./$.ctx":40,"./$.iter":50,"./$.iter-call":47}],44:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10}],45:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var $ = require('./$')
  , toString = {}.toString
  , getNames = $.getNames;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

function getWindowNames(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
}

module.exports.get = function getOwnPropertyNames(it){
  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
  return getNames($.toObject(it));
};
},{"./$":51}],46:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],47:[function(require,module,exports){
var assertObject = require('./$.assert').obj;
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function call(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;
},{"./$.assert":38}],48:[function(require,module,exports){
var $def            = require('./$.def')
  , $redef          = require('./$.redef')
  , $               = require('./$')
  , cof             = require('./$.cof')
  , $iter           = require('./$.iter')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values'
  , Iterators       = $iter.Iterators;
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  $iter.create(Constructor, NAME, next);
  function createMethod(kind){
    function $$(that){
      return new Constructor(that, kind);
    }
    switch(kind){
      case KEYS: return function keys(){ return $$(this); };
      case VALUES: return function values(){ return $$(this); };
    } return function entries(){ return $$(this); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = $.getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    cof.set(IteratorPrototype, TAG, true);
    // FF fix
    if($.FW && $.has(proto, FF_ITERATOR))$iter.set(IteratorPrototype, $.that);
  }
  // Define iterator
  if($.FW || FORCE)$iter.set(proto, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = $.that;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};
},{"./$":51,"./$.cof":39,"./$.def":41,"./$.iter":50,"./$.redef":53,"./$.wks":62}],49:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":62}],50:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , cof               = require('./$.cof')
  , classof           = cof.classof
  , assert            = require('./$.assert')
  , assertObject      = assert.obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = require('./$.shared')('iterators')
  , IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol;
    return (Symbol && Symbol.iterator || FF_ITERATOR) in O
      || SYMBOL_ITERATOR in O
      || $.has(Iterators, classof(O));
  },
  get: function(it){
    var Symbol = $.g.Symbol
      , getIter;
    if(it != undefined){
      getIter = it[Symbol && Symbol.iterator || FF_ITERATOR]
        || it[SYMBOL_ITERATOR]
        || Iterators[classof(it)];
    }
    assert($.isFunction(getIter), it, ' is not iterable!');
    return assertObject(getIter.call(it));
  },
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  }
};
},{"./$":51,"./$.assert":38,"./$.cof":39,"./$.shared":56,"./$.wks":62}],51:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./$.fw":44,"dup":11}],52:[function(require,module,exports){
var $redef = require('./$.redef');
module.exports = function(target, src){
  for(var key in src)$redef(target, key, src[key]);
  return target;
};
},{"./$.redef":53}],53:[function(require,module,exports){
module.exports = require('./$').hide;
},{"./$":51}],54:[function(require,module,exports){
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],55:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
function check(O, proto){
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":51,"./$.assert":38,"./$.ctx":40}],56:[function(require,module,exports){
var $      = require('./$')
  , SHARED = '__core-js_shared__'
  , store  = $.g[SHARED] || ($.g[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$":51}],57:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if($.DESC && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};
},{"./$":51,"./$.wks":62}],58:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String($.assertDefined(that))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":51}],59:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , cel    = require('./$.dom-create')
  , global             = $.g
  , isFunction         = $.isFunction
  , html               = $.html
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(global.addEventListener && isFunction(global.postMessage) && !global.importScripts){
    defer = function(id){
      global.postMessage(id, '*');
    };
    global.addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":51,"./$.cof":39,"./$.ctx":40,"./$.dom-create":42,"./$.invoke":46}],60:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++sid + Math.random()).toString(36));
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":51}],61:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],62:[function(require,module,exports){
var global = require('./$').g
  , store  = require('./$.shared')('wks');
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":51,"./$.shared":56,"./$.uid":60}],63:[function(require,module,exports){
var core  = require('./$').core
  , $iter = require('./$.iter');
core.isIterable  = $iter.is;
core.getIterator = $iter.get;
},{"./$":51,"./$.iter":50}],64:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":51,"./$.iter":50,"./$.iter-define":48,"./$.uid":60,"./$.unscope":61}],65:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.def":41,"./$.set-proto":55}],66:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
, function(KEY, ID){
  var fn     = ($.core.Object || {})[KEY] || Object[KEY]
    , forced = 0
    , method = {};
  method[KEY] = ID == 0 ? function freeze(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 1 ? function seal(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 2 ? function preventExtensions(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 3 ? function isFrozen(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 4 ? function isSealed(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 5 ? function isExtensible(it){
    return isObject(it) ? fn(it) : false;
  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : ID == 7 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : ID == 8 ? function keys(it){
    return fn(toObject(it));
  } : require('./$.get-names').get;
  try {
    fn('z');
  } catch(e){
    forced = 1;
  }
  $def($def.S + $def.F * forced, 'Object', method);
});
},{"./$":51,"./$.def":41,"./$.get-names":45}],67:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if(require('./$').FW && cof(tmp) != 'z'){
  require('./$.redef')(Object.prototype, 'toString', function toString(){
    return '[object ' + cof.classof(this) + ']';
  }, true);
}
},{"./$":51,"./$.cof":39,"./$.redef":53,"./$.wks":62}],68:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , setProto = require('./$.set-proto').set
  , same     = require('./$.same')
  , species  = require('./$.species')
  , SPECIES  = require('./$.wks')('species')
  , RECORD   = require('./$.uid').safe('record')
  , PROMISE  = 'Promise'
  , global   = $.g
  , process  = global.process
  , isNode   = cof(process) == 'process'
  , asap     = process && process.nextTick || require('./$.task').set
  , P        = global[PROMISE]
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , Wrapper;

function testResolve(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
}

var useNative = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = isFunction(P) && isFunction(P.resolve) && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && $.DESC){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
function isPromise(it){
  return isObject(it) && (useNative ? cof.classof(it) == 'Promise' : RECORD in it);
}
function sameConstructor(a, b){
  // library wrapper special case
  if(!$.FW && a === P && b === Wrapper)return true;
  return same(a, b);
}
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  if(isObject(it))then = it.then;
  return isFunction(then) ? then : false;
}
function notify(record){
  var chain = record.c;
  // strange IE + webpack dev server bug - use .call(global)
  if(chain.length)asap.call(global, function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    function run(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
  });
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function $reject(value){
  var record = this
    , promise;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  setTimeout(function(){
    // strange IE + webpack dev server bug - use .call(global)
    asap.call(global, function(){
      if(isUnhandled(promise = record.p)){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(global.console && console.error){
          console.error('Unhandled promise rejection', value);
        }
      }
      record.a = undefined;
    });
  }, 1);
  notify(record);
}
function $resolve(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      // strange IE + webpack dev server bug - use .call(global)
      asap.call(global, function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
}

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE),       // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.mix')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      if(record.s)notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
cof.set(P, PROMISE);
species(P);
species(Wrapper = $.core[PROMISE]);

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new (getConstructor(this))(function(res, rej){ rej(r); });
  }
});
$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isPromise(x) && sameConstructor(x.constructor, this)
      ? x : new this(function(res){ res(x); });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":51,"./$.assert":38,"./$.cof":39,"./$.ctx":40,"./$.def":41,"./$.for-of":43,"./$.iter-detect":49,"./$.mix":52,"./$.same":54,"./$.set-proto":55,"./$.species":57,"./$.task":59,"./$.uid":60,"./$.wks":62}],69:[function(require,module,exports){
var set   = require('./$').set
  , $at   = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = $at(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":51,"./$.iter":50,"./$.iter-define":48,"./$.string-at":58,"./$.uid":60}],70:[function(require,module,exports){
require('./es6.array.iterator');
var $           = require('./$')
  , Iterators   = require('./$.iter').Iterators
  , ITERATOR    = require('./$.wks')('iterator')
  , ArrayValues = Iterators.Array
  , NL          = $.g.NodeList
  , HTC         = $.g.HTMLCollection
  , NLProto     = NL && NL.prototype
  , HTCProto    = HTC && HTC.prototype;
if($.FW){
  if(NL && !(ITERATOR in NLProto))$.hide(NLProto, ITERATOR, ArrayValues);
  if(HTC && !(ITERATOR in HTCProto))$.hide(HTCProto, ITERATOR, ArrayValues);
}
Iterators.NodeList = Iterators.HTMLCollection = ArrayValues;
},{"./$":51,"./$.iter":50,"./$.wks":62,"./es6.array.iterator":64}],71:[function(require,module,exports){
(function (global){
/*!
 * Platform.js v1.3.0 <http://mths.be/platform>
 * Copyright 2010-2014 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object` */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object */
  var oldRoot = root;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Opera regexp */
  var reOpera = /\bOpera/;

  /** Possible global object */
  var thisBinding = this;

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // platform tokens defined at
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '6.4':  '10',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // detect Windows version from platform tokens
    if (pattern && label && /^Win/i.test(os) &&
        (data = data[0/*Opera 9.25 fix*/, /[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // correct character case and cleanup
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object */
    var context = root;

    /** Used to flag when a custom context is provided */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // juggle arguments
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object */
    var nav = context.navigator || {};

    /** Browser user agent string */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope] */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environment */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based)
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]` */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime */
    var data;

    /** The CPU architecture */
    var arch = ua;

    /** Platform description array */
    var description = [];

    /** Platform alpha/beta indicator */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform */
    var useFeatures = ua == userAgent;

    /** The browser/environment version */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important) */
    var layout = getLayout([
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important) */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      'Midori',
      'Nook Browser',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      'Sunrise',
      'Swiftfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important) */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nook',
      'PlayBook',
      'PlayStation 4',
      'PlayStation 3',
      'PlayStation Vita',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation 4': 1, 'PlayStation 3': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable OSes (order is important) */
    var os = getOS([
      'Windows Phone ',
      'Android',
      'CentOS',
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // lookup the manufacturer by product or scan the UA for the manufacturer
        return result || (
          value[product] ||
          value[0/*Opera 9.25 fix*/, /^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // split by forward slash and append product version if needed
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // correct character case and cleanup
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // convert layout to an array so we can add extra details
    layout && (layout = [layout]);

    // detect product names that contain their manufacturer's name
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // clean up Google TV
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // detect simulators
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // detect iOS
    if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // detect Kubuntu
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // detect Android browsers
    else if (manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // detect false positives for Firefox/Safari
    else if (!name || (data = !/\bMinefield\b|\(Android;/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // escape the `/` for Firefox 1
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // clear name of false positives
        name = null;
      }
      // reassign a generic name
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // detect Firefox OS
    if ((data = /\((Mobile|Tablet).*?Firefox\b/i.exec(ua)) && data[1]) {
      os = 'Firefox OS';
      if (!product) {
        product = data[1];
      }
    }
    // detect non-Opera versions (order is important)
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // detect stubborn layout engines
    if (layout == 'iCab' && parseFloat(version) > 3) {
      layout = ['WebKit'];
    } else if (
        layout != 'Trident' &&
        (data =
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident')
        )
    ) {
      layout = [data];
    }
    // detect NetFront on PlayStation
    else if (/\bPlayStation\b(?! Vita\b)/i.test(name) && layout == 'WebKit') {
      layout = ['NetFront'];
    }
    // detect Windows Phone 7 desktop mode
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // detect Windows Phone 8+ desktop mode
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8+';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // detect IE 11 and above
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (!/\bWPDesktop\b/i.test(ua)) {
        if (name) {
          description.push('identifying as ' + name + (version ? ' ' + version : ''));
        }
        name = 'IE';
      }
      version = data[1];
    }
    // detect IE Tech Preview
    else if ((name == 'Chrome' || name != 'IE') && (data = /\bEdge\/([\d.]+)/.exec(ua))) {
      name = 'IE';
      version = data[1];
      layout = ['Trident'];
      description.unshift('platform preview');
    }
    // leverage environment features
    if (useFeatures) {
      // detect server-side environments
      // Rhino has a global function while others have a global object
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (isModuleScope && isHostType(context, 'system') && (data = [context.system])[0]) {
          os || (os = data[0].os || null);
          try {
            data[1] = context.require('ringo/engine').version;
            version = data[1].join('.');
            name = 'RingoJS';
          } catch(e) {
            if (data[0].global.system == context.system) {
              name = 'Narwhal';
            }
          }
        }
        else if (typeof context.process == 'object' && (data = context.process)) {
          name = 'Node.js';
          arch = data.arch;
          os = data.platform;
          version = /[\d.]+/.exec(data.version)[0];
        }
        else if (rhino) {
          name = 'Rhino';
        }
      }
      // detect Adobe AIR
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // detect PhantomJS
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // detect IE compatibility modes
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // we're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      os = os && format(os);
    }
    // detect prerelease phases
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // detect Firefox Mobile
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // obscure Maxthon's unreliable version
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // detect Silk desktop/accelerated modes
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // detect Xbox 360 and Xbox One
    else if (/\bXbox\b/i.test(product)) {
      os = null;
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // add mobile postfix
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // detect IE platform preview
    else if (name == 'IE' && useFeatures && context.external === null) {
      description.unshift('platform preview');
    }
    // detect BlackBerry OS version
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // detect Opera identifying/masking itself as another browser
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && (
          product != 'Wii' && (
            (useFeatures && opera) ||
            (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
            (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
            (name == 'IE' && (
              (os && !/^Win/.test(os) && version > 5.5) ||
              /\bWindows XP\b/.test(os) && version > 8 ||
              version == 8 && !/\bTrident\b/.test(ua)
            ))
          )
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {

      // when "indentifying", the UA contains both Opera and the other browser's name
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // when "masking", the UA contains only the other browser's name
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // detect WebKit Nightly and approximate Chrome/Safari versions
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // correct build for numeric comparison
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // nightly builds are postfixed with a `+`
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // clear incorrect browser versions
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // use the full Chrome version when available
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // detect Blink layout engine
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && name != 'IE') {
        layout = ['Blink'];
      }
      // detect JavaScriptCore
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // add the postfix of ".x" or "+" for approximate versions
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // obscure version for some Safari 1-2 releases
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // detect Opera desktop modes
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // detect Chrome desktop mode
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // strip incorrect OS versions
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // add layout engine
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Sleipnir|Web)/.test(name) && layout[1])) {
      // don't add layout details to description if they are falsey
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // combine contextual information
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // append manufacturer
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // append product
    if (product) {
      description.push((/^on /.test(description[description.length -1]) ? '' : 'on ') + product);
    }
    // parse OS into an object
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // add browser/OS architecture
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // export platform
  // some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module so, through path mapping, it can be aliased
    define(function() {
      return parse();
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Narwhal, Node.js, Rhino -require, or RingoJS
    forOwn(parse(), function(value, key) {
      freeExports[key] = value;
    });
  }
  // in a browser or Rhino
  else {
    root.platform = parse();
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvanMvRWRnZS5qcyIsImJ1aWxkL3NyYy9WZXJ0ZXguanMiLCJidWlsZC9zcmMvanMvYW5pbWF0aW9uLmpzIiwiYnVpbGQvc3JjL2luZGV4LmpzIiwiYnVpbGQvc3JjL2pzL2xvb3AuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2NyZWF0ZS1jbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZ3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L2Rpc3Qvc3JjL0RPTUV2ZW50U3VibW9kdWxlLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9kaXN0L3NyYy9EZXZpY2VNb3Rpb25Nb2R1bGUuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L2Rpc3Qvc3JjL0RldmljZU9yaWVudGF0aW9uTW9kdWxlLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9kaXN0L3NyYy9FbmVyZ3lNb2R1bGUuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L2Rpc3Qvc3JjL0lucHV0TW9kdWxlLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9kaXN0L3NyYy9Nb3Rpb25JbnB1dC5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbW90aW9uLWlucHV0LmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9pcy1pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9nZXQuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvc2xpY2VkLXRvLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9pcy1pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2YuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmN0eC5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZGVmLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdldC1uYW1lcy5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW52b2tlLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNhbGwuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWRldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubWl4LmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZi5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2FtZS5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXByb3RvLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zaGFyZWQuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNwZWNpZXMuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudGFzay5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudWlkLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC51bnNjb3BlLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC53a3MuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLml0ZXItaGVscGVycy5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcy5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnByb21pc2UuanMiLCJub2RlX21vZHVsZXMvbW90aW9uLWlucHV0L25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL21vdGlvbi1pbnB1dC9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9tb3Rpb24taW5wdXQvbm9kZV9tb2R1bGVzL3BsYXRmb3JtL3BsYXRmb3JtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsWUFBWSxDQUFDOzs7Ozs7O0lBR1AsSUFBSTtBQUNHLFdBRFAsSUFBSSxDQUNJLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRTswQkFEN0MsSUFBSTs7QUFFTixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUN6QixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztHQUNoQzs7ZUFORyxJQUFJOztXQVlKLGNBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRTtBQUNaLFNBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoQixTQUFHLENBQUMsV0FBVyxHQUFHLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ3hELFNBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9ELFNBQUcs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QyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV4SSxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7QUFDL0IsS0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztHQUFBLEFBRWQsT0FBTyxDQUFDLENBQUM7Q0FDVjs7Ozs7Ozs7Ozs7QUFXRCxTQUFTLEtBQUssQ0FBQyxVQUFVLEVBQUU7Ozs7Ozs7OztBQVN6QixNQUFNLFlBQVksR0FBSSxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEFBQUMsQ0FBQzs7QUFFekQsTUFBTSxNQUFNLEdBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQUMsQ0FBQztBQUM1RCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV2QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFNUIsTUFBSSxLQUFLLFlBQUE7TUFBRSxJQUFJLFlBQUE7TUFBRSxLQUFLLFlBQUEsQ0FBQzs7QUFFdkIsTUFBSSxDQUFDLEdBQUcsQ0FDTixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUN0QixDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQ1IsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDdEIsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDdEIsRUFBRSxHQUFHLEVBQUUsRUFDUCxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUN0QixDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQ1IsRUFBRSxFQUNGLEVBQUUsR0FBRyxFQUFFLENBQ1IsQ0FBQztBQUNGLFdBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0FBR2IsTUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFOzs7QUFHWixTQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxRQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixTQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNqQyxNQUFNLElBQUks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LENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXZDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUU1QixNQUFJLEtBQUssWUFBQTtNQUFFLElBQUksWUFBQTtNQUFFLEtBQUssWUFBQSxDQUFDOztBQUV2QixNQUFJLENBQUMsR0FBRyxDQUNOLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQ3RCLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFDUixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUN0QixFQUFFLEdBQUcsRUFBRSxFQUNQLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQ3RCLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFDUixFQUFFLEVBQ0YsRUFBRSxHQUFHLEVBQUUsQ0FDUixDQUFDO0FBQ0YsV0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUViLE9BQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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O0FDQUE7Ozs7QUNBQTs7QUNBQTs7QUNBQTs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBOztBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vLyBibGFoIGJsXG5cbmNsYXNzIEVkZ2Uge1xuICBjb25zdHJ1Y3Rvcihub2RlMSwgbm9kZTIsIGRpc3RhbmNlLCBtaW5EaXN0YW5jZSkge1xuICAgIHRoaXMubm9kZTEgPSBub2RlMTtcbiAgICB0aGlzLm5vZGUyID0gbm9kZTI7XG4gICAgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIHRoaXMubWluRGlzdGFuY2UgPSBtaW5EaXN0YW5jZTtcbiAgfVxuXG4gIGdldCBvcGFjaXR5KCkge1xuICAgIHJldHVybiAyICogKDEuMiAtIHRoaXMuZGlzdGFuY2UgLyB0aGlzLm1pbkRpc3RhbmNlKSAqIE1hdGgubWF4KHRoaXMubm9kZTEub3BhY2l0eSwgdGhpcy5ub2RlMi5vcGFjaXR5KTtcbiAgfVxuXG4gIGRyYXcoY3R4LCBkdCkge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgXCIgKyB0aGlzLm9wYWNpdHkgKyBcIilcIjtcbiAgICBjdHgubW92ZVRvKHRoaXMubm9kZTEuY29vcmRpbmF0ZXMueCwgdGhpcy5ub2RlMS5jb29yZGluYXRlcy55KTtcbiAgICBjdHgubGluZVRvKHRoaXMubm9kZTIuY29vcmRpbmF0ZXMueCwgdGhpcy5ub2RlMi5jb29yZGluYXRlcy55KTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRnZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgVmVydGV4IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5jYW52YXNNYXJnaW4gPSBvcHRpb25zLmNhbnZhc01hcmdpbiB8fCAwO1xuXG4gICAgdGhpcy54ID0gTWF0aC5yYW5kb20oKSAqICgxICsgMiAqIHRoaXMuY2FudmFzTWFyZ2luKSAtIHRoaXMuY2FudmFzTWFyZ2luOyAvLyBub3JtYWxpemVkXG4gICAgdGhpcy55ID0gTWF0aC5yYW5kb20oKSAqICgxICsgMiAqIHRoaXMuY2FudmFzTWFyZ2luKSAtIHRoaXMuY2FudmFzTWFyZ2luOyAvLyBub3JtYWxpemVkXG4gICAgdGhpcy56ID0gTWF0aC5yYW5kb20oKTtcbiAgICBcbiAgICB0aGlzLm1pblJhZGl1cyA9IG9wdGlvbnMubWluUmFkaXVzIHx8IDQ7IC8vIGluIHBpeGVsc1xuICAgIHRoaXMucmFkaXVzVmFyaWFuY2UgPSBvcHRpb25zLnJhZGl1c1ZhcmlhbmNlIHx8IDY7IC8vIGluIHBpeGVsc1xuICAgIHRoaXMucmFkaXVzID0gdGhpcy5yYWRpdXNWYXJpYW5jZSAqIHRoaXMueiArIHRoaXMubWluUmFkaXVzO1xuICAgIFxuICAgIHRoaXMudmVsb2NpdHlGYWN0b3IgPSBvcHRpb25zLnZlbG9jaXR5RmFjdG9yIHx8IDIwOyAvLyBwaXhlbHMgcGVyIHNlY29uZFxuICAgIHRoaXMudkluaXRYID0gTWF0aC5yYW5kb20oKSAqIDIgLSAxO1xuICAgIHRoaXMudkluaXRZID0gTWF0aC5yYW5kb20oKSAqIDIgLSAxO1xuICAgIHRoaXMuZEJldGEgPSAwO1xuICAgIHRoaXMuZEdhbW1hID0gMDtcbiAgICBcbiAgICB0aGlzLm1pbkZhZGVpbkR1cmF0aW9uID0gb3B0aW9ucy5taW5GYWRlaW5EdXJhdGlvbiB8fCAzO1xuICAgIHRoaXMuZmFkZUluRHVyYXRpb25WYXJpYW5jZSA9IG9wdGlvbnMuZmFkZUluRHVyYXRpb25WYXJpYW5jZSB8fCAyO1xuICAgIHRoaXMuZmFkZUluRHVyYXRpb24gPSB0aGlzLm1pbkZhZGVpbkR1cmF0aW9uICsgKDEgLSB0aGlzLnopICogdGhpcy5mYWRlSW5EdXJhdGlvblZhcmlhbmNlOyAvLyBpbiBzZWNvbmRzXG5cbiAgICB0aGlzLm9wYWNpdHkgPSAwO1xuXG4gICAgdGhpcy5jb29yZGluYXRlcyA9IHt9OyAvLyBpbiBwaXhlbHNcbiAgfVxuXG4gIGdldCB2eCgpIHtcbiAgICByZXR1cm4gdGhpcy52ZWxvY2l0eUZhY3RvciAqICh0aGlzLnZJbml0WCArIHRoaXMuZEdhbW1hICogdGhpcy56ICogMjAwKTtcbiAgfVxuXG4gIGdldCB2eSgpIHtcbiAgICByZXR1cm4gdGhpcy52ZWxvY2l0eUZhY3RvciAqICh0aGlzLnZJbml0WSArIHRoaXMuZEJldGEgKiB0aGlzLnogKiAyMDApO1xuICB9XG5cbiAgdXBkYXRlKGVsYXBzZWRUaW1lLCBkdCwgdywgaCkge1xuICAgIHRoaXMueCArPSB0aGlzLnZ4IC8gdyAqIGR0O1xuICAgIHRoaXMueSArPSB0aGlzLnZ5IC8gaCAqIGR0O1xuXG4gICAgaWYgKHRoaXMueCA+IDEgKyB0aGlzLmNhbnZhc01hcmdpbilcbiAgICAgIHRoaXMueCA9IC10aGlzLmNhbnZhc01hcmdpbjtcbiAgICBlbHNlIGlmICh0aGlzLnggPCAtdGhpcy5jYW52YXNNYXJnaW4pXG4gICAgICB0aGlzLnggPSAxICsgdGhpcy5jYW52YXNNYXJnaW47XG5cbiAgICBpZiAodGhpcy55ID4gMSArIHRoaXMuY2FudmFzTWFyZ2luKVxuICAgICAgdGhpcy55ID0gLXRoaXMuY2FudmFzTWFyZ2luO1xuICAgIGVsc2UgaWYgKHRoaXMueSA8IC10aGlzLmNhbnZhc01hcmdpbilcbiAgICAgIHRoaXMueSA9IDEgKyB0aGlzLmNhbnZhc01hcmdpbjtcblxuICAgIHRoaXMuY29vcmRpbmF0ZXMueCA9IHRoaXMueCAqIHc7XG4gICAgdGhpcy5jb29yZGluYXRlcy55ID0gdGhpcy55ICogaDtcblxuICAgIHRoaXMub3BhY2l0eSA9IDAuMDQgKiBNYXRoLm1pbihlbGFwc2VkVGltZSAvIHRoaXMuZmFkZUluRHVyYXRpb24sIDEpO1xuICB9XG5cbiAgZHJhdyhjdHgsIGR0KSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCBcIiArIHRoaXMub3BhY2l0eSArIFwiKVwiO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguYXJjKHRoaXMuY29vcmRpbmF0ZXMueCwgdGhpcy5jb29yZGluYXRlcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICB9XG5cbiAgb25PcmllbnRhdGlvbihkQmV0YSwgZEdhbW1hKSB7XG4gICAgdGhpcy5kQmV0YSA9IGRCZXRhO1xuICAgIHRoaXMuZEdhbW1hID0gZEdhbW1hO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVmVydGV4OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgbG9vcCA9IHJlcXVpcmUoJy4vbG9vcCcpO1xuY29uc3QgVmVydGV4ID0gcmVxdWlyZSgnLi9WZXJ0ZXgnKTtcbmNvbnN0IEVkZ2UgPSByZXF1aXJlKCcuL0VkZ2UnKTtcblxuLy8gQ2FudmFzIHBhcmFtZXRlcnNcbnZhciBjYW52YXNXaWR0aDtcbnZhciBjYW52YXNIZWlnaHQ7XG52YXIgd2luZG93V2lkdGg7XG52YXIgd2luZG93SGVpZ2h0O1xudmFyIGNhbnZhcztcbnZhciBjdHg7XG5cbi8vIEdhbWUgbG9vcCBvcHRpb25zXG52YXIgb3B0aW9ucyA9IHtcbiAgY3R4OiBjdHgsXG4gIGJ1ZmZlcnM6IFtdLFxuICB1cGRhdGU6IHVwZGF0ZSxcbiAgcmVuZGVyOiByZW5kZXIsXG4gIGZwczogNjBcbiAgICAvLyBndWk6IGd1aS5tb2RlbFxufTtcblxudmFyIGVkZ2VzID0gW107XG52YXIgZWxhcHNlZFRpbWUgPSAwO1xuXG4vLyBHYW1lIGxvb3AgbWFpbiBmdW5jdGlvbnNcbmZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICBlZGdlcyA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgdmVydGV4MSA9IHZlcnRpY2VzW2ldO1xuICAgIHZlcnRpY2VzW2ldLnVwZGF0ZShlbGFwc2VkVGltZSwgZHQsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpO1xuXG4gICAgZm9yIChsZXQgaiA9IGk7IGogPiAwOyBqLS0pIHtcbiAgICAgIGxldCB2ZXJ0ZXgyID0gdmVydGljZXNbal07XG4gICAgICBsZXQgZGlzdCA9IGRpc3RhbmNlKHZlcnRleDEsIHZlcnRleDIpO1xuXG4gICAgICBpZiAoZGlzdCA8IG1pbkRpc3QpXG4gICAgICAgIGVkZ2VzLnB1c2gobmV3IEVkZ2UodmVydGV4MSwgdmVydGV4MiwgZGlzdCwgbWluRGlzdCkpO1xuICAgIH1cbiAgfVxuXG4gIGVsYXBzZWRUaW1lICs9IGR0O1xufVxuXG5mdW5jdGlvbiByZW5kZXIoZHQpIHtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKVxuICAgIHZlcnRpY2VzW2ldLmRyYXcoY3R4LCBkdCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlZGdlcy5sZW5ndGg7IGkrKylcbiAgICBlZGdlc1tpXS5kcmF3KGN0eCwgZHQpO1xufVxuXG5mdW5jdGlvbiBzdGFydCgpIHtcbiAgd2luZG93V2lkdGggPSBwYXJzZUludCh3aW5kb3cuaW5uZXJXaWR0aCwgMTApO1xuICB3aW5kb3dIZWlnaHQgPSBwYXJzZUludCh3aW5kb3cuaW5uZXJIZWlnaHQsIDEwKTtcblxuICBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NlbmUnKTtcbiAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgdXBkYXRlQ2FudmFzU2l6ZSgpXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGVDYW52YXNTaXplKTtcblxuICBsb29wLnJ1bihvcHRpb25zKTtcbn1cblxuLy8gQW5pbWF0aW9uXG52YXIgbWluRGlzdCA9IDIwMDAwOyAvLyBzcXVhcmUgZGlzdGFuY2VcbnZhciB2ZXJ0aWNlc051bTtcbnZhciB2ZXJ0aWNlcyA9IFtdO1xuXG52YXIgUElYRUxfUkFUSU8gPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBjb250ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKS5nZXRDb250ZXh0KFwiMmRcIiksXG4gICAgZHByID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSxcbiAgICBic3IgPSBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICBjb250ZXh0Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICBjb250ZXh0Lm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgIGNvbnRleHQub0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICBjb250ZXh0LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcblxuICByZXR1cm4gZHByIC8gYnNyO1xufSkoKTtcblxuZnVuY3Rpb24gdXBkYXRlQ2FudmFzU2l6ZSgpIHtcbiAgd2luZG93V2lkdGggPSBwYXJzZUludCh3aW5kb3cuaW5uZXJXaWR0aCwgMTApO1xuICB3aW5kb3dIZWlnaHQgPSBwYXJzZUludCh3aW5kb3cuaW5uZXJIZWlnaHQsIDEwKTtcbiAgY2FudmFzV2lkdGggPSB3aW5kb3dXaWR0aCAqIFBJWEVMX1JBVElPO1xuICBjYW52YXNIZWlnaHQgPSB3aW5kb3dIZWlnaHQgKiBQSVhFTF9SQVRJTztcblxuICBjYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gd2luZG93V2lkdGggKyBcInB4XCI7XG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIZWlnaHQgKyBcInB4XCI7XG4gIGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikuc2V0VHJhbnNmb3JtKFBJWEVMX1JBVElPLCAwLCAwLCBQSVhFTF9SQVRJTywgMCwgMCk7XG5cbiAgdmVydGljZXMgPSBbXTtcbiAgdmVydGljZXNOdW0gPSBNYXRoLnJvdW5kKGNhbnZhc1dpZHRoICogY2FudmFzSGVpZ2h0IC8gMTIwMDApO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXNOdW07IGkrKykge1xuICAgIHZlcnRpY2VzLnB1c2gobmV3IFZlcnRleCh7XG4gICAgICBjYW52YXNNYXJnaW46IDAuMSxcbiAgICAgIHZlbG9jaXR5RmFjdG9yOiA3LFxuICAgICAgbWluUmFkaXVzOiA0LFxuICAgICAgcmFkaXVzVmFyaWFuY2U6IDYsXG4gICAgICBtaW5GYWRlaW5EdXJhdGlvbjogMyxcbiAgICAgIGZhZGVpbkR1cmF0aW9uVmFyaWFuY2U6IDJcbiAgICB9KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGlzdGFuY2UodmVydGV4MSwgdmVydGV4Mikge1xuICBsZXQgZHggPSB2ZXJ0ZXgxLmNvb3JkaW5hdGVzLnggLSB2ZXJ0ZXgyLmNvb3JkaW5hdGVzLng7XG4gIGxldCBkeSA9IHZlcnRleDEuY29vcmRpbmF0ZXMueSAtIHZlcnRleDIuY29vcmRpbmF0ZXMueTtcblxuICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG59XG5cbmZ1bmN0aW9uIGRyYXdFZGdlKHZlcnRleDEsIHZlcnRleDIsIGRpc3QpIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgXCIgKyAoMS4yIC0gZGlzdCAvIG1pbkRpc3QpICogTWF0aC5tYXgodmVydGV4MS5vcGFjaXR5LCB2ZXJ0ZXgyLm9wYWNpdHkpICsgXCIpXCI7XG4gIGN0eC5tb3ZlVG8odmVydGV4MS5jb29yZGluYXRlcy54LCB2ZXJ0ZXgxLmNvb3JkaW5hdGVzLnkpO1xuICBjdHgubGluZVRvKHZlcnRleDIuY29vcmRpbmF0ZXMueCwgdmVydGV4Mi5jb29yZGluYXRlcy55KTtcbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG59XG5cbmZ1bmN0aW9uIG9uT3JpZW50YXRpb24oYmV0YSwgZ2FtbWEpIHtcbiAgbGV0IG5vdyA9IHRpbWVzdGFtcCgpO1xuICBsZXQgayA9IDAuODtcblxuICBpZiAocHJldmlvdXNUaW1lc3RhbXAgJiYgcHJldmlvdXNCZXRhICYmIHByZXZpb3VzR2FtbWEpwqAge1xuICAgIGxldCBkdCA9IG5vdyAtIHByZXZpb3VzVGltZXN0YW1wO1xuICAgIGRCZXRhID0gKGJldGEgLSBwcmV2aW91c0JldGEpIC8gZHQ7XG4gICAgZEdhbW1hID0gKGdhbW1hIC0gcHJldmlvdXNHYW1tYSkgLyBkdDtcbiAgfVxuXG4gIHByZXZpb3VzVGltZXN0YW1wID0gbm93O1xuICBwcmV2aW91c0JldGEgPSBiZXRhO1xuICBwcmV2aW91c0dhbW1hID0gZ2FtbWE7XG5cbiAgaWYgKGRCZXRhICYmIGRHYW1tYSkge1xuICAgIGlmIChwcmV2aW91c0RCZXRhRmlsdGVyZWQgJiYgcHJldmlvdXNER2FtbWFGaWx0ZXJlZCkge1xuICAgICAgZEJldGFGaWx0ZXJlZCA9IGsgKiBwcmV2aW91c0RCZXRhRmlsdGVyZWQgKyAoMSAtIGspICogZEJldGE7XG4gICAgICBkR2FtbWFGaWx0ZXJlZCA9IGsgKiBwcmV2aW91c0RHYW1tYUZpbHRlcmVkICsgKDEgLSBrKSAqIGRHYW1tYTtcbiAgICB9IGVsc2Uge1xuICAgICAgZEJldGFGaWx0ZXJlZCA9IGRCZXRhO1xuICAgICAgZEdhbW1hRmlsdGVyZWQgPSBkR2FtbWE7XG4gICAgfVxuXG4gICAgcHJldmlvdXNEQmV0YUZpbHRlcmVkID0gZEJldGFGaWx0ZXJlZDtcbiAgICBwcmV2aW91c0RHYW1tYUZpbHRlcmVkID0gZEdhbW1hRmlsdGVyZWQ7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKVxuICAgICAgdmVydGljZXNbaV0ub25PcmllbnRhdGlvbihkQmV0YUZpbHRlcmVkLCBkR2FtbWFGaWx0ZXJlZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICByZXR1cm4gd2luZG93LnBlcmZvcm1hbmNlICYmIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgPyB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn1cblxudmFyIHByZXZpb3VzVGltZXN0YW1wO1xudmFyIHByZXZpb3VzQmV0YTtcbnZhciBwcmV2aW91c0dhbW1hO1xudmFyIGRCZXRhO1xudmFyIGRHYW1tYTtcbnZhciBkQmV0YUZpbHRlcmVkO1xudmFyIGRHYW1tYUZpbHRlcmVkO1xudmFyIHByZXZpb3VzREJldGFGaWx0ZXJlZDtcbnZhciBwcmV2aW91c0RHYW1tYUZpbHRlcmVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RhcnQ6IHN0YXJ0LFxuICBvbk9yaWVudGF0aW9uOiBvbk9yaWVudGF0aW9uXG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFPDqWJhc3RpZW4gUm9iYXN6a2lld2ljeidzIHBlcnNvbmFsIHdlYnBhZ2VcbiAqIEBhdXRob3IgPGEgaHJlZj0nbWFpbHRvOmhlbGxvQHJvYmkubWUnPlPDqWJhc3RpZW4gUm9iYXN6a2lld2ljejwvYT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGlucHV0ID0gcmVxdWlyZSgnbW90aW9uLWlucHV0Jyk7XG5jb25zdCBhbmltYXRpb24gPSByZXF1aXJlKCcuL2FuaW1hdGlvbicpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGFuaW1hdGlvbi5zdGFydCgpO1xuXG4gIGlucHV0LmluaXQoJ29yaWVudGF0aW9uQWx0JylcbiAgICAudGhlbigobW9kdWxlcykgPT4ge1xuICAgICAgY29uc3Qgb3JpZW50YXRpb24gPSBtb2R1bGVzWzBdO1xuXG4gICAgICBpZiAob3JpZW50YXRpb24uaXNWYWxpZCkge1xuICAgICAgICBpbnB1dC5hZGRMaXN0ZW5lcignb3JpZW50YXRpb25BbHQnLCAodmFsKSA9PiB7XG4gICAgICAgICAgYW5pbWF0aW9uLm9uT3JpZW50YXRpb24odmFsWzFdLCB2YWxbMl0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbn0oKSk7IiwiLy8gaHR0cDovL3BhdWxpcmlzaC5jb20vMjAxMS9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWFuaW1hdGluZy9cbi8vIGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcbi8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwb2x5ZmlsbCBieSBFcmlrIE3DtmxsZXIuIGZpeGVzIGZyb20gUGF1bCBJcmlzaCBhbmQgVGlubyBaaWpkZWxcbi8vIE1JVCBsaWNlbnNlXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBsYXN0VGltZSA9IDA7XG4gIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgZm9yKHZhciB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxBbmltYXRpb25GcmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICB9XG5cbiAgaWYgKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LFxuICAgICAgICB0aW1lVG9DYWxsKTtcbiAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgcmV0dXJuIGlkO1xuICAgIH07XG5cbiAgaWYgKCF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpXG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgfTtcbn0oKSk7XG5cbi8vIGh0dHA6Ly9jb2RlaW5jb21wbGV0ZS5jb20vcG9zdHMvMjAxMy8xMi80L2phdmFzY3JpcHRfZ2FtZV9mb3VuZGF0aW9uc190aGVfZ2FtZV9sb29wL1xuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICByZXR1cm4gd2luZG93LnBlcmZvcm1hbmNlICYmIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgPyB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn1cblxudmFyIGxvb3AgPSB7XG4gIHJ1bjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIG5vdztcbiAgICB2YXIgZHQgPSAwO1xuICAgIHZhciBsYXN0ID0gdGltZXN0YW1wKCk7XG4gICAgdmFyIHN0ZXAgPSAxIC8gb3B0aW9ucy5mcHM7XG4gICAgdmFyIGN0eCA9IG9wdGlvbnMuY3R4O1xuICAgIHZhciBidWZmZXJzID0gb3B0aW9ucy5idWZmZXJzO1xuICAgIHZhciB1cGRhdGUgPSBvcHRpb25zLnVwZGF0ZTtcbiAgICB2YXIgcmVuZGVyID0gb3B0aW9ucy5yZW5kZXI7XG4gICAgdmFyIGd1aSA9IG9wdGlvbnMuZ3VpO1xuXG4gICAgKGZ1bmN0aW9uKHRoYXQpIHtcbiAgICAgIGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICAgIHZhciBzbG93ICAgICA9IChndWkgJiYgZ3VpLnNsb3cpID8gZ3VpLnNsb3cgOiAxOyAvLyBzbG93IG1vdGlvbiBzY2FsaW5nIGZhY3RvclxuICAgICAgICB2YXIgc2xvd1N0ZXAgPSBzbG93ICogc3RlcDtcblxuICAgICAgICBub3cgPSB0aW1lc3RhbXAoKTtcbiAgICAgICAgZHQgPSBkdCArIE1hdGgubWluKDEsIChub3cgLSBsYXN0KSAvIDEwMDApO1xuXG4gICAgICAgIHdoaWxlKGR0ID4gc2xvd1N0ZXApIHtcbiAgICAgICAgICAgIGR0ID0gZHQgLSBzbG93U3RlcDtcbiAgICAgICAgICAgIHVwZGF0ZShzdGVwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlcihjdHgsIGJ1ZmZlcnMsIGR0L3Nsb3cpO1xuXG4gICAgICAgIGxhc3QgPSBub3c7XG4gICAgICAgIHRoYXQuckFGaWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICB9XG5cbiAgICAgIHRoYXQuckFGaWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgfSh0aGlzKSk7XG4gIH0sXG5cbiAgcXVpdDogZnVuY3Rpb24oKSB7XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yQUZpZCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGxvb3A7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG5cbiAgICAgIF9PYmplY3QkZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYyl7XG4gIHJldHVybiAkLnNldERlc2MoaXQsIGtleSwgZGVzYyk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJCl7XG4gICQuRlcgICA9IGZhbHNlO1xuICAkLnBhdGggPSAkLmNvcmU7XG4gIHJldHVybiAkO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgZ2xvYmFsID0gdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKVxuICAsIGNvcmUgICA9IHt9XG4gICwgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHlcbiAgLCBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5XG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcbiAgLCBtYXggICA9IE1hdGgubWF4XG4gICwgbWluICAgPSBNYXRoLm1pbjtcbi8vIFRoZSBlbmdpbmUgd29ya3MgZmluZSB3aXRoIGRlc2NyaXB0b3JzPyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5LlxudmFyIERFU0MgPSAhIWZ1bmN0aW9uKCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiAyOyB9fSkuYSA9PSAyO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG59KCk7XG52YXIgaGlkZSA9IGNyZWF0ZURlZmluZXIoMSk7XG4vLyA3LjEuNCBUb0ludGVnZXJcbmZ1bmN0aW9uIHRvSW50ZWdlcihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufVxuZnVuY3Rpb24gZGVzYyhiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59XG5mdW5jdGlvbiBzaW1wbGVTZXQob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZURlZmluZXIoYml0bWFwKXtcbiAgcmV0dXJuIERFU0MgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICAgIHJldHVybiAkLnNldERlc2Mob2JqZWN0LCBrZXksIGRlc2MoYml0bWFwLCB2YWx1ZSkpO1xuICB9IDogc2ltcGxlU2V0O1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChpdCl7XG4gIHJldHVybiBpdCAhPT0gbnVsbCAmJiAodHlwZW9mIGl0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nKTtcbn1cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBhc3NlcnREZWZpbmVkKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufVxuXG52YXIgJCA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZ3Jykoe1xuICBnOiBnbG9iYWwsXG4gIGNvcmU6IGNvcmUsXG4gIGh0bWw6IGdsb2JhbC5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2NvcmUtanMtaXNvYmplY3RcbiAgaXNPYmplY3Q6ICAgaXNPYmplY3QsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIHRoYXQ6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIC8vIDcuMS40IFRvSW50ZWdlclxuICB0b0ludGVnZXI6IHRvSW50ZWdlcixcbiAgLy8gNy4xLjE1IFRvTGVuZ3RoXG4gIHRvTGVuZ3RoOiBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbiAgfSxcbiAgdG9JbmRleDogZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XG4gICAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICAgIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xuICB9LFxuICBoYXM6IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xuICB9LFxuICBjcmVhdGU6ICAgICBPYmplY3QuY3JlYXRlLFxuICBnZXRQcm90bzogICBPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIERFU0M6ICAgICAgIERFU0MsXG4gIGRlc2M6ICAgICAgIGRlc2MsXG4gIGdldERlc2M6ICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIHNldERlc2M6ICAgIGRlZmluZVByb3BlcnR5LFxuICBzZXREZXNjczogICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyxcbiAgZ2V0S2V5czogICAgT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICBnZXRTeW1ib2xzOiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxuICBhc3NlcnREZWZpbmVkOiBhc3NlcnREZWZpbmVkLFxuICAvLyBEdW1teSwgZml4IGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nIGluIGVzNSBtb2R1bGVcbiAgRVM1T2JqZWN0OiBPYmplY3QsXG4gIHRvT2JqZWN0OiBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuICQuRVM1T2JqZWN0KGFzc2VydERlZmluZWQoaXQpKTtcbiAgfSxcbiAgaGlkZTogaGlkZSxcbiAgZGVmOiBjcmVhdGVEZWZpbmVyKDApLFxuICBzZXQ6IGdsb2JhbC5TeW1ib2wgPyBzaW1wbGVTZXQgOiBoaWRlLFxuICBlYWNoOiBbXS5mb3JFYWNoXG59KTtcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5pZih0eXBlb2YgX19lICE9ICd1bmRlZmluZWQnKV9fZSA9IGNvcmU7XG5pZih0eXBlb2YgX19nICE9ICd1bmRlZmluZWQnKV9fZyA9IGdsb2JhbDsiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgYERPTUV2ZW50U3VibW9kdWxlYCBtb2R1bGVcbiAqIEBhdXRob3IgPGEgaHJlZj0nbWFpbHRvOnNlYmFzdGllbkByb2Jhc3praWV3aWN6LmNvbSc+U8OpYmFzdGllbiBSb2Jhc3praWV3aWN6PC9hPiwgPGEgaHJlZj0nbWFpbHRvOk5vcmJlcnQuU2NobmVsbEBpcmNhbS5mcic+Tm9yYmVydCBTY2huZWxsPC9hPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgSW5wdXRNb2R1bGUgPSByZXF1aXJlKCcuL0lucHV0TW9kdWxlJyk7XG5cbi8qKlxuICogYERPTUV2ZW50U3VibW9kdWxlYCBjbGFzcy5cbiAqIFRoZSBgRE9NRXZlbnRTdWJtb2R1bGVgIGNsYXNzIGFsbG93cyB0byBpbnN0YW50aWF0ZSBtb2R1bGVzIHRoYXQgcHJvdmlkZVxuICogdW5pZmllZCB2YWx1ZXMgKHN1Y2ggYXMgYEFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgLCBgQWNjZWxlcmF0aW9uYCxcbiAqIGBSb3RhdGlvblJhdGVgLCBgT3JpZW50YXRpb25gLCBgT3JpZW50YXRpb25BbHQpIGZyb20gdGhlIGBkZXZpY2Vtb3Rpb25gXG4gKiBvciBgZGV2aWNlb3JpZW50YXRpb25gIERPTSBldmVudHMuXG4gKlxuICogQGNsYXNzIERPTUV2ZW50U3VibW9kdWxlXG4gKiBAZXh0ZW5kcyBJbnB1dE1vZHVsZVxuICovXG5jbGFzcyBET01FdmVudFN1Ym1vZHVsZSBleHRlbmRzIElucHV0TW9kdWxlIHtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGBET01FdmVudFN1Ym1vZHVsZWAgbW9kdWxlIGluc3RhbmNlLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtEZXZpY2VNb3Rpb25Nb2R1bGV8RGV2aWNlT3JpZW50YXRpb25Nb2R1bGV9IERPTUV2ZW50TW9kdWxlIC0gVGhlIHBhcmVudCBET00gZXZlbnQgbW9kdWxlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIC0gVGhlIG5hbWUgb2YgdGhlIHN1Ym1vZHVsZSAvIGV2ZW50ICgqZS5nLiogJ2FjY2VsZXJhdGlvbicgb3IgJ29yaWVudGF0aW9uQWx0JykuXG4gICAqIEBzZWUgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAqIEBzZWUgRGV2aWNlT3JpZW50YXRpb25Nb2R1bGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKERPTUV2ZW50TW9kdWxlLCBldmVudFR5cGUpIHtcbiAgICBzdXBlcihldmVudFR5cGUpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIERPTSBldmVudCBwYXJlbnQgbW9kdWxlIGZyb20gd2hpY2ggdGhpcyBtb2R1bGUgZ2V0cyB0aGUgcmF3IHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEB0aGlzIERPTUV2ZW50U3VibW9kdWxlXG4gICAgICogQHR5cGUge0RldmljZU1vdGlvbk1vZHVsZXxEZXZpY2VPcmllbnRhdGlvbk1vZHVsZX1cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKi9cbiAgICB0aGlzLkRPTUV2ZW50TW9kdWxlID0gRE9NRXZlbnRNb2R1bGU7XG5cbiAgICAvKipcbiAgICAgKiBSYXcgdmFsdWVzIGNvbWluZyBmcm9tIHRoZSBgZGV2aWNlbW90aW9uYCBldmVudCBzZW50IGJ5IHRoaXMgbW9kdWxlLlxuICAgICAqXG4gICAgICogQHRoaXMgRE9NRXZlbnRTdWJtb2R1bGVcbiAgICAgKiBAdHlwZSB7bnVtYmVyW119XG4gICAgICogQGRlZmF1bHQgWzAsIDAsIDBdXG4gICAgICovXG4gICAgdGhpcy5ldmVudCA9IFswLCAwLCAwXTtcblxuICAgIC8qKlxuICAgICAqIENvbXBhc3MgaGVhZGluZyByZWZlcmVuY2UgKGlPUyBkZXZpY2VzIG9ubHksIGBPcmllbnRhdGlvbmAgYW5kIGBPcmllbnRhdGlvbkFsdGAgc3VibW9kdWxlcyBvbmx5KS5cbiAgICAgKlxuICAgICAqIEB0aGlzIERPTUV2ZW50U3VibW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgdGhpcy5fd2Via2l0Q29tcGFzc0hlYWRpbmdSZWZlcmVuY2UgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgbW9kdWxlLlxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5ET01FdmVudE1vZHVsZS5fYWRkTGlzdGVuZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB0aGUgbW9kdWxlLlxuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB0aGlzLkRPTUV2ZW50TW9kdWxlLl9yZW1vdmVMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIG9mIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIEluZGljYXRlIHRvIHRoZSBwYXJlbnQgbW9kdWxlIHRoYXQgdGhpcyBldmVudCBpcyByZXF1aXJlZFxuICAgIHRoaXMuRE9NRXZlbnRNb2R1bGUucmVxdWlyZWRbdGhpcy5ldmVudFR5cGVdID0gdHJ1ZTtcblxuICAgIC8vIElmIHRoZSBwYXJlbnQgZXZlbnQgaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkIHlldCwgaW5pdGlhbGl6ZSBpdFxuICAgIGxldCBET01FdmVudFByb21pc2UgPSB0aGlzLkRPTUV2ZW50TW9kdWxlLnByb21pc2U7XG4gICAgaWYgKCFET01FdmVudFByb21pc2UpXG4gICAgICBET01FdmVudFByb21pc2UgPSB0aGlzLkRPTUV2ZW50TW9kdWxlLmluaXQoKTtcblxuICAgIHJldHVybiBET01FdmVudFByb21pc2UudGhlbigobW9kdWxlKSA9PiB0aGlzKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERPTUV2ZW50U3VibW9kdWxlOyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBgRGV2aWNlTW90aW9uYCBtb2R1bGVcbiAqIEBhdXRob3IgPGEgaHJlZj0nbWFpbHRvOnNlYmFzdGllbkByb2Jhc3praWV3aWN6LmNvbSc+U8OpYmFzdGllbiBSb2Jhc3praWV3aWN6PC9hPiwgPGEgaHJlZj0nbWFpbHRvOk5vcmJlcnQuU2NobmVsbEBpcmNhbS5mcic+Tm9yYmVydCBTY2huZWxsPC9hPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgSW5wdXRNb2R1bGUgPSByZXF1aXJlKCcuL0lucHV0TW9kdWxlJyk7XG5jb25zdCBET01FdmVudFN1Ym1vZHVsZSA9IHJlcXVpcmUoJy4vRE9NRXZlbnRTdWJtb2R1bGUnKTtcbmNvbnN0IE1vdGlvbklucHV0ID0gcmVxdWlyZSgnLi9Nb3Rpb25JbnB1dCcpO1xuY29uc3QgcGxhdGZvcm0gPSByZXF1aXJlKCdwbGF0Zm9ybScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnQgbG9jYWwgdGltZSBpbiBzZWNvbmRzLlxuICogVXNlcyBgd2luZG93LnBlcmZvcm1hbmNlLm5vdygpYCBpZiBhdmFpbGFibGUsIGFuZCBgRGF0ZS5ub3coKWAgb3RoZXJ3aXNlLlxuICogXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldExvY2FsVGltZSgpIHtcbiAgaWYgKHdpbmRvdy5wZXJmb3JtYW5jZSlcbiAgICByZXR1cm4gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMDtcbiAgcmV0dXJuIERhdGUubm93KCkgLyAxMDAwO1xufVxuXG4vKipcbiAqIGBEZXZpY2VNb3Rpb25gIG1vZHVsZSBzaW5nbGV0b24uXG4gKiBUaGUgYERldmljZU1vdGlvbk1vZHVsZWAgc2luZ2xldG9uIHByb3ZpZGVzIHRoZSByYXcgdmFsdWVzXG4gKiBvZiB0aGUgYWNjZWxlcmF0aW9uIGluY2x1ZGluZyBncmF2aXR5LCBhY2NlbGVyYXRpb24sIGFuZCByb3RhdGlvblxuICogcmF0ZSBwcm92aWRlZCBieSB0aGUgYERldmljZU1vdGlvbmAgZXZlbnQuXG4gKiBJdCBhbHNvIGluc3RhbnRpYXRlIHRoZSBgQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAsXG4gKiBgQWNjZWxlcmF0aW9uYCBhbmQgYFJvdGF0aW9uUmF0ZWAgc3VibW9kdWxlcyB0aGF0IHVuaWZ5IHRob3NlIHZhbHVlc1xuICogYWNyb3NzIHBsYXRmb3JtcyBieSBtYWtpbmcgdGhlbSBjb21wbGlhbnQgd2l0aCB7QGxpbmtcbiAqIGh0dHA6Ly93d3cudzMub3JnL1RSL29yaWVudGF0aW9uLWV2ZW50L3x0aGUgVzNDIHN0YW5kYXJkfS5cbiAqIFdoZW4gcmF3IHZhbHVlcyBhcmUgbm90IHByb3ZpZGVkIGJ5IHRoZSBzZW5zb3JzLCB0aGlzIG1vZHVsZXMgdHJpZXNcbiAqIHRvIHJlY2FsY3VsYXRlIHRoZW0gZnJvbSBhdmFpbGFibGUgdmFsdWVzOlxuICogLSBgYWNjZWxlcmF0aW9uYCBpcyBjYWxjdWxhdGVkIGZyb20gYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgXG4gKiAgIHdpdGggYSBoaWdoLXBhc3MgZmlsdGVyO1xuICogLSAoY29taW5nIHNvb24g4oCUIHdhaXRpbmcgZm9yIGEgYnVnIG9uIENocm9tZSB0byBiZSByZXNvbHZlZClcbiAqICAgYHJvdGF0aW9uUmF0ZWAgaXMgY2FsY3VsYXRlZCBmcm9tIGBvcmllbnRhdGlvbmAuXG4gKlxuICogQGNsYXNzIERldmljZU1vdGlvbk1vZHVsZVxuICogQGV4dGVuZHMgSW5wdXRNb2R1bGVcbiAqL1xuY2xhc3MgRGV2aWNlTW90aW9uTW9kdWxlIGV4dGVuZHMgSW5wdXRNb2R1bGUge1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBgRGV2aWNlTW90aW9uYCBtb2R1bGUgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ2RldmljZW1vdGlvbicpO1xuXG4gICAgLyoqXG4gICAgICogUmF3IHZhbHVlcyBjb21pbmcgZnJvbSB0aGUgYGRldmljZW1vdGlvbmAgZXZlbnQgc2VudCBieSB0aGlzIG1vZHVsZS5cbiAgICAgKlxuICAgICAqIEB0aGlzIERldmljZU1vdGlvbk1vZHVsZVxuICAgICAqIEB0eXBlIHtudW1iZXJbXX1cbiAgICAgKiBAZGVmYXVsdCBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF1cbiAgICAgKi9cbiAgICB0aGlzLmV2ZW50ID0gW251bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGxdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGBBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5YCBtb2R1bGUuXG4gICAgICogUHJvdmlkZXMgdW5pZmllZCB2YWx1ZXMgb2YgdGhlIGFjY2VsZXJhdGlvbiBpbmNsdWRpbmcgZ3Jhdml0eS5cbiAgICAgKlxuICAgICAqIEB0aGlzIERldmljZU1vdGlvbk1vZHVsZVxuICAgICAqIEB0eXBlIHtET01FdmVudFN1Ym1vZHVsZX1cbiAgICAgKi9cbiAgICB0aGlzLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkgPSBuZXcgRE9NRXZlbnRTdWJtb2R1bGUodGhpcywgJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknKTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgYEFjY2VsZXJhdGlvbmAgc3VibW9kdWxlLlxuICAgICAqIFByb3ZpZGVzIHVuaWZpZWQgdmFsdWVzIG9mIHRoZSBhY2NlbGVyYXRpb24uXG4gICAgICogRXN0aW1hdGVzIHRoZSBhY2NlbGVyYXRpb24gdmFsdWVzIGZyb20gYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgXG4gICAgICogcmF3IHZhbHVlcyBpZiB0aGUgYWNjZWxlcmF0aW9uIHJhdyB2YWx1ZXMgYXJlIG5vdCBhdmFpbGFibGUgb24gdGhlXG4gICAgICogZGV2aWNlLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge0RPTUV2ZW50U3VibW9kdWxlfVxuICAgICAqL1xuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IERPTUV2ZW50U3VibW9kdWxlKHRoaXMsICdhY2NlbGVyYXRpb24nKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBgUm90YXRpb25SYXRlYCBzdWJtb2R1bGUuXG4gICAgICogUHJvdmlkZXMgdW5pZmllZCB2YWx1ZXMgb2YgdGhlIHJvdGF0aW9uIHJhdGUuXG4gICAgICogKGNvbWluZyBzb29uLCB3YWl0aW5nIGZvciBhIGJ1ZyBvbiBDaHJvbWUgdG8gYmUgcmVzb2x2ZWQpXG4gICAgICogRXN0aW1hdGVzIHRoZSByb3RhdGlvbiByYXRlIHZhbHVlcyBmcm9tIGBvcmllbnRhdGlvbmAgdmFsdWVzIGlmXG4gICAgICogdGhlIHJvdGF0aW9uIHJhdGUgcmF3IHZhbHVlcyBhcmUgbm90IGF2YWlsYWJsZSBvbiB0aGUgZGV2aWNlLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge0RPTUV2ZW50U3VibW9kdWxlfVxuICAgICAqL1xuICAgIHRoaXMucm90YXRpb25SYXRlID0gbmV3IERPTUV2ZW50U3VibW9kdWxlKHRoaXMsICdyb3RhdGlvblJhdGUnKTtcblxuICAgIC8qKlxuICAgICAqIFJlcXVpcmVkIHN1Ym1vZHVsZXMgLyBldmVudHMuXG4gICAgICpcbiAgICAgKiBAdGhpcyBEZXZpY2VNb3Rpb25Nb2R1bGVcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbH0gYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSAtIEluZGljYXRlcyB3aGV0aGVyIHRoZSBgYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAgdW5pZmllZCB2YWx1ZXMgYXJlIHJlcXVpcmVkIG9yIG5vdCAoZGVmYXVsdHMgdG8gYGZhbHNlYCkuXG4gICAgICogQHByb3BlcnR5IHtib29sfSBhY2NlbGVyYXRpb24gLSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgYGFjY2VsZXJhdGlvbmAgdW5pZmllZCB2YWx1ZXMgYXJlIHJlcXVpcmVkIG9yIG5vdCAoZGVmYXVsdHMgdG8gYGZhbHNlYCkuXG4gICAgICogQHByb3BlcnR5IHtib29sfSByb3RhdGlvblJhdGUgLSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgYHJvdGF0aW9uUmF0ZWAgdW5pZmllZCB2YWx1ZXMgYXJlIHJlcXVpcmVkIG9yIG5vdCAoZGVmYXVsdHMgdG8gYGZhbHNlYCkuXG4gICAgICovXG4gICAgdGhpcy5yZXF1aXJlZCA9IHtcbiAgICAgIGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHk6IGZhbHNlLFxuICAgICAgYWNjZWxlcmF0aW9uOiBmYWxzZSxcbiAgICAgIHJvdGF0aW9uUmF0ZTogZmFsc2VcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTnVtYmVyIG9mIGxpc3RlbmVycyBzdWJzY3JpYmVkIHRvIHRoZSBgRGV2aWNlTW90aW9uYCBtb2R1bGUuXG4gICAgICpcbiAgICAgKiBAdGhpcyBEZXZpY2VNb3Rpb25Nb2R1bGVcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuX251bUxpc3RlbmVycyA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIGZ1bmN0aW9uIG9mIHRoZSBtb2R1bGUncyBwcm9taXNlLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKiBAc2VlIERldmljZU1vdGlvbk1vZHVsZSNpbml0XG4gICAgICovXG4gICAgdGhpcy5fcHJvbWlzZVJlc29sdmUgPSBudWxsO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFVuaWZ5aW5nIGZhY3RvciBvZiB0aGUgbW90aW9uIGRhdGEgdmFsdWVzIChgMWAgb24gQW5kcm9pZCwgYC0xYCBvbiBpT1MpLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLl91bmlmeU1vdGlvbkRhdGEgPSAocGxhdGZvcm0ub3MuZmFtaWx5ID09PSAnaU9TJyA/IC0xIDogMSk7XG5cbiAgICAvKipcbiAgICAgKiBVbmlmeWluZyBmYWN0b3Igb2YgdGhlIHBlcmlvZCAoYDAuMDAxYCBvbiBBbmRyb2lkLCBgMWAgb24gaU9TKS5cbiAgICAgKlxuICAgICAqIEB0aGlzIERldmljZU1vdGlvbk1vZHVsZVxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5fdW5pZnlQZXJpb2QgPSAocGxhdGZvcm0ub3MuZmFtaWx5ID09PSAnQW5kcm9pZCcgPyAwLjAwMSA6IDEpO1xuXG4gICAgLyoqXG4gICAgICogQWNjZWxlcmF0aW9uIGNhbGN1bGF0ZWQgZnJvbSB0aGUgYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgIHJhdyB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBAdGhpcyBEZXZpY2VNb3Rpb25Nb2R1bGVcbiAgICAgKiBAdHlwZSB7bnVtYmVyW119XG4gICAgICogQGRlZmF1bHQgWzAsIDAsIDBdXG4gICAgICovXG4gICAgdGhpcy5fY2FsY3VsYXRlZEFjY2VsZXJhdGlvbiA9IFswLCAwLCAwXTtcblxuICAgIC8qKlxuICAgICAqIFRpbWUgY29uc3RhbnQgKGhhbGYtbGlmZSkgb2YgdGhlIGhpZ2gtcGFzcyBmaWx0ZXIgdXNlZCB0byBzbW9vdGggdGhlIGFjY2VsZXJhdGlvbiB2YWx1ZXMgY2FsY3VsYXRlZCBmcm9tIHRoZSBhY2NlbGVyYXRpb24gaW5jbHVkaW5nIGdyYXZpdHkgcmF3IHZhbHVlcyAoaW4gc2Vjb25kcykuXG4gICAgICpcbiAgICAgKiBAdGhpcyBEZXZpY2VNb3Rpb25Nb2R1bGVcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDAuMVxuICAgICAqIEBjb25zdGFudFxuICAgICAqL1xuICAgIHRoaXMuX2NhbGN1bGF0ZWRBY2NlbGVyYXRpb25UaW1lQ29uc3RhbnQgPSAwLjE7XG5cbiAgICAvKipcbiAgICAgKiBMYXRlc3QgYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgIHJhdyB2YWx1ZSwgdXNlZCBpbiB0aGUgaGlnaC1wYXNzIGZpbHRlciB0byBjYWxjdWxhdGUgdGhlIGFjY2VsZXJhdGlvbiAoaWYgdGhlIGBhY2NlbGVyYXRpb25gIHZhbHVlcyBhcmUgbm90IHByb3ZpZGVkIGJ5IGAnZGV2aWNlbW90aW9uJ2ApLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcltdfVxuICAgICAqIEBkZWZhdWx0IFswLCAwLCAwXVxuICAgICAqL1xuICAgIHRoaXMuX2xhc3RBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5ID0gWzAsIDAsIDBdO1xuICBcbiAgICAvKipcbiAgICAgKiBSb3RhdGlvbiByYXRlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgb3JpZW50YXRpb24gdmFsdWVzLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcltdfVxuICAgICAqIEBkZWZhdWx0IFswLCAwLCAwXVxuICAgICAqL1xuICAgIHRoaXMuX2NhbGN1bGF0ZWRSb3RhdGlvblJhdGUgPSBbMCwgMCwgMF07XG5cbiAgICAvKipcbiAgICAgKiBMYXRlc3Qgb3JpZW50YXRpb24gdmFsdWUsIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSByb3RhdGlvbiByYXRlICAoaWYgdGhlIGByb3RhdGlvblJhdGVgIHZhbHVlcyBhcmUgbm90IHByb3ZpZGVkIGJ5IGAnZGV2aWNlbW90aW9uJ2ApLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcltdfVxuICAgICAqIEBkZWZhdWx0IFswLCAwLCAwXVxuICAgICAqL1xuICAgIHRoaXMuX2xhc3RPcmllbnRhdGlvbiA9IFswLCAwLCAwXTtcblxuICAgIC8qKlxuICAgICAqIExhdGVzdCBvcmllbnRhdGlvbiB0aW1lc3RhbXBzLCB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgcm90YXRpb24gcmF0ZSAoaWYgdGhlIGByb3RhdGlvblJhdGVgIHZhbHVlcyBhcmUgbm90IHByb3ZpZGVkIGJ5IGAnZGV2aWNlbW90aW9uJ2ApLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcltdfVxuICAgICAqIEBkZWZhdWx0IFswLCAwLCAwXVxuICAgICAqL1xuICAgIHRoaXMuX2xhc3RPcmllbnRhdGlvblRpbWVzdGFtcCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgYmluZGluZyBvZiB0aGUgc2Vuc29yIGNoZWNrLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuX2RldmljZW1vdGlvbkNoZWNrID0gdGhpcy5fZGV2aWNlbW90aW9uQ2hlY2suYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCBiaW5kaW5nIG9mIHRoZSBgJ2RldmljZW1vdGlvbidgIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlTW90aW9uTW9kdWxlXG4gICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuX2RldmljZW1vdGlvbkxpc3RlbmVyID0gdGhpcy5fZGV2aWNlbW90aW9uTGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNheSBmYWN0b3Igb2YgdGhlIGhpZ2gtcGFzcyBmaWx0ZXIgdXNlZCB0byBjYWxjdWxhdGUgdGhlIGFjY2VsZXJhdGlvbiBmcm9tIHRoZSBgYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAgcmF3IHZhbHVlcy5cbiAgICpcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgX2NhbGN1bGF0ZWRBY2NlbGVyYXRpb25EZWNheSgpIHtcbiAgICByZXR1cm4gTWF0aC5leHAoLTIgKiBNYXRoLlBJICogdGhpcy5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LnBlcmlvZCAvIHRoaXMuX2NhbGN1bGF0ZWRBY2NlbGVyYXRpb25UaW1lQ29uc3RhbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbnNvciBjaGVjayBvbiBpbml0aWFsaXphdGlvbiBvZiB0aGUgbW9kdWxlLlxuICAgKiBUaGlzIG1ldGhvZDpcbiAgICogLSBjaGVja3Mgd2hldGhlciB0aGUgYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgLCB0aGUgYGFjY2VsZXJhdGlvbmAsXG4gICAqICAgYW5kIHRoZSBgcm90YXRpb25SYXRlYCB2YWx1ZXMgYXJlIHZhbGlkIG9yIG5vdDtcbiAgICogLSBnZXRzIHRoZSBwZXJpb2Qgb2YgdGhlIGAnZGV2aWNlbW90aW9uJ2AgZXZlbnQgYW5kIHNldHMgdGhlIHBlcmlvZCBvZlxuICAgKiAgIHRoZSBgQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAsIGBBY2NlbGVyYXRpb25gLCBhbmQgYFJvdGF0aW9uUmF0ZWBcbiAgICogICBzdWJtb2R1bGVzO1xuICAgKiAtIChpbiB0aGUgY2FzZSB3aGVyZSBhY2NlbGVyYXRpb24gcmF3IHZhbHVlcyBhcmUgbm90IHByb3ZpZGVkKVxuICAgKiAgIGluZGljYXRlcyB3aGV0aGVyIHRoZSBhY2NlbGVyYXRpb24gY2FuIGJlIGNhbGN1bGF0ZWQgZnJvbSB0aGVcbiAgICogICBgYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAgdW5pZmllZCB2YWx1ZXMgb3Igbm90LlxuICAgKlxuICAgKiBAcGFyYW0ge0RldmljZU1vdGlvbkV2ZW50fSBlIC0gVGhlIGZpcnN0IGAnZGV2aWNlbW90aW9uJ2AgZXZlbnQgY2F1Z2h0LlxuICAgKi9cbiAgX2RldmljZW1vdGlvbkNoZWNrKGUpIHtcbiAgICB0aGlzLmlzUHJvdmlkZWQgPSB0cnVlO1xuICAgIHRoaXMucGVyaW9kID0gZS5pbnRlcnZhbCAvIDEwMDA7XG5cbiAgICAvLyBTZW5zb3IgYXZhaWxhYmlsaXR5IGZvciB0aGUgYWNjZWxlcmF0aW9uIGluY2x1ZGluZyBncmF2aXR5XG4gICAgdGhpcy5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LmlzUHJvdmlkZWQgPSAoXG4gICAgICBlLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkgJiZcbiAgICAgICh0eXBlb2YgZS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LnggPT09ICdudW1iZXInKSAmJlxuICAgICAgKHR5cGVvZiBlLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueSA9PT0gJ251bWJlcicpICYmXG4gICAgICAodHlwZW9mIGUuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56ID09PSAnbnVtYmVyJylcbiAgICApO1xuICAgIHRoaXMuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS5wZXJpb2QgPSBlLmludGVydmFsICogdGhpcy5fdW5pZnlQZXJpb2Q7XG5cbiAgICAvLyBTZW5zb3IgYXZhaWxhYmlsaXR5IGZvciB0aGUgYWNjZWxlcmF0aW9uXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uaXNQcm92aWRlZCA9IChcbiAgICAgIGUuYWNjZWxlcmF0aW9uICYmXG4gICAgICAodHlwZW9mIGUuYWNjZWxlcmF0aW9uLnggPT09ICdudW1iZXInKSAmJlxuICAgICAgKHR5cGVvZiBlLmFjY2VsZXJhdGlvbi55ID09PSAnbnVtYmVyJykgJiZcbiAgICAgICh0eXBlb2YgZS5hY2NlbGVyYXRpb24ueiA9PT0gJ251bWJlcicpXG4gICAgKTtcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5wZXJpb2QgPSBlLmludGVydmFsICogdGhpcy5fdW5pZnlQZXJpb2Q7XG5cbiAgICAvLyBTZW5zb3IgYXZhaWxhYmlsaXR5IGZvciB0aGUgcm90YXRpb24gcmF0ZVxuICAgIHRoaXMucm90YXRpb25SYXRlLmlzUHJvdmlkZWQgPSAoXG4gICAgICBlLnJvdGF0aW9uUmF0ZSAmJlxuICAgICAgKHR5cGVvZiBlLnJvdGF0aW9uUmF0ZS5hbHBoYSA9PT0gJ251bWJlcicpICYmXG4gICAgICAodHlwZW9mIGUucm90YXRpb25SYXRlLmJldGEgPT09ICdudW1iZXInKSAmJlxuICAgICAgKHR5cGVvZiBlLnJvdGF0aW9uUmF0ZS5nYW1tYSA9PT0gJ251bWJlcicpXG4gICAgKTtcbiAgICB0aGlzLnJvdGF0aW9uUmF0ZS5wZXJpb2QgPSBlLmludGVydmFsICogdGhpcy5fdW5pZnlQZXJpb2Q7XG5cbiAgICAvLyBXZSBvbmx5IG5lZWQgdG8gbGlzdGVuIHRvIG9uZSBldmVudCAoPT4gcmVtb3ZlIHRoZSBsaXN0ZW5lcilcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGV2aWNlbW90aW9uJywgdGhpcy5fZGV2aWNlbW90aW9uQ2hlY2ssIGZhbHNlKTtcblxuICAgIC8vIElmIGFjY2VsZXJhdGlvbiBpcyBub3QgcHJvdmlkZWQgYnkgcmF3IHNlbnNvcnMsIGluZGljYXRlIHdoZXRoZXIgaXRcbiAgICAvLyBjYW4gYmUgY2FsY3VsYXRlZCB3aXRoIGBhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5YCBvciBub3RcbiAgICBpZiAoIXRoaXMuYWNjZWxlcmF0aW9uLmlzUHJvdmlkZWQpXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbi5pc0NhbGN1bGF0ZWQgPSB0aGlzLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkuaXNQcm92aWRlZDtcblxuICAgIC8vIFdBUk5JTkdcbiAgICAvLyBUaGUgbGluZXMgb2YgY29kZSBiZWxvdyBhcmUgY29tbWVudGVkIGJlY2F1c2Ugb2YgYSBidWcgb2YgQ2hyb21lXG4gICAgLy8gb24gc29tZSBBbmRyb2lkIGRldmljZXMsIHdoZXJlICdkZXZpY2Vtb3Rpb24nIGV2ZW50cyBhcmUgbm90IHNlbnRcbiAgICAvLyBvciBjYXVnaHQgaWYgdGhlIGxpc3RlbmVyIGlzIHNldCB1cCBhZnRlciBhICdkZXZpY2VvcmllbnRhdGlvbidcbiAgICAvLyBsaXN0ZW5lci4gSGVyZSwgdGhlIF90cnlPcmllbnRhdGlvbkZhbGxiYWNrIG1ldGhvZCB3b3VsZCBhZGQgYVxuICAgIC8vICdkZXZpY2VvcmllbnRhdGlvbicgbGlzdGVuZXIgYW5kIGJsb2NrIGFsbCBzdWJzZXF1ZW50ICdkZXZpY2Vtb3Rpb24nXG4gICAgLy8gZXZlbnRzIG9uIHRoZXNlIGRldmljZXMuIENvbW1lbnRzIHdpbGwgYmUgcmVtb3ZlZCBvbmNlIHRoZSBidWcgb2ZcbiAgICAvLyBDaHJvbWUgaXMgY29ycmVjdGVkLlxuXG4gICAgLy8gaWYgKHRoaXMucmVxdWlyZWQucm90YXRpb25SYXRlICYmICF0aGlzLnJvdGF0aW9uUmF0ZS5pc1Byb3ZpZGVkKVxuICAgIC8vICAgdGhpcy5fdHJ5T3JpZW50YXRpb25GYWxsYmFjaygpO1xuICAgIC8vIGVsc2VcbiAgICB0aGlzLl9wcm9taXNlUmVzb2x2ZSh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBgJ2RldmljZW1vdGlvbidgIGV2ZW50IGNhbGxiYWNrLlxuICAgKiBUaGlzIG1ldGhvZCBlbWl0cyBhbiBldmVudCB3aXRoIHRoZSByYXcgYCdkZXZpY2Vtb3Rpb24nYCB2YWx1ZXMsIGFuZCBlbWl0c1xuICAgKiBldmVudHMgd2l0aCB0aGUgdW5pZmllZCBgYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAsIGBhY2NlbGVyYXRpb25gLCBcbiAgICogYW5kIC8gb3IgYHJvdGF0aW9uUmF0ZWAgdmFsdWVzIGlmIHRoZXkgYXJlIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge0RldmljZU1vdGlvbkV2ZW50fSBlIC0gYCdkZXZpY2Vtb3Rpb24nYCBldmVudCB0aGUgdmFsdWVzIGFyZSBjYWxjdWxhdGVkIGZyb20uXG4gICAqL1xuICBfZGV2aWNlbW90aW9uTGlzdGVuZXIoZSkge1xuICAgIC8vICdkZXZpY2Vtb3Rpb24nIGV2ZW50IChyYXcgdmFsdWVzKVxuICAgIHRoaXMuX2VtaXREZXZpY2VNb3Rpb25FdmVudChlKTtcblxuICAgIC8vICdhY2NlbGVyYXRpb24nIGV2ZW50ICh1bmlmaWVkIHZhbHVlcylcbiAgICBpZiAodGhpcy5yZXF1aXJlZC5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5ICYmIHRoaXMuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS5pc1ZhbGlkKVxuICAgICAgdGhpcy5fZW1pdEFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlFdmVudChlKTtcblxuICAgIC8vICdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JyBldmVudCAodW5pZmllZCB2YWx1ZXMpXG4gICAgaWYgKHRoaXMucmVxdWlyZWQuYWNjZWxlcmF0aW9uICYmIHRoaXMuYWNjZWxlcmF0aW9uLmlzVmFsaWQpIC8vIHRoZSBmYWxsYmFjayBjYWxjdWxhdGlvbiBvZiB0aGUgYWNjZWxlcmF0aW9uIGhhcHBlbnMgaW4gdGhlIGBfZW1pdEFjY2VsZXJhdGlvbmAgbWV0aG9kLCBzbyB3ZSBjaGVjayBpZiB0aGlzLmFjY2VsZXJhdGlvbi5pc1ZhbGlkXG4gICAgICB0aGlzLl9lbWl0QWNjZWxlcmF0aW9uRXZlbnQoZSk7XG5cbiAgICAvLyAncm90YXRpb25SYXRlJyBldmVudCAodW5pZmllZCB2YWx1ZXMpXG4gICAgaWYgKHRoaXMucmVxdWlyZWQucm90YXRpb25SYXRlICYmIHRoaXMucm90YXRpb25SYXRlLmlzUHJvdmlkZWQpIC8vIHRoZSBmYWxsYmFjayBjYWxjdWxhdGlvbiBvZiB0aGUgcm90YXRpb24gcmF0ZSBkb2VzIE5PVCBoYXBwZW4gaW4gdGhlIGBfZW1pdFJvdGF0aW9uUmF0ZWAgbWV0aG9kLCBzbyB3ZSBvbmx5IGNoZWNrIGlmIHRoaXMucm90YXRpb25SYXRlLmlzUHJvdmlkZWRcbiAgICAgIHRoaXMuX2VtaXRSb3RhdGlvblJhdGVFdmVudChlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgYCdkZXZpY2Vtb3Rpb24nYCByYXcgdmFsdWVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0RldmljZU1vdGlvbkV2ZW50fSBlIC0gYCdkZXZpY2Vtb3Rpb24nYCBldmVudCB0aGUgdmFsdWVzIGFyZSBjYWxjdWxhdGVkIGZyb20uXG4gICAqL1xuICBfZW1pdERldmljZU1vdGlvbkV2ZW50KGUpIHtcbiAgICBsZXQgb3V0RXZlbnQgPSB0aGlzLmV2ZW50O1xuXG4gICAgaWYgKGUuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSkge1xuICAgICAgb3V0RXZlbnRbMF0gPSBlLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueDtcbiAgICAgIG91dEV2ZW50WzFdID0gZS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lnk7XG4gICAgICBvdXRFdmVudFsyXSA9IGUuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56O1xuICAgIH1cblxuICAgIGlmIChlLmFjY2VsZXJhdGlvbikge1xuICAgICAgb3V0RXZlbnRbM10gPSBlLmFjY2VsZXJhdGlvbi54O1xuICAgICAgb3V0RXZlbnRbNF0gPSBlLmFjY2VsZXJhdGlvbi55O1xuICAgICAgb3V0RXZlbnRbNV0gPSBlLmFjY2VsZXJhdGlvbi56O1xuICAgIH1cblxuICAgIGlmIChlLnJvdGF0aW9uUmF0ZSkge1xuICAgICAgb3V0RXZlbnRbNl0gPSBlLnJvdGF0aW9uUmF0ZS5hbHBoYTtcbiAgICAgIG91dEV2ZW50WzddID0gZS5yb3RhdGlvblJhdGUuYmV0YTtcbiAgICAgIG91dEV2ZW50WzhdID0gZS5yb3RhdGlvblJhdGUuZ2FtbWE7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KG91dEV2ZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgIHVuaWZpZWQgdmFsdWVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0RldmljZU1vdGlvbkV2ZW50fSBlIC0gYCdkZXZpY2Vtb3Rpb24nYCBldmVudCB0aGUgdmFsdWVzIGFyZSBjYWxjdWxhdGVkIGZyb20uXG4gICAqL1xuICBfZW1pdEFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlFdmVudChlKSB7XG4gICAgbGV0IG91dEV2ZW50ID0gdGhpcy5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LmV2ZW50O1xuXG4gICAgb3V0RXZlbnRbMF0gPSBlLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueCAqIHRoaXMuX3VuaWZ5TW90aW9uRGF0YTtcbiAgICBvdXRFdmVudFsxXSA9IGUuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS55ICogdGhpcy5fdW5pZnlNb3Rpb25EYXRhO1xuICAgIG91dEV2ZW50WzJdID0gZS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LnogKiB0aGlzLl91bmlmeU1vdGlvbkRhdGE7XG5cbiAgICB0aGlzLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkuZW1pdChvdXRFdmVudCk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgdGhlIGBhY2NlbGVyYXRpb25gIHVuaWZpZWQgdmFsdWVzLlxuICAgKiBXaGVuIHRoZSBgYWNjZWxlcmF0aW9uYCByYXcgdmFsdWVzIGFyZSBub3QgYXZhaWxhYmxlLCB0aGUgbWV0aG9kXG4gICAqIGFsc28gY2FsY3VsYXRlcyB0aGUgYWNjZWxlcmF0aW9uIGZyb20gdGhlXG4gICAqIGBhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5YCByYXcgdmFsdWVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0RldmljZU1vdGlvbkV2ZW50fSBlIC0gVGhlIGAnZGV2aWNlbW90aW9uJ2AgZXZlbnQuXG4gICAqL1xuICBfZW1pdEFjY2VsZXJhdGlvbkV2ZW50KGUpIHtcbiAgICBsZXQgb3V0RXZlbnQgPSB0aGlzLmFjY2VsZXJhdGlvbi5ldmVudDtcblxuICAgIGlmICh0aGlzLmFjY2VsZXJhdGlvbi5pc1Byb3ZpZGVkKSB7XG4gICAgICAvLyBJZiByYXcgYWNjZWxlcmF0aW9uIHZhbHVlcyBhcmUgcHJvdmlkZWRcbiAgICAgIG91dEV2ZW50WzBdID0gZS5hY2NlbGVyYXRpb24ueCAqIHRoaXMuX3VuaWZ5TW90aW9uRGF0YTtcbiAgICAgIG91dEV2ZW50WzFdID0gZS5hY2NlbGVyYXRpb24ueSAqIHRoaXMuX3VuaWZ5TW90aW9uRGF0YTtcbiAgICAgIG91dEV2ZW50WzJdID0gZS5hY2NlbGVyYXRpb24ueiAqIHRoaXMuX3VuaWZ5TW90aW9uRGF0YTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS5pc1ZhbGlkKSB7XG4gICAgICAvLyBPdGhlcndpc2UsIGlmIGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkgdmFsdWVzIGFyZSBwcm92aWRlZCxcbiAgICAgIC8vIGVzdGltYXRlIHRoZSBhY2NlbGVyYXRpb24gd2l0aCBhIGhpZ2gtcGFzcyBmaWx0ZXJcbiAgICAgIGNvbnN0IGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkgPSBbXG4gICAgICAgIGUuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS54ICogdGhpcy5fdW5pZnlNb3Rpb25EYXRhLFxuICAgICAgICBlLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueSAqIHRoaXMuX3VuaWZ5TW90aW9uRGF0YSxcbiAgICAgICAgZS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LnogKiB0aGlzLl91bmlmeU1vdGlvbkRhdGFcbiAgICAgIF07XG4gICAgICBjb25zdCBrID0gdGhpcy5fY2FsY3VsYXRlZEFjY2VsZXJhdGlvbkRlY2F5O1xuXG4gICAgICAvLyBIaWdoLXBhc3MgZmlsdGVyIHRvIGVzdGltYXRlIHRoZSBhY2NlbGVyYXRpb24gKHdpdGhvdXQgdGhlIGdyYXZpdHkpXG4gICAgICB0aGlzLl9jYWxjdWxhdGVkQWNjZWxlcmF0aW9uWzBdID0gKDEgKyBrKSAqIDAuNSAqIGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlbMF0gLSAoMSArIGspICogMC41ICogdGhpcy5fbGFzdEFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlbMF0gKyBrICogdGhpcy5fY2FsY3VsYXRlZEFjY2VsZXJhdGlvblswXTtcbiAgICAgIHRoaXMuX2NhbGN1bGF0ZWRBY2NlbGVyYXRpb25bMV0gPSAoMSArIGspICogMC41ICogYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eVsxXSAtICgxICsgaykgKiAwLjUgKiB0aGlzLl9sYXN0QWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eVsxXSArIGsgKiB0aGlzLl9jYWxjdWxhdGVkQWNjZWxlcmF0aW9uWzFdO1xuICAgICAgdGhpcy5fY2FsY3VsYXRlZEFjY2VsZXJhdGlvblsyXSA9ICgxICsgaykgKiAwLjUgKiBhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5WzJdIC0gKDEgKyBrKSAqIDAuNSAqIHRoaXMuX2xhc3RBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5WzJdICsgayAqIHRoaXMuX2NhbGN1bGF0ZWRBY2NlbGVyYXRpb25bMl07XG5cbiAgICAgIHRoaXMuX2xhc3RBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5WzBdID0gYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eVswXTtcbiAgICAgIHRoaXMuX2xhc3RBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5WzFdID0gYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eVsxXTtcbiAgICAgIHRoaXMuX2xhc3RBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5WzJdID0gYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eVsyXTtcblxuICAgICAgb3V0RXZlbnRbMF0gPSB0aGlzLl9jYWxjdWxhdGVkQWNjZWxlcmF0aW9uWzBdO1xuICAgICAgb3V0RXZlbnRbMV0gPSB0aGlzLl9jYWxjdWxhdGVkQWNjZWxlcmF0aW9uWzFdO1xuICAgICAgb3V0RXZlbnRbMl0gPSB0aGlzLl9jYWxjdWxhdGVkQWNjZWxlcmF0aW9uWzJdO1xuICAgIH1cblxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmVtaXQob3V0RXZlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBgcm90YXRpb25SYXRlYCB1bmlmaWVkIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHtEZXZpY2VNb3Rpb25FdmVudH0gZSAtIGAnZGV2aWNlbW90aW9uJ2AgZXZlbnQgdGhlIHZhbHVlcyBhcmUgY2FsY3VsYXRlZCBmcm9tLlxuICAgKi9cbiAgX2VtaXRSb3RhdGlvblJhdGVFdmVudChlKSB7XG4gICAgbGV0IG91dEV2ZW50ID0gdGhpcy5yb3RhdGlvblJhdGUuZXZlbnQ7XG5cbiAgICBvdXRFdmVudFswXSA9IGUucm90YXRpb25SYXRlLmFscGhhO1xuICAgIG91dEV2ZW50WzFdID0gZS5yb3RhdGlvblJhdGUuYmV0YTtcbiAgICBvdXRFdmVudFsyXSA9IGUucm90YXRpb25SYXRlLmdhbW1hO1xuXG4gICAgLy8gVE9ETyg/KTogdW5pZnlcblxuICAgIHRoaXMucm90YXRpb25SYXRlLmVtaXQob3V0RXZlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgYW5kIGVtaXRzIHRoZSBgcm90YXRpb25SYXRlYCB1bmlmaWVkIHZhbHVlcyBmcm9tIHRoZSBgb3JpZW50YXRpb25gIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJbXX0gb3JpZW50YXRpb24gLSBMYXRlc3QgYG9yaWVudGF0aW9uYCByYXcgdmFsdWVzLlxuICAgKi9cbiAgX2NhbGN1bGF0ZVJvdGF0aW9uUmF0ZUZyb21PcmllbnRhdGlvbihvcmllbnRhdGlvbikge1xuICAgIGNvbnN0IG5vdyA9IGdldExvY2FsVGltZSgpO1xuICAgIGNvbnN0IGsgPSAwLjg7IC8vIFRPRE86IGltcHJvdmUgbG93IHBhc3MgZmlsdGVyIChmcmFtZXMgYXJlIG5vdCByZWd1bGFyKVxuICAgIGNvbnN0IGFscGhhSXNWYWxpZCA9ICh0eXBlb2Ygb3JpZW50YXRpb25bMF0gPT09ICdudW1iZXInKTtcblxuICAgIGlmICh0aGlzLl9sYXN0T3JpZW50YXRpb25UaW1lc3RhbXApIHtcbiAgICAgIGxldCByQWxwaGEgPSBudWxsO1xuICAgICAgbGV0IHJCZXRhO1xuICAgICAgbGV0IHJHYW1tYTtcblxuICAgICAgbGV0IGFscGhhRGlzY29udGludWl0eUZhY3RvciA9IDA7XG4gICAgICBsZXQgYmV0YURpc2NvbnRpbnVpdHlGYWN0b3IgPSAwO1xuICAgICAgbGV0IGdhbW1hRGlzY29udGludWl0eUZhY3RvciA9IDA7XG5cbiAgICAgIGNvbnN0IGRlbHRhVCA9IG5vdyAtIHRoaXMuX2xhc3RPcmllbnRhdGlvblRpbWVzdGFtcDtcblxuICAgICAgaWYgKGFscGhhSXNWYWxpZCkge1xuICAgICAgICAvLyBhbHBoYSBkaXNjb250aW51aXR5ICgrMzYwIC0+IDAgb3IgMCAtPiArMzYwKVxuICAgICAgICBpZiAodGhpcy5fbGFzdE9yaWVudGF0aW9uWzBdID4gMzIwICYmIG9yaWVudGF0aW9uWzBdIDwgNDApXG4gICAgICAgICAgYWxwaGFEaXNjb250aW51aXR5RmFjdG9yID0gMzYwO1xuICAgICAgICBlbHNlIGlmICh0aGlzLl9sYXN0T3JpZW50YXRpb25bMF0gPCA0MCAmJiBvcmllbnRhdGlvblswXSA+IDMyMClcbiAgICAgICAgICBhbHBoYURpc2NvbnRpbnVpdHlGYWN0b3IgPSAtMzYwO1xuICAgICAgfVxuXG4gICAgICAvLyBiZXRhIGRpc2NvbnRpbnVpdHkgKCsxODAgLT4gLTE4MCBvciAtMTgwIC0+ICsxODApXG4gICAgICBpZiAodGhpcy5fbGFzdE9yaWVudGF0aW9uWzFdID4gMTQwICYmIG9yaWVudGF0aW9uWzFdIDwgLTE0MClcbiAgICAgICAgYmV0YURpc2NvbnRpbnVpdHlGYWN0b3IgPSAzNjA7XG4gICAgICBlbHNlIGlmICh0aGlzLl9sYXN0T3JpZW50YXRpb25bMV0gPCAtMTQwICYmIG9yaWVudGF0aW9uWzFdID4gMTQwKVxuICAgICAgICBiZXRhRGlzY29udGludWl0eUZhY3RvciA9IC0zNjA7XG5cbiAgICAgIC8vIGdhbW1hIGRpc2NvbnRpbnVpdGllcyAoKzE4MCAtPiAtMTgwIG9yIC0xODAgLT4gKzE4MClcbiAgICAgIGlmICh0aGlzLl9sYXN0T3JpZW50YXRpb25bMl0gPiA1MCAmJiBvcmllbnRhdGlvblsyXSA8IC01MClcbiAgICAgICAgZ2FtbWFEaXNjb250aW51aXR5RmFjdG9yID0gMTgwO1xuICAgICAgZWxzZSBpZiAodGhpcy5fbGFzdE9yaWVudGF0aW9uWzJdIDwgLTUwICYmIG9yaWVudGF0aW9uWzJdID4gNTApXG4gICAgICAgIGdhbW1hRGlzY29udGludWl0eUZhY3RvciA9IC0xODA7XG5cbiAgICAgIGlmIChkZWx0YVQgPiAwKSB7XG4gICAgICAgIC8vIExvdyBwYXNzIGZpbHRlciB0byBzbW9vdGggdGhlIGRhdGFcbiAgICAgICAgaWYgKGFscGhhSXNWYWxpZClcbiAgICAgICAgICByQWxwaGEgPSBrICogdGhpcy5fY2FsY3VsYXRlZFJvdGF0aW9uUmF0ZVswXSArICgxIC0gaykgKiAob3JpZW50YXRpb25bMF0gLSB0aGlzLl9sYXN0T3JpZW50YXRpb25bMF0gKyBhbHBoYURpc2NvbnRpbnVpdHlGYWN0b3IpIC8gZGVsdGFUO1xuICAgICAgICByQmV0YSA9IGsgKiB0aGlzLl9jYWxjdWxhdGVkUm90YXRpb25SYXRlWzFdICsgKDEgLSBrKSAqIChvcmllbnRhdGlvblsxXSAtIHRoaXMuX2xhc3RPcmllbnRhdGlvblsxXSArIGJldGFEaXNjb250aW51aXR5RmFjdG9yKSAvIGRlbHRhVDtcbiAgICAgICAgckdhbW1hID0gayAqIHRoaXMuX2NhbGN1bGF0ZWRSb3RhdGlvblJhdGVbMl0gKyAoMSAtIGspICogKG9yaWVudGF0aW9uWzJdIC0gdGhpcy5fbGFzdE9yaWVudGF0aW9uWzJdICsgZ2FtbWFEaXNjb250aW51aXR5RmFjdG9yKSAvIGRlbHRhVDtcblxuICAgICAgICB0aGlzLl9jYWxjdWxhdGVkUm90YXRpb25SYXRlWzBdID0gckFscGhhO1xuICAgICAgICB0aGlzLl9jYWxjdWxhdGVkUm90YXRpb25SYXRlWzFdID0gckJldGE7XG4gICAgICAgIHRoaXMuX2NhbGN1bGF0ZWRSb3RhdGlvblJhdGVbMl0gPSByR2FtbWE7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IHJlc2FtcGxlIHRoZSBlbWlzc2lvbiByYXRlIHRvIG1hdGNoIHRoZSBkZXZpY2Vtb3Rpb24gcmF0ZVxuICAgICAgdGhpcy5yb3RhdGlvblJhdGUuZW1pdCh0aGlzLl9jYWxjdWxhdGVkUm90YXRpb25SYXRlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9sYXN0T3JpZW50YXRpb25UaW1lc3RhbXAgPSBub3c7XG4gICAgdGhpcy5fbGFzdE9yaWVudGF0aW9uWzBdID0gb3JpZW50YXRpb25bMF07XG4gICAgdGhpcy5fbGFzdE9yaWVudGF0aW9uWzFdID0gb3JpZW50YXRpb25bMV07XG4gICAgdGhpcy5fbGFzdE9yaWVudGF0aW9uWzJdID0gb3JpZW50YXRpb25bMl07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHJvdGF0aW9uIHJhdGUgY2FuIGJlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgYG9yaWVudGF0aW9uYCB2YWx1ZXMgb3Igbm90LlxuICAgKi9cbiAgX3RyeU9yaWVudGF0aW9uRmFsbGJhY2soKSB7XG4gICAgTW90aW9uSW5wdXQucmVxdWlyZU1vZHVsZSgnb3JpZW50YXRpb24nKVxuICAgICAgLnRoZW4oKG9yaWVudGF0aW9uKSA9PiB7XG4gICAgICAgIGlmIChvcmllbnRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJXQVJOSU5HIChtb3Rpb24taW5wdXQpOiBUaGUgJ2RldmljZW1vdGlvbicgZXZlbnQgZG9lcyBub3QgZXhpc3RzIG9yIGRvZXMgbm90IHByb3ZpZGUgcm90YXRpb24gcmF0ZSB2YWx1ZXMgaW4geW91ciBicm93c2VyLCBzbyB0aGUgcm90YXRpb24gcmF0ZSBvZiB0aGUgZGV2aWNlIGlzIGVzdGltYXRlZCBmcm9tIHRoZSAnb3JpZW50YXRpb24nLCBjYWxjdWxhdGVkIGZyb20gdGhlICdkZXZpY2VvcmllbnRhdGlvbicgZXZlbnQuIFNpbmNlIHRoZSBjb21wYXNzIG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUsIG9ubHkgYGJldGFgIGFuZCBgZ2FtbWFgIGFuZ2xlcyBtYXkgYmUgcHJvdmlkZWQgKGBhbHBoYWAgd291bGQgYmUgbnVsbCkuXCIpO1xuXG4gICAgICAgICAgdGhpcy5yb3RhdGlvblJhdGUuaXNDYWxjdWxhdGVkID0gdHJ1ZTtcblxuICAgICAgICAgIE1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdvcmllbnRhdGlvbicsIChvcmllbnRhdGlvbikgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY2FsY3VsYXRlUm90YXRpb25SYXRlRnJvbU9yaWVudGF0aW9uKG9yaWVudGF0aW9uKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Byb21pc2VSZXNvbHZlKHRoaXMpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5jcmVhc2VzIHRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIHRvIHRoaXMgbW9kdWxlIChlaXRoZXIgYmVjYXVzZSBzb21lb25lIGxpc3RlbnNcbiAgICogdG8gdGhpcyBtb2R1bGUsIG9yIG9uZSBvZiB0aGUgdGhyZWUgYERPTUV2ZW50U3VibW9kdWxlc2BcbiAgICogKGBBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5YCwgYEFjY2VsZXJhdGlvbmAsIGBSb3RhdGlvblJhdGVgKS5cbiAgICogV2hlbiB0aGUgbnVtYmVyIG9mIGxpc3RlbmVycyByZWFjaGVzIGAxYCwgYWRkcyBhIGAnZGV2aWNlbW90aW9uJ2AgZXZlbnQgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBzZWUgRGV2aWNlTW90aW9uTW9kdWxlI2FkZExpc3RlbmVyXG4gICAqIEBzZWUgRE9NRXZlbnRTdWJtb2R1bGUjc3RhcnRcbiAgICovXG4gIF9hZGRMaXN0ZW5lcigpIHtcbiAgICB0aGlzLl9udW1MaXN0ZW5lcnMrKztcblxuICAgIGlmICh0aGlzLl9udW1MaXN0ZW5lcnMgPT09IDEpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlbW90aW9uJywgdGhpcy5fZGV2aWNlbW90aW9uTGlzdGVuZXIsIGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNyZWFzZXMgdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgdG8gdGhpcyBtb2R1bGUgKGVpdGhlciBiZWNhdXNlIHNvbWVvbmUgc3RvcHNcbiAgICogbGlzdGVuaW5nIHRvIHRoaXMgbW9kdWxlLCBvciBvbmUgb2YgdGhlIHRocmVlIGBET01FdmVudFN1Ym1vZHVsZXNgXG4gICAqIChgQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAsIGBBY2NlbGVyYXRpb25gLCBgUm90YXRpb25SYXRlYCkuXG4gICAqIFdoZW4gdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgcmVhY2hlcyBgMGAsIHJlbW92ZXMgdGhlIGAnZGV2aWNlbW90aW9uJ2AgZXZlbnQgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBzZWUgRGV2aWNlTW90aW9uTW9kdWxlI3JlbW92ZUxpc3RlbmVyXG4gICAqIEBzZWUgRE9NRXZlbnRTdWJtb2R1bGUjc3RvcFxuICAgKi9cbiAgX3JlbW92ZUxpc3RlbmVyKCkge1xuICAgIHRoaXMuX251bUxpc3RlbmVycy0tO1xuXG4gICAgaWYgKHRoaXMuX251bUxpc3RlbmVycyA9PT0gMClcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCB0aGlzLl9kZXZpY2Vtb3Rpb25MaXN0ZW5lciwgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIG9mIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEByZXR1cm4ge3Byb21pc2V9XG4gICAqL1xuICBpbml0KCkge1xuICAgIHJldHVybiBzdXBlci5pbml0KChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLl9wcm9taXNlUmVzb2x2ZSA9IHJlc29sdmU7XG5cbiAgICAgIGlmICh3aW5kb3cuRGV2aWNlTW90aW9uRXZlbnQpXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCB0aGlzLl9kZXZpY2Vtb3Rpb25DaGVjaywgZmFsc2UpO1xuXG4gICAgICAvLyBXQVJOSU5HXG4gICAgICAvLyBUaGUgbGluZXMgb2YgY29kZSBiZWxvdyBhcmUgY29tbWVudGVkIGJlY2F1c2Ugb2YgYSBidWcgb2YgQ2hyb21lXG4gICAgICAvLyBvbiBzb21lIEFuZHJvaWQgZGV2aWNlcywgd2hlcmUgJ2RldmljZW1vdGlvbicgZXZlbnRzIGFyZSBub3Qgc2VudFxuICAgICAgLy8gb3IgY2F1Z2h0IGlmIHRoZSBsaXN0ZW5lciBpcyBzZXQgdXAgYWZ0ZXIgYSAnZGV2aWNlb3JpZW50YXRpb24nXG4gICAgICAvLyBsaXN0ZW5lci4gSGVyZSwgdGhlIF90cnlPcmllbnRhdGlvbkZhbGxiYWNrIG1ldGhvZCB3b3VsZCBhZGQgYVxuICAgICAgLy8gJ2RldmljZW9yaWVudGF0aW9uJyBsaXN0ZW5lciBhbmQgYmxvY2sgYWxsIHN1YnNlcXVlbnQgJ2RldmljZW1vdGlvbidcbiAgICAgIC8vIGV2ZW50cyBvbiB0aGVzZSBkZXZpY2VzLiBDb21tZW50cyB3aWxsIGJlIHJlbW92ZWQgb25jZSB0aGUgYnVnIG9mXG4gICAgICAvLyBDaHJvbWUgaXMgY29ycmVjdGVkLlxuXG4gICAgICAvLyBlbHNlIGlmICh0aGlzLnJlcXVpcmVkLnJvdGF0aW9uUmF0ZSlcbiAgICAgIC8vIHRoaXMuX3RyeU9yaWVudGF0aW9uRmFsbGJhY2soKTtcblxuICAgICAgZWxzZVxuICAgICAgICByZXNvbHZlKHRoaXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBsaXN0ZW5lciB0byB0aGlzIG1vZHVsZS5cbiAgICogXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gTGlzdGVuZXIgdG8gYWRkLlxuICAgKi9cbiAgYWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICBzdXBlci5hZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgdGhpcy5fYWRkTGlzdGVuZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnJvbSB0aGlzIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgLSBMaXN0ZW5lciB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcikge1xuICAgIHN1cGVyLnJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcigpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERldmljZU1vdGlvbk1vZHVsZSgpOyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBgRGV2aWNlT3JpZW50YXRpb25gIG1vZHVsZVxuICogQGF1dGhvciA8YSBocmVmPSdtYWlsdG86c2ViYXN0aWVuQHJvYmFzemtpZXdpY3ouY29tJz5Tw6liYXN0aWVuIFJvYmFzemtpZXdpY3o8L2E+LCA8YSBocmVmPSdtYWlsdG86Tm9yYmVydC5TY2huZWxsQGlyY2FtLmZyJz5Ob3JiZXJ0IFNjaG5lbGw8L2E+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBET01FdmVudFN1Ym1vZHVsZSA9IHJlcXVpcmUoJy4vRE9NRXZlbnRTdWJtb2R1bGUnKTtcbmNvbnN0IElucHV0TW9kdWxlID0gcmVxdWlyZSgnLi9JbnB1dE1vZHVsZScpO1xuY29uc3QgTW90aW9uSW5wdXQgPSByZXF1aXJlKCcuL01vdGlvbklucHV0Jyk7XG5jb25zdCBwbGF0Zm9ybSA9IHJlcXVpcmUoJ3BsYXRmb3JtJyk7XG5cbi8qKlxuICogQ29udmVydHMgZGVncmVlcyB0byByYWRpYW5zLlxuICogXG4gKiBAcGFyYW0ge251bWJlcn0gZGVnIC0gQW5nbGUgaW4gZGVncmVlcy5cbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZGVnVG9SYWQoZGVnKSB7XG4gIHJldHVybiBkZWcgKiBNYXRoLlBJIC8gMTgwO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHJhZGlhbnMgdG8gZGVncmVlcy5cbiAqIFxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCAtIEFuZ2xlIGluIHJhZGlhbnMuXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHJhZFRvRGVnKHJhZCkge1xuICByZXR1cm4gcmFkICogMTgwIC8gTWF0aC5QSTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemVzIGEgMyB4IDMgbWF0cml4LlxuICogXG4gKiBAcGFyYW0ge251bWJlcltdfSBtIC0gTWF0cml4IHRvIG5vcm1hbGl6ZSwgcmVwcmVzZW50ZWQgYnkgYW4gYXJyYXkgb2YgbGVuZ3RoIDkuXG4gKiBAcmV0dXJuIHtudW1iZXJbXX1cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplKG0pIHtcbiAgY29uc3QgZGV0ID0gbVswXSAqIG1bNF0gKiBtWzhdICsgbVsxXSAqIG1bNV0gKiBtWzZdICsgbVsyXSAqIG1bM10gKiBtWzddIC0gbVswXSAqIG1bNV0gKiBtWzddIC0gbVsxXSAqIG1bM10gKiBtWzhdIC0gbVsyXSAqIG1bNF0gKiBtWzZdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkrKylcbiAgICBtW2ldIC89IGRldDtcblxuICByZXR1cm4gbTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIEV1bGVyIGFuZ2xlIGBbYWxwaGEsIGJldGEsIGdhbW1hXWAgdG8gdGhlIFczQyBzcGVjaWZpY2F0aW9uLCB3aGVyZTpcbiAqIC0gYGFscGhhYCBpcyBpbiBbMDsgKzM2MFs7XG4gKiAtIGBiZXRhYCBpcyBpbiBbLTE4MDsgKzE4MFs7XG4gKiAtIGBnYW1tYWAgaXMgaW4gWy05MDsgKzkwWy5cbiAqIFxuICogQHBhcmFtIHtudW1iZXJbXX0gZXVsZXJBbmdsZSAtIEV1bGVyIGFuZ2xlIHRvIHVuaWZ5LCByZXByZXNlbnRlZCBieSBhbiBhcnJheSBvZiBsZW5ndGggMyAoYFthbHBoYSwgYmV0YSwgZ2FtbWFdYCkuXG4gKiBAc2VlIHtAbGluayBodHRwOi8vd3d3LnczLm9yZy9UUi9vcmllbnRhdGlvbi1ldmVudC99XG4gKi9cbmZ1bmN0aW9uIHVuaWZ5KGV1bGVyQW5nbGUpIHtcbiAgLy8gQ2YuIFczQyBzcGVjaWZpY2F0aW9uIChodHRwOi8vdzNjLmdpdGh1Yi5pby9kZXZpY2VvcmllbnRhdGlvbi9zcGVjLXNvdXJjZS1vcmllbnRhdGlvbi5odG1sKVxuICAvLyBhbmQgRXVsZXIgYW5nbGVzIFdpa2lwZWRpYSBwYWdlIChodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0V1bGVyX2FuZ2xlcykuXG4gIC8vXG4gIC8vIFczQyBjb252ZW50aW9uOiBUYWl04oCTQnJ5YW4gYW5nbGVzIFotWCctWScnLCB3aGVyZTpcbiAgLy8gICBhbHBoYSBpcyBpbiBbMDsgKzM2MFssXG4gIC8vICAgYmV0YSBpcyBpbiBbLTE4MDsgKzE4MFssXG4gIC8vICAgZ2FtbWEgaXMgaW4gWy05MDsgKzkwWy5cblxuICBjb25zdCBhbHBoYUlzVmFsaWQgPSAodHlwZW9mIGV1bGVyQW5nbGVbMF0gPT09ICdudW1iZXInKTtcblxuICBjb25zdCBfYWxwaGEgPSAoYWxwaGFJc1ZhbGlkID8gZGVnVG9SYWQoZXVsZXJBbmdsZVswXSkgOiAwKTtcbiAgY29uc3QgX2JldGEgPSBkZWdUb1JhZChldWxlckFuZ2xlWzFdKTtcbiAgY29uc3QgX2dhbW1hID0gZGVnVG9SYWQoZXVsZXJBbmdsZVsyXSk7XG5cbiAgY29uc3QgY0EgPSBNYXRoLmNvcyhfYWxwaGEpO1xuICBjb25zdCBjQiA9IE1hdGguY29zKF9iZXRhKTtcbiAgY29uc3QgY0cgPSBNYXRoLmNvcyhfZ2FtbWEpO1xuICBjb25zdCBzQSA9IE1hdGguc2luKF9hbHBoYSk7XG4gIGNvbnN0IHNCID0gTWF0aC5zaW4oX2JldGEpO1xuICBjb25zdCBzRyA9IE1hdGguc2luKF9nYW1tYSk7XG5cbiAgbGV0IGFscGhhLCBiZXRhLCBnYW1tYTtcblxuICBsZXQgbSA9IFtcbiAgICBjQSAqIGNHIC0gc0EgKiBzQiAqIHNHLFxuICAgIC1jQiAqIHNBLFxuICAgIGNBICogc0cgKyBjRyAqIHNBICogc0IsXG4gICAgY0cgKiBzQSArIGNBICogc0IgKiBzRyxcbiAgICBjQSAqIGNCLFxuICAgIHNBICogc0cgLSBjQSAqIGNHICogc0IsXG4gICAgLWNCICogc0csXG4gICAgc0IsXG4gICAgY0IgKiBjR1xuICBdO1xuICBub3JtYWxpemUobSk7XG5cbiAgLy8gU2luY2Ugd2Ugd2FudCBnYW1tYSBpbiBbLTkwOyArOTBbLCBjRyA+PSAwLlxuICBpZiAobVs4XSA+IDApIHtcbiAgICAvLyBDYXNlIDE6IG1bOF0gPiAwIDw9PiBjQiA+IDAgICAgICAgICAgICAgICAgIChhbmQgY0cgIT0gMClcbiAgICAvLyAgICAgICAgICAgICAgICAgIDw9PiBiZXRhIGluIF0tcGkvMjsgK3BpLzJbIChhbmQgY0cgIT0gMClcbiAgICBhbHBoYSA9IE1hdGguYXRhbjIoLW1bMV0sIG1bNF0pO1xuICAgIGJldGEgPSBNYXRoLmFzaW4obVs3XSk7IC8vIGFzaW4gcmV0dXJucyBhIG51bWJlciBiZXR3ZWVuIC1waS8yIGFuZCArcGkvMiA9PiBPS1xuICAgIGdhbW1hID0gTWF0aC5hdGFuMigtbVs2XSwgbVs4XSk7XG4gIH0gZWxzZSBpZiAobVs4XSA8IDApIHtcbiAgICAvLyBDYXNlIDI6IG1bOF0gPCAwIDw9PiBjQiA8IDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGFuZCBjRyAhPSAwKVxuICAgIC8vICAgICAgICAgICAgICAgICAgPD0+IGJldGEgaW4gWy1waTsgLXBpLzJbIFUgXStwaS8yOyArcGldIChhbmQgY0cgIT0gMClcblxuICAgIC8vIFNpbmNlIGNCIDwgMCBhbmQgY0IgaXMgaW4gbVsxXSBhbmQgbVs0XSwgdGhlIHBvaW50IGlzIGZsaXBwZWQgYnkgMTgwIGRlZ3JlZXMuXG4gICAgLy8gSGVuY2UsIHdlIGhhdmUgdG8gbXVsdGlwbHkgYm90aCBhcmd1bWVudHMgb2YgYXRhbjIgYnkgLTEgaW4gb3JkZXIgdG8gcmV2ZXJ0XG4gICAgLy8gdGhlIHBvaW50IGluIGl0cyBvcmlnaW5hbCBwb3NpdGlvbiAoPT4gYW5vdGhlciBmbGlwIGJ5IDE4MCBkZWdyZWVzKS5cbiAgICBhbHBoYSA9IE1hdGguYXRhbjIobVsxXSwgLW1bNF0pO1xuICAgIGJldGEgPSAtTWF0aC5hc2luKG1bN10pO1xuICAgIGJldGEgKz0gKGJldGEgPj0gMCkgPyAtTWF0aC5QSSA6IE1hdGguUEk7IC8vIGFzaW4gcmV0dXJucyBhIG51bWJlciBiZXR3ZWVuIC1waS8yIGFuZCBwaS8yID0+IG1ha2Ugc3VyZSBiZXRhIGluIFstcGk7IC1waS8yWyBVIF0rcGkvMjsgK3BpXVxuICAgIGdhbW1hID0gTWF0aC5hdGFuMihtWzZdLCAtbVs4XSk7IC8vIHNhbWUgcmVtYXJrIGFzIGZvciBhbHBoYSwgbXVsdGlwbGljYXRpb24gYnkgLTFcbiAgfSBlbHNlIHtcbiAgICAvLyBDYXNlIDM6IG1bOF0gPSAwIDw9PiBjQiA9IDAgb3IgY0cgPSAwXG4gICAgaWYgKG1bNl0gPiAwKSB7XG4gICAgICAvLyBTdWJjYXNlIDE6IGNHID0gMCBhbmQgY0IgPiAwXG4gICAgICAvLyAgICAgICAgICAgIGNHID0gMCA8PT4gc0cgPSAtMSA8PT4gZ2FtbWEgPSAtcGkvMiA9PiBtWzZdID0gY0JcbiAgICAgIC8vICAgICAgICAgICAgSGVuY2UsIG1bNl0gPiAwIDw9PiBjQiA+IDAgPD0+IGJldGEgaW4gXS1waS8yOyArcGkvMltcbiAgICAgIGFscGhhID0gTWF0aC5hdGFuMigtbVsxXSwgbVs0XSk7XG4gICAgICBiZXRhID0gTWF0aC5hc2luKG1bN10pOyAvLyBhc2luIHJldHVybnMgYSBudW1iZXIgYmV0d2VlbiAtcGkvMiBhbmQgK3BpLzIgPT4gT0tcbiAgICAgIGdhbW1hID0gLU1hdGguUEkgLyAyO1xuICAgIH0gZWxzZSBpZiAobVs2XSA8IDApIHtcbiAgICAgIC8vIFN1YmNhc2UgMjogY0cgPSAwIGFuZCBjQiA8IDBcbiAgICAgIC8vICAgICAgICAgICAgY0cgPSAwIDw9PiBzRyA9IC0xIDw9PiBnYW1tYSA9IC1waS8yID0+IG1bNl0gPSBjQlxuICAgICAgLy8gICAgICAgICAgICBIZW5jZSwgbVs2XSA8IDAgPD0+IGNCIDwgMCA8PT4gYmV0YSBpbiBbLXBpOyAtcGkvMlsgVSBdK3BpLzI7ICtwaV1cbiAgICAgIGFscGhhID0gTWF0aC5hdGFuMihtWzFdLCAtbVs0XSk7IC8vIHNhbWUgcmVtYXJrIGFzIGZvciBhbHBoYSBpbiBhIGNhc2UgYWJvdmVcbiAgICAgIGJldGEgPSAtTWF0aC5hc2luKG1bN10pO1xuICAgICAgYmV0YSArPSAoYmV0YSA+PSAwKSA/IC1NYXRoLlBJIDogTWF0aC5QSTsgLy8gYXNpbiByZXR1cm5zIGEgbnVtYmVyIGJldHdlZW4gLXBpLzIgYW5kICtwaS8yID0+IG1ha2Ugc3VyZSBiZXRhIGluIFstcGk7IC1waS8yWyBVIF0rcGkvMjsgK3BpXVxuICAgICAgZ2FtbWEgPSAtTWF0aC5QSSAvIDI7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN1YmNhc2UgMzogY0IgPSAwXG4gICAgICAvLyBJbiB0aGUgY2FzZSB3aGVyZSBjb3MoYmV0YSkgPSAwIChpLmUuIGJldGEgPSAtcGkvMiBvciBiZXRhID0gcGkvMiksXG4gICAgICAvLyB3ZSBoYXZlIHRoZSBnaW1iYWwgbG9jayBwcm9ibGVtOiBpbiB0aGF0IGNvbmZpZ3VyYXRpb24sIG9ubHkgdGhlIGFuZ2xlXG4gICAgICAvLyBhbHBoYSArIGdhbW1hIChpZiBiZXRhID0gK3BpLzIpIG9yIGFscGhhIC0gZ2FtbWEgKGlmIGJldGEgPSAtcGkvMilcbiAgICAgIC8vIGFyZSB1bmlxdWVseSBkZWZpbmVkOiBhbHBoYSBhbmQgZ2FtbWEgY2FuIHRha2UgYW4gaW5maW5pdHkgb2YgdmFsdWVzLlxuICAgICAgLy8gRm9yIGNvbnZlbmllbmNlLCBsZXQncyBzZXQgZ2FtbWEgPSAwIChhbmQgdGh1cyBzaW4oZ2FtbWEpID0gMCkuXG4gICAgICAvLyAoQXMgYSBjb25zZXF1ZW5jZSBvZiB0aGUgZ2ltYmFsIGxvY2sgcHJvYmxlbSwgdGhlcmUgaXMgYSBkaXNjb250aW51aXR5XG4gICAgICAvLyBpbiBhbHBoYSBhbmQgZ2FtbWEuKVxuICAgICAgYWxwaGEgPSBNYXRoLmF0YW4yKG1bM10sIG1bMF0pO1xuICAgICAgYmV0YSA9IChtWzddID4gMCkgPyBNYXRoLlBJIC8gMiA6IC1NYXRoLlBJIC8gMjtcbiAgICAgIGdhbW1hID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyBhdGFuMiByZXR1cm5zIGEgbnVtYmVyIGJldHdlZW4gLXBpIGFuZCBwaSA9PiBtYWtlIHN1cmUgdGhhdCBhbHBoYSBpcyBpbiBbMCwgMipwaVsuXG4gIGFscGhhICs9IChhbHBoYSA8IDApID8gMiAqIE1hdGguUEkgOiAwO1xuXG4gIGV1bGVyQW5nbGVbMF0gPSAoYWxwaGFJc1ZhbGlkID8gcmFkVG9EZWcoYWxwaGEpIDogbnVsbCk7XG4gIGV1bGVyQW5nbGVbMV0gPSByYWRUb0RlZyhiZXRhKTtcbiAgZXVsZXJBbmdsZVsyXSA9IHJhZFRvRGVnKGdhbW1hKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIEV1bGVyIGFuZ2xlIGBbYWxwaGEsIGJldGEsIGdhbW1hXWAgdG8gYSBFdWxlciBhbmdsZSB3aGVyZTpcbiAqIC0gYGFscGhhYCBpcyBpbiBbMDsgKzM2MFs7XG4gKiAtIGBiZXRhYCBpcyBpbiBbLTkwOyArOTBbO1xuICogLSBgZ2FtbWFgIGlzIGluIFstMTgwOyArMTgwWy5cbiAqIFxuICogQHBhcmFtIHtudW1iZXJbXX0gZXVsZXJBbmdsZSAtIEV1bGVyIGFuZ2xlIHRvIGNvbnZlcnQsIHJlcHJlc2VudGVkIGJ5IGFuIGFycmF5IG9mIGxlbmd0aCAzIChgW2FscGhhLCBiZXRhLCBnYW1tYV1gKS5cbiAqL1xuZnVuY3Rpb24gdW5pZnlBbHQoZXVsZXJBbmdsZSkge1xuICAvLyBDb252ZW50aW9uIGhlcmU6IFRhaXTigJNCcnlhbiBhbmdsZXMgWi1YJy1ZJycsIHdoZXJlOlxuICAvLyAgIGFscGhhIGlzIGluIFswOyArMzYwWyxcbiAgLy8gICBiZXRhIGlzIGluIFstOTA7ICs5MFssXG4gIC8vICAgZ2FtbWEgaXMgaW4gWy0xODA7ICsxODBbLlxuXG4gIGNvbnN0IGFscGhhSXNWYWxpZCA9ICh0eXBlb2YgZXVsZXJBbmdsZVswXSA9PT0gJ251bWJlcicpO1xuXG4gIGNvbnN0IF9hbHBoYSA9IChhbHBoYUlzVmFsaWQgPyBkZWdUb1JhZChldWxlckFuZ2xlWzBdKSA6IDApO1xuICBjb25zdCBfYmV0YSA9IGRlZ1RvUmFkKGV1bGVyQW5nbGVbMV0pO1xuICBjb25zdCBfZ2FtbWEgPSBkZWdUb1JhZChldWxlckFuZ2xlWzJdKTtcblxuICBjb25zdCBjQSA9IE1hdGguY29zKF9hbHBoYSk7XG4gIGNvbnN0IGNCID0gTWF0aC5jb3MoX2JldGEpO1xuICBjb25zdCBjRyA9IE1hdGguY29zKF9nYW1tYSk7XG4gIGNvbnN0IHNBID0gTWF0aC5zaW4oX2FscGhhKTtcbiAgY29uc3Qgc0IgPSBNYXRoLnNpbihfYmV0YSk7XG4gIGNvbnN0IHNHID0gTWF0aC5zaW4oX2dhbW1hKTtcblxuICBsZXQgYWxwaGEsIGJldGEsIGdhbW1hO1xuXG4gIGxldCBtID0gW1xuICAgIGNBICogY0cgLSBzQSAqIHNCICogc0csXG4gICAgLWNCICogc0EsXG4gICAgY0EgKiBzRyArIGNHICogc0EgKiBzQixcbiAgICBjRyAqIHNBICsgY0EgKiBzQiAqIHNHLFxuICAgIGNBICogY0IsXG4gICAgc0EgKiBzRyAtIGNBICogY0cgKiBzQixcbiAgICAtY0IgKiBzRyxcbiAgICBzQixcbiAgICBjQiAqIGNHXG4gIF07XG4gIG5vcm1hbGl6ZShtKTtcblxuICBhbHBoYSA9IE1hdGguYXRhbjIoLW1bMV0sIG1bNF0pO1xuICBhbHBoYSArPSAoYWxwaGEgPCAwKSA/IDIgKiBNYXRoLlBJIDogMDsgLy8gYXRhbjIgcmV0dXJucyBhIG51bWJlciBiZXR3ZWVuIC1waSBhbmQgK3BpID0+IG1ha2Ugc3VyZSBhbHBoYSBpcyBpbiBbMCwgMipwaVsuXG4gIGJldGEgPSBNYXRoLmFzaW4obVs3XSk7IC8vIGFzaW4gcmV0dXJucyBhIG51bWJlciBiZXR3ZWVuIC1waS8yIGFuZCBwaS8yID0+IE9LXG4gIGdhbW1hID0gTWF0aC5hdGFuMigtbVs2XSwgbVs4XSk7IC8vIGF0YW4yIHJldHVybnMgYSBudW1iZXIgYmV0d2VlbiAtcGkgYW5kICtwaSA9PiBPS1xuXG4gIGV1bGVyQW5nbGVbMF0gPSAoYWxwaGFJc1ZhbGlkID8gcmFkVG9EZWcoYWxwaGEpIDogbnVsbCk7XG4gIGV1bGVyQW5nbGVbMV0gPSByYWRUb0RlZyhiZXRhKTtcbiAgZXVsZXJBbmdsZVsyXSA9IHJhZFRvRGVnKGdhbW1hKTtcbn1cblxuLyoqXG4gKiBgRGV2aWNlT3JpZW50YXRpb25Nb2R1bGVgIHNpbmdsZXRvbi5cbiAqIFRoZSBgRGV2aWNlT3JpZW50YXRpb25Nb2R1bGVgIHNpbmdsZXRvbiBwcm92aWRlcyB0aGUgcmF3IHZhbHVlc1xuICogb2YgdGhlIG9yaWVudGF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBgRGV2aWNlTW90aW9uYCBldmVudC5cbiAqIEl0IGFsc28gaW5zdGFudGlhdGUgdGhlIGBPcmllbnRhdGlvbmAgc3VibW9kdWxlIHRoYXQgdW5pZmllcyB0aG9zZVxuICogdmFsdWVzIGFjcm9zcyBwbGF0Zm9ybXMgYnkgbWFraW5nIHRoZW0gY29tcGxpYW50IHdpdGgge0BsaW5rXG4gKiBodHRwOi8vd3d3LnczLm9yZy9UUi9vcmllbnRhdGlvbi1ldmVudC98dGhlIFczQyBzdGFuZGFyZH0gKCppLmUuKlxuICogdGhlIGBhbHBoYWAgYW5nbGUgYmV0d2VlbiBgMGAgYW5kIGAzNjBgIGRlZ3JlZXMsIHRoZSBgYmV0YWAgYW5nbGVcbiAqIGJldHdlZW4gYC0xODBgIGFuZCBgMTgwYCBkZWdyZWVzLCBhbmQgYGdhbW1hYCBiZXR3ZWVuIGAtOTBgIGFuZFxuICogYDkwYCBkZWdyZWVzKSwgYXMgd2VsbCBhcyB0aGUgYE9yaWVudGF0aW9uQWx0YCBzdWJtb2R1bGVzICh3aXRoXG4gKiB0aGUgYGFscGhhYCBhbmdsZSBiZXR3ZWVuIGAwYCBhbmQgYDM2MGAgZGVncmVlcywgdGhlIGBiZXRhYCBhbmdsZVxuICogYmV0d2VlbiBgLTkwYCBhbmQgYDkwYCBkZWdyZWVzLCBhbmQgYGdhbW1hYCBiZXR3ZWVuIGAtMTgwYCBhbmRcbiAqIGAxODBgIGRlZ3JlZXMpLlxuICogV2hlbiB0aGUgYG9yaWVudGF0aW9uYCByYXcgdmFsdWVzIGFyZSBub3QgcHJvdmlkZWQgYnkgdGhlIHNlbnNvcnMsXG4gKiB0aGlzIG1vZHVsZXMgdHJpZXMgdG8gcmVjYWxjdWxhdGUgYGJldGFgIGFuZCBgZ2FtbWFgIGZyb20gdGhlXG4gKiBgQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAgbW9kdWxlLCBpZiBhdmFpbGFibGUgKGluIHRoYXQgY2FzZSxcbiAqIHRoZSBgYWxwaGFgIGFuZ2xlIGlzIGltcG9zc2libGUgdG8gcmV0cmlldmUgc2luY2UgdGhlIGNvbXBhc3MgaXNcbiAqIG5vdCBhdmFpbGFibGUpLlxuICpcbiAqIEBjbGFzcyBEZXZpY2VNb3Rpb25Nb2R1bGVcbiAqIEBleHRlbmRzIElucHV0TW9kdWxlXG4gKi9cbmNsYXNzIERldmljZU9yaWVudGF0aW9uTW9kdWxlIGV4dGVuZHMgSW5wdXRNb2R1bGUge1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBgRGV2aWNlT3JpZW50YXRpb25gIG1vZHVsZSBpbnN0YW5jZS5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcignZGV2aWNlb3JpZW50YXRpb24nKTtcblxuICAgIC8qKlxuICAgICAqIFJhdyB2YWx1ZXMgY29taW5nIGZyb20gdGhlIGBkZXZpY2VvcmllbnRhdGlvbmAgZXZlbnQgc2VudCBieSB0aGlzIG1vZHVsZS5cbiAgICAgKlxuICAgICAqIEB0aGlzIERldmljZU9yaWVudGF0aW9uTW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcltdfVxuICAgICAqIEBkZWZhdWx0IFtudWxsLCBudWxsLCBudWxsXVxuICAgICAqL1xuICAgIHRoaXMuZXZlbnQgPSBbbnVsbCwgbnVsbCwgbnVsbF07XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYE9yaWVudGF0aW9uYCBtb2R1bGUuXG4gICAgICogUHJvdmlkZXMgdW5pZmllZCB2YWx1ZXMgb2YgdGhlIG9yaWVudGF0aW9uIGNvbXBsaWFudCB3aXRoIHtAbGlua1xuICAgICAqIGh0dHA6Ly93d3cudzMub3JnL1RSL29yaWVudGF0aW9uLWV2ZW50L3x0aGUgVzNDIHN0YW5kYXJkfVxuICAgICAqIChgYWxwaGFgIGluIGBbMCwgMzYwXWAsIGJldGEgaW4gYFstMTgwLCArMTgwXWAsIGBnYW1tYWAgaW4gYFstOTAsICs5MF1gKS5cbiAgICAgKlxuICAgICAqIEB0aGlzIERldmljZU9yaWVudGF0aW9uTW9kdWxlXG4gICAgICogQHR5cGUge0RPTUV2ZW50U3VibW9kdWxlfVxuICAgICAqL1xuICAgIHRoaXMub3JpZW50YXRpb24gPSBuZXcgRE9NRXZlbnRTdWJtb2R1bGUodGhpcywgJ29yaWVudGF0aW9uJyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYE9yaWVudGF0aW9uQWx0YCBtb2R1bGUuXG4gICAgICogUHJvdmlkZXMgYWx0ZXJuYXRpdmUgdmFsdWVzIG9mIHRoZSBvcmllbnRhdGlvblxuICAgICAqIChgYWxwaGFgIGluIGBbMCwgMzYwXWAsIGJldGEgaW4gYFstOTAsICs5MF1gLCBgZ2FtbWFgIGluIGBbLTE4MCwgKzE4MF1gKS5cbiAgICAgKlxuICAgICAqIEB0aGlzIERldmljZU9yaWVudGF0aW9uTW9kdWxlXG4gICAgICogQHR5cGUge0RPTUV2ZW50U3VibW9kdWxlfVxuICAgICAqL1xuICAgIHRoaXMub3JpZW50YXRpb25BbHQgPSBuZXcgRE9NRXZlbnRTdWJtb2R1bGUodGhpcywgJ29yaWVudGF0aW9uQWx0Jyk7XG5cbiAgICAvKipcbiAgICAgKiBSZXF1aXJlZCBzdWJtb2R1bGVzIC8gZXZlbnRzLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlT3JpZW50YXRpb25Nb2R1bGVcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbH0gb3JpZW50YXRpb24gLSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgYG9yaWVudGF0aW9uYCB1bmlmaWVkIHZhbHVlcyBhcmUgcmVxdWlyZWQgb3Igbm90IChkZWZhdWx0cyB0byBgZmFsc2VgKS5cbiAgICAgKiBAcHJvcGVydHkge2Jvb2x9IG9yaWVudGF0aW9uQWx0IC0gSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGBvcmllbnRhdGlvbkFsdGAgdmFsdWVzIGFyZSByZXF1aXJlZCBvciBub3QgKGRlZmF1bHRzIHRvIGBmYWxzZWApLlxuICAgICAqL1xuICAgIHRoaXMucmVxdWlyZWQgPSB7XG4gICAgICBvcmllbnRhdGlvbjogZmFsc2UsXG4gICAgICBvcmllbnRhdGlvbkFsdDogZmFsc2VcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTnVtYmVyIG9mIGxpc3RlbmVycyBzdWJzY3JpYmVkIHRvIHRoZSBgRGV2aWNlT3JpZW50YXRpb25gIG1vZHVsZS5cbiAgICAgKlxuICAgICAqIEB0aGlzIERldmljZU9yaWVudGF0aW9uTW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLl9udW1MaXN0ZW5lcnMgPSAwO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgZnVuY3Rpb24gb2YgdGhlIG1vZHVsZSdzIHByb21pc2UuXG4gICAgICpcbiAgICAgKiBAdGhpcyBEZXZpY2VPcmllbnRhdGlvbk1vZHVsZVxuICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICogQHNlZSBEZXZpY2VPcmllbnRhdGlvbk1vZHVsZSNpbml0XG4gICAgICovXG4gICAgdGhpcy5fcHJvbWlzZVJlc29sdmUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogR3Jhdml0eSB2ZWN0b3IgY2FsY3VsYXRlZCBmcm9tIHRoZSBgYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eWAgdW5pZmllZCB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBAdGhpcyBEZXZpY2VPcmllbnRhdGlvbk1vZHVsZVxuICAgICAqIEB0eXBlIHtudW1iZXJbXX1cbiAgICAgKiBAZGVmYXVsdCBbMCwgMCwgMF1cbiAgICAgKi9cbiAgICB0aGlzLl9lc3RpbWF0ZWRHcmF2aXR5ID0gWzAsIDAsIDBdO1xuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIGJpbmRpbmcgb2YgdGhlIHNlbnNvciBjaGVjay5cbiAgICAgKlxuICAgICAqIEB0aGlzIERldmljZU9yaWVudGF0aW9uTW9kdWxlXG4gICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuX2RldmljZW9yaWVudGF0aW9uQ2hlY2sgPSB0aGlzLl9kZXZpY2VvcmllbnRhdGlvbkNoZWNrLmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgYmluZGluZyBvZiB0aGUgYCdkZXZpY2VvcmllbnRhdGlvbidgIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqXG4gICAgICogQHRoaXMgRGV2aWNlT3JpZW50YXRpb25Nb2R1bGVcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgdGhpcy5fZGV2aWNlb3JpZW50YXRpb25MaXN0ZW5lciA9IHRoaXMuX2RldmljZW9yaWVudGF0aW9uTGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5zb3IgY2hlY2sgb24gaW5pdGlhbGl6YXRpb24gb2YgdGhlIG1vZHVsZS5cbiAgICogVGhpcyBtZXRob2Q6XG4gICAqIC0gY2hlY2tzIHdoZXRoZXIgdGhlIGBvcmllbnRhdGlvbmAgdmFsdWVzIGFyZSB2YWxpZCBvciBub3Q7XG4gICAqIC0gKGluIHRoZSBjYXNlIHdoZXJlIG9yaWVudGF0aW9uIHJhdyB2YWx1ZXMgYXJlIG5vdCBwcm92aWRlZClcbiAgICogICB0cmllcyB0byBjYWxjdWxhdGUgdGhlIG9yaWVudGF0aW9uIGZyb20gdGhlXG4gICAqICAgYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgIHVuaWZpZWQgdmFsdWVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0RldmljZU1vdGlvbkV2ZW50fSBlIC0gRmlyc3QgYCdkZXZpY2Vtb3Rpb24nYCBldmVudCBjYXVnaHQsIG9uIHdoaWNoIHRoZSBjaGVjayBpcyBkb25lLlxuICAgKi9cbiAgX2RldmljZW9yaWVudGF0aW9uQ2hlY2soZSkge1xuICAgIHRoaXMuaXNQcm92aWRlZCA9IHRydWU7XG5cbiAgICAvLyBTZW5zb3IgYXZhaWxhYmlsaXR5IGZvciB0aGUgb3JpZW50YXRpb24gYW5kIGFsdGVybmF0aXZlIG9yaWVudGF0aW9uXG4gICAgY29uc3QgcmF3VmFsdWVzUHJvdmlkZWQgPSAoKHR5cGVvZiBlLmFscGhhID09PSAnbnVtYmVyJykgJiYgKHR5cGVvZiBlLmJldGEgPT09ICdudW1iZXInKSAmJiAodHlwZW9mIGUuZ2FtbWEgPT09ICdudW1iZXInKSk7XG4gICAgdGhpcy5vcmllbnRhdGlvbi5pc1Byb3ZpZGVkID0gcmF3VmFsdWVzUHJvdmlkZWQ7XG4gICAgdGhpcy5vcmllbnRhdGlvbkFsdC5pc1Byb3ZpZGVkID0gcmF3VmFsdWVzUHJvdmlkZWQ7XG5cbiAgICAvLyBUT0RPKD8pOiBnZXQgcHNldWRvLXBlcmlvZFxuXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGxpc3RlbiB0byBvbmUgZXZlbnQgKD0+IHJlbW92ZSB0aGUgbGlzdGVuZXIpXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RldmljZW9yaWVudGF0aW9uJywgdGhpcy5fZGV2aWNlb3JpZW50YXRpb25DaGVjaywgZmFsc2UpO1xuXG4gICAgLy8gSWYgb3JpZW50YXRpb24gb3IgYWx0ZXJuYXRpdmUgb3JpZW50YXRpb24gYXJlIG5vdCBwcm92aWRlZCBieSByYXcgc2Vuc29ycyBidXQgcmVxdWlyZWQsXG4gICAgLy8gdHJ5IHRvIGNhbGN1bGF0ZSB0aGVtIHdpdGggYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgIHVuaWZpZWQgdmFsdWVzXG4gICAgaWYgKCh0aGlzLnJlcXVpcmVkLm9yaWVudGF0aW9uICYmICF0aGlzLm9yaWVudGF0aW9uLmlzUHJvdmlkZWQpIHx8ICh0aGlzLnJlcXVpcmVkLm9yaWVudGF0aW9uQWx0ICYmICF0aGlzLm9yaWVudGF0aW9uQWx0LmlzUHJvdmlkZWQpKVxuICAgICAgdGhpcy5fdHJ5QWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eUZhbGxiYWNrKCk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5fcHJvbWlzZVJlc29sdmUodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogYCdkZXZpY2VvcmllbnRhdGlvbidgIGV2ZW50IGNhbGxiYWNrLlxuICAgKiBUaGlzIG1ldGhvZCBlbWl0cyBhbiBldmVudCB3aXRoIHRoZSByYXcgYCdkZXZpY2VvcmllbnRhdGlvbidgIHZhbHVlcyxcbiAgICogYW5kIGVtaXRzIGV2ZW50cyB3aXRoIHRoZSB1bmlmaWVkIGBvcmllbnRhdGlvbmAgYW5kIC8gb3IgdGhlXG4gICAqIGBvcmllbnRhdGlvbkFsdGAgdmFsdWVzIGlmIHRoZXkgYXJlIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge0RldmljZU9yaWVudGF0aW9uRXZlbnR9IGUgLSBgJ2RldmljZW9yaWVudGF0aW9uJ2AgZXZlbnQgdGhlIHZhbHVlcyBhcmUgY2FsY3VsYXRlZCBmcm9tLlxuICAgKi9cbiAgX2RldmljZW9yaWVudGF0aW9uTGlzdGVuZXIoZSkge1xuICAgIC8vICdkZXZpY2VvcmllbnRhdGlvbicgZXZlbnQgKHJhdyB2YWx1ZXMpXG4gICAgbGV0IG91dEV2ZW50ID0gdGhpcy5ldmVudDtcblxuICAgIG91dEV2ZW50WzBdID0gZS5hbHBoYTtcbiAgICBvdXRFdmVudFsxXSA9IGUuYmV0YTtcbiAgICBvdXRFdmVudFsyXSA9IGUuZ2FtbWE7XG4gICAgXG4gICAgdGhpcy5lbWl0KG91dEV2ZW50KTtcblxuICAgIC8vICdvcmllbnRhdGlvbicgZXZlbnQgKHVuaWZpZWQgdmFsdWVzKVxuICAgIGlmICh0aGlzLnJlcXVpcmVkLm9yaWVudGF0aW9uICYmIHRoaXMub3JpZW50YXRpb24uaXNQcm92aWRlZCkge1xuICAgICAgLy8gT24gaU9TLCB0aGUgYGFscGhhYCB2YWx1ZSBpcyBpbml0aWFsaXplZCBhdCBgMGAgb24gdGhlIGZpcnN0IGBkZXZpY2VvcmllbnRhdGlvbmAgZXZlbnRcbiAgICAgIC8vIHNvIHdlIGtlZXAgdGhhdCByZWZlcmVuY2UgaW4gbWVtb3J5IHRvIGNhbGN1bGF0ZSB0aGUgTm9ydGggbGF0ZXIgb25cbiAgICAgIGlmICghdGhpcy5vcmllbnRhdGlvbi5fd2Via2l0Q29tcGFzc0hlYWRpbmdSZWZlcmVuY2UgJiYgZS53ZWJraXRDb21wYXNzSGVhZGluZyAmJiBwbGF0Zm9ybS5vcy5mYW1pbHkgPT09ICdpT1MnKVxuICAgICAgICB0aGlzLm9yaWVudGF0aW9uLl93ZWJraXRDb21wYXNzSGVhZGluZ1JlZmVyZW5jZSA9IGUud2Via2l0Q29tcGFzc0hlYWRpbmc7XG5cbiAgICAgIGxldCBvdXRFdmVudCA9IHRoaXMub3JpZW50YXRpb24uZXZlbnQ7XG5cbiAgICAgIG91dEV2ZW50WzBdID0gZS5hbHBoYTtcbiAgICAgIG91dEV2ZW50WzFdID0gZS5iZXRhO1xuICAgICAgb3V0RXZlbnRbMl0gPSBlLmdhbW1hO1xuXG4gICAgICAvLyBPbiBpT1MsIHJlcGxhY2UgdGhlIGBhbHBoYWAgdmFsdWUgYnkgdGhlIE5vcnRoIHZhbHVlIGFuZCB1bmlmeSB0aGUgYW5nbGVzXG4gICAgICAvLyAodGhlIGRlZmF1bHQgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFuZ2xlcyBvbiBpT1MgaXMgbm90IGNvbXBsaWFudCB3aXRoIHRoZSBXM0Mgc3BlY2lmaWNhdGlvbilcbiAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uLl93ZWJraXRDb21wYXNzSGVhZGluZ1JlZmVyZW5jZSAmJiBwbGF0Zm9ybS5vcy5mYW1pbHkgPT09ICdpT1MnKSB7XG4gICAgICAgIG91dEV2ZW50WzBdICs9IDM2MCAtIHRoaXMub3JpZW50YXRpb24uX3dlYmtpdENvbXBhc3NIZWFkaW5nUmVmZXJlbmNlO1xuICAgICAgICB1bmlmeShvdXRFdmVudCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMub3JpZW50YXRpb24uZW1pdChvdXRFdmVudCk7XG4gICAgfVxuXG4gICAgLy8gJ29yaWVudGF0aW9uQWx0JyBldmVudFxuICAgIGlmICh0aGlzLnJlcXVpcmVkLm9yaWVudGF0aW9uQWx0ICYmIHRoaXMub3JpZW50YXRpb25BbHQuaXNQcm92aWRlZCkge1xuICAgICAgLy8gT24gaU9TLCB0aGUgYGFscGhhYCB2YWx1ZSBpcyBpbml0aWFsaXplZCBhdCBgMGAgb24gdGhlIGZpcnN0IGBkZXZpY2VvcmllbnRhdGlvbmAgZXZlbnRcbiAgICAgIC8vIHNvIHdlIGtlZXAgdGhhdCByZWZlcmVuY2UgaW4gbWVtb3J5IHRvIGNhbGN1bGF0ZSB0aGUgTm9ydGggbGF0ZXIgb25cbiAgICAgIGlmICghdGhpcy5vcmllbnRhdGlvbkFsdC5fd2Via2l0Q29tcGFzc0hlYWRpbmdSZWZlcmVuY2UgJiYgZS53ZWJraXRDb21wYXNzSGVhZGluZyAmJiBwbGF0Zm9ybS5vcy5mYW1pbHkgPT09ICdpT1MnKVxuICAgICAgICB0aGlzLm9yaWVudGF0aW9uQWx0Ll93ZWJraXRDb21wYXNzSGVhZGluZ1JlZmVyZW5jZSA9IGUud2Via2l0Q29tcGFzc0hlYWRpbmc7XG5cbiAgICAgIGxldCBvdXRFdmVudCA9IHRoaXMub3JpZW50YXRpb25BbHQuZXZlbnQ7XG5cbiAgICAgIG91dEV2ZW50WzBdID0gZS5hbHBoYTtcbiAgICAgIG91dEV2ZW50WzFdID0gZS5iZXRhO1xuICAgICAgb3V0RXZlbnRbMl0gPSBlLmdhbW1hO1xuXG4gICAgICAvLyBPbiBpT1MsIHJlcGxhY2UgdGhlIGBhbHBoYWAgdmFsdWUgYnkgdGhlIE5vcnRoIHZhbHVlIGJ1dCBkbyBub3QgY29udmVydCB0aGUgYW5nbGVzXG4gICAgICAvLyAodGhlIGRlZmF1bHQgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFuZ2xlcyBvbiBpT1MgaXMgY29tcGxpYW50IHdpdGggdGhlIGFsdGVybmF0aXZlIHJlcHJlc2VudGF0aW9uKVxuICAgICAgaWYgKHRoaXMub3JpZW50YXRpb25BbHQuX3dlYmtpdENvbXBhc3NIZWFkaW5nUmVmZXJlbmNlICYmIHBsYXRmb3JtLm9zLmZhbWlseSA9PT0gJ2lPUycpe1xuICAgICAgICBvdXRFdmVudFswXSAtPSB0aGlzLm9yaWVudGF0aW9uQWx0Ll93ZWJraXRDb21wYXNzSGVhZGluZ1JlZmVyZW5jZTtcbiAgICAgICAgb3V0RXZlbnRbMF0gKz0gKG91dEV2ZW50WzBdIDwgMCkgPyAzNjAgOiAwOyAvLyBtYWtlIHN1cmUgYGFscGhhYCBpcyBpbiBbMCwgKzM2MFtcbiAgICAgIH1cblxuICAgICAgLy8gT24gQW5kcm9pZCwgdHJhbnNmb3JtIHRoZSBhbmdsZXMgdG8gdGhlIGFsdGVybmF0aXZlIHJlcHJlc2VudGF0aW9uXG4gICAgICAvLyAodGhlIGRlZmF1bHQgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFuZ2xlcyBvbiBBbmRyb2lkIGlzIGNvbXBsaWFudCB3aXRoIHRoZSBXM0Mgc3BlY2lmaWNhdGlvbilcbiAgICAgIGlmIChwbGF0Zm9ybS5vcy5mYW1pbHkgPT09ICdBbmRyb2lkJylcbiAgICAgICAgdW5pZnlBbHQob3V0RXZlbnQpO1xuXG4gICAgICB0aGlzLm9yaWVudGF0aW9uQWx0LmVtaXQob3V0RXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBgYmV0YWAgYW5kIGBnYW1tYWAgY2FuIGJlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgIHZhbHVlcyBvciBub3QuXG4gICAqL1xuICBfdHJ5QWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eUZhbGxiYWNrKCkge1xuICAgIE1vdGlvbklucHV0LnJlcXVpcmVNb2R1bGUoJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknKVxuICAgICAgLnRoZW4oKGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkpID0+IHtcbiAgICAgICAgaWYgKGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkuaXNWYWxpZCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiV0FSTklORyAobW90aW9uLWlucHV0KTogVGhlICdkZXZpY2VvcmllbnRhdGlvbicgZXZlbnQgZG9lcyBub3QgZXhpc3Qgb3IgZG9lcyBub3QgcHJvdmlkZSB2YWx1ZXMgaW4geW91ciBicm93c2VyLCBzbyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIGRldmljZSBpcyBlc3RpbWF0ZWQgZnJvbSBEZXZpY2VNb3Rpb24ncyAnYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eScgZXZlbnQuIFNpbmNlIHRoZSBjb21wYXNzIGlzIG5vdCBhdmFpbGFibGUsIG9ubHkgdGhlIGBiZXRhYCBhbmQgYGdhbW1hYCBhbmdsZXMgYXJlIHByb3ZpZGVkIChgYWxwaGFgIGlzIG51bGwpLlwiKTtcblxuICAgICAgICAgIGlmICh0aGlzLnJlcXVpcmVkLm9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLm9yaWVudGF0aW9uLmlzQ2FsY3VsYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm9yaWVudGF0aW9uLnBlcmlvZCA9IGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkucGVyaW9kO1xuXG4gICAgICAgICAgICBNb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eScsIChhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5KSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX2NhbGN1bGF0ZUJldGFBbmRHYW1tYUZyb21BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5KGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMucmVxdWlyZWQub3JpZW50YXRpb25BbHQpIHtcbiAgICAgICAgICAgIHRoaXMub3JpZW50YXRpb25BbHQuaXNDYWxjdWxhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMub3JpZW50YXRpb25BbHQucGVyaW9kID0gYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS5wZXJpb2Q7XG5cbiAgICAgICAgICAgIE1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JywgKGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fY2FsY3VsYXRlQmV0YUFuZEdhbW1hRnJvbUFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkoYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wcm9taXNlUmVzb2x2ZSh0aGlzKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgYW5kIGVtaXRzIGBiZXRhYCBhbmQgYGdhbW1hYCB2YWx1ZXMgYXMgYSBmYWxsYmFjayBvZiB0aGUgYG9yaWVudGF0aW9uYCBhbmQgLyBvciBgb3JpZW50YXRpb25BbHRgIGV2ZW50cywgZnJvbSB0aGUgYGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlgIHVuaWZpZWQgdmFsdWVzLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcltdfSBhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5IC0gTGF0ZXN0IGBhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5IHJhdyB2YWx1ZXMuXG4gICAqIEBwYXJhbSB7Ym9vbH0gW2FsdD1mYWxzZV0gLSBJbmRpY2F0ZXMgd2hldGhlciB3ZSBuZWVkIHRoZSBhbHRlcm5hdGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFuZ2xlcyBvciBub3QuXG4gICAqL1xuICBfY2FsY3VsYXRlQmV0YUFuZEdhbW1hRnJvbUFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkoYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSwgYWx0ID0gZmFsc2UpIHtcbiAgICBjb25zdCBrID0gMC44O1xuXG4gICAgLy8gTG93IHBhc3MgZmlsdGVyIHRvIGVzdGltYXRlIHRoZSBncmF2aXR5XG4gICAgdGhpcy5fZXN0aW1hdGVkR3Jhdml0eVswXSA9IGsgKiB0aGlzLl9lc3RpbWF0ZWRHcmF2aXR5WzBdICsgKDEgLSBrKSAqIGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlbMF07XG4gICAgdGhpcy5fZXN0aW1hdGVkR3Jhdml0eVsxXSA9IGsgKiB0aGlzLl9lc3RpbWF0ZWRHcmF2aXR5WzFdICsgKDEgLSBrKSAqIGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlbMV07XG4gICAgdGhpcy5fZXN0aW1hdGVkR3Jhdml0eVsyXSA9IGsgKiB0aGlzLl9lc3RpbWF0ZWRHcmF2aXR5WzJdICsgKDEgLSBrKSAqIGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlbMl07XG5cbiAgICBsZXQgX2dYID0gdGhpcy5fZXN0aW1hdGVkR3Jhdml0eVswXTtcbiAgICBsZXQgX2dZID0gdGhpcy5fZXN0aW1hdGVkR3Jhdml0eVsxXTtcbiAgICBsZXQgX2daID0gdGhpcy5fZXN0aW1hdGVkR3Jhdml0eVsyXTtcblxuICAgIGNvbnN0IG5vcm0gPSBNYXRoLnNxcnQoX2dYICogX2dYICsgX2dZICogX2dZICsgX2daICogX2daKTtcblxuICAgIF9nWCAvPSBub3JtO1xuICAgIF9nWSAvPSBub3JtO1xuICAgIF9nWiAvPSBub3JtO1xuXG4gICAgLy8gQWRvcHRpbmcgdGhlIGZvbGxvd2luZyBjb252ZW50aW9uczpcbiAgICAvLyAtIGVhY2ggbWF0cml4IG9wZXJhdGVzIGJ5IHByZS1tdWx0aXBseWluZyBjb2x1bW4gdmVjdG9ycyxcbiAgICAvLyAtIGVhY2ggbWF0cml4IHJlcHJlc2VudHMgYW4gYWN0aXZlIHJvdGF0aW9uLFxuICAgIC8vIC0gZWFjaCBtYXRyaXggcmVwcmVzZW50cyB0aGUgY29tcG9zaXRpb24gb2YgaW50cmluc2ljIHJvdGF0aW9ucyxcbiAgICAvLyB0aGUgcm90YXRpb24gbWF0cml4IHJlcHJlc2VudGluZyB0aGUgY29tcG9zaXRpb24gb2YgYSByb3RhdGlvblxuICAgIC8vIGFib3V0IHRoZSB4LWF4aXMgYnkgYW4gYW5nbGUgYmV0YSBhbmQgYSByb3RhdGlvbiBhYm91dCB0aGUgeS1heGlzXG4gICAgLy8gYnkgYW4gYW5nbGUgZ2FtbWEgaXM6XG4gICAgLy9cbiAgICAvLyBbIGNvcyhnYW1tYSkgICAgICAgICAgICAgICAsICAwICAgICAgICAgICwgIHNpbihnYW1tYSkgICAgICAgICAgICAgICxcbiAgICAvLyAgIHNpbihiZXRhKSAqIHNpbihnYW1tYSkgICAsICBjb3MoYmV0YSkgICwgIC1jb3MoZ2FtbWEpICogc2luKGJldGEpICxcbiAgICAvLyAgIC1jb3MoYmV0YSkgKiBzaW4oZ2FtbWEpICAsICBzaW4oYmV0YSkgICwgIGNvcyhiZXRhKSAqIGNvcyhnYW1tYSkgIF0uXG4gICAgLy9cbiAgICAvLyBIZW5jZSwgdGhlIHByb2plY3Rpb24gb2YgdGhlIG5vcm1hbGl6ZWQgZ3Jhdml0eSBnID0gWzAsIDAsIDFdXG4gICAgLy8gaW4gdGhlIGRldmljZSdzIHJlZmVyZW5jZSBmcmFtZSBjb3JyZXNwb25kcyB0bzpcbiAgICAvL1xuICAgIC8vIGdYID0gLWNvcyhiZXRhKSAqIHNpbihnYW1tYSksXG4gICAgLy8gZ1kgPSBzaW4oYmV0YSksXG4gICAgLy8gZ1ogPSBjb3MoYmV0YSkgKiBjb3MoZ2FtbWEpLFxuICAgIC8vXG4gICAgLy8gc28gYmV0YSA9IGFzaW4oZ1kpIGFuZCBnYW1tYSA9IGF0YW4yKC1nWCwgZ1opLlxuXG4gICAgLy8gQmV0YSAmIGdhbW1hIGVxdWF0aW9ucyAod2UgYXBwcm94aW1hdGUgW2dYLCBnWSwgZ1pdIGJ5IFtfZ1gsIF9nWSwgX2daXSlcbiAgICBsZXQgYmV0YSA9IHJhZFRvRGVnKE1hdGguYXNpbihfZ1kpKTsgLy8gYmV0YSBpcyBpbiBbLXBpLzI7IHBpLzJbXG4gICAgbGV0IGdhbW1hID0gcmFkVG9EZWcoTWF0aC5hdGFuMigtX2dYLCBfZ1opKTsgLy8gZ2FtbWEgaXMgaW4gWy1waTsgcGlbXG5cbiAgICBpZiAoYWx0KSB7XG4gICAgICAvLyBJbiB0aGF0IGNhc2UsIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG8gc2luY2UgdGhlIGNhbGN1bGF0aW9ucyBhYm92ZSBnYXZlIHRoZSBhbmdsZSBpbiB0aGUgcmlnaHQgcmFuZ2VzXG4gICAgICBsZXQgb3V0RXZlbnQgPSB0aGlzLm9yaWVudGF0aW9uQWx0LmV2ZW50O1xuICAgICAgb3V0RXZlbnRbMF0gPSBudWxsO1xuICAgICAgb3V0RXZlbnRbMV0gPSBiZXRhO1xuICAgICAgb3V0RXZlbnRbMl0gPSBnYW1tYTtcblxuICAgICAgdGhpcy5vcmllbnRhdGlvbkFsdC5lbWl0KG91dEV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSGVyZSB3ZSBoYXZlIHRvIHVuaWZ5IHRoZSBhbmdsZXMgdG8gZ2V0IHRoZSByYW5nZXMgY29tcGxpYW50IHdpdGggdGhlIFczQyBzcGVjaWZpY2F0aW9uXG4gICAgICBsZXQgb3V0RXZlbnQgPSB0aGlzLm9yaWVudGF0aW9uLmV2ZW50O1xuICAgICAgb3V0RXZlbnRbMF0gPSBudWxsO1xuICAgICAgb3V0RXZlbnRbMV0gPSBiZXRhO1xuICAgICAgb3V0RXZlbnRbMl0gPSBnYW1tYTtcbiAgICAgIHVuaWZ5KG91dEV2ZW50KTtcbiAgICAgIFxuICAgICAgdGhpcy5vcmllbnRhdGlvbi5lbWl0KG91dEV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5jcmVhc2VzIHRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIHRvIHRoaXMgbW9kdWxlIChlaXRoZXIgYmVjYXVzZSBzb21lb25lIGxpc3RlbnNcbiAgICogdG8gdGhpcyBtb2R1bGUsIG9yIG9uZSBvZiB0aGUgdHdvIGBET01FdmVudFN1Ym1vZHVsZXNgIChgT3JpZW50YXRpb25gLFxuICAgKiBgT3JpZW50YXRpb25BbHRgKS5cbiAgICogV2hlbiB0aGUgbnVtYmVyIG9mIGxpc3RlbmVycyByZWFjaGVzIGAxYCwgYWRkcyBhIGAnZGV2aWNlb3JpZW50YXRpb24nYFxuICAgKiBldmVudCBsaXN0ZW5lci5cbiAgICpcbiAgICogQHNlZSBEZXZpY2VPcmllbnRhdGlvbk1vZHVsZSNhZGRMaXN0ZW5lclxuICAgKiBAc2VlIERPTUV2ZW50U3VibW9kdWxlI3N0YXJ0XG4gICAqL1xuICBfYWRkTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5fbnVtTGlzdGVuZXJzKys7XG5cbiAgICBpZiAodGhpcy5fbnVtTGlzdGVuZXJzID09PSAxKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZW9yaWVudGF0aW9uJywgdGhpcy5fZGV2aWNlb3JpZW50YXRpb25MaXN0ZW5lciwgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY3JlYXNlcyB0aGUgbnVtYmVyIG9mIGxpc3RlbmVycyB0byB0aGlzIG1vZHVsZSAoZWl0aGVyIGJlY2F1c2Ugc29tZW9uZSBzdG9wc1xuICAgKiBsaXN0ZW5pbmcgdG8gdGhpcyBtb2R1bGUsIG9yIG9uZSBvZiB0aGUgdGhyZWUgYERPTUV2ZW50U3VibW9kdWxlc2BcbiAgICogKGBPcmllbnRhdGlvbmAsIGBPcmllbnRhdGlvbkFsdGApLlxuICAgKiBXaGVuIHRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIHJlYWNoZXMgYDBgLCByZW1vdmVzIHRoZSBgJ2RldmljZW9yaWVudGF0aW9uJ2BcbiAgICogZXZlbnQgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBzZWUgRGV2aWNlT3JpZW50YXRpb25Nb2R1bGUjcmVtb3ZlTGlzdGVuZXJcbiAgICogQHNlZSBET01FdmVudFN1Ym1vZHVsZSNzdG9wXG4gICAqL1xuICBfcmVtb3ZlTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5fbnVtTGlzdGVuZXJzLS07XG5cbiAgICBpZiAodGhpcy5fbnVtTGlzdGVuZXJzID09PSAwKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGV2aWNlb3JpZW50YXRpb24nLCB0aGlzLl9kZXZpY2VvcmllbnRhdGlvbkxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICB0aGlzLm9yaWVudGF0aW9uLl93ZWJraXRDb21wYXNzSGVhZGluZ1JlZmVyZW5jZSA9IG51bGw7IC8vIGRvbid0IGZvcmdldCB0byByZXNldCB0aGUgY29tcGFzcyByZWZlcmVuY2Ugc2luY2UgdGhpcyByZWZlcmVuY2UgaXMgc2V0IGVhY2ggdGltZSB3ZSBzdGFydCBsaXN0ZW5pbmcgdG8gYSBgJ2RldmljZW9yaWVudGF0aW9uJ2AgZXZlbnRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgb2YgdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmluaXQoKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuX3Byb21pc2VSZXNvbHZlID0gcmVzb2x2ZTtcblxuICAgICAgaWYgKHdpbmRvdy5EZXZpY2VPcmllbnRhdGlvbkV2ZW50KVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlb3JpZW50YXRpb24nLCB0aGlzLl9kZXZpY2VvcmllbnRhdGlvbkNoZWNrLCBmYWxzZSk7XG4gICAgICBlbHNlIGlmICh0aGlzLnJlcXVpcmVkLm9yaWVudGF0aW9uKVxuICAgICAgICB0aGlzLl90cnlBY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5RmFsbGJhY2soKTtcbiAgICAgIGVsc2VcbiAgICAgICAgcmVzb2x2ZSh0aGlzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbGlzdGVuZXIgdG8gdGhpcyBtb2R1bGUuXG4gICAqIFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lciAtIExpc3RlbmVyIHRvIGFkZC5cbiAgICovXG4gIGFkZExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgc3VwZXIuYWRkTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgIHRoaXMuX2FkZExpc3RlbmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyIGZyb20gdGhpcyBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gTGlzdGVuZXIgdG8gcmVtb3ZlLlxuICAgKi9cbiAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICBzdXBlci5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXIoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEZXZpY2VPcmllbnRhdGlvbk1vZHVsZSgpOyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBFbmVyZ3kgbW9kdWxlXG4gKiBAYXV0aG9yIDxhIGhyZWY9J21haWx0bzpzZWJhc3RpZW5Acm9iYXN6a2lld2ljei5jb20nPlPDqWJhc3RpZW4gUm9iYXN6a2lld2ljejwvYT4sIDxhIGhyZWY9J21haWx0bzpOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnInPk5vcmJlcnQgU2NobmVsbDwvYT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IElucHV0TW9kdWxlID0gcmVxdWlyZSgnLi9JbnB1dE1vZHVsZScpO1xuY29uc3QgTW90aW9uSW5wdXQgPSByZXF1aXJlKCcuL01vdGlvbklucHV0Jyk7XG5cbi8qKlxuICogRW5lcmd5IG1vZHVsZSBzaW5nbGV0b24uXG4gKiBUaGUgZW5lcmd5IG1vZHVsZSBzaW5nbGV0b24gcHJvdmlkZXMgZW5lcmd5IHZhbHVlcyAoYmV0d2VlbiAwIGFuZCAxKVxuICogYmFzZWQgb24gdGhlIGFjY2VsZXJhdGlvbiBhbmQgdGhlIHJvdGF0aW9uIHJhdGUgb2YgdGhlIGRldmljZS5cbiAqIFRoZSBwZXJpb2Qgb2YgdGhlIGVuZXJneSB2YWx1ZXMgaXMgdGhlIHNhbWUgYXMgdGhlIHBlcmlvZCBvZiB0aGVcbiAqIGFjY2VsZXJhdGlvbiBhbmQgdGhlIHJvdGF0aW9uIHJhdGUgdmFsdWVzLlxuICpcbiAqIEBjbGFzcyBFbmVyZ3lNb2R1bGVcbiAqIEBleHRlbmRzIElucHV0TW9kdWxlXG4gKi9cbmNsYXNzIEVuZXJneU1vZHVsZSBleHRlbmRzIElucHV0TW9kdWxlIHtcblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgZW5lcmd5IG1vZHVsZSBpbnN0YW5jZS5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcignZW5lcmd5Jyk7XG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBjb250YWluaW5nIHRoZSB2YWx1ZSBvZiB0aGUgZW5lcmd5LCBzZW50IGJ5IHRoZSBlbmVyZ3kgbW9kdWxlLlxuICAgICAqXG4gICAgICogQHRoaXMgRW5lcmd5TW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG4gICAgdGhpcy5ldmVudCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYWNjZWxlcmF0aW9uIG1vZHVsZSwgdXNlZCBpbiB0aGUgY2FsY3VsYXRpb24gb2YgdGhlIGVuZXJneS5cbiAgICAgKlxuICAgICAqIEB0aGlzIEVuZXJneU1vZHVsZVxuICAgICAqIEB0eXBlIHtET01FdmVudFN1Ym1vZHVsZX1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICogQHNlZSBEZXZpY2Vtb3Rpb25Nb2R1bGVcbiAgICAgKi9cbiAgICB0aGlzLl9hY2NlbGVyYXRpb25Nb2R1bGUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogTGF0ZXN0IGFjY2VsZXJhdGlvbiB2YWx1ZSBzZW50IGJ5IHRoZSBhY2NlbGVyYXRpb24gbW9kdWxlLlxuICAgICAqXG4gICAgICogQHRoaXMgRW5lcmd5TW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcltdfVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cbiAgICB0aGlzLl9hY2NlbGVyYXRpb25WYWx1ZXMgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogTWF4aW11bSB2YWx1ZSByZWFjaGVkIGJ5IHRoZSBhY2NlbGVyYXRpb24gbWFnbml0dWRlLCBjbGlwcGVkIGF0IGB0aGlzLl9hY2NlbGVyYXRpb25NYWduaXR1ZGVUaHJlc2hvbGRgLlxuICAgICAqXG4gICAgICogQHRoaXMgRW5lcmd5TW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCA5LjgxXG4gICAgICovXG4gICAgdGhpcy5fYWNjZWxlcmF0aW9uTWFnbml0dWRlQ3VycmVudE1heCA9IDkuODE7XG5cbiAgICAvKipcbiAgICAgKiBDbGlwcGluZyB2YWx1ZSBvZiB0aGUgYWNjZWxlcmF0aW9uIG1hZ25pdHVkZS5cbiAgICAgKlxuICAgICAqIEB0aGlzIEVuZXJneU1vZHVsZVxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMjBcbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKi9cbiAgICB0aGlzLl9hY2NlbGVyYXRpb25NYWduaXR1ZGVUaHJlc2hvbGQgPSAyMDtcblxuICAgIC8qKlxuICAgICAqIFRoZSByb3RhdGlvbiByYXRlIG1vZHVsZSwgdXNlZCBpbiB0aGUgY2FsY3VsYXRpb24gb2YgdGhlIGVuZXJneS5cbiAgICAgKlxuICAgICAqIEB0aGlzIEVuZXJneU1vZHVsZVxuICAgICAqIEB0eXBlIHtET01FdmVudFN1Ym1vZHVsZX1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICogQHNlZSBEZXZpY2Vtb3Rpb25Nb2R1bGVcbiAgICAgKi9cbiAgICB0aGlzLl9yb3RhdGlvblJhdGVNb2R1bGUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogTGF0ZXN0IHJvdGF0aW9uIHJhdGUgdmFsdWUgc2VudCBieSB0aGUgcm90YXRpb24gcmF0ZSBtb2R1bGUuXG4gICAgICpcbiAgICAgKiBAdGhpcyBFbmVyZ3lNb2R1bGVcbiAgICAgKiBAdHlwZSB7bnVtYmVyW119XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIHRoaXMuX3JvdGF0aW9uUmF0ZVZhbHVlcyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBNYXhpbXVtIHZhbHVlIHJlYWNoZWQgYnkgdGhlIHJvdGF0aW9uIHJhdGUgbWFnbml0dWRlLCBjbGlwcGVkIGF0IGB0aGlzLl9yb3RhdGlvblJhdGVNYWduaXR1ZGVUaHJlc2hvbGRgLlxuICAgICAqXG4gICAgICogQHRoaXMgRW5lcmd5TW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAyMDBcbiAgICAgKi9cbiAgICB0aGlzLl9yb3RhdGlvblJhdGVNYWduaXR1ZGVDdXJyZW50TWF4ID0gMjAwO1xuXG4gICAgLyoqXG4gICAgICogQ2xpcHBpbmcgdmFsdWUgb2YgdGhlIHJvdGF0aW9uIHJhdGUgbWFnbml0dWRlLlxuICAgICAqXG4gICAgICogQHRoaXMgRW5lcmd5TW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCA2MDBcbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKi9cbiAgICB0aGlzLl9yb3RhdGlvblJhdGVNYWduaXR1ZGVUaHJlc2hvbGQgPSA2MDA7XG5cbiAgICAvKipcbiAgICAgKiBUaW1lIGNvbnN0YW50IChoYWxmLWxpZmUpIG9mIHRoZSBsb3ctcGFzcyBmaWx0ZXIgdXNlZCB0byBzbW9vdGggdGhlIGVuZXJneSB2YWx1ZXMgKGluIHNlY29uZHMpLlxuICAgICAqXG4gICAgICogQHRoaXMgRW5lcmd5TW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjFcbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKi9cbiAgICB0aGlzLl9lbmVyZ3lUaW1lQ29uc3RhbnQgPSAwLjE7XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgYmluZGluZyBvZiB0aGUgYWNjZWxlcmF0aW9uIHZhbHVlcyBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIEB0aGlzIEVuZXJneU1vZHVsZVxuICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgKi9cbiAgICB0aGlzLl9vbkFjY2VsZXJhdGlvbiA9IHRoaXMuX29uQWNjZWxlcmF0aW9uLmJpbmQodGhpcyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogTWV0aG9kIGJpbmRpbmcgb2YgdGhlIHJvdGF0aW9uIHJhdGUgdmFsdWVzIGNhbGxiYWNrLlxuICAgICAqXG4gICAgICogQHRoaXMgRW5lcmd5TW9kdWxlXG4gICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuX29uUm90YXRpb25SYXRlID0gdGhpcy5fb25Sb3RhdGlvblJhdGUuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNheSBmYWN0b3Igb2YgdGhlIGxvdy1wYXNzIGZpbHRlciB1c2VkIHRvIHNtb290aCB0aGUgZW5lcmd5IHZhbHVlcy5cbiAgICpcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgX2VuZXJneURlY2F5KCkge1xuICAgIHJldHVybiBNYXRoLmV4cCgtMiAqIE1hdGguUEkgKiB0aGlzLnBlcmlvZCAvIHRoaXMuX2VuZXJneVRpbWVDb25zdGFudCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgb2YgdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmluaXQoKHJlc29sdmUpID0+IHtcbiAgICAgIC8vIFRoZSBlbmVyZ3kgbW9kdWxlIHJlcXVpcmVzIHRoZSBhY2NlbGVyYXRpb24gYW5kIHRoZSByb3RhdGlvbiByYXRlIG1vZHVsZXNcbiAgICAgIFByb21pc2UuYWxsKFtNb3Rpb25JbnB1dC5yZXF1aXJlTW9kdWxlKCdhY2NlbGVyYXRpb24nKSwgTW90aW9uSW5wdXQucmVxdWlyZU1vZHVsZSgncm90YXRpb25SYXRlJyldKVxuICAgICAgICAudGhlbigobW9kdWxlcykgPT4ge1xuICAgICAgICAgIGNvbnN0IFthY2NlbGVyYXRpb24sIHJvdGF0aW9uUmF0ZV0gPSBtb2R1bGVzO1xuXG4gICAgICAgICAgdGhpcy5fYWNjZWxlcmF0aW9uTW9kdWxlID0gYWNjZWxlcmF0aW9uO1xuICAgICAgICAgIHRoaXMuX3JvdGF0aW9uUmF0ZU1vZHVsZSA9IHJvdGF0aW9uUmF0ZTtcbiAgICAgICAgICB0aGlzLmlzQ2FsY3VsYXRlZCA9IHRoaXMuX2FjY2VsZXJhdGlvbk1vZHVsZS5pc1ZhbGlkIHx8IHRoaXMuX3JvdGF0aW9uUmF0ZU1vZHVsZS5pc1ZhbGlkO1xuXG4gICAgICAgICAgaWYgKHRoaXMuX2FjY2VsZXJhdGlvbk1vZHVsZS5pc1ZhbGlkKVxuICAgICAgICAgICAgdGhpcy5wZXJpb2QgPSB0aGlzLl9hY2NlbGVyYXRpb25Nb2R1bGUucGVyaW9kO1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX3JvdGF0aW9uUmF0ZU1vZHVsZS5pc1ZhbGlkKVxuICAgICAgICAgICAgdGhpcy5wZXJpb2QgPSB0aGlzLl9yb3RhdGlvblJhdGVNb2R1bGUucGVyaW9kO1xuXG4gICAgICAgICAgcmVzb2x2ZSh0aGlzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdGhlIG1vZHVsZS5cbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIC8vIFRPRE8oPyk6IG1ha2UgdGhpcyBtZXRob2QgcHJpdmF0ZVxuICAgIGlmICh0aGlzLl9hY2NlbGVyYXRpb25Nb2R1bGUuaXNWYWxpZClcbiAgICAgIE1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb24nLCB0aGlzLl9vbkFjY2VsZXJhdGlvbik7XG4gICAgaWYgKHRoaXMuX3JvdGF0aW9uUmF0ZU1vZHVsZS5pc1ZhbGlkKVxuICAgICAgTW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ3JvdGF0aW9uUmF0ZScsIHRoaXMuX29uUm90YXRpb25SYXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHRoZSBtb2R1bGUuXG4gICAqL1xuICBzdG9wKCkge1xuICAgIC8vIFRPRE8oPyk6IG1ha2UgdGhpcyBtZXRob2QgcHJpdmF0ZVxuICAgIGlmICh0aGlzLl9hY2NlbGVyYXRpb25Nb2R1bGUuaXNWYWxpZClcbiAgICAgIE1vdGlvbklucHV0LnJlbW92ZUxpc3RlbmVyKCdhY2NlbGVyYXRpb24nLCB0aGlzLl9vbkFjY2VsZXJhdGlvbik7XG4gICAgaWYgKHRoaXMuX3JvdGF0aW9uUmF0ZU1vZHVsZS5pc1ZhbGlkKVxuICAgICAgTW90aW9uSW5wdXQucmVtb3ZlTGlzdGVuZXIoJ3JvdGF0aW9uUmF0ZScsIHRoaXMuX29uUm90YXRpb25SYXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY2NlbGVyYXRpb24gdmFsdWVzIGhhbmRsZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyW119IGFjY2VsZXJhdGlvbiAtIExhdGVzdCBhY2NlbGVyYXRpb24gdmFsdWUuXG4gICAqL1xuICBfb25BY2NlbGVyYXRpb24oYWNjZWxlcmF0aW9uKSB7XG4gICAgdGhpcy5fYWNjZWxlcmF0aW9uVmFsdWVzID0gYWNjZWxlcmF0aW9uO1xuXG4gICAgLy8gSWYgdGhlIHJvdGF0aW9uIHJhdGUgdmFsdWVzIGFyZSBub3QgYXZhaWxhYmxlLCB3ZSBjYWxjdWxhdGUgdGhlIGVuZXJneSByaWdodCBhd2F5LlxuICAgIGlmICghdGhpcy5fcm90YXRpb25SYXRlTW9kdWxlLmlzVmFsaWQpXG4gICAgICB0aGlzLl9jYWxjdWxhdGVFbmVyZ3koKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGlvbiByYXRlIHZhbHVlcyBoYW5kbGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcltdfSByb3RhdGlvblJhdGUgLSBMYXRlc3Qgcm90YXRpb24gcmF0ZSB2YWx1ZS5cbiAgICovXG4gIF9vblJvdGF0aW9uUmF0ZShyb3RhdGlvblJhdGUpIHtcbiAgICB0aGlzLl9yb3RhdGlvblJhdGVWYWx1ZXMgPSByb3RhdGlvblJhdGU7XG5cbiAgICAvLyBXZSBrbm93IHRoYXQgdGhlIGFjY2VsZXJhdGlvbiBhbmQgcm90YXRpb24gcmF0ZSB2YWx1ZXMgY29taW5nIGZyb20gdGhlXG4gICAgLy8gc2FtZSBgZGV2aWNlbW90aW9uYCBldmVudCBhcmUgc2VudCBpbiB0aGF0IG9yZGVyIChhY2NlbGVyYXRpb24gPiByb3RhdGlvbiByYXRlKVxuICAgIC8vIHNvIHdoZW4gdGhlIHJvdGF0aW9uIHJhdGUgaXMgcHJvdmlkZWQsIHdlIGNhbGN1bGF0ZSB0aGUgZW5lcmd5IHZhbHVlIG9mIHRoZVxuICAgIC8vIGxhdGVzdCBgZGV2aWNlbW90aW9uYCBldmVudCB3aGVuIHdlIHJlY2VpdmUgdGhlIHJvdGF0aW9uIHJhdGUgdmFsdWVzLlxuICAgIHRoaXMuX2NhbGN1bGF0ZUVuZXJneSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZXJneSBjYWxjdWxhdGlvbjogZW1pdHMgYW4gZW5lcmd5IHZhbHVlIGJldHdlZW4gMCBhbmQgMS5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgY2hlY2tzIGlmIHRoZSBhY2NlbGVyYXRpb24gbW9kdWxlcyBpcyB2YWxpZC4gSWYgdGhhdCBpcyB0aGUgY2FzZSxcbiAgICogaXQgY2FsY3VsYXRlcyBhbiBlc3RpbWF0aW9uIG9mIHRoZSBlbmVyZ3kgKGJldHdlZW4gMCBhbmQgMSkgYmFzZWQgb24gdGhlIHJhdGlvXG4gICAqIG9mIHRoZSBjdXJyZW50IGFjY2VsZXJhdGlvbiBtYWduaXR1ZGUgYW5kIHRoZSBtYXhpbXVtIGFjY2VsZXJhdGlvbiBtYWduaXR1ZGVcbiAgICogcmVhY2hlZCBzbyBmYXIgKGNsaXBwZWQgYXQgdGhlIGB0aGlzLl9hY2NlbGVyYXRpb25NYWduaXR1ZGVUaHJlc2hvbGRgIHZhbHVlKS5cbiAgICogKFdlIHVzZSB0aGlzIHRyaWNrIHRvIGdldCB1bmlmb3JtIGJlaGF2aW9ycyBhbW9uZyBkZXZpY2VzLiBJZiB3ZSBjYWxjdWxhdGVkXG4gICAqIHRoZSByYXRpbyBiYXNlZCBvbiBhIGZpeGVkIHZhbHVlIGluZGVwZW5kZW50IG9mIHdoYXQgdGhlIGRldmljZSBpcyBjYXBhYmxlIG9mXG4gICAqIHByb3ZpZGluZywgd2UgY291bGQgZ2V0IGluY29uc2lzdGVudCBiZWhhdmlvcnMuIEZvciBpbnN0YW5jZSwgdGhlIGRldmljZXNcbiAgICogd2hvc2UgYWNjZWxlcm9tZXRlcnMgYXJlIGxpbWl0ZWQgYXQgMmcgd291bGQgYWx3YXlzIHByb3ZpZGUgdmVyeSBsb3cgdmFsdWVzXG4gICAqIGNvbXBhcmVkIHRvIGRldmljZXMgd2l0aCBhY2NlbGVyb21ldGVycyBjYXBhYmxlIG9mIG1lYXN1cmluZyA0ZyBhY2NlbGVyYXRpb25zLilcbiAgICogVGhlIHNhbWUgY2hlY2tzIGFuZCBjYWxjdWxhdGlvbnMgYXJlIG1hZGUgb24gdGhlIHJvdGF0aW9uIHJhdGUgbW9kdWxlLlxuICAgKiBGaW5hbGx5LCB0aGUgZW5lcmd5IHZhbHVlIGlzIHRoZSBtYXhpbXVtIGJldHdlZW4gdGhlIGVuZXJneSB2YWx1ZSBlc3RpbWF0ZWRcbiAgICogZnJvbSB0aGUgYWNjZWxlcmF0aW9uLCBhbmQgdGhlIG9uZSBlc3RpbWF0ZWQgZnJvbSB0aGUgcm90YXRpb24gcmF0ZS4gSXQgaXNcbiAgICogc21vb3RoZWQgdGhyb3VnaCBhIGxvdy1wYXNzIGZpbHRlci5cbiAgICovXG4gIF9jYWxjdWxhdGVFbmVyZ3koKSB7XG4gICAgbGV0IGFjY2VsZXJhdGlvbkVuZXJneSA9IDA7XG4gICAgbGV0IHJvdGF0aW9uUmF0ZUVuZXJneSA9IDA7XG5cbiAgICAvLyBDaGVjayB0aGUgYWNjZWxlcmF0aW9uIG1vZHVsZSBhbmQgY2FsY3VsYXRlIGFuIGVzdGltYXRpb24gb2YgdGhlIGVuZXJneSB2YWx1ZSBmcm9tIHRoZSBsYXRlc3QgYWNjZWxlcmF0aW9uIHZhbHVlXG4gICAgaWYgKHRoaXMuX2FjY2VsZXJhdGlvbk1vZHVsZS5pc1ZhbGlkKSB7XG4gICAgICBsZXQgYVggPSB0aGlzLl9hY2NlbGVyYXRpb25WYWx1ZXNbMF07XG4gICAgICBsZXQgYVkgPSB0aGlzLl9hY2NlbGVyYXRpb25WYWx1ZXNbMV07XG4gICAgICBsZXQgYVogPSB0aGlzLl9hY2NlbGVyYXRpb25WYWx1ZXNbMl07XG4gICAgICBsZXQgYWNjZWxlcmF0aW9uTWFnbml0dWRlID0gTWF0aC5zcXJ0KGFYICogYVggKyBhWSAqIGFZICsgYVogKiBhWik7XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBtYXhpbXVtIGFjY2VsZXJhdGlvbiBtYWduaXR1ZGUgcmVhY2hlZCBzbyBmYXIsIGNsaXBwZWQgYXQgYHRoaXMuX2FjY2VsZXJhdGlvbk1hZ25pdHVkZVRocmVzaG9sZGBcbiAgICAgIGlmICh0aGlzLl9hY2NlbGVyYXRpb25NYWduaXR1ZGVDdXJyZW50TWF4IDwgYWNjZWxlcmF0aW9uTWFnbml0dWRlKVxuICAgICAgICB0aGlzLl9hY2NlbGVyYXRpb25NYWduaXR1ZGVDdXJyZW50TWF4ID0gTWF0aC5taW4oYWNjZWxlcmF0aW9uTWFnbml0dWRlLCB0aGlzLl9hY2NlbGVyYXRpb25NYWduaXR1ZGVUaHJlc2hvbGQpO1xuICAgICAgLy8gVE9ETyg/KTogcmVtb3ZlIG91bGllcnMgLS0tIG9uIHNvbWUgQW5kcm9pZCBkZXZpY2VzLCB0aGUgbWFnbml0dWRlIGlzIHZlcnkgaGlnaCBvbiBhIGZldyBpc29sYXRlZCBkYXRhcG9pbnRzLFxuICAgICAgLy8gd2hpY2ggbWFrZSB0aGUgdGhyZXNob2xkIHZlcnkgaGlnaCBhcyB3ZWxsID0+IHRoZSBlbmVyZ3kgcmVtYWlucyBhcm91bmQgMC41LCBldmVuIHdoZW4geW91IHNoYWtlIHZlcnkgaGFyZC5cblxuICAgICAgYWNjZWxlcmF0aW9uRW5lcmd5ID0gTWF0aC5taW4oYWNjZWxlcmF0aW9uTWFnbml0dWRlIC8gdGhpcy5fYWNjZWxlcmF0aW9uTWFnbml0dWRlQ3VycmVudE1heCwgMSk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIHJvdGF0aW9uIHJhdGUgbW9kdWxlIGFuZCBjYWxjdWxhdGUgYW4gZXN0aW1hdGlvbiBvZiB0aGUgZW5lcmd5IHZhbHVlIGZyb20gdGhlIGxhdGVzdCByb3RhdGlvbiByYXRlIHZhbHVlXG4gICAgaWYgKHRoaXMuX3JvdGF0aW9uUmF0ZU1vZHVsZS5pc1ZhbGlkKSB7XG4gICAgICBsZXQgckEgPSB0aGlzLl9yb3RhdGlvblJhdGVWYWx1ZXNbMF07XG4gICAgICBsZXQgckIgPSB0aGlzLl9yb3RhdGlvblJhdGVWYWx1ZXNbMV07XG4gICAgICBsZXQgckcgPSB0aGlzLl9yb3RhdGlvblJhdGVWYWx1ZXNbMl07XG4gICAgICBsZXQgcm90YXRpb25SYXRlTWFnbml0dWRlID0gTWF0aC5zcXJ0KHJBICogckEgKyByQiAqIHJCICsgckcgKiByRyk7XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBtYXhpbXVtIHJvdGF0aW9uIHJhdGUgbWFnbml0dWRlIHJlYWNoZWQgc28gZmFyLCBjbGlwcGVkIGF0IGB0aGlzLl9yb3RhdGlvblJhdGVNYWduaXR1ZGVUaHJlc2hvbGRgXG4gICAgICBpZiAodGhpcy5fcm90YXRpb25SYXRlTWFnbml0dWRlQ3VycmVudE1heCA8IHJvdGF0aW9uUmF0ZU1hZ25pdHVkZSlcbiAgICAgICAgdGhpcy5fcm90YXRpb25SYXRlTWFnbml0dWRlQ3VycmVudE1heCA9IE1hdGgubWluKHJvdGF0aW9uUmF0ZU1hZ25pdHVkZSwgdGhpcy5fcm90YXRpb25SYXRlTWFnbml0dWRlVGhyZXNob2xkKTtcblxuICAgICAgcm90YXRpb25SYXRlRW5lcmd5ID0gTWF0aC5taW4ocm90YXRpb25SYXRlTWFnbml0dWRlIC8gdGhpcy5fcm90YXRpb25SYXRlTWFnbml0dWRlQ3VycmVudE1heCwgMSk7XG4gICAgfVxuXG4gICAgbGV0IGVuZXJneSA9IE1hdGgubWF4KGFjY2VsZXJhdGlvbkVuZXJneSwgcm90YXRpb25SYXRlRW5lcmd5KTtcblxuICAgIC8vIExvdy1wYXNzIGZpbHRlciB0byBzbW9vdGggdGhlIGVuZXJneSB2YWx1ZXNcbiAgICBjb25zdCBrID0gdGhpcy5fZW5lcmd5RGVjYXk7XG4gICAgdGhpcy5ldmVudCA9IGsgKiB0aGlzLmV2ZW50ICsgKDEgLSBrKSAqIGVuZXJneTtcblxuICAgIC8vIEVtaXQgdGhlIGVuZXJneSB2YWx1ZVxuICAgIHRoaXMuZW1pdCh0aGlzLmV2ZW50KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBFbmVyZ3lNb2R1bGUoKTsiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgYElucHV0TW9kdWxlYCBtb2R1bGVcbiAqIEBhdXRob3IgPGEgaHJlZj0nbWFpbHRvOnNlYmFzdGllbkByb2Jhc3praWV3aWN6LmNvbSc+U8OpYmFzdGllbiBSb2Jhc3praWV3aWN6PC9hPiwgPGEgaHJlZj0nbWFpbHRvOk5vcmJlcnQuU2NobmVsbEBpcmNhbS5mcic+Tm9yYmVydCBTY2huZWxsPC9hPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBgSW5wdXRNb2R1bGVgIGNsYXNzLlxuICogVGhlIGBJbnB1dE1vZHVsZWAgY2xhc3MgYWxsb3dzIHRvIGluc3RhbnRpYXRlIG1vZHVsZXMgdGhhdCBhcmUgcGFydCBvZiB0aGVcbiAqIG1vdGlvbiBpbnB1dCBtb2R1bGUsIGFuZCB0aGF0IHByb3ZpZGUgdmFsdWVzIChmb3IgaW5zdGFuY2UsIGBkZXZpY2VvcmllbnRhdGlvbmAsXG4gKiBgYWNjZWxlcmF0aW9uYCwgYGVuZXJneWApLlxuICpcbiAqIEBjbGFzcyBJbnB1dE1vZHVsZVxuICovXG5jbGFzcyBJbnB1dE1vZHVsZSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYElucHV0TW9kdWxlYCBtb2R1bGUgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIC0gTmFtZSBvZiB0aGUgbW9kdWxlIC8gZXZlbnQgKCplLmcuKiBgZGV2aWNlb3JpZW50YXRpb24sICdhY2NlbGVyYXRpb24nLCAnZW5lcmd5JykuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihldmVudFR5cGUpIHtcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IHR5cGUgb2YgdGhlIG1vZHVsZS5cbiAgICAgKlxuICAgICAqIEB0aGlzIElucHV0TW9kdWxlXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKi9cbiAgICB0aGlzLmV2ZW50VHlwZSA9IGV2ZW50VHlwZTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIGxpc3RlbmVycyBhdHRhY2hlZCB0byB0aGlzIG1vZHVsZSAvIGV2ZW50LlxuICAgICAqXG4gICAgICogQHRoaXMgSW5wdXRNb2R1bGVcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb25bXX1cbiAgICAgKiBAZGVmYXVsdCBbXVxuICAgICAqL1xuICAgIHRoaXMubGlzdGVuZXJzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBzZW50IGJ5IHRoaXMgbW9kdWxlLlxuICAgICAqXG4gICAgICogQHRoaXMgSW5wdXRNb2R1bGVcbiAgICAgKiBAdHlwZSB7bnVtYmVyfG51bWJlcltdfVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cbiAgICB0aGlzLmV2ZW50ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIE1vZHVsZSBwcm9taXNlIChyZXNvbHZlZCB3aGVuIHRoZSBtb2R1bGUgaXMgaW5pdGlhbGl6ZWQpLlxuICAgICAqXG4gICAgICogQHRoaXMgSW5wdXRNb2R1bGVcbiAgICAgKiBAdHlwZSB7UHJvbWlzZX1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgdGhpcy5wcm9taXNlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyBpZiB0aGUgbW9kdWxlJ3MgZXZlbnQgdmFsdWVzIGFyZSBjYWxjdWxhdGVkIGZyb20gcGFyZW50IG1vZHVsZXMgLyBldmVudHMuXG4gICAgICpcbiAgICAgKiBAdGhpcyBJbnB1dE1vZHVsZVxuICAgICAqIEB0eXBlIHtib29sfVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgdGhpcy5pc0NhbGN1bGF0ZWQgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEluZGljYXRlcyBpZiB0aGUgbW9kdWxlJ3MgZXZlbnQgdmFsdWVzIGFyZSBwcm92aWRlZCBieSB0aGUgZGV2aWNlJ3Mgc2Vuc29ycy5cbiAgICAgKiAoKkkuZS4qIGluZGljYXRlcyBpZiB0aGUgYCdkZXZpY2Vtb3Rpb24nYCBvciBgJ2RldmljZW9yaWVudGF0aW9uJ2AgZXZlbnRzIHByb3ZpZGUgdGhlIHJlcXVpcmVkIHJhdyB2YWx1ZXMuKVxuICAgICAqXG4gICAgICogQHRoaXMgSW5wdXRNb2R1bGVcbiAgICAgKiBAdHlwZSB7Ym9vbH1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIHRoaXMuaXNQcm92aWRlZCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogUGVyaW9kIGF0IHdoaWNoIHRoZSBtb2R1bGUncyBldmVudHMgYXJlIHNlbnQgKGB1bmRlZmluZWRgIGlmIHRoZSBldmVudHMgYXJlIG5vdCBzZW50IGF0IHJlZ3VsYXIgaW50ZXJ2YWxzKS5cbiAgICAgKlxuICAgICAqIEB0aGlzIElucHV0TW9kdWxlXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCB1bmRlZmluZWRcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgbW9kdWxlIGNhbiBwcm92aWRlIHZhbHVlcyBvciBub3QuXG4gICAqXG4gICAqIEB0eXBlIHtib29sfVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBpc1ZhbGlkKCkge1xuICAgIHJldHVybiAodGhpcy5pc1Byb3ZpZGVkIHx8IHRoaXMuaXNDYWxjdWxhdGVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9taXNlRnVuIC0gUHJvbWlzZSBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBgcmVzb2x2ZWAgYW5kIGByZWplY3RgIGZ1bmN0aW9ucyBhcyBhcmd1bWVudHMuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICBpbml0KHByb21pc2VGdW4pIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShwcm9taXNlRnVuKTtcbiAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgbW9kdWxlLlxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgLy8gYWJzdHJhY3QgbWV0aG9kXG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIG1vZHVsZS5cbiAgICovXG4gIHN0b3AoKSB7XG4gICAgLy8gYWJzdHJhY3QgbWV0aG9kXG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRvIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gTGlzdGVuZXIgdG8gYWRkLlxuICAgKi9cbiAgYWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuICAgIC8vIFN0YXJ0IHRoZSBtb2R1bGUgYXMgc29vbiBhcyB0aGVyZSBpcyBhIGxpc3RlbmVyXG4gICAgaWYgKHRoaXMubGlzdGVuZXJzLmxlbmd0aCA9PT0gMSlcbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnJvbSB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lciAtIExpc3RlbmVyIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgbGV0IGluZGV4ID0gdGhpcy5saXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgdGhpcy5saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIC8vIFN0b3AgdGhlIG1vZHVsZSBpZCB0aGVyZSBhcmUgbm8gbGlzdGVuZXJzXG4gICAgaWYgKHRoaXMubGlzdGVuZXJzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb3BhZ2F0ZXMgYW4gZXZlbnQgdG8gYWxsIHRoZSBtb2R1bGUncyBsaXN0ZW5lcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfG51bWJlcltdfSBbZXZlbnQ9dGhpcy5ldmVudF0gLSBFdmVudCB2YWx1ZXMgdG8gcHJvcGFnYXRlIHRvIHRoZSBtb2R1bGUncyBsaXN0ZW5lcnMuXG4gICAqL1xuICBlbWl0KGV2ZW50ID0gdGhpcy5ldmVudCkge1xuICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMubGlzdGVuZXJzKVxuICAgICAgbGlzdGVuZXIoZXZlbnQpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXRNb2R1bGU7IiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGBNb3Rpb25JbnB1dGAgbW9kdWxlXG4gKiBAYXV0aG9yIDxhIGhyZWY9J21haWx0bzpzZWJhc3RpZW5Acm9iYXN6a2lld2ljei5jb20nPlPDqWJhc3RpZW4gUm9iYXN6a2lld2ljejwvYT4sIDxhIGhyZWY9J21haWx0bzpOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnInPk5vcmJlcnQgU2NobmVsbDwvYT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogYE1vdGlvbklucHV0YCBzaW5nbGV0b24uXG4gKiBUaGUgYE1vdGlvbklucHV0YCBzaW5nbGV0b24gYWxsb3dzIHRvIGluaXRpYWxpemUgbW90aW9uIGV2ZW50c1xuICogYW5kIHRvIGxpc3RlbiB0byB0aGVtLlxuICogXG4gKiBAY2xhc3MgTW90aW9uSW5wdXRcbiAqL1xuY2xhc3MgTW90aW9uSW5wdXQge1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBgTW90aW9uSW5wdXRgIG1vZHVsZSBpbnN0YW5jZS5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIC8qKlxuICAgICAqIFBvb2wgb2YgYWxsIGF2YWlsYWJsZSBtb2R1bGVzLlxuICAgICAqXG4gICAgICogQHRoaXMgTW90aW9uSW5wdXRcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHt9XG4gICAgICovXG4gICAgdGhpcy5tb2R1bGVzID0ge307XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG1vZHVsZSB0byB0aGUgYE1vdGlvbklucHV0YCBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgLSBOYW1lIG9mIHRoZSBldmVudCB0eXBlLlxuICAgKiBAcGFyYW0ge0lucHV0TW9kdWxlfSBtb2R1bGUgLSBNb2R1bGUgdG8gYWRkIHRvIHRoZSBgTW90aW9uSW5wdXRgIG1vZHVsZS5cbiAgICovXG4gIGFkZE1vZHVsZShldmVudFR5cGUsIG1vZHVsZSkge1xuICAgIHRoaXMubW9kdWxlc1tldmVudFR5cGVdID0gbW9kdWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgLSBOYW1lIG9mIHRoZSBldmVudCB0eXBlIChtb2R1bGUpIHRvIHJldHJpZXZlLlxuICAgKiBAcmV0dXJuIHtJbnB1dE1vZHVsZX1cbiAgICovXG4gIGdldE1vZHVsZShldmVudFR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5tb2R1bGVzW2V2ZW50VHlwZV07XG4gIH1cblxuICAvKipcbiAgICogUmVxdWlyZXMgYSBtb2R1bGUuXG4gICAqIElmIHRoZSBtb2R1bGUgaGFzIGJlZW4gaW5pdGlhbGl6ZWQgYWxyZWFkLCByZXR1cm5zIGl0cyBwcm9taXNlLiBPdGhlcndpc2UsXG4gICAqIGluaXRpYWxpemVzIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgLSBOYW1lIG9mIHRoZSBldmVudCB0eXBlIChtb2R1bGUpIHRvIHJlcXVpcmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICByZXF1aXJlTW9kdWxlKGV2ZW50VHlwZSkge1xuICAgIGxldCBtb2R1bGUgPSB0aGlzLmdldE1vZHVsZShldmVudFR5cGUpO1xuXG4gICAgaWYobW9kdWxlLnByb21pc2UpXG4gICAgICByZXR1cm4gbW9kdWxlLnByb21pc2U7XG5cbiAgICByZXR1cm4gbW9kdWxlLmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgYE1vdGlvbklucHV0YCBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IC4uLmV2ZW50VHlwZXMgLSBBcnJheSBvZiB0aGUgZXZlbnQgdHlwZXMgdG8gaW5pdGlhbGl6ZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIGluaXQoLi4uZXZlbnRUeXBlcykge1xuICAgIGxldCBtb2R1bGVQcm9taXNlcyA9IGV2ZW50VHlwZXMubWFwKCh2YWx1ZSkgPT4ge1xuICAgICAgbGV0IG1vZHVsZSA9IHRoaXMuZ2V0TW9kdWxlKHZhbHVlKTtcbiAgICAgIHJldHVybiBtb2R1bGUuaW5pdCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKG1vZHVsZVByb21pc2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgLSBOYW1lIG9mIHRoZSBldmVudCB0eXBlIChtb2R1bGUpIHRvIGFkZCBhIGxpc3RlbmVyIHRvLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lciAtIExpc3RlbmVyIHRvIGFkZC5cbiAgICovXG4gIGFkZExpc3RlbmVyKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcbiAgICBsZXQgbW9kdWxlID0gdGhpcy5nZXRNb2R1bGUoZXZlbnRUeXBlKTtcbiAgICBtb2R1bGUuYWRkTGlzdGVuZXIobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lci5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSAtIE5hbWUgb2YgdGhlIGV2ZW50IHR5cGUgKG1vZHVsZSkgdG8gYWRkIGEgbGlzdGVuZXIgdG8uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gTGlzdGVuZXIgdG8gcmVtb3ZlLlxuICAgKi9cbiAgcmVtb3ZlTGlzdGVuZXIoZXZlbnRUeXBlLCBsaXN0ZW5lcikge1xuICAgIGxldCBtb2R1bGUgPSB0aGlzLmdldE1vZHVsZShldmVudFR5cGUpO1xuICAgIG1vZHVsZS5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW90aW9uSW5wdXQoKTsiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTW90aW9uIGlucHV0IGluZGV4IGZpbGVcbiAqIEBhdXRob3IgPGEgaHJlZj0nbWFpbHRvOnNlYmFzdGllbkByb2Jhc3praWV3aWN6LmNvbSc+U8OpYmFzdGllbiBSb2Jhc3praWV3aWN6PC9hPiwgPGEgaHJlZj0nbWFpbHRvOk5vcmJlcnQuU2NobmVsbEBpcmNhbS5mcic+Tm9yYmVydCBTY2huZWxsPC9hPlxuICogQGRlc2NyaXB0aW9uIFRoZSBtb3Rpb24gaW5wdXQgbW9kdWxlIGNhbiBiZSB1c2VkIGFzIGZvbGxvd3M6XG4gKiBgYGBcbiAqIGNvbnN0IGlucHV0ID0gcmVxdWlyZSgnbW90aW9uLWlucHV0Jyk7XG4gKiBjb25zdCByZXF1aXJlZEV2ZW50cyA9IFsnYWNjZWxlcmF0aW9uJywgJ29yaWVudGF0aW9uJywgJ2VuZXJneSddO1xuICogXG4gKiBpbnB1dFxuICogIC5pbml0KHJlcXVpcmVkRXZlbnRzKVxuICogIC50aGVuKChtb2R1bGVzKSA9PiB7XG4gKiAgICBjb25zdCBbYWNjZWxlcmF0aW9uLCBvcmllbnRhdGlvbiwgZW5lcmd5XSA9IG1vZHVsZXM7XG4gKlxuICogICAgaWYgKGFjY2VsZXJhdGlvbi5pc1ZhbGlkKSB7XG4gKiAgICAgIGlucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb24nLCAodmFsKSA9PiB7XG4gKiAgICAgICAgY29uc29sZS5sb2coJ2FjY2VsZXJhdGlvbicsIHZhbCk7XG4gKiAgICAgICAgLy8gZG8gc29tZXRoaW5nIHdpdGggdGhlIGFjY2VsZXJhdGlvbiB2YWx1ZXNcbiAqICAgICAgfSk7XG4gKiAgICB9XG4gKlxuICogICAgLy8gZG8gc29tZXRoaW5nIGVsc2Ugd2l0aCB0aGUgb3RoZXIgbW9kdWxlc1xuICogIH0pO1xuICogYGBgXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbW90aW9uSW5wdXQgPSByZXF1aXJlKCcuL2Rpc3QvTW90aW9uSW5wdXQnKTtcbnZhciBkZXZpY2VvcmllbnRhdGlvbk1vZHVsZSA9IHJlcXVpcmUoJy4vZGlzdC9EZXZpY2VPcmllbnRhdGlvbk1vZHVsZScpO1xudmFyIGRldmljZW1vdGlvbk1vZHVsZSA9IHJlcXVpcmUoJy4vZGlzdC9EZXZpY2VNb3Rpb25Nb2R1bGUnKTtcbnZhciBlbmVyZ3kgPSByZXF1aXJlKCcuL2Rpc3QvRW5lcmd5TW9kdWxlJyk7XG5cbm1vdGlvbklucHV0LmFkZE1vZHVsZSgnZGV2aWNlbW90aW9uJywgZGV2aWNlbW90aW9uTW9kdWxlKTtcbm1vdGlvbklucHV0LmFkZE1vZHVsZSgnZGV2aWNlb3JpZW50YXRpb24nLCBkZXZpY2VvcmllbnRhdGlvbk1vZHVsZSk7XG5tb3Rpb25JbnB1dC5hZGRNb2R1bGUoJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknLCBkZXZpY2Vtb3Rpb25Nb2R1bGUuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSk7XG5tb3Rpb25JbnB1dC5hZGRNb2R1bGUoJ2FjY2VsZXJhdGlvbicsIGRldmljZW1vdGlvbk1vZHVsZS5hY2NlbGVyYXRpb24pO1xubW90aW9uSW5wdXQuYWRkTW9kdWxlKCdyb3RhdGlvblJhdGUnLCBkZXZpY2Vtb3Rpb25Nb2R1bGUucm90YXRpb25SYXRlKTtcbm1vdGlvbklucHV0LmFkZE1vZHVsZSgnb3JpZW50YXRpb24nLCBkZXZpY2VvcmllbnRhdGlvbk1vZHVsZS5vcmllbnRhdGlvbik7XG5tb3Rpb25JbnB1dC5hZGRNb2R1bGUoJ29yaWVudGF0aW9uQWx0JywgZGV2aWNlb3JpZW50YXRpb25Nb2R1bGUub3JpZW50YXRpb25BbHQpO1xubW90aW9uSW5wdXQuYWRkTW9kdWxlKCdlbmVyZ3knLCBlbmVyZ3kpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1vdGlvbklucHV0OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vaXMtaXRlcmFibGVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3Byb21pc2VcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7XG4gIHZhciBfYWdhaW4gPSB0cnVlO1xuXG4gIF9mdW5jdGlvbjogd2hpbGUgKF9hZ2Fpbikge1xuICAgIHZhciBvYmplY3QgPSBfeCxcbiAgICAgICAgcHJvcGVydHkgPSBfeDIsXG4gICAgICAgIHJlY2VpdmVyID0gX3gzO1xuICAgIGRlc2MgPSBwYXJlbnQgPSBnZXR0ZXIgPSB1bmRlZmluZWQ7XG4gICAgX2FnYWluID0gZmFsc2U7XG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgdmFyIGRlc2MgPSBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3ggPSBwYXJlbnQ7XG4gICAgICAgIF94MiA9IHByb3BlcnR5O1xuICAgICAgICBfeDMgPSByZWNlaXZlcjtcbiAgICAgICAgX2FnYWluID0gdHJ1ZTtcbiAgICAgICAgY29udGludWUgX2Z1bmN0aW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkY3JlYXRlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIF9PYmplY3Qkc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gX09iamVjdCRjcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIF9PYmplY3Qkc2V0UHJvdG90eXBlT2YgPyBfT2JqZWN0JHNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2dldEl0ZXJhdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3JcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX2lzSXRlcmFibGUgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkge1xuICAgIHZhciBfYXJyID0gW107XG4gICAgdmFyIF9uID0gdHJ1ZTtcbiAgICB2YXIgX2QgPSBmYWxzZTtcbiAgICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2kgPSBfZ2V0SXRlcmF0b3IoYXJyKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZCA9IHRydWU7XG4gICAgICBfZSA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9hcnI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfSBlbHNlIGlmIChfaXNJdGVyYWJsZShPYmplY3QoYXJyKSkpIHtcbiAgICAgIHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwicmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvY29yZS5pdGVyLWhlbHBlcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy8kJykuY29yZS5nZXRJdGVyYXRvcjsiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9jb3JlLml0ZXItaGVscGVycycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzLyQnKS5jb3JlLmlzSXRlcmFibGU7IiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpe1xuICByZXR1cm4gJC5jcmVhdGUoUCwgRCk7XG59OyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIHJldHVybiAkLmdldERlc2MoaXQsIGtleSk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpLmNvcmUuT2JqZWN0LnNldFByb3RvdHlwZU9mOyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5wcm9taXNlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvJCcpLmNvcmUuUHJvbWlzZTsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbXNnMSwgbXNnMil7XG4gIGlmKCFjb25kaXRpb24pdGhyb3cgVHlwZUVycm9yKG1zZzIgPyBtc2cxICsgbXNnMiA6IG1zZzEpO1xufVxuYXNzZXJ0LmRlZiA9ICQuYXNzZXJ0RGVmaW5lZDtcbmFzc2VydC5mbiA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoISQuaXNGdW5jdGlvbihpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcbmFzc2VydC5vYmogPSBmdW5jdGlvbihpdCl7XG4gIGlmKCEkLmlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG5hc3NlcnQuaW5zdCA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSl7XG4gIGlmKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpdGhyb3cgVHlwZUVycm9yKG5hbWUgKyBcIjogdXNlIHRoZSAnbmV3JyBvcGVyYXRvciFcIik7XG4gIHJldHVybiBpdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGFzc2VydDsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIFRBRyAgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXG4gICwgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcbmZ1bmN0aW9uIGNvZihpdCl7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59XG5jb2YuY2xhc3NvZiA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIE8sIFQ7XG4gIHJldHVybiBpdCA9PSB1bmRlZmluZWQgPyBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiAnTnVsbCdcbiAgICA6IHR5cGVvZiAoVCA9IChPID0gT2JqZWN0KGl0KSlbVEFHXSkgPT0gJ3N0cmluZycgPyBUIDogY29mKE8pO1xufTtcbmNvZi5zZXQgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgISQuaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSQuaGlkZShpdCwgVEFHLCB0YWcpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gY29mOyIsIi8vIE9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFzc2VydEZ1bmN0aW9uID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLmZuO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYXNzZXJ0RnVuY3Rpb24oZm4pO1xuICBpZih+bGVuZ3RoICYmIHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9IHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICAgIH07XG59OyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBnbG9iYWwgICAgID0gJC5nXG4gICwgY29yZSAgICAgICA9ICQuY29yZVxuICAsIGlzRnVuY3Rpb24gPSAkLmlzRnVuY3Rpb247XG5mdW5jdGlvbiBjdHgoZm4sIHRoYXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cbi8vIHR5cGUgYml0bWFwXG4kZGVmLkYgPSAxOyAgLy8gZm9yY2VkXG4kZGVmLkcgPSAyOyAgLy8gZ2xvYmFsXG4kZGVmLlMgPSA0OyAgLy8gc3RhdGljXG4kZGVmLlAgPSA4OyAgLy8gcHJvdG9cbiRkZWYuQiA9IDE2OyAvLyBiaW5kXG4kZGVmLlcgPSAzMjsgLy8gd3JhcFxuZnVuY3Rpb24gJGRlZih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIga2V5LCBvd24sIG91dCwgZXhwXG4gICAgLCBpc0dsb2JhbCA9IHR5cGUgJiAkZGVmLkdcbiAgICAsIGlzUHJvdG8gID0gdHlwZSAmICRkZWYuUFxuICAgICwgdGFyZ2V0ICAgPSBpc0dsb2JhbCA/IGdsb2JhbCA6IHR5cGUgJiAkZGVmLlNcbiAgICAgICAgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KS5wcm90b3R5cGVcbiAgICAsIGV4cG9ydHMgID0gaXNHbG9iYWwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgaWYoaXNHbG9iYWwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICEodHlwZSAmICRkZWYuRikgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XG4gICAgaWYob3duICYmIGtleSBpbiBleHBvcnRzKWNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBpZihpc0dsb2JhbCAmJiAhaXNGdW5jdGlvbih0YXJnZXRba2V5XSkpZXhwID0gc291cmNlW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBlbHNlIGlmKHR5cGUgJiAkZGVmLkIgJiYgb3duKWV4cCA9IGN0eChvdXQsIGdsb2JhbCk7XG4gICAgLy8gd3JhcCBnbG9iYWwgY29uc3RydWN0b3JzIGZvciBwcmV2ZW50IGNoYW5nZSB0aGVtIGluIGxpYnJhcnlcbiAgICBlbHNlIGlmKHR5cGUgJiAkZGVmLlcgJiYgdGFyZ2V0W2tleV0gPT0gb3V0KSFmdW5jdGlvbihDKXtcbiAgICAgIGV4cCA9IGZ1bmN0aW9uKHBhcmFtKXtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBDID8gbmV3IEMocGFyYW0pIDogQyhwYXJhbSk7XG4gICAgICB9O1xuICAgICAgZXhwLnByb3RvdHlwZSA9IEMucHJvdG90eXBlO1xuICAgIH0ob3V0KTtcbiAgICBlbHNlIGV4cCA9IGlzUHJvdG8gJiYgaXNGdW5jdGlvbihvdXQpID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXhwb3J0XG4gICAgZXhwb3J0c1trZXldID0gZXhwO1xuICAgIGlmKGlzUHJvdG8pKGV4cG9ydHMucHJvdG90eXBlIHx8IChleHBvcnRzLnByb3RvdHlwZSA9IHt9KSlba2V5XSA9IG91dDtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSAkZGVmOyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZG9jdW1lbnQgPSAkLmcuZG9jdW1lbnRcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcbiAgLy8gaW4gb2xkIElFIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnXG4gICwgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07IiwidmFyIGN0eCAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBnZXQgID0gcmVxdWlyZSgnLi8kLml0ZXInKS5nZXRcbiAgLCBjYWxsID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQpe1xuICB2YXIgaXRlcmF0b3IgPSBnZXQoaXRlcmFibGUpXG4gICAgLCBmICAgICAgICA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxuICAgICwgc3RlcDtcbiAgd2hpbGUoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKXtcbiAgICBpZihjYWxsKGl0ZXJhdG9yLCBmLCBzdGVwLnZhbHVlLCBlbnRyaWVzKSA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuIGNhbGwuY2xvc2UoaXRlcmF0b3IpO1xuICAgIH1cbiAgfVxufTsiLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XHJcbnZhciAkID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHRvU3RyaW5nID0ge30udG9TdHJpbmdcclxuICAsIGdldE5hbWVzID0gJC5nZXROYW1lcztcclxuXHJcbnZhciB3aW5kb3dOYW1lcyA9IHR5cGVvZiB3aW5kb3cgPT0gJ29iamVjdCcgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcclxuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcclxuXHJcbmZ1bmN0aW9uIGdldFdpbmRvd05hbWVzKGl0KXtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGdldE5hbWVzKGl0KTtcclxuICB9IGNhdGNoKGUpe1xyXG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcclxuICBpZih3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJylyZXR1cm4gZ2V0V2luZG93TmFtZXMoaXQpO1xyXG4gIHJldHVybiBnZXROYW1lcygkLnRvT2JqZWN0KGl0KSk7XHJcbn07IiwiLy8gRmFzdCBhcHBseVxuLy8gaHR0cDovL2pzcGVyZi5sbmtpdC5jb20vZmFzdC1hcHBseS81XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCBhcmdzLCB0aGF0KXtcbiAgdmFyIHVuID0gdGhhdCA9PT0gdW5kZWZpbmVkO1xuICBzd2l0Y2goYXJncy5sZW5ndGgpe1xuICAgIGNhc2UgMDogcmV0dXJuIHVuID8gZm4oKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0KTtcbiAgICBjYXNlIDE6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgY2FzZSAzOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICBjYXNlIDQ6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10pO1xuICAgIGNhc2UgNTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSk7XG4gIH0gcmV0dXJuICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzKTtcbn07IiwidmFyIGFzc2VydE9iamVjdCA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmo7XG5mdW5jdGlvbiBjbG9zZShpdGVyYXRvcil7XG4gIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFzc2VydE9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xufVxuZnVuY3Rpb24gY2FsbChpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFzc2VydE9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgfSBjYXRjaChlKXtcbiAgICBjbG9zZShpdGVyYXRvcik7XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuY2FsbC5jbG9zZSA9IGNsb3NlO1xubW9kdWxlLmV4cG9ydHMgPSBjYWxsOyIsInZhciAkZGVmICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcmVkZWYgICAgICAgICAgPSByZXF1aXJlKCcuLyQucmVkZWYnKVxuICAsICQgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGl0ZXIgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIFNZTUJPTF9JVEVSQVRPUiA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEZGX0lURVJBVE9SICAgICA9ICdAQGl0ZXJhdG9yJ1xuICAsIEtFWVMgICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgICA9ICd2YWx1ZXMnXG4gICwgSXRlcmF0b3JzICAgICAgID0gJGl0ZXIuSXRlcmF0b3JzO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRSl7XG4gICRpdGVyLmNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIGZ1bmN0aW9uIGNyZWF0ZU1ldGhvZChraW5kKXtcbiAgICBmdW5jdGlvbiAkJCh0aGF0KXtcbiAgICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhhdCwga2luZCk7XG4gICAgfVxuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xuICB9XG4gIHZhciBUQUcgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgcHJvdG8gICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgX25hdGl2ZSAgPSBwcm90b1tTWU1CT0xfSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXG4gICAgLCBfZGVmYXVsdCA9IF9uYXRpdmUgfHwgY3JlYXRlTWV0aG9kKERFRkFVTFQpXG4gICAgLCBtZXRob2RzLCBrZXk7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoX25hdGl2ZSl7XG4gICAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0gJC5nZXRQcm90byhfZGVmYXVsdC5jYWxsKG5ldyBCYXNlKSk7XG4gICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgIGNvZi5zZXQoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgLy8gRkYgZml4XG4gICAgaWYoJC5GVyAmJiAkLmhhcyhwcm90bywgRkZfSVRFUkFUT1IpKSRpdGVyLnNldChJdGVyYXRvclByb3RvdHlwZSwgJC50aGF0KTtcbiAgfVxuICAvLyBEZWZpbmUgaXRlcmF0b3JcbiAgaWYoJC5GVyB8fCBGT1JDRSkkaXRlci5zZXQocHJvdG8sIF9kZWZhdWx0KTtcbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSBfZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gID0gJC50aGF0O1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAga2V5czogICAgSVNfU0VUICAgICAgICAgICAgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZChLRVlTKSxcbiAgICAgIHZhbHVlczogIERFRkFVTFQgPT0gVkFMVUVTID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoVkFMVUVTKSxcbiAgICAgIGVudHJpZXM6IERFRkFVTFQgIT0gVkFMVUVTID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoJ2VudHJpZXMnKVxuICAgIH07XG4gICAgaWYoRk9SQ0UpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSkkcmVkZWYocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAkaXRlci5CVUdHWSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbn07IiwidmFyIFNZTUJPTF9JVEVSQVRPUiA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIFNBRkVfQ0xPU0lORyAgICA9IGZhbHNlO1xudHJ5IHtcbiAgdmFyIHJpdGVyID0gWzddW1NZTUJPTF9JVEVSQVRPUl0oKTtcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24oKXsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XG59IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xuICBpZighU0FGRV9DTE9TSU5HKXJldHVybiBmYWxzZTtcbiAgdmFyIHNhZmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyICA9IFs3XVxuICAgICAgLCBpdGVyID0gYXJyW1NZTUJPTF9JVEVSQVRPUl0oKTtcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpeyBzYWZlID0gdHJ1ZTsgfTtcbiAgICBhcnJbU1lNQk9MX0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsIGNsYXNzb2YgICAgICAgICAgID0gY29mLmNsYXNzb2ZcbiAgLCBhc3NlcnQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxuICAsIGFzc2VydE9iamVjdCAgICAgID0gYXNzZXJ0Lm9ialxuICAsIFNZTUJPTF9JVEVSQVRPUiAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgRkZfSVRFUkFUT1IgICAgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBJdGVyYXRvcnMgICAgICAgICA9IHJlcXVpcmUoJy4vJC5zaGFyZWQnKSgnaXRlcmF0b3JzJylcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnNldEl0ZXJhdG9yKEl0ZXJhdG9yUHJvdG90eXBlLCAkLnRoYXQpO1xuZnVuY3Rpb24gc2V0SXRlcmF0b3IoTywgdmFsdWUpe1xuICAkLmhpZGUoTywgU1lNQk9MX0lURVJBVE9SLCB2YWx1ZSk7XG4gIC8vIEFkZCBpdGVyYXRvciBmb3IgRkYgaXRlcmF0b3IgcHJvdG9jb2xcbiAgaWYoRkZfSVRFUkFUT1IgaW4gW10pJC5oaWRlKE8sIEZGX0lURVJBVE9SLCB2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gIEJVR0dZOiAna2V5cycgaW4gW10gJiYgISgnbmV4dCcgaW4gW10ua2V5cygpKSxcbiAgSXRlcmF0b3JzOiBJdGVyYXRvcnMsXG4gIHN0ZXA6IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcbiAgfSxcbiAgaXM6IGZ1bmN0aW9uKGl0KXtcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KGl0KVxuICAgICAgLCBTeW1ib2wgPSAkLmcuU3ltYm9sO1xuICAgIHJldHVybiAoU3ltYm9sICYmIFN5bWJvbC5pdGVyYXRvciB8fCBGRl9JVEVSQVRPUikgaW4gT1xuICAgICAgfHwgU1lNQk9MX0lURVJBVE9SIGluIE9cbiAgICAgIHx8ICQuaGFzKEl0ZXJhdG9ycywgY2xhc3NvZihPKSk7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24oaXQpe1xuICAgIHZhciBTeW1ib2wgPSAkLmcuU3ltYm9sXG4gICAgICAsIGdldEl0ZXI7XG4gICAgaWYoaXQgIT0gdW5kZWZpbmVkKXtcbiAgICAgIGdldEl0ZXIgPSBpdFtTeW1ib2wgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IEZGX0lURVJBVE9SXVxuICAgICAgICB8fCBpdFtTWU1CT0xfSVRFUkFUT1JdXG4gICAgICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG4gICAgfVxuICAgIGFzc2VydCgkLmlzRnVuY3Rpb24oZ2V0SXRlciksIGl0LCAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgICByZXR1cm4gYXNzZXJ0T2JqZWN0KGdldEl0ZXIuY2FsbChpdCkpO1xuICB9LFxuICBzZXQ6IHNldEl0ZXJhdG9yLFxuICBjcmVhdGU6IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0LCBwcm90byl7XG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gJC5jcmVhdGUocHJvdG8gfHwgSXRlcmF0b3JQcm90b3R5cGUsIHtuZXh0OiAkLmRlc2MoMSwgbmV4dCl9KTtcbiAgICBjb2Yuc2V0KENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xuICB9XG59OyIsInZhciAkcmVkZWYgPSByZXF1aXJlKCcuLyQucmVkZWYnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XHJcbiAgZm9yKHZhciBrZXkgaW4gc3JjKSRyZWRlZih0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gIHJldHVybiB0YXJnZXQ7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQnKS5oaWRlOyIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmlzIHx8IGZ1bmN0aW9uIGlzKHgsIHkpe1xyXG4gIHJldHVybiB4ID09PSB5ID8geCAhPT0gMCB8fCAxIC8geCA9PT0gMSAvIHkgOiB4ICE9IHggJiYgeSAhPSB5O1xyXG59OyIsIi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbnZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGFzc2VydCA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKTtcbmZ1bmN0aW9uIGNoZWNrKE8sIHByb3RvKXtcbiAgYXNzZXJ0Lm9iaihPKTtcbiAgYXNzZXJ0KHByb3RvID09PSBudWxsIHx8ICQuaXNPYmplY3QocHJvdG8pLCBwcm90bywgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8ICgnX19wcm90b19fJyBpbiB7fSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgPyBmdW5jdGlvbihidWdneSwgc2V0KXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzZXQgPSByZXF1aXJlKCcuLyQuY3R4JykoRnVuY3Rpb24uY2FsbCwgJC5nZXREZXNjKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQsIDIpO1xuICAgICAgICAgIHNldCh7fSwgW10pO1xuICAgICAgICB9IGNhdGNoKGUpeyBidWdneSA9IHRydWU7IH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKE8sIHByb3RvKXtcbiAgICAgICAgICBjaGVjayhPLCBwcm90byk7XG4gICAgICAgICAgaWYoYnVnZ3kpTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgICBlbHNlIHNldChPLCBwcm90byk7XG4gICAgICAgICAgcmV0dXJuIE87XG4gICAgICAgIH07XG4gICAgICB9KClcbiAgICA6IHVuZGVmaW5lZCksXG4gIGNoZWNrOiBjaGVja1xufTsiLCJ2YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXHJcbiAgLCBzdG9yZSAgPSAkLmdbU0hBUkVEXSB8fCAoJC5nW1NIQVJFRF0gPSB7fSk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcclxuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcclxufTsiLCJ2YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vJC53a3MnKSgnc3BlY2llcycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDKXtcbiAgaWYoJC5ERVNDICYmICEoU1BFQ0lFUyBpbiBDKSkkLnNldERlc2MoQywgU1BFQ0lFUywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6ICQudGhhdFxuICB9KTtcbn07IiwiLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbnZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRPX1NUUklORyl7XG4gIHJldHVybiBmdW5jdGlvbih0aGF0LCBwb3Mpe1xuICAgIHZhciBzID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9ICQudG9JbnRlZ2VyKHBvcylcbiAgICAgICwgbCA9IHMubGVuZ3RoXG4gICAgICAsIGEsIGI7XG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGxcbiAgICAgIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgY29mICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgaW52b2tlID0gcmVxdWlyZSgnLi8kLmludm9rZScpXG4gICwgY2VsICAgID0gcmVxdWlyZSgnLi8kLmRvbS1jcmVhdGUnKVxuICAsIGdsb2JhbCAgICAgICAgICAgICA9ICQuZ1xuICAsIGlzRnVuY3Rpb24gICAgICAgICA9ICQuaXNGdW5jdGlvblxuICAsIGh0bWwgICAgICAgICAgICAgICA9ICQuaHRtbFxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgc2V0VGFzayAgICAgICAgICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxuICAsIGNsZWFyVGFzayAgICAgICAgICA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZVxuICAsIE1lc3NhZ2VDaGFubmVsICAgICA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbFxuICAsIGNvdW50ZXIgICAgICAgICAgICA9IDBcbiAgLCBxdWV1ZSAgICAgICAgICAgICAgPSB7fVxuICAsIE9OUkVBRFlTVEFURUNIQU5HRSA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnXG4gICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XG5mdW5jdGlvbiBydW4oKXtcbiAgdmFyIGlkID0gK3RoaXM7XG4gIGlmKCQuaGFzKHF1ZXVlLCBpZCkpe1xuICAgIHZhciBmbiA9IHF1ZXVlW2lkXTtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICAgIGZuKCk7XG4gIH1cbn1cbmZ1bmN0aW9uIGxpc3RuZXIoZXZlbnQpe1xuICBydW4uY2FsbChldmVudC5kYXRhKTtcbn1cbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcbmlmKCFpc0Z1bmN0aW9uKHNldFRhc2spIHx8ICFpc0Z1bmN0aW9uKGNsZWFyVGFzaykpe1xuICBzZXRUYXNrID0gZnVuY3Rpb24oZm4pe1xuICAgIHZhciBhcmdzID0gW10sIGkgPSAxO1xuICAgIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uKCl7XG4gICAgICBpbnZva2UoaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKSwgYXJncyk7XG4gICAgfTtcbiAgICBkZWZlcihjb3VudGVyKTtcbiAgICByZXR1cm4gY291bnRlcjtcbiAgfTtcbiAgY2xlYXJUYXNrID0gZnVuY3Rpb24oaWQpe1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gIH07XG4gIC8vIE5vZGUuanMgMC44LVxuICBpZihjb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY3R4KHJ1biwgaWQsIDEpKTtcbiAgICB9O1xuICAvLyBNb2Rlcm4gYnJvd3NlcnMsIHNraXAgaW1wbGVtZW50YXRpb24gZm9yIFdlYldvcmtlcnNcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgb2JqZWN0XG4gIH0gZWxzZSBpZihnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiBpc0Z1bmN0aW9uKGdsb2JhbC5wb3N0TWVzc2FnZSkgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShpZCwgJyonKTtcbiAgICB9O1xuICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdG5lciwgZmFsc2UpO1xuICAvLyBXZWJXb3JrZXJzXG4gIH0gZWxzZSBpZihpc0Z1bmN0aW9uKE1lc3NhZ2VDaGFubmVsKSl7XG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICBwb3J0ICAgID0gY2hhbm5lbC5wb3J0MjtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpc3RuZXI7XG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XG4gIC8vIElFOC1cbiAgfSBlbHNlIGlmKE9OUkVBRFlTVEFURUNIQU5HRSBpbiBjZWwoJ3NjcmlwdCcpKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIHJ1bi5jYWxsKGlkKTtcbiAgICAgIH07XG4gICAgfTtcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcbiAgfSBlbHNlIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcbiAgICB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiAgIHNldFRhc2ssXG4gIGNsZWFyOiBjbGVhclRhc2tcbn07IiwidmFyIHNpZCA9IDA7XG5mdW5jdGlvbiB1aWQoa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsrc2lkICsgTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoMzYpKTtcbn1cbnVpZC5zYWZlID0gcmVxdWlyZSgnLi8kJykuZy5TeW1ib2wgfHwgdWlkO1xubW9kdWxlLmV4cG9ydHMgPSB1aWQ7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9OyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLyQnKS5nXG4gICwgc3RvcmUgID0gcmVxdWlyZSgnLi8kLnNoYXJlZCcpKCd3a3MnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIGdsb2JhbC5TeW1ib2wgJiYgZ2xvYmFsLlN5bWJvbFtuYW1lXSB8fCByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnU3ltYm9sLicgKyBuYW1lKSk7XG59OyIsInZhciBjb3JlICA9IHJlcXVpcmUoJy4vJCcpLmNvcmVcbiAgLCAkaXRlciA9IHJlcXVpcmUoJy4vJC5pdGVyJyk7XG5jb3JlLmlzSXRlcmFibGUgID0gJGl0ZXIuaXM7XG5jb3JlLmdldEl0ZXJhdG9yID0gJGl0ZXIuZ2V0OyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBzZXRVbnNjb3BlID0gcmVxdWlyZSgnLi8kLnVuc2NvcGUnKVxuICAsIElURVIgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnaXRlcicpXG4gICwgJGl0ZXIgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJylcbiAgLCBzdGVwICAgICAgID0gJGl0ZXIuc3RlcFxuICAsIEl0ZXJhdG9ycyAgPSAkaXRlci5JdGVyYXRvcnM7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICQuc2V0KHRoaXMsIElURVIsIHtvOiAkLnRvT2JqZWN0KGl0ZXJhdGVkKSwgaTogMCwgazoga2luZH0pO1xuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXG4gICAgLCBPICAgICA9IGl0ZXIub1xuICAgICwga2luZCAgPSBpdGVyLmtcbiAgICAsIGluZGV4ID0gaXRlci5pKys7XG4gIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcbiAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbnNldFVuc2NvcGUoJ2tleXMnKTtcbnNldFVuc2NvcGUoJ3ZhbHVlcycpO1xuc2V0VW5zY29wZSgnZW50cmllcycpOyIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0fSk7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxuICAsIHRvT2JqZWN0ID0gJC50b09iamVjdDtcbiQuZWFjaC5jYWxsKCgnZnJlZXplLHNlYWwscHJldmVudEV4dGVuc2lvbnMsaXNGcm96ZW4saXNTZWFsZWQsaXNFeHRlbnNpYmxlLCcgK1xuICAnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLGdldFByb3RvdHlwZU9mLGtleXMsZ2V0T3duUHJvcGVydHlOYW1lcycpLnNwbGl0KCcsJylcbiwgZnVuY3Rpb24oS0VZLCBJRCl7XG4gIHZhciBmbiAgICAgPSAoJC5jb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZm9yY2VkID0gMFxuICAgICwgbWV0aG9kID0ge307XG4gIG1ldGhvZFtLRVldID0gSUQgPT0gMCA/IGZ1bmN0aW9uIGZyZWV6ZShpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMSA/IGZ1bmN0aW9uIHNlYWwoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcbiAgfSA6IElEID09IDIgPyBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyhpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMyA/IGZ1bmN0aW9uIGlzRnJvemVuKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcbiAgfSA6IElEID09IDQgPyBmdW5jdGlvbiBpc1NlYWxlZChpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XG4gIH0gOiBJRCA9PSA1ID8gZnVuY3Rpb24gaXNFeHRlbnNpYmxlKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogZmFsc2U7XG4gIH0gOiBJRCA9PSA2ID8gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCksIGtleSk7XG4gIH0gOiBJRCA9PSA3ID8gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpe1xuICAgIHJldHVybiBmbihPYmplY3QoJC5hc3NlcnREZWZpbmVkKGl0KSkpO1xuICB9IDogSUQgPT0gOCA/IGZ1bmN0aW9uIGtleXMoaXQpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCkpO1xuICB9IDogcmVxdWlyZSgnLi8kLmdldC1uYW1lcycpLmdldDtcbiAgdHJ5IHtcbiAgICBmbigneicpO1xuICB9IGNhdGNoKGUpe1xuICAgIGZvcmNlZCA9IDE7XG4gIH1cbiAgJGRlZigkZGVmLlMgKyAkZGVmLkYgKiBmb3JjZWQsICdPYmplY3QnLCBtZXRob2QpO1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgdG1wID0ge307XG50bXBbcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXSA9ICd6JztcbmlmKHJlcXVpcmUoJy4vJCcpLkZXICYmIGNvZih0bXApICE9ICd6Jyl7XG4gIHJlcXVpcmUoJy4vJC5yZWRlZicpKE9iamVjdC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdbb2JqZWN0ICcgKyBjb2YuY2xhc3NvZih0aGlzKSArICddJztcbiAgfSwgdHJ1ZSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjdHggICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGNvZiAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBhc3NlcnQgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxuICAsIGZvck9mICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgc2V0UHJvdG8gPSByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0XG4gICwgc2FtZSAgICAgPSByZXF1aXJlKCcuLyQuc2FtZScpXG4gICwgc3BlY2llcyAgPSByZXF1aXJlKCcuLyQuc3BlY2llcycpXG4gICwgU1BFQ0lFUyAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKVxuICAsIFJFQ09SRCAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ3JlY29yZCcpXG4gICwgUFJPTUlTRSAgPSAnUHJvbWlzZSdcbiAgLCBnbG9iYWwgICA9ICQuZ1xuICAsIHByb2Nlc3MgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBpc05vZGUgICA9IGNvZihwcm9jZXNzKSA9PSAncHJvY2VzcydcbiAgLCBhc2FwICAgICA9IHByb2Nlc3MgJiYgcHJvY2Vzcy5uZXh0VGljayB8fCByZXF1aXJlKCcuLyQudGFzaycpLnNldFxuICAsIFAgICAgICAgID0gZ2xvYmFsW1BST01JU0VdXG4gICwgaXNGdW5jdGlvbiAgICAgPSAkLmlzRnVuY3Rpb25cbiAgLCBpc09iamVjdCAgICAgICA9ICQuaXNPYmplY3RcbiAgLCBhc3NlcnRGdW5jdGlvbiA9IGFzc2VydC5mblxuICAsIGFzc2VydE9iamVjdCAgID0gYXNzZXJ0Lm9ialxuICAsIFdyYXBwZXI7XG5cbmZ1bmN0aW9uIHRlc3RSZXNvbHZlKHN1Yil7XG4gIHZhciB0ZXN0ID0gbmV3IFAoZnVuY3Rpb24oKXt9KTtcbiAgaWYoc3ViKXRlc3QuY29uc3RydWN0b3IgPSBPYmplY3Q7XG4gIHJldHVybiBQLnJlc29sdmUodGVzdCkgPT09IHRlc3Q7XG59XG5cbnZhciB1c2VOYXRpdmUgPSBmdW5jdGlvbigpe1xuICB2YXIgd29ya3MgPSBmYWxzZTtcbiAgZnVuY3Rpb24gUDIoeCl7XG4gICAgdmFyIHNlbGYgPSBuZXcgUCh4KTtcbiAgICBzZXRQcm90byhzZWxmLCBQMi5wcm90b3R5cGUpO1xuICAgIHJldHVybiBzZWxmO1xuICB9XG4gIHRyeSB7XG4gICAgd29ya3MgPSBpc0Z1bmN0aW9uKFApICYmIGlzRnVuY3Rpb24oUC5yZXNvbHZlKSAmJiB0ZXN0UmVzb2x2ZSgpO1xuICAgIHNldFByb3RvKFAyLCBQKTtcbiAgICBQMi5wcm90b3R5cGUgPSAkLmNyZWF0ZShQLnByb3RvdHlwZSwge2NvbnN0cnVjdG9yOiB7dmFsdWU6IFAyfX0pO1xuICAgIC8vIGFjdHVhbCBGaXJlZm94IGhhcyBicm9rZW4gc3ViY2xhc3Mgc3VwcG9ydCwgdGVzdCB0aGF0XG4gICAgaWYoIShQMi5yZXNvbHZlKDUpLnRoZW4oZnVuY3Rpb24oKXt9KSBpbnN0YW5jZW9mIFAyKSl7XG4gICAgICB3b3JrcyA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBhY3R1YWwgVjggYnVnLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDE2MlxuICAgIGlmKHdvcmtzICYmICQuREVTQyl7XG4gICAgICB2YXIgdGhlbmFibGVUaGVuR290dGVuID0gZmFsc2U7XG4gICAgICBQLnJlc29sdmUoJC5zZXREZXNjKHt9LCAndGhlbicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpeyB0aGVuYWJsZVRoZW5Hb3R0ZW4gPSB0cnVlOyB9XG4gICAgICB9KSk7XG4gICAgICB3b3JrcyA9IHRoZW5hYmxlVGhlbkdvdHRlbjtcbiAgICB9XG4gIH0gY2F0Y2goZSl7IHdvcmtzID0gZmFsc2U7IH1cbiAgcmV0dXJuIHdvcmtzO1xufSgpO1xuXG4vLyBoZWxwZXJzXG5mdW5jdGlvbiBpc1Byb21pc2UoaXQpe1xuICByZXR1cm4gaXNPYmplY3QoaXQpICYmICh1c2VOYXRpdmUgPyBjb2YuY2xhc3NvZihpdCkgPT0gJ1Byb21pc2UnIDogUkVDT1JEIGluIGl0KTtcbn1cbmZ1bmN0aW9uIHNhbWVDb25zdHJ1Y3RvcihhLCBiKXtcbiAgLy8gbGlicmFyeSB3cmFwcGVyIHNwZWNpYWwgY2FzZVxuICBpZighJC5GVyAmJiBhID09PSBQICYmIGIgPT09IFdyYXBwZXIpcmV0dXJuIHRydWU7XG4gIHJldHVybiBzYW1lKGEsIGIpO1xufVxuZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XG4gIHZhciBTID0gYXNzZXJ0T2JqZWN0KEMpW1NQRUNJRVNdO1xuICByZXR1cm4gUyAhPSB1bmRlZmluZWQgPyBTIDogQztcbn1cbmZ1bmN0aW9uIGlzVGhlbmFibGUoaXQpe1xuICB2YXIgdGhlbjtcbiAgaWYoaXNPYmplY3QoaXQpKXRoZW4gPSBpdC50aGVuO1xuICByZXR1cm4gaXNGdW5jdGlvbih0aGVuKSA/IHRoZW4gOiBmYWxzZTtcbn1cbmZ1bmN0aW9uIG5vdGlmeShyZWNvcmQpe1xuICB2YXIgY2hhaW4gPSByZWNvcmQuYztcbiAgLy8gc3RyYW5nZSBJRSArIHdlYnBhY2sgZGV2IHNlcnZlciBidWcgLSB1c2UgLmNhbGwoZ2xvYmFsKVxuICBpZihjaGFpbi5sZW5ndGgpYXNhcC5jYWxsKGdsb2JhbCwgZnVuY3Rpb24oKXtcbiAgICB2YXIgdmFsdWUgPSByZWNvcmQudlxuICAgICAgLCBvayAgICA9IHJlY29yZC5zID09IDFcbiAgICAgICwgaSAgICAgPSAwO1xuICAgIGZ1bmN0aW9uIHJ1bihyZWFjdCl7XG4gICAgICB2YXIgY2IgPSBvayA/IHJlYWN0Lm9rIDogcmVhY3QuZmFpbFxuICAgICAgICAsIHJldCwgdGhlbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKGNiKXtcbiAgICAgICAgICBpZighb2spcmVjb3JkLmggPSB0cnVlO1xuICAgICAgICAgIHJldCA9IGNiID09PSB0cnVlID8gdmFsdWUgOiBjYih2YWx1ZSk7XG4gICAgICAgICAgaWYocmV0ID09PSByZWFjdC5QKXtcbiAgICAgICAgICAgIHJlYWN0LnJlaihUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJldCkpe1xuICAgICAgICAgICAgdGhlbi5jYWxsKHJldCwgcmVhY3QucmVzLCByZWFjdC5yZWopO1xuICAgICAgICAgIH0gZWxzZSByZWFjdC5yZXMocmV0KTtcbiAgICAgICAgfSBlbHNlIHJlYWN0LnJlaih2YWx1ZSk7XG4gICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgIHJlYWN0LnJlaihlcnIpO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXJ1bihjaGFpbltpKytdKTsgLy8gdmFyaWFibGUgbGVuZ3RoIC0gY2FuJ3QgdXNlIGZvckVhY2hcbiAgICBjaGFpbi5sZW5ndGggPSAwO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGlzVW5oYW5kbGVkKHByb21pc2Upe1xuICB2YXIgcmVjb3JkID0gcHJvbWlzZVtSRUNPUkRdXG4gICAgLCBjaGFpbiAgPSByZWNvcmQuYSB8fCByZWNvcmQuY1xuICAgICwgaSAgICAgID0gMFxuICAgICwgcmVhY3Q7XG4gIGlmKHJlY29yZC5oKXJldHVybiBmYWxzZTtcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XG4gICAgcmVhY3QgPSBjaGFpbltpKytdO1xuICAgIGlmKHJlYWN0LmZhaWwgfHwgIWlzVW5oYW5kbGVkKHJlYWN0LlApKXJldHVybiBmYWxzZTtcbiAgfSByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uICRyZWplY3QodmFsdWUpe1xuICB2YXIgcmVjb3JkID0gdGhpc1xuICAgICwgcHJvbWlzZTtcbiAgaWYocmVjb3JkLmQpcmV0dXJuO1xuICByZWNvcmQuZCA9IHRydWU7XG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXG4gIHJlY29yZC52ID0gdmFsdWU7XG4gIHJlY29yZC5zID0gMjtcbiAgcmVjb3JkLmEgPSByZWNvcmQuYy5zbGljZSgpO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgLy8gc3RyYW5nZSBJRSArIHdlYnBhY2sgZGV2IHNlcnZlciBidWcgLSB1c2UgLmNhbGwoZ2xvYmFsKVxuICAgIGFzYXAuY2FsbChnbG9iYWwsIGZ1bmN0aW9uKCl7XG4gICAgICBpZihpc1VuaGFuZGxlZChwcm9taXNlID0gcmVjb3JkLnApKXtcbiAgICAgICAgaWYoaXNOb2RlKXtcbiAgICAgICAgICBwcm9jZXNzLmVtaXQoJ3VuaGFuZGxlZFJlamVjdGlvbicsIHZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgfSBlbHNlIGlmKGdsb2JhbC5jb25zb2xlICYmIGNvbnNvbGUuZXJyb3Ipe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVjb3JkLmEgPSB1bmRlZmluZWQ7XG4gICAgfSk7XG4gIH0sIDEpO1xuICBub3RpZnkocmVjb3JkKTtcbn1cbmZ1bmN0aW9uICRyZXNvbHZlKHZhbHVlKXtcbiAgdmFyIHJlY29yZCA9IHRoaXNcbiAgICAsIHRoZW47XG4gIGlmKHJlY29yZC5kKXJldHVybjtcbiAgcmVjb3JkLmQgPSB0cnVlO1xuICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxuICB0cnkge1xuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XG4gICAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgICBhc2FwLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgd3JhcHBlciA9IHtyOiByZWNvcmQsIGQ6IGZhbHNlfTsgLy8gd3JhcFxuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgY3R4KCRyZXNvbHZlLCB3cmFwcGVyLCAxKSwgY3R4KCRyZWplY3QsIHdyYXBwZXIsIDEpKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAkcmVqZWN0LmNhbGwod3JhcHBlciwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWNvcmQudiA9IHZhbHVlO1xuICAgICAgcmVjb3JkLnMgPSAxO1xuICAgICAgbm90aWZ5KHJlY29yZCk7XG4gICAgfVxuICB9IGNhdGNoKGUpe1xuICAgICRyZWplY3QuY2FsbCh7cjogcmVjb3JkLCBkOiBmYWxzZX0sIGUpOyAvLyB3cmFwXG4gIH1cbn1cblxuLy8gY29uc3RydWN0b3IgcG9seWZpbGxcbmlmKCF1c2VOYXRpdmUpe1xuICAvLyAyNS40LjMuMSBQcm9taXNlKGV4ZWN1dG9yKVxuICBQID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcil7XG4gICAgYXNzZXJ0RnVuY3Rpb24oZXhlY3V0b3IpO1xuICAgIHZhciByZWNvcmQgPSB7XG4gICAgICBwOiBhc3NlcnQuaW5zdCh0aGlzLCBQLCBQUk9NSVNFKSwgICAgICAgLy8gPC0gcHJvbWlzZVxuICAgICAgYzogW10sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGF3YWl0aW5nIHJlYWN0aW9uc1xuICAgICAgYTogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGNoZWNrZWQgaW4gaXNVbmhhbmRsZWQgcmVhY3Rpb25zXG4gICAgICBzOiAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gc3RhdGVcbiAgICAgIGQ6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBkb25lXG4gICAgICB2OiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcbiAgICAgIGg6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBoYW5kbGVkIHJlamVjdGlvblxuICAgIH07XG4gICAgJC5oaWRlKHRoaXMsIFJFQ09SRCwgcmVjb3JkKTtcbiAgICB0cnkge1xuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCByZWNvcmQsIDEpLCBjdHgoJHJlamVjdCwgcmVjb3JkLCAxKSk7XG4gICAgfSBjYXRjaChlcnIpe1xuICAgICAgJHJlamVjdC5jYWxsKHJlY29yZCwgZXJyKTtcbiAgICB9XG4gIH07XG4gIHJlcXVpcmUoJy4vJC5taXgnKShQLnByb3RvdHlwZSwge1xuICAgIC8vIDI1LjQuNS4zIFByb21pc2UucHJvdG90eXBlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCl7XG4gICAgICB2YXIgUyA9IGFzc2VydE9iamVjdChhc3NlcnRPYmplY3QodGhpcykuY29uc3RydWN0b3IpW1NQRUNJRVNdO1xuICAgICAgdmFyIHJlYWN0ID0ge1xuICAgICAgICBvazogICBpc0Z1bmN0aW9uKG9uRnVsZmlsbGVkKSA/IG9uRnVsZmlsbGVkIDogdHJ1ZSxcbiAgICAgICAgZmFpbDogaXNGdW5jdGlvbihvblJlamVjdGVkKSAgPyBvblJlamVjdGVkICA6IGZhbHNlXG4gICAgICB9O1xuICAgICAgdmFyIHByb21pc2UgPSByZWFjdC5QID0gbmV3IChTICE9IHVuZGVmaW5lZCA/IFMgOiBQKShmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICAgIHJlYWN0LnJlcyA9IGFzc2VydEZ1bmN0aW9uKHJlcyk7XG4gICAgICAgIHJlYWN0LnJlaiA9IGFzc2VydEZ1bmN0aW9uKHJlaik7XG4gICAgICB9KTtcbiAgICAgIHZhciByZWNvcmQgPSB0aGlzW1JFQ09SRF07XG4gICAgICByZWNvcmQuYy5wdXNoKHJlYWN0KTtcbiAgICAgIGlmKHJlY29yZC5hKXJlY29yZC5hLnB1c2gocmVhY3QpO1xuICAgICAgaWYocmVjb3JkLnMpbm90aWZ5KHJlY29yZCk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3RlZCl7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gZXhwb3J0XG4kZGVmKCRkZWYuRyArICRkZWYuVyArICRkZWYuRiAqICF1c2VOYXRpdmUsIHtQcm9taXNlOiBQfSk7XG5jb2Yuc2V0KFAsIFBST01JU0UpO1xuc3BlY2llcyhQKTtcbnNwZWNpZXMoV3JhcHBlciA9ICQuY29yZVtQUk9NSVNFXSk7XG5cbi8vIHN0YXRpY3NcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXVzZU5hdGl2ZSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxuICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyKXtcbiAgICByZXR1cm4gbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzLCByZWopeyByZWoocik7IH0pO1xuICB9XG59KTtcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogKCF1c2VOYXRpdmUgfHwgdGVzdFJlc29sdmUodHJ1ZSkpLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKHgpe1xuICAgIHJldHVybiBpc1Byb21pc2UoeCkgJiYgc2FtZUNvbnN0cnVjdG9yKHguY29uc3RydWN0b3IsIHRoaXMpXG4gICAgICA/IHggOiBuZXcgdGhpcyhmdW5jdGlvbihyZXMpeyByZXMoeCk7IH0pO1xuICB9XG59KTtcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogISh1c2VOYXRpdmUgJiYgcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7XG4gIFAuYWxsKGl0ZXIpWydjYXRjaCddKGZ1bmN0aW9uKCl7fSk7XG59KSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXG4gIGFsbDogZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKXtcbiAgICB2YXIgQyAgICAgID0gZ2V0Q29uc3RydWN0b3IodGhpcylcbiAgICAgICwgdmFsdWVzID0gW107XG4gICAgcmV0dXJuIG5ldyBDKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgdmFsdWVzLnB1c2gsIHZhbHVlcyk7XG4gICAgICB2YXIgcmVtYWluaW5nID0gdmFsdWVzLmxlbmd0aFxuICAgICAgICAsIHJlc3VsdHMgICA9IEFycmF5KHJlbWFpbmluZyk7XG4gICAgICBpZihyZW1haW5pbmcpJC5lYWNoLmNhbGwodmFsdWVzLCBmdW5jdGlvbihwcm9taXNlLCBpbmRleCl7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlcyhyZXN1bHRzKTtcbiAgICAgICAgfSwgcmVqKTtcbiAgICAgIH0pO1xuICAgICAgZWxzZSByZXMocmVzdWx0cyk7XG4gICAgfSk7XG4gIH0sXG4gIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSl7XG4gICAgdmFyIEMgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKTtcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4ocmVzLCByZWopO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn0pOyIsInZhciBzZXQgICA9IHJlcXVpcmUoJy4vJCcpLnNldFxuICAsICRhdCAgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpXG4gICwgSVRFUiAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnaXRlcicpXG4gICwgJGl0ZXIgPSByZXF1aXJlKCcuLyQuaXRlcicpXG4gICwgc3RlcCAgPSAkaXRlci5zdGVwO1xuXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XG4gIHNldCh0aGlzLCBJVEVSLCB7bzogU3RyaW5nKGl0ZXJhdGVkKSwgaTogMH0pO1xuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxuICAgICwgTyAgICAgPSBpdGVyLm9cbiAgICAsIGluZGV4ID0gaXRlci5pXG4gICAgLCBwb2ludDtcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHN0ZXAoMSk7XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgaXRlci5pICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHN0ZXAoMCwgcG9pbnQpO1xufSk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgSXRlcmF0b3JzICAgPSByZXF1aXJlKCcuLyQuaXRlcicpLkl0ZXJhdG9yc1xuICAsIElURVJBVE9SICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgQXJyYXlWYWx1ZXMgPSBJdGVyYXRvcnMuQXJyYXlcbiAgLCBOTCAgICAgICAgICA9ICQuZy5Ob2RlTGlzdFxuICAsIEhUQyAgICAgICAgID0gJC5nLkhUTUxDb2xsZWN0aW9uXG4gICwgTkxQcm90byAgICAgPSBOTCAmJiBOTC5wcm90b3R5cGVcbiAgLCBIVENQcm90byAgICA9IEhUQyAmJiBIVEMucHJvdG90eXBlO1xuaWYoJC5GVyl7XG4gIGlmKE5MICYmICEoSVRFUkFUT1IgaW4gTkxQcm90bykpJC5oaWRlKE5MUHJvdG8sIElURVJBVE9SLCBBcnJheVZhbHVlcyk7XG4gIGlmKEhUQyAmJiAhKElURVJBVE9SIGluIEhUQ1Byb3RvKSkkLmhpZGUoSFRDUHJvdG8sIElURVJBVE9SLCBBcnJheVZhbHVlcyk7XG59XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuSFRNTENvbGxlY3Rpb24gPSBBcnJheVZhbHVlczsiLCIvKiFcbiAqIFBsYXRmb3JtLmpzIHYxLjMuMCA8aHR0cDovL210aHMuYmUvcGxhdGZvcm0+XG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IEpvaG4tRGF2aWQgRGFsdG9uIDxodHRwOi8vYWxseW91Y2FubGVldC5jb20vPlxuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbXRocy5iZS9taXQ+XG4gKi9cbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKiogVXNlZCB0byBkZXRlcm1pbmUgaWYgdmFsdWVzIGFyZSBvZiB0aGUgbGFuZ3VhZ2UgdHlwZSBgT2JqZWN0YCAqL1xuICB2YXIgb2JqZWN0VHlwZXMgPSB7XG4gICAgJ2Z1bmN0aW9uJzogdHJ1ZSxcbiAgICAnb2JqZWN0JzogdHJ1ZVxuICB9O1xuXG4gIC8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0ICovXG4gIHZhciByb290ID0gKG9iamVjdFR5cGVzW3R5cGVvZiB3aW5kb3ddICYmIHdpbmRvdykgfHwgdGhpcztcblxuICAvKiogQmFja3VwIHBvc3NpYmxlIGdsb2JhbCBvYmplY3QgKi9cbiAgdmFyIG9sZFJvb3QgPSByb290O1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AgKi9cbiAgdmFyIGZyZWVFeHBvcnRzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGV4cG9ydHNdICYmIGV4cG9ydHM7XG5cbiAgLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgICovXG4gIHZhciBmcmVlTW9kdWxlID0gb2JqZWN0VHlwZXNbdHlwZW9mIG1vZHVsZV0gJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUgYW5kIHVzZSBpdCBhcyBgcm9vdGAgKi9cbiAgdmFyIGZyZWVHbG9iYWwgPSBmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlICYmIHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuICBpZiAoZnJlZUdsb2JhbCAmJiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC5zZWxmID09PSBmcmVlR2xvYmFsKSkge1xuICAgIHJvb3QgPSBmcmVlR2xvYmFsO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgYXMgdGhlIG1heGltdW0gbGVuZ3RoIG9mIGFuIGFycmF5LWxpa2Ugb2JqZWN0LlxuICAgKiBTZWUgdGhlIFtFUzYgc3BlY10oaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGgpXG4gICAqIGZvciBtb3JlIGRldGFpbHMuXG4gICAqL1xuICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuXG4gIC8qKiBPcGVyYSByZWdleHAgKi9cbiAgdmFyIHJlT3BlcmEgPSAvXFxiT3BlcmEvO1xuXG4gIC8qKiBQb3NzaWJsZSBnbG9iYWwgb2JqZWN0ICovXG4gIHZhciB0aGlzQmluZGluZyA9IHRoaXM7XG5cbiAgLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xuICB2YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4gIC8qKiBVc2VkIHRvIGNoZWNrIGZvciBvd24gcHJvcGVydGllcyBvZiBhbiBvYmplY3QgKi9cbiAgdmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgYFtbQ2xhc3NdXWAgb2YgdmFsdWVzICovXG4gIHZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBDYXBpdGFsaXplcyBhIHN0cmluZyB2YWx1ZS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGNhcGl0YWxpemUuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjYXBpdGFsaXplZCBzdHJpbmcuXG4gICAqL1xuICBmdW5jdGlvbiBjYXBpdGFsaXplKHN0cmluZykge1xuICAgIHN0cmluZyA9IFN0cmluZyhzdHJpbmcpO1xuICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG4gIH1cblxuICAvKipcbiAgICogQSB1dGlsaXR5IGZ1bmN0aW9uIHRvIGNsZWFuIHVwIHRoZSBPUyBuYW1lLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3MgVGhlIE9TIG5hbWUgdG8gY2xlYW4gdXAuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0dGVybl0gQSBgUmVnRXhwYCBwYXR0ZXJuIG1hdGNoaW5nIHRoZSBPUyBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2xhYmVsXSBBIGxhYmVsIGZvciB0aGUgT1MuXG4gICAqL1xuICBmdW5jdGlvbiBjbGVhbnVwT1Mob3MsIHBhdHRlcm4sIGxhYmVsKSB7XG4gICAgLy8gcGxhdGZvcm0gdG9rZW5zIGRlZmluZWQgYXRcbiAgICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1Mzc1MDMoVlMuODUpLmFzcHhcbiAgICAvLyBodHRwOi8vd2ViLmFyY2hpdmUub3JnL3dlYi8yMDA4MTEyMjA1Mzk1MC9odHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1Mzc1MDMoVlMuODUpLmFzcHhcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICc2LjQnOiAgJzEwJyxcbiAgICAgICc2LjMnOiAgJzguMScsXG4gICAgICAnNi4yJzogICc4JyxcbiAgICAgICc2LjEnOiAgJ1NlcnZlciAyMDA4IFIyIC8gNycsXG4gICAgICAnNi4wJzogICdTZXJ2ZXIgMjAwOCAvIFZpc3RhJyxcbiAgICAgICc1LjInOiAgJ1NlcnZlciAyMDAzIC8gWFAgNjQtYml0JyxcbiAgICAgICc1LjEnOiAgJ1hQJyxcbiAgICAgICc1LjAxJzogJzIwMDAgU1AxJyxcbiAgICAgICc1LjAnOiAgJzIwMDAnLFxuICAgICAgJzQuMCc6ICAnTlQnLFxuICAgICAgJzQuOTAnOiAnTUUnXG4gICAgfTtcbiAgICAvLyBkZXRlY3QgV2luZG93cyB2ZXJzaW9uIGZyb20gcGxhdGZvcm0gdG9rZW5zXG4gICAgaWYgKHBhdHRlcm4gJiYgbGFiZWwgJiYgL15XaW4vaS50ZXN0KG9zKSAmJlxuICAgICAgICAoZGF0YSA9IGRhdGFbMC8qT3BlcmEgOS4yNSBmaXgqLywgL1tcXGQuXSskLy5leGVjKG9zKV0pKSB7XG4gICAgICBvcyA9ICdXaW5kb3dzICcgKyBkYXRhO1xuICAgIH1cbiAgICAvLyBjb3JyZWN0IGNoYXJhY3RlciBjYXNlIGFuZCBjbGVhbnVwXG4gICAgb3MgPSBTdHJpbmcob3MpO1xuXG4gICAgaWYgKHBhdHRlcm4gJiYgbGFiZWwpIHtcbiAgICAgIG9zID0gb3MucmVwbGFjZShSZWdFeHAocGF0dGVybiwgJ2knKSwgbGFiZWwpO1xuICAgIH1cblxuICAgIG9zID0gZm9ybWF0KFxuICAgICAgb3MucmVwbGFjZSgvIGNlJC9pLCAnIENFJylcbiAgICAgICAgLnJlcGxhY2UoL1xcYmhwdy9pLCAnd2ViJylcbiAgICAgICAgLnJlcGxhY2UoL1xcYk1hY2ludG9zaFxcYi8sICdNYWMgT1MnKVxuICAgICAgICAucmVwbGFjZSgvX1Bvd2VyUENcXGIvaSwgJyBPUycpXG4gICAgICAgIC5yZXBsYWNlKC9cXGIoT1MgWCkgW14gXFxkXSsvaSwgJyQxJylcbiAgICAgICAgLnJlcGxhY2UoL1xcYk1hYyAoT1MgWClcXGIvLCAnJDEnKVxuICAgICAgICAucmVwbGFjZSgvXFwvKFxcZCkvLCAnICQxJylcbiAgICAgICAgLnJlcGxhY2UoL18vZywgJy4nKVxuICAgICAgICAucmVwbGFjZSgvKD86IEJlUEN8WyAuXSpmY1sgXFxkLl0rKSQvaSwgJycpXG4gICAgICAgIC5yZXBsYWNlKC9cXGJ4ODZcXC42NFxcYi9naSwgJ3g4Nl82NCcpXG4gICAgICAgIC5yZXBsYWNlKC9cXGIoV2luZG93cyBQaG9uZSkgT1NcXGIvLCAnJDEnKVxuICAgICAgICAuc3BsaXQoJyBvbiAnKVswXVxuICAgICk7XG5cbiAgICByZXR1cm4gb3M7XG4gIH1cblxuICAvKipcbiAgICogQW4gaXRlcmF0aW9uIHV0aWxpdHkgZm9yIGFycmF5cyBhbmQgb2JqZWN0cy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gZWFjaChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IG9iamVjdCA/IG9iamVjdC5sZW5ndGggOiAwO1xuXG4gICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgbGVuZ3RoID4gLTEgJiYgbGVuZ3RoIDw9IG1heFNhZmVJbnRlZ2VyKSB7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICBjYWxsYmFjayhvYmplY3RbaW5kZXhdLCBpbmRleCwgb2JqZWN0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yT3duKG9iamVjdCwgY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmltIGFuZCBjb25kaXRpb25hbGx5IGNhcGl0YWxpemUgc3RyaW5nIHZhbHVlcy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGZvcm1hdC5cbiAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCBzdHJpbmcuXG4gICAqL1xuICBmdW5jdGlvbiBmb3JtYXQoc3RyaW5nKSB7XG4gICAgc3RyaW5nID0gdHJpbShzdHJpbmcpO1xuICAgIHJldHVybiAvXig/OndlYk9TfGkoPzpPU3xQKSkvLnRlc3Qoc3RyaW5nKVxuICAgICAgPyBzdHJpbmdcbiAgICAgIDogY2FwaXRhbGl6ZShzdHJpbmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGVzIG92ZXIgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMsIGV4ZWN1dGluZyB0aGUgYGNhbGxiYWNrYCBmb3IgZWFjaC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIGV4ZWN1dGVkIHBlciBvd24gcHJvcGVydHkuXG4gICAqL1xuICBmdW5jdGlvbiBmb3JPd24ob2JqZWN0LCBjYWxsYmFjaykge1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkge1xuICAgICAgICBjYWxsYmFjayhvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbnRlcm5hbCBgW1tDbGFzc11dYCBvZiBhIHZhbHVlLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZS5cbiAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGBbW0NsYXNzXV1gLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q2xhc3NPZih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsXG4gICAgICA/IGNhcGl0YWxpemUodmFsdWUpXG4gICAgICA6IHRvU3RyaW5nLmNhbGwodmFsdWUpLnNsaWNlKDgsIC0xKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIb3N0IG9iamVjdHMgY2FuIHJldHVybiB0eXBlIHZhbHVlcyB0aGF0IGFyZSBkaWZmZXJlbnQgZnJvbSB0aGVpciBhY3R1YWxcbiAgICogZGF0YSB0eXBlLiBUaGUgb2JqZWN0cyB3ZSBhcmUgY29uY2VybmVkIHdpdGggdXN1YWxseSByZXR1cm4gbm9uLXByaW1pdGl2ZVxuICAgKiB0eXBlcyBvZiBcIm9iamVjdFwiLCBcImZ1bmN0aW9uXCIsIG9yIFwidW5rbm93blwiLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyp9IG9iamVjdCBUaGUgb3duZXIgb2YgdGhlIHByb3BlcnR5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHByb3BlcnR5IHZhbHVlIGlzIGEgbm9uLXByaW1pdGl2ZSwgZWxzZSBgZmFsc2VgLlxuICAgKi9cbiAgZnVuY3Rpb24gaXNIb3N0VHlwZShvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgdmFyIHR5cGUgPSBvYmplY3QgIT0gbnVsbCA/IHR5cGVvZiBvYmplY3RbcHJvcGVydHldIDogJ251bWJlcic7XG4gICAgcmV0dXJuICEvXig/OmJvb2xlYW58bnVtYmVyfHN0cmluZ3x1bmRlZmluZWQpJC8udGVzdCh0eXBlKSAmJlxuICAgICAgKHR5cGUgPT0gJ29iamVjdCcgPyAhIW9iamVjdFtwcm9wZXJ0eV0gOiB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwYXJlcyBhIHN0cmluZyBmb3IgdXNlIGluIGEgYFJlZ0V4cGAgYnkgbWFraW5nIGh5cGhlbnMgYW5kIHNwYWNlcyBvcHRpb25hbC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIHF1YWxpZnkuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBxdWFsaWZpZWQgc3RyaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gcXVhbGlmeShzdHJpbmcpIHtcbiAgICByZXR1cm4gU3RyaW5nKHN0cmluZykucmVwbGFjZSgvKFsgLV0pKD8hJCkvZywgJyQxPycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgYmFyZS1ib25lcyBgQXJyYXkjcmVkdWNlYCBsaWtlIHV0aWxpdHkgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICogQHJldHVybnMgeyp9IFRoZSBhY2N1bXVsYXRlZCByZXN1bHQuXG4gICAqL1xuICBmdW5jdGlvbiByZWR1Y2UoYXJyYXksIGNhbGxiYWNrKSB7XG4gICAgdmFyIGFjY3VtdWxhdG9yID0gbnVsbDtcbiAgICBlYWNoKGFycmF5LCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIGFjY3VtdWxhdG9yID0gY2FsbGJhY2soYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgYXJyYXkpO1xuICAgIH0pO1xuICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UgZnJvbSBhIHN0cmluZy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIHRyaW0uXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSB0cmltbWVkIHN0cmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIHRyaW0oc3RyaW5nKSB7XG4gICAgcmV0dXJuIFN0cmluZyhzdHJpbmcpLnJlcGxhY2UoL14gK3wgKyQvZywgJycpO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgcGxhdGZvcm0gb2JqZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgcGxhdGZvcm1cbiAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSBbdWE9bmF2aWdhdG9yLnVzZXJBZ2VudF0gVGhlIHVzZXIgYWdlbnQgc3RyaW5nIG9yXG4gICAqICBjb250ZXh0IG9iamVjdC5cbiAgICogQHJldHVybnMge09iamVjdH0gQSBwbGF0Zm9ybSBvYmplY3QuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZSh1YSkge1xuXG4gICAgLyoqIFRoZSBlbnZpcm9ubWVudCBjb250ZXh0IG9iamVjdCAqL1xuICAgIHZhciBjb250ZXh0ID0gcm9vdDtcblxuICAgIC8qKiBVc2VkIHRvIGZsYWcgd2hlbiBhIGN1c3RvbSBjb250ZXh0IGlzIHByb3ZpZGVkICovXG4gICAgdmFyIGlzQ3VzdG9tQ29udGV4dCA9IHVhICYmIHR5cGVvZiB1YSA9PSAnb2JqZWN0JyAmJiBnZXRDbGFzc09mKHVhKSAhPSAnU3RyaW5nJztcblxuICAgIC8vIGp1Z2dsZSBhcmd1bWVudHNcbiAgICBpZiAoaXNDdXN0b21Db250ZXh0KSB7XG4gICAgICBjb250ZXh0ID0gdWE7XG4gICAgICB1YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqIEJyb3dzZXIgbmF2aWdhdG9yIG9iamVjdCAqL1xuICAgIHZhciBuYXYgPSBjb250ZXh0Lm5hdmlnYXRvciB8fCB7fTtcblxuICAgIC8qKiBCcm93c2VyIHVzZXIgYWdlbnQgc3RyaW5nICovXG4gICAgdmFyIHVzZXJBZ2VudCA9IG5hdi51c2VyQWdlbnQgfHwgJyc7XG5cbiAgICB1YSB8fCAodWEgPSB1c2VyQWdlbnQpO1xuXG4gICAgLyoqIFVzZWQgdG8gZmxhZyB3aGVuIGB0aGlzQmluZGluZ2AgaXMgdGhlIFtNb2R1bGVTY29wZV0gKi9cbiAgICB2YXIgaXNNb2R1bGVTY29wZSA9IGlzQ3VzdG9tQ29udGV4dCB8fCB0aGlzQmluZGluZyA9PSBvbGRSb290O1xuXG4gICAgLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGJyb3dzZXIgaXMgbGlrZSBDaHJvbWUgKi9cbiAgICB2YXIgbGlrZUNocm9tZSA9IGlzQ3VzdG9tQ29udGV4dFxuICAgICAgPyAhIW5hdi5saWtlQ2hyb21lXG4gICAgICA6IC9cXGJDaHJvbWVcXGIvLnRlc3QodWEpICYmICEvaW50ZXJuYWx8XFxuL2kudGVzdCh0b1N0cmluZy50b1N0cmluZygpKTtcblxuICAgIC8qKiBJbnRlcm5hbCBgW1tDbGFzc11dYCB2YWx1ZSBzaG9ydGN1dHMgKi9cbiAgICB2YXIgb2JqZWN0Q2xhc3MgPSAnT2JqZWN0JyxcbiAgICAgICAgYWlyUnVudGltZUNsYXNzID0gaXNDdXN0b21Db250ZXh0ID8gb2JqZWN0Q2xhc3MgOiAnU2NyaXB0QnJpZGdpbmdQcm94eU9iamVjdCcsXG4gICAgICAgIGVudmlyb0NsYXNzID0gaXNDdXN0b21Db250ZXh0ID8gb2JqZWN0Q2xhc3MgOiAnRW52aXJvbm1lbnQnLFxuICAgICAgICBqYXZhQ2xhc3MgPSAoaXNDdXN0b21Db250ZXh0ICYmIGNvbnRleHQuamF2YSkgPyAnSmF2YVBhY2thZ2UnIDogZ2V0Q2xhc3NPZihjb250ZXh0LmphdmEpLFxuICAgICAgICBwaGFudG9tQ2xhc3MgPSBpc0N1c3RvbUNvbnRleHQgPyBvYmplY3RDbGFzcyA6ICdSdW50aW1lT2JqZWN0JztcblxuICAgIC8qKiBEZXRlY3QgSmF2YSBlbnZpcm9ubWVudCAqL1xuICAgIHZhciBqYXZhID0gL1xcYkphdmEvLnRlc3QoamF2YUNsYXNzKSAmJiBjb250ZXh0LmphdmE7XG5cbiAgICAvKiogRGV0ZWN0IFJoaW5vICovXG4gICAgdmFyIHJoaW5vID0gamF2YSAmJiBnZXRDbGFzc09mKGNvbnRleHQuZW52aXJvbm1lbnQpID09IGVudmlyb0NsYXNzO1xuXG4gICAgLyoqIEEgY2hhcmFjdGVyIHRvIHJlcHJlc2VudCBhbHBoYSAqL1xuICAgIHZhciBhbHBoYSA9IGphdmEgPyAnYScgOiAnXFx1MDNiMSc7XG5cbiAgICAvKiogQSBjaGFyYWN0ZXIgdG8gcmVwcmVzZW50IGJldGEgKi9cbiAgICB2YXIgYmV0YSA9IGphdmEgPyAnYicgOiAnXFx1MDNiMic7XG5cbiAgICAvKiogQnJvd3NlciBkb2N1bWVudCBvYmplY3QgKi9cbiAgICB2YXIgZG9jID0gY29udGV4dC5kb2N1bWVudCB8fCB7fTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCBPcGVyYSBicm93c2VyIChQcmVzdG8tYmFzZWQpXG4gICAgICogaHR0cDovL3d3dy5ob3d0b2NyZWF0ZS5jby51ay9vcGVyYVN0dWZmL29wZXJhT2JqZWN0Lmh0bWxcbiAgICAgKiBodHRwOi8vZGV2Lm9wZXJhLmNvbS9hcnRpY2xlcy92aWV3L29wZXJhLW1pbmktd2ViLWNvbnRlbnQtYXV0aG9yaW5nLWd1aWRlbGluZXMvI29wZXJhbWluaVxuICAgICAqL1xuICAgIHZhciBvcGVyYSA9IGNvbnRleHQub3BlcmFtaW5pIHx8IGNvbnRleHQub3BlcmE7XG5cbiAgICAvKiogT3BlcmEgYFtbQ2xhc3NdXWAgKi9cbiAgICB2YXIgb3BlcmFDbGFzcyA9IHJlT3BlcmEudGVzdChvcGVyYUNsYXNzID0gKGlzQ3VzdG9tQ29udGV4dCAmJiBvcGVyYSkgPyBvcGVyYVsnW1tDbGFzc11dJ10gOiBnZXRDbGFzc09mKG9wZXJhKSlcbiAgICAgID8gb3BlcmFDbGFzc1xuICAgICAgOiAob3BlcmEgPSBudWxsKTtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgdXNlZCBvdmVyIHRoZSBzY3JpcHQncyBsaWZldGltZSAqL1xuICAgIHZhciBkYXRhO1xuXG4gICAgLyoqIFRoZSBDUFUgYXJjaGl0ZWN0dXJlICovXG4gICAgdmFyIGFyY2ggPSB1YTtcblxuICAgIC8qKiBQbGF0Zm9ybSBkZXNjcmlwdGlvbiBhcnJheSAqL1xuICAgIHZhciBkZXNjcmlwdGlvbiA9IFtdO1xuXG4gICAgLyoqIFBsYXRmb3JtIGFscGhhL2JldGEgaW5kaWNhdG9yICovXG4gICAgdmFyIHByZXJlbGVhc2UgPSBudWxsO1xuXG4gICAgLyoqIEEgZmxhZyB0byBpbmRpY2F0ZSB0aGF0IGVudmlyb25tZW50IGZlYXR1cmVzIHNob3VsZCBiZSB1c2VkIHRvIHJlc29sdmUgdGhlIHBsYXRmb3JtICovXG4gICAgdmFyIHVzZUZlYXR1cmVzID0gdWEgPT0gdXNlckFnZW50O1xuXG4gICAgLyoqIFRoZSBicm93c2VyL2Vudmlyb25tZW50IHZlcnNpb24gKi9cbiAgICB2YXIgdmVyc2lvbiA9IHVzZUZlYXR1cmVzICYmIG9wZXJhICYmIHR5cGVvZiBvcGVyYS52ZXJzaW9uID09ICdmdW5jdGlvbicgJiYgb3BlcmEudmVyc2lvbigpO1xuXG4gICAgLyoqIEEgZmxhZyB0byBpbmRpY2F0ZSBpZiB0aGUgT1MgZW5kcyB3aXRoIFwiLyBWZXJzaW9uXCIgKi9cbiAgICB2YXIgaXNTcGVjaWFsQ2FzZWRPUztcblxuICAgIC8qIERldGVjdGFibGUgbGF5b3V0IGVuZ2luZXMgKG9yZGVyIGlzIGltcG9ydGFudCkgKi9cbiAgICB2YXIgbGF5b3V0ID0gZ2V0TGF5b3V0KFtcbiAgICAgICdUcmlkZW50JyxcbiAgICAgIHsgJ2xhYmVsJzogJ1dlYktpdCcsICdwYXR0ZXJuJzogJ0FwcGxlV2ViS2l0JyB9LFxuICAgICAgJ2lDYWInLFxuICAgICAgJ1ByZXN0bycsXG4gICAgICAnTmV0RnJvbnQnLFxuICAgICAgJ1Rhc21hbicsXG4gICAgICAnS0hUTUwnLFxuICAgICAgJ0dlY2tvJ1xuICAgIF0pO1xuXG4gICAgLyogRGV0ZWN0YWJsZSBicm93c2VyIG5hbWVzIChvcmRlciBpcyBpbXBvcnRhbnQpICovXG4gICAgdmFyIG5hbWUgPSBnZXROYW1lKFtcbiAgICAgICdBZG9iZSBBSVInLFxuICAgICAgJ0Fyb3JhJyxcbiAgICAgICdBdmFudCBCcm93c2VyJyxcbiAgICAgICdCcmVhY2gnLFxuICAgICAgJ0NhbWlubycsXG4gICAgICAnRXBpcGhhbnknLFxuICAgICAgJ0Zlbm5lYycsXG4gICAgICAnRmxvY2snLFxuICAgICAgJ0dhbGVvbicsXG4gICAgICAnR3JlZW5Ccm93c2VyJyxcbiAgICAgICdpQ2FiJyxcbiAgICAgICdJY2V3ZWFzZWwnLFxuICAgICAgeyAnbGFiZWwnOiAnU1JXYXJlIElyb24nLCAncGF0dGVybic6ICdJcm9uJyB9LFxuICAgICAgJ0stTWVsZW9uJyxcbiAgICAgICdLb25xdWVyb3InLFxuICAgICAgJ0x1bmFzY2FwZScsXG4gICAgICAnTWF4dGhvbicsXG4gICAgICAnTWlkb3JpJyxcbiAgICAgICdOb29rIEJyb3dzZXInLFxuICAgICAgJ1BoYW50b21KUycsXG4gICAgICAnUmF2ZW4nLFxuICAgICAgJ1Jla29ucScsXG4gICAgICAnUm9ja01lbHQnLFxuICAgICAgJ1NlYU1vbmtleScsXG4gICAgICB7ICdsYWJlbCc6ICdTaWxrJywgJ3BhdHRlcm4nOiAnKD86Q2xvdWQ5fFNpbGstQWNjZWxlcmF0ZWQpJyB9LFxuICAgICAgJ1NsZWlwbmlyJyxcbiAgICAgICdTbGltQnJvd3NlcicsXG4gICAgICAnU3VucmlzZScsXG4gICAgICAnU3dpZnRmb3gnLFxuICAgICAgJ1dlYlBvc2l0aXZlJyxcbiAgICAgICdPcGVyYSBNaW5pJyxcbiAgICAgIHsgJ2xhYmVsJzogJ09wZXJhIE1pbmknLCAncGF0dGVybic6ICdPUGlPUycgfSxcbiAgICAgICdPcGVyYScsXG4gICAgICB7ICdsYWJlbCc6ICdPcGVyYScsICdwYXR0ZXJuJzogJ09QUicgfSxcbiAgICAgICdDaHJvbWUnLFxuICAgICAgeyAnbGFiZWwnOiAnQ2hyb21lIE1vYmlsZScsICdwYXR0ZXJuJzogJyg/OkNyaU9TfENyTW8pJyB9LFxuICAgICAgeyAnbGFiZWwnOiAnRmlyZWZveCcsICdwYXR0ZXJuJzogJyg/OkZpcmVmb3h8TWluZWZpZWxkKScgfSxcbiAgICAgIHsgJ2xhYmVsJzogJ0lFJywgJ3BhdHRlcm4nOiAnSUVNb2JpbGUnIH0sXG4gICAgICB7ICdsYWJlbCc6ICdJRScsICdwYXR0ZXJuJzogJ01TSUUnIH0sXG4gICAgICAnU2FmYXJpJ1xuICAgIF0pO1xuXG4gICAgLyogRGV0ZWN0YWJsZSBwcm9kdWN0cyAob3JkZXIgaXMgaW1wb3J0YW50KSAqL1xuICAgIHZhciBwcm9kdWN0ID0gZ2V0UHJvZHVjdChbXG4gICAgICB7ICdsYWJlbCc6ICdCbGFja0JlcnJ5JywgJ3BhdHRlcm4nOiAnQkIxMCcgfSxcbiAgICAgICdCbGFja0JlcnJ5JyxcbiAgICAgIHsgJ2xhYmVsJzogJ0dhbGF4eSBTJywgJ3BhdHRlcm4nOiAnR1QtSTkwMDAnIH0sXG4gICAgICB7ICdsYWJlbCc6ICdHYWxheHkgUzInLCAncGF0dGVybic6ICdHVC1JOTEwMCcgfSxcbiAgICAgIHsgJ2xhYmVsJzogJ0dhbGF4eSBTMycsICdwYXR0ZXJuJzogJ0dULUk5MzAwJyB9LFxuICAgICAgeyAnbGFiZWwnOiAnR2FsYXh5IFM0JywgJ3BhdHRlcm4nOiAnR1QtSTk1MDAnIH0sXG4gICAgICAnR29vZ2xlIFRWJyxcbiAgICAgICdMdW1pYScsXG4gICAgICAnaVBhZCcsXG4gICAgICAnaVBvZCcsXG4gICAgICAnaVBob25lJyxcbiAgICAgICdLaW5kbGUnLFxuICAgICAgeyAnbGFiZWwnOiAnS2luZGxlIEZpcmUnLCAncGF0dGVybic6ICcoPzpDbG91ZDl8U2lsay1BY2NlbGVyYXRlZCknIH0sXG4gICAgICAnTm9vaycsXG4gICAgICAnUGxheUJvb2snLFxuICAgICAgJ1BsYXlTdGF0aW9uIDQnLFxuICAgICAgJ1BsYXlTdGF0aW9uIDMnLFxuICAgICAgJ1BsYXlTdGF0aW9uIFZpdGEnLFxuICAgICAgJ1RvdWNoUGFkJyxcbiAgICAgICdUcmFuc2Zvcm1lcicsXG4gICAgICB7ICdsYWJlbCc6ICdXaWkgVScsICdwYXR0ZXJuJzogJ1dpaVUnIH0sXG4gICAgICAnV2lpJyxcbiAgICAgICdYYm94IE9uZScsXG4gICAgICB7ICdsYWJlbCc6ICdYYm94IDM2MCcsICdwYXR0ZXJuJzogJ1hib3gnIH0sXG4gICAgICAnWG9vbSdcbiAgICBdKTtcblxuICAgIC8qIERldGVjdGFibGUgbWFudWZhY3R1cmVycyAqL1xuICAgIHZhciBtYW51ZmFjdHVyZXIgPSBnZXRNYW51ZmFjdHVyZXIoe1xuICAgICAgJ0FwcGxlJzogeyAnaVBhZCc6IDEsICdpUGhvbmUnOiAxLCAnaVBvZCc6IDEgfSxcbiAgICAgICdBbWF6b24nOiB7ICdLaW5kbGUnOiAxLCAnS2luZGxlIEZpcmUnOiAxIH0sXG4gICAgICAnQXN1cyc6IHsgJ1RyYW5zZm9ybWVyJzogMSB9LFxuICAgICAgJ0Jhcm5lcyAmIE5vYmxlJzogeyAnTm9vayc6IDEgfSxcbiAgICAgICdCbGFja0JlcnJ5JzogeyAnUGxheUJvb2snOiAxIH0sXG4gICAgICAnR29vZ2xlJzogeyAnR29vZ2xlIFRWJzogMSB9LFxuICAgICAgJ0hQJzogeyAnVG91Y2hQYWQnOiAxIH0sXG4gICAgICAnSFRDJzoge30sXG4gICAgICAnTEcnOiB7fSxcbiAgICAgICdNaWNyb3NvZnQnOiB7ICdYYm94JzogMSwgJ1hib3ggT25lJzogMSB9LFxuICAgICAgJ01vdG9yb2xhJzogeyAnWG9vbSc6IDEgfSxcbiAgICAgICdOaW50ZW5kbyc6IHsgJ1dpaSBVJzogMSwgICdXaWknOiAxIH0sXG4gICAgICAnTm9raWEnOiB7ICdMdW1pYSc6IDEgfSxcbiAgICAgICdTYW1zdW5nJzogeyAnR2FsYXh5IFMnOiAxLCAnR2FsYXh5IFMyJzogMSwgJ0dhbGF4eSBTMyc6IDEsICdHYWxheHkgUzQnOiAxIH0sXG4gICAgICAnU29ueSc6IHsgJ1BsYXlTdGF0aW9uIDQnOiAxLCAnUGxheVN0YXRpb24gMyc6IDEsICdQbGF5U3RhdGlvbiBWaXRhJzogMSB9XG4gICAgfSk7XG5cbiAgICAvKiBEZXRlY3RhYmxlIE9TZXMgKG9yZGVyIGlzIGltcG9ydGFudCkgKi9cbiAgICB2YXIgb3MgPSBnZXRPUyhbXG4gICAgICAnV2luZG93cyBQaG9uZSAnLFxuICAgICAgJ0FuZHJvaWQnLFxuICAgICAgJ0NlbnRPUycsXG4gICAgICAnRGViaWFuJyxcbiAgICAgICdGZWRvcmEnLFxuICAgICAgJ0ZyZWVCU0QnLFxuICAgICAgJ0dlbnRvbycsXG4gICAgICAnSGFpa3UnLFxuICAgICAgJ0t1YnVudHUnLFxuICAgICAgJ0xpbnV4IE1pbnQnLFxuICAgICAgJ1JlZCBIYXQnLFxuICAgICAgJ1N1U0UnLFxuICAgICAgJ1VidW50dScsXG4gICAgICAnWHVidW50dScsXG4gICAgICAnQ3lnd2luJyxcbiAgICAgICdTeW1iaWFuIE9TJyxcbiAgICAgICdocHdPUycsXG4gICAgICAnd2ViT1MgJyxcbiAgICAgICd3ZWJPUycsXG4gICAgICAnVGFibGV0IE9TJyxcbiAgICAgICdMaW51eCcsXG4gICAgICAnTWFjIE9TIFgnLFxuICAgICAgJ01hY2ludG9zaCcsXG4gICAgICAnTWFjJyxcbiAgICAgICdXaW5kb3dzIDk4OycsXG4gICAgICAnV2luZG93cyAnXG4gICAgXSk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBQaWNrcyB0aGUgbGF5b3V0IGVuZ2luZSBmcm9tIGFuIGFycmF5IG9mIGd1ZXNzZXMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGd1ZXNzZXMgQW4gYXJyYXkgb2YgZ3Vlc3Nlcy5cbiAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9IFRoZSBkZXRlY3RlZCBsYXlvdXQgZW5naW5lLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldExheW91dChndWVzc2VzKSB7XG4gICAgICByZXR1cm4gcmVkdWNlKGd1ZXNzZXMsIGZ1bmN0aW9uKHJlc3VsdCwgZ3Vlc3MpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCBSZWdFeHAoJ1xcXFxiJyArIChcbiAgICAgICAgICBndWVzcy5wYXR0ZXJuIHx8IHF1YWxpZnkoZ3Vlc3MpXG4gICAgICAgICkgKyAnXFxcXGInLCAnaScpLmV4ZWModWEpICYmIChndWVzcy5sYWJlbCB8fCBndWVzcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaWNrcyB0aGUgbWFudWZhY3R1cmVyIGZyb20gYW4gYXJyYXkgb2YgZ3Vlc3Nlcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3Vlc3NlcyBBbiBvYmplY3Qgb2YgZ3Vlc3Nlcy5cbiAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9IFRoZSBkZXRlY3RlZCBtYW51ZmFjdHVyZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0TWFudWZhY3R1cmVyKGd1ZXNzZXMpIHtcbiAgICAgIHJldHVybiByZWR1Y2UoZ3Vlc3NlcywgZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgICAgIC8vIGxvb2t1cCB0aGUgbWFudWZhY3R1cmVyIGJ5IHByb2R1Y3Qgb3Igc2NhbiB0aGUgVUEgZm9yIHRoZSBtYW51ZmFjdHVyZXJcbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCAoXG4gICAgICAgICAgdmFsdWVbcHJvZHVjdF0gfHxcbiAgICAgICAgICB2YWx1ZVswLypPcGVyYSA5LjI1IGZpeCovLCAvXlthLXpdKyg/OiArW2Etel0rXFxiKSovaS5leGVjKHByb2R1Y3QpXSB8fFxuICAgICAgICAgIFJlZ0V4cCgnXFxcXGInICsgcXVhbGlmeShrZXkpICsgJyg/OlxcXFxifFxcXFx3KlxcXFxkKScsICdpJykuZXhlYyh1YSlcbiAgICAgICAgKSAmJiBrZXk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaWNrcyB0aGUgYnJvd3NlciBuYW1lIGZyb20gYW4gYXJyYXkgb2YgZ3Vlc3Nlcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3Vlc3NlcyBBbiBhcnJheSBvZiBndWVzc2VzLlxuICAgICAqIEByZXR1cm5zIHtudWxsfHN0cmluZ30gVGhlIGRldGVjdGVkIGJyb3dzZXIgbmFtZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXROYW1lKGd1ZXNzZXMpIHtcbiAgICAgIHJldHVybiByZWR1Y2UoZ3Vlc3NlcywgZnVuY3Rpb24ocmVzdWx0LCBndWVzcykge1xuICAgICAgICByZXR1cm4gcmVzdWx0IHx8IFJlZ0V4cCgnXFxcXGInICsgKFxuICAgICAgICAgIGd1ZXNzLnBhdHRlcm4gfHwgcXVhbGlmeShndWVzcylcbiAgICAgICAgKSArICdcXFxcYicsICdpJykuZXhlYyh1YSkgJiYgKGd1ZXNzLmxhYmVsIHx8IGd1ZXNzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBpY2tzIHRoZSBPUyBuYW1lIGZyb20gYW4gYXJyYXkgb2YgZ3Vlc3Nlcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3Vlc3NlcyBBbiBhcnJheSBvZiBndWVzc2VzLlxuICAgICAqIEByZXR1cm5zIHtudWxsfHN0cmluZ30gVGhlIGRldGVjdGVkIE9TIG5hbWUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0T1MoZ3Vlc3Nlcykge1xuICAgICAgcmV0dXJuIHJlZHVjZShndWVzc2VzLCBmdW5jdGlvbihyZXN1bHQsIGd1ZXNzKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gZ3Vlc3MucGF0dGVybiB8fCBxdWFsaWZ5KGd1ZXNzKTtcbiAgICAgICAgaWYgKCFyZXN1bHQgJiYgKHJlc3VsdCA9XG4gICAgICAgICAgICAgIFJlZ0V4cCgnXFxcXGInICsgcGF0dGVybiArICcoPzovW1xcXFxkLl0rfFsgXFxcXHcuXSopJywgJ2knKS5leGVjKHVhKVxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgIHJlc3VsdCA9IGNsZWFudXBPUyhyZXN1bHQsIHBhdHRlcm4sIGd1ZXNzLmxhYmVsIHx8IGd1ZXNzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGlja3MgdGhlIHByb2R1Y3QgbmFtZSBmcm9tIGFuIGFycmF5IG9mIGd1ZXNzZXMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGd1ZXNzZXMgQW4gYXJyYXkgb2YgZ3Vlc3Nlcy5cbiAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9IFRoZSBkZXRlY3RlZCBwcm9kdWN0IG5hbWUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0UHJvZHVjdChndWVzc2VzKSB7XG4gICAgICByZXR1cm4gcmVkdWNlKGd1ZXNzZXMsIGZ1bmN0aW9uKHJlc3VsdCwgZ3Vlc3MpIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBndWVzcy5wYXR0ZXJuIHx8IHF1YWxpZnkoZ3Vlc3MpO1xuICAgICAgICBpZiAoIXJlc3VsdCAmJiAocmVzdWx0ID1cbiAgICAgICAgICAgICAgUmVnRXhwKCdcXFxcYicgKyBwYXR0ZXJuICsgJyAqXFxcXGQrWy5cXFxcd19dKicsICdpJykuZXhlYyh1YSkgfHxcbiAgICAgICAgICAgICAgUmVnRXhwKCdcXFxcYicgKyBwYXR0ZXJuICsgJyg/OjsgKig/OlthLXpdK1tfLV0pP1thLXpdK1xcXFxkK3xbXiAoKTstXSopJywgJ2knKS5leGVjKHVhKVxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgIC8vIHNwbGl0IGJ5IGZvcndhcmQgc2xhc2ggYW5kIGFwcGVuZCBwcm9kdWN0IHZlcnNpb24gaWYgbmVlZGVkXG4gICAgICAgICAgaWYgKChyZXN1bHQgPSBTdHJpbmcoKGd1ZXNzLmxhYmVsICYmICFSZWdFeHAocGF0dGVybiwgJ2knKS50ZXN0KGd1ZXNzLmxhYmVsKSkgPyBndWVzcy5sYWJlbCA6IHJlc3VsdCkuc3BsaXQoJy8nKSlbMV0gJiYgIS9bXFxkLl0rLy50ZXN0KHJlc3VsdFswXSkpIHtcbiAgICAgICAgICAgIHJlc3VsdFswXSArPSAnICcgKyByZXN1bHRbMV07XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGNvcnJlY3QgY2hhcmFjdGVyIGNhc2UgYW5kIGNsZWFudXBcbiAgICAgICAgICBndWVzcyA9IGd1ZXNzLmxhYmVsIHx8IGd1ZXNzO1xuICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdChyZXN1bHRbMF1cbiAgICAgICAgICAgIC5yZXBsYWNlKFJlZ0V4cChwYXR0ZXJuLCAnaScpLCBndWVzcylcbiAgICAgICAgICAgIC5yZXBsYWNlKFJlZ0V4cCgnOyAqKD86JyArIGd1ZXNzICsgJ1tfLV0pPycsICdpJyksICcgJylcbiAgICAgICAgICAgIC5yZXBsYWNlKFJlZ0V4cCgnKCcgKyBndWVzcyArICcpWy1fLl0/KFxcXFx3KScsICdpJyksICckMSAkMicpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZXMgdGhlIHZlcnNpb24gdXNpbmcgYW4gYXJyYXkgb2YgVUEgcGF0dGVybnMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhdHRlcm5zIEFuIGFycmF5IG9mIFVBIHBhdHRlcm5zLlxuICAgICAqIEByZXR1cm5zIHtudWxsfHN0cmluZ30gVGhlIGRldGVjdGVkIHZlcnNpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0VmVyc2lvbihwYXR0ZXJucykge1xuICAgICAgcmV0dXJuIHJlZHVjZShwYXR0ZXJucywgZnVuY3Rpb24ocmVzdWx0LCBwYXR0ZXJuKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQgfHwgKFJlZ0V4cChwYXR0ZXJuICtcbiAgICAgICAgICAnKD86LVtcXFxcZC5dKy98KD86IGZvciBbXFxcXHctXSspP1sgLy1dKShbXFxcXGQuXStbXiAoKTsvXy1dKiknLCAnaScpLmV4ZWModWEpIHx8IDApWzFdIHx8IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGBwbGF0Zm9ybS5kZXNjcmlwdGlvbmAgd2hlbiB0aGUgcGxhdGZvcm0gb2JqZWN0IGlzIGNvZXJjZWQgdG8gYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAbmFtZSB0b1N0cmluZ1xuICAgICAqIEBtZW1iZXJPZiBwbGF0Zm9ybVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgYHBsYXRmb3JtLmRlc2NyaXB0aW9uYCBpZiBhdmFpbGFibGUsIGVsc2UgYW4gZW1wdHkgc3RyaW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRvU3RyaW5nUGxhdGZvcm0oKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXNjcmlwdGlvbiB8fCAnJztcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBjb252ZXJ0IGxheW91dCB0byBhbiBhcnJheSBzbyB3ZSBjYW4gYWRkIGV4dHJhIGRldGFpbHNcbiAgICBsYXlvdXQgJiYgKGxheW91dCA9IFtsYXlvdXRdKTtcblxuICAgIC8vIGRldGVjdCBwcm9kdWN0IG5hbWVzIHRoYXQgY29udGFpbiB0aGVpciBtYW51ZmFjdHVyZXIncyBuYW1lXG4gICAgaWYgKG1hbnVmYWN0dXJlciAmJiAhcHJvZHVjdCkge1xuICAgICAgcHJvZHVjdCA9IGdldFByb2R1Y3QoW21hbnVmYWN0dXJlcl0pO1xuICAgIH1cbiAgICAvLyBjbGVhbiB1cCBHb29nbGUgVFZcbiAgICBpZiAoKGRhdGEgPSAvXFxiR29vZ2xlIFRWXFxiLy5leGVjKHByb2R1Y3QpKSkge1xuICAgICAgcHJvZHVjdCA9IGRhdGFbMF07XG4gICAgfVxuICAgIC8vIGRldGVjdCBzaW11bGF0b3JzXG4gICAgaWYgKC9cXGJTaW11bGF0b3JcXGIvaS50ZXN0KHVhKSkge1xuICAgICAgcHJvZHVjdCA9IChwcm9kdWN0ID8gcHJvZHVjdCArICcgJyA6ICcnKSArICdTaW11bGF0b3InO1xuICAgIH1cbiAgICAvLyBkZXRlY3QgT3BlcmEgTWluaSA4KyBydW5uaW5nIGluIFR1cmJvL1VuY29tcHJlc3NlZCBtb2RlIG9uIGlPU1xuICAgIGlmIChuYW1lID09ICdPcGVyYSBNaW5pJyAmJiAvXFxiT1BpT1NcXGIvLnRlc3QodWEpKSB7XG4gICAgICBkZXNjcmlwdGlvbi5wdXNoKCdydW5uaW5nIGluIFR1cmJvL1VuY29tcHJlc3NlZCBtb2RlJyk7XG4gICAgfVxuICAgIC8vIGRldGVjdCBpT1NcbiAgICBpZiAoL15pUC8udGVzdChwcm9kdWN0KSkge1xuICAgICAgbmFtZSB8fCAobmFtZSA9ICdTYWZhcmknKTtcbiAgICAgIG9zID0gJ2lPUycgKyAoKGRhdGEgPSAvIE9TIChbXFxkX10rKS9pLmV4ZWModWEpKVxuICAgICAgICA/ICcgJyArIGRhdGFbMV0ucmVwbGFjZSgvXy9nLCAnLicpXG4gICAgICAgIDogJycpO1xuICAgIH1cbiAgICAvLyBkZXRlY3QgS3VidW50dVxuICAgIGVsc2UgaWYgKG5hbWUgPT0gJ0tvbnF1ZXJvcicgJiYgIS9idW50dS9pLnRlc3Qob3MpKSB7XG4gICAgICBvcyA9ICdLdWJ1bnR1JztcbiAgICB9XG4gICAgLy8gZGV0ZWN0IEFuZHJvaWQgYnJvd3NlcnNcbiAgICBlbHNlIGlmIChtYW51ZmFjdHVyZXIgJiYgbWFudWZhY3R1cmVyICE9ICdHb29nbGUnICYmXG4gICAgICAgICgoL0Nocm9tZS8udGVzdChuYW1lKSAmJiAhL1xcYk1vYmlsZSBTYWZhcmlcXGIvaS50ZXN0KHVhKSkgfHwgL1xcYlZpdGFcXGIvLnRlc3QocHJvZHVjdCkpKSB7XG4gICAgICBuYW1lID0gJ0FuZHJvaWQgQnJvd3Nlcic7XG4gICAgICBvcyA9IC9cXGJBbmRyb2lkXFxiLy50ZXN0KG9zKSA/IG9zIDogJ0FuZHJvaWQnO1xuICAgIH1cbiAgICAvLyBkZXRlY3QgZmFsc2UgcG9zaXRpdmVzIGZvciBGaXJlZm94L1NhZmFyaVxuICAgIGVsc2UgaWYgKCFuYW1lIHx8IChkYXRhID0gIS9cXGJNaW5lZmllbGRcXGJ8XFwoQW5kcm9pZDsvaS50ZXN0KHVhKSAmJiAvXFxiKD86RmlyZWZveHxTYWZhcmkpXFxiLy5leGVjKG5hbWUpKSkge1xuICAgICAgLy8gZXNjYXBlIHRoZSBgL2AgZm9yIEZpcmVmb3ggMVxuICAgICAgaWYgKG5hbWUgJiYgIXByb2R1Y3QgJiYgL1tcXC8sXXxeW14oXSs/XFwpLy50ZXN0KHVhLnNsaWNlKHVhLmluZGV4T2YoZGF0YSArICcvJykgKyA4KSkpIHtcbiAgICAgICAgLy8gY2xlYXIgbmFtZSBvZiBmYWxzZSBwb3NpdGl2ZXNcbiAgICAgICAgbmFtZSA9IG51bGw7XG4gICAgICB9XG4gICAgICAvLyByZWFzc2lnbiBhIGdlbmVyaWMgbmFtZVxuICAgICAgaWYgKChkYXRhID0gcHJvZHVjdCB8fCBtYW51ZmFjdHVyZXIgfHwgb3MpICYmXG4gICAgICAgICAgKHByb2R1Y3QgfHwgbWFudWZhY3R1cmVyIHx8IC9cXGIoPzpBbmRyb2lkfFN5bWJpYW4gT1N8VGFibGV0IE9TfHdlYk9TKVxcYi8udGVzdChvcykpKSB7XG4gICAgICAgIG5hbWUgPSAvW2Etel0rKD86IEhhdCk/L2kuZXhlYygvXFxiQW5kcm9pZFxcYi8udGVzdChvcykgPyBvcyA6IGRhdGEpICsgJyBCcm93c2VyJztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gZGV0ZWN0IEZpcmVmb3ggT1NcbiAgICBpZiAoKGRhdGEgPSAvXFwoKE1vYmlsZXxUYWJsZXQpLio/RmlyZWZveFxcYi9pLmV4ZWModWEpKSAmJiBkYXRhWzFdKSB7XG4gICAgICBvcyA9ICdGaXJlZm94IE9TJztcbiAgICAgIGlmICghcHJvZHVjdCkge1xuICAgICAgICBwcm9kdWN0ID0gZGF0YVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gZGV0ZWN0IG5vbi1PcGVyYSB2ZXJzaW9ucyAob3JkZXIgaXMgaW1wb3J0YW50KVxuICAgIGlmICghdmVyc2lvbikge1xuICAgICAgdmVyc2lvbiA9IGdldFZlcnNpb24oW1xuICAgICAgICAnKD86Q2xvdWQ5fENyaU9TfENyTW98SUVNb2JpbGV8SXJvbnxPcGVyYSA/TWluaXxPUGlPU3xPUFJ8UmF2ZW58U2lsayg/IS9bXFxcXGQuXSskKSknLFxuICAgICAgICAnVmVyc2lvbicsXG4gICAgICAgIHF1YWxpZnkobmFtZSksXG4gICAgICAgICcoPzpGaXJlZm94fE1pbmVmaWVsZHxOZXRGcm9udCknXG4gICAgICBdKTtcbiAgICB9XG4gICAgLy8gZGV0ZWN0IHN0dWJib3JuIGxheW91dCBlbmdpbmVzXG4gICAgaWYgKGxheW91dCA9PSAnaUNhYicgJiYgcGFyc2VGbG9hdCh2ZXJzaW9uKSA+IDMpIHtcbiAgICAgIGxheW91dCA9IFsnV2ViS2l0J107XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgbGF5b3V0ICE9ICdUcmlkZW50JyAmJlxuICAgICAgICAoZGF0YSA9XG4gICAgICAgICAgL1xcYk9wZXJhXFxiLy50ZXN0KG5hbWUpICYmICgvXFxiT1BSXFxiLy50ZXN0KHVhKSA/ICdCbGluaycgOiAnUHJlc3RvJykgfHxcbiAgICAgICAgICAvXFxiKD86TWlkb3JpfE5vb2t8U2FmYXJpKVxcYi9pLnRlc3QodWEpICYmICdXZWJLaXQnIHx8XG4gICAgICAgICAgIWxheW91dCAmJiAvXFxiTVNJRVxcYi9pLnRlc3QodWEpICYmIChvcyA9PSAnTWFjIE9TJyA/ICdUYXNtYW4nIDogJ1RyaWRlbnQnKVxuICAgICAgICApXG4gICAgKSB7XG4gICAgICBsYXlvdXQgPSBbZGF0YV07XG4gICAgfVxuICAgIC8vIGRldGVjdCBOZXRGcm9udCBvbiBQbGF5U3RhdGlvblxuICAgIGVsc2UgaWYgKC9cXGJQbGF5U3RhdGlvblxcYig/ISBWaXRhXFxiKS9pLnRlc3QobmFtZSkgJiYgbGF5b3V0ID09ICdXZWJLaXQnKSB7XG4gICAgICBsYXlvdXQgPSBbJ05ldEZyb250J107XG4gICAgfVxuICAgIC8vIGRldGVjdCBXaW5kb3dzIFBob25lIDcgZGVza3RvcCBtb2RlXG4gICAgaWYgKG5hbWUgPT0gJ0lFJyAmJiAoZGF0YSA9ICgvOyAqKD86WEJMV1B8WnVuZVdQKShcXGQrKS9pLmV4ZWModWEpIHx8IDApWzFdKSkge1xuICAgICAgbmFtZSArPSAnIE1vYmlsZSc7XG4gICAgICBvcyA9ICdXaW5kb3dzIFBob25lICcgKyAoL1xcKyQvLnRlc3QoZGF0YSkgPyBkYXRhIDogZGF0YSArICcueCcpO1xuICAgICAgZGVzY3JpcHRpb24udW5zaGlmdCgnZGVza3RvcCBtb2RlJyk7XG4gICAgfVxuICAgIC8vIGRldGVjdCBXaW5kb3dzIFBob25lIDgrIGRlc2t0b3AgbW9kZVxuICAgIGVsc2UgaWYgKC9cXGJXUERlc2t0b3BcXGIvaS50ZXN0KHVhKSkge1xuICAgICAgbmFtZSA9ICdJRSBNb2JpbGUnO1xuICAgICAgb3MgPSAnV2luZG93cyBQaG9uZSA4Kyc7XG4gICAgICBkZXNjcmlwdGlvbi51bnNoaWZ0KCdkZXNrdG9wIG1vZGUnKTtcbiAgICAgIHZlcnNpb24gfHwgKHZlcnNpb24gPSAoL1xcYnJ2OihbXFxkLl0rKS8uZXhlYyh1YSkgfHwgMClbMV0pO1xuICAgIH1cbiAgICAvLyBkZXRlY3QgSUUgMTEgYW5kIGFib3ZlXG4gICAgZWxzZSBpZiAobmFtZSAhPSAnSUUnICYmIGxheW91dCA9PSAnVHJpZGVudCcgJiYgKGRhdGEgPSAvXFxicnY6KFtcXGQuXSspLy5leGVjKHVhKSkpIHtcbiAgICAgIGlmICghL1xcYldQRGVza3RvcFxcYi9pLnRlc3QodWEpKSB7XG4gICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgZGVzY3JpcHRpb24ucHVzaCgnaWRlbnRpZnlpbmcgYXMgJyArIG5hbWUgKyAodmVyc2lvbiA/ICcgJyArIHZlcnNpb24gOiAnJykpO1xuICAgICAgICB9XG4gICAgICAgIG5hbWUgPSAnSUUnO1xuICAgICAgfVxuICAgICAgdmVyc2lvbiA9IGRhdGFbMV07XG4gICAgfVxuICAgIC8vIGRldGVjdCBJRSBUZWNoIFByZXZpZXdcbiAgICBlbHNlIGlmICgobmFtZSA9PSAnQ2hyb21lJyB8fCBuYW1lICE9ICdJRScpICYmIChkYXRhID0gL1xcYkVkZ2VcXC8oW1xcZC5dKykvLmV4ZWModWEpKSkge1xuICAgICAgbmFtZSA9ICdJRSc7XG4gICAgICB2ZXJzaW9uID0gZGF0YVsxXTtcbiAgICAgIGxheW91dCA9IFsnVHJpZGVudCddO1xuICAgICAgZGVzY3JpcHRpb24udW5zaGlmdCgncGxhdGZvcm0gcHJldmlldycpO1xuICAgIH1cbiAgICAvLyBsZXZlcmFnZSBlbnZpcm9ubWVudCBmZWF0dXJlc1xuICAgIGlmICh1c2VGZWF0dXJlcykge1xuICAgICAgLy8gZGV0ZWN0IHNlcnZlci1zaWRlIGVudmlyb25tZW50c1xuICAgICAgLy8gUmhpbm8gaGFzIGEgZ2xvYmFsIGZ1bmN0aW9uIHdoaWxlIG90aGVycyBoYXZlIGEgZ2xvYmFsIG9iamVjdFxuICAgICAgaWYgKGlzSG9zdFR5cGUoY29udGV4dCwgJ2dsb2JhbCcpKSB7XG4gICAgICAgIGlmIChqYXZhKSB7XG4gICAgICAgICAgZGF0YSA9IGphdmEubGFuZy5TeXN0ZW07XG4gICAgICAgICAgYXJjaCA9IGRhdGEuZ2V0UHJvcGVydHkoJ29zLmFyY2gnKTtcbiAgICAgICAgICBvcyA9IG9zIHx8IGRhdGEuZ2V0UHJvcGVydHkoJ29zLm5hbWUnKSArICcgJyArIGRhdGEuZ2V0UHJvcGVydHkoJ29zLnZlcnNpb24nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNNb2R1bGVTY29wZSAmJiBpc0hvc3RUeXBlKGNvbnRleHQsICdzeXN0ZW0nKSAmJiAoZGF0YSA9IFtjb250ZXh0LnN5c3RlbV0pWzBdKSB7XG4gICAgICAgICAgb3MgfHwgKG9zID0gZGF0YVswXS5vcyB8fCBudWxsKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGF0YVsxXSA9IGNvbnRleHQucmVxdWlyZSgncmluZ28vZW5naW5lJykudmVyc2lvbjtcbiAgICAgICAgICAgIHZlcnNpb24gPSBkYXRhWzFdLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIG5hbWUgPSAnUmluZ29KUyc7XG4gICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVswXS5nbG9iYWwuc3lzdGVtID09IGNvbnRleHQuc3lzdGVtKSB7XG4gICAgICAgICAgICAgIG5hbWUgPSAnTmFyd2hhbCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBjb250ZXh0LnByb2Nlc3MgPT0gJ29iamVjdCcgJiYgKGRhdGEgPSBjb250ZXh0LnByb2Nlc3MpKSB7XG4gICAgICAgICAgbmFtZSA9ICdOb2RlLmpzJztcbiAgICAgICAgICBhcmNoID0gZGF0YS5hcmNoO1xuICAgICAgICAgIG9zID0gZGF0YS5wbGF0Zm9ybTtcbiAgICAgICAgICB2ZXJzaW9uID0gL1tcXGQuXSsvLmV4ZWMoZGF0YS52ZXJzaW9uKVswXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyaGlubykge1xuICAgICAgICAgIG5hbWUgPSAnUmhpbm8nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBkZXRlY3QgQWRvYmUgQUlSXG4gICAgICBlbHNlIGlmIChnZXRDbGFzc09mKChkYXRhID0gY29udGV4dC5ydW50aW1lKSkgPT0gYWlyUnVudGltZUNsYXNzKSB7XG4gICAgICAgIG5hbWUgPSAnQWRvYmUgQUlSJztcbiAgICAgICAgb3MgPSBkYXRhLmZsYXNoLnN5c3RlbS5DYXBhYmlsaXRpZXMub3M7XG4gICAgICB9XG4gICAgICAvLyBkZXRlY3QgUGhhbnRvbUpTXG4gICAgICBlbHNlIGlmIChnZXRDbGFzc09mKChkYXRhID0gY29udGV4dC5waGFudG9tKSkgPT0gcGhhbnRvbUNsYXNzKSB7XG4gICAgICAgIG5hbWUgPSAnUGhhbnRvbUpTJztcbiAgICAgICAgdmVyc2lvbiA9IChkYXRhID0gZGF0YS52ZXJzaW9uIHx8IG51bGwpICYmIChkYXRhLm1ham9yICsgJy4nICsgZGF0YS5taW5vciArICcuJyArIGRhdGEucGF0Y2gpO1xuICAgICAgfVxuICAgICAgLy8gZGV0ZWN0IElFIGNvbXBhdGliaWxpdHkgbW9kZXNcbiAgICAgIGVsc2UgaWYgKHR5cGVvZiBkb2MuZG9jdW1lbnRNb2RlID09ICdudW1iZXInICYmIChkYXRhID0gL1xcYlRyaWRlbnRcXC8oXFxkKykvaS5leGVjKHVhKSkpIHtcbiAgICAgICAgLy8gd2UncmUgaW4gY29tcGF0aWJpbGl0eSBtb2RlIHdoZW4gdGhlIFRyaWRlbnQgdmVyc2lvbiArIDQgZG9lc24ndFxuICAgICAgICAvLyBlcXVhbCB0aGUgZG9jdW1lbnQgbW9kZVxuICAgICAgICB2ZXJzaW9uID0gW3ZlcnNpb24sIGRvYy5kb2N1bWVudE1vZGVdO1xuICAgICAgICBpZiAoKGRhdGEgPSArZGF0YVsxXSArIDQpICE9IHZlcnNpb25bMV0pIHtcbiAgICAgICAgICBkZXNjcmlwdGlvbi5wdXNoKCdJRSAnICsgdmVyc2lvblsxXSArICcgbW9kZScpO1xuICAgICAgICAgIGxheW91dCAmJiAobGF5b3V0WzFdID0gJycpO1xuICAgICAgICAgIHZlcnNpb25bMV0gPSBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIHZlcnNpb24gPSBuYW1lID09ICdJRScgPyBTdHJpbmcodmVyc2lvblsxXS50b0ZpeGVkKDEpKSA6IHZlcnNpb25bMF07XG4gICAgICB9XG4gICAgICBvcyA9IG9zICYmIGZvcm1hdChvcyk7XG4gICAgfVxuICAgIC8vIGRldGVjdCBwcmVyZWxlYXNlIHBoYXNlc1xuICAgIGlmICh2ZXJzaW9uICYmIChkYXRhID1cbiAgICAgICAgICAvKD86W2FiXXxkcHxwcmV8W2FiXVxcZCtwcmUpKD86XFxkK1xcKz8pPyQvaS5leGVjKHZlcnNpb24pIHx8XG4gICAgICAgICAgLyg/OmFscGhhfGJldGEpKD86ID9cXGQpPy9pLmV4ZWModWEgKyAnOycgKyAodXNlRmVhdHVyZXMgJiYgbmF2LmFwcE1pbm9yVmVyc2lvbikpIHx8XG4gICAgICAgICAgL1xcYk1pbmVmaWVsZFxcYi9pLnRlc3QodWEpICYmICdhJ1xuICAgICAgICApKSB7XG4gICAgICBwcmVyZWxlYXNlID0gL2IvaS50ZXN0KGRhdGEpID8gJ2JldGEnIDogJ2FscGhhJztcbiAgICAgIHZlcnNpb24gPSB2ZXJzaW9uLnJlcGxhY2UoUmVnRXhwKGRhdGEgKyAnXFxcXCs/JCcpLCAnJykgK1xuICAgICAgICAocHJlcmVsZWFzZSA9PSAnYmV0YScgPyBiZXRhIDogYWxwaGEpICsgKC9cXGQrXFwrPy8uZXhlYyhkYXRhKSB8fCAnJyk7XG4gICAgfVxuICAgIC8vIGRldGVjdCBGaXJlZm94IE1vYmlsZVxuICAgIGlmIChuYW1lID09ICdGZW5uZWMnIHx8IG5hbWUgPT0gJ0ZpcmVmb3gnICYmIC9cXGIoPzpBbmRyb2lkfEZpcmVmb3ggT1MpXFxiLy50ZXN0KG9zKSkge1xuICAgICAgbmFtZSA9ICdGaXJlZm94IE1vYmlsZSc7XG4gICAgfVxuICAgIC8vIG9ic2N1cmUgTWF4dGhvbidzIHVucmVsaWFibGUgdmVyc2lvblxuICAgIGVsc2UgaWYgKG5hbWUgPT0gJ01heHRob24nICYmIHZlcnNpb24pIHtcbiAgICAgIHZlcnNpb24gPSB2ZXJzaW9uLnJlcGxhY2UoL1xcLltcXGQuXSsvLCAnLngnKTtcbiAgICB9XG4gICAgLy8gZGV0ZWN0IFNpbGsgZGVza3RvcC9hY2NlbGVyYXRlZCBtb2Rlc1xuICAgIGVsc2UgaWYgKG5hbWUgPT0gJ1NpbGsnKSB7XG4gICAgICBpZiAoIS9cXGJNb2JpL2kudGVzdCh1YSkpIHtcbiAgICAgICAgb3MgPSAnQW5kcm9pZCc7XG4gICAgICAgIGRlc2NyaXB0aW9uLnVuc2hpZnQoJ2Rlc2t0b3AgbW9kZScpO1xuICAgICAgfVxuICAgICAgaWYgKC9BY2NlbGVyYXRlZCAqPSAqdHJ1ZS9pLnRlc3QodWEpKSB7XG4gICAgICAgIGRlc2NyaXB0aW9uLnVuc2hpZnQoJ2FjY2VsZXJhdGVkJyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGRldGVjdCBYYm94IDM2MCBhbmQgWGJveCBPbmVcbiAgICBlbHNlIGlmICgvXFxiWGJveFxcYi9pLnRlc3QocHJvZHVjdCkpIHtcbiAgICAgIG9zID0gbnVsbDtcbiAgICAgIGlmIChwcm9kdWN0ID09ICdYYm94IDM2MCcgJiYgL1xcYklFTW9iaWxlXFxiLy50ZXN0KHVhKSkge1xuICAgICAgICBkZXNjcmlwdGlvbi51bnNoaWZ0KCdtb2JpbGUgbW9kZScpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBhZGQgbW9iaWxlIHBvc3RmaXhcbiAgICBlbHNlIGlmICgoL14oPzpDaHJvbWV8SUV8T3BlcmEpJC8udGVzdChuYW1lKSB8fCBuYW1lICYmICFwcm9kdWN0ICYmICEvQnJvd3NlcnxNb2JpLy50ZXN0KG5hbWUpKSAmJlxuICAgICAgICAob3MgPT0gJ1dpbmRvd3MgQ0UnIHx8IC9Nb2JpL2kudGVzdCh1YSkpKSB7XG4gICAgICBuYW1lICs9ICcgTW9iaWxlJztcbiAgICB9XG4gICAgLy8gZGV0ZWN0IElFIHBsYXRmb3JtIHByZXZpZXdcbiAgICBlbHNlIGlmIChuYW1lID09ICdJRScgJiYgdXNlRmVhdHVyZXMgJiYgY29udGV4dC5leHRlcm5hbCA9PT0gbnVsbCkge1xuICAgICAgZGVzY3JpcHRpb24udW5zaGlmdCgncGxhdGZvcm0gcHJldmlldycpO1xuICAgIH1cbiAgICAvLyBkZXRlY3QgQmxhY2tCZXJyeSBPUyB2ZXJzaW9uXG4gICAgLy8gaHR0cDovL2RvY3MuYmxhY2tiZXJyeS5jb20vZW4vZGV2ZWxvcGVycy9kZWxpdmVyYWJsZXMvMTgxNjkvSFRUUF9oZWFkZXJzX3NlbnRfYnlfQkJfQnJvd3Nlcl8xMjM0OTExXzExLmpzcFxuICAgIGVsc2UgaWYgKCgvXFxiQmxhY2tCZXJyeVxcYi8udGVzdChwcm9kdWN0KSB8fCAvXFxiQkIxMFxcYi8udGVzdCh1YSkpICYmIChkYXRhID1cbiAgICAgICAgICAoUmVnRXhwKHByb2R1Y3QucmVwbGFjZSgvICsvZywgJyAqJykgKyAnLyhbLlxcXFxkXSspJywgJ2knKS5leGVjKHVhKSB8fCAwKVsxXSB8fFxuICAgICAgICAgIHZlcnNpb25cbiAgICAgICAgKSkge1xuICAgICAgZGF0YSA9IFtkYXRhLCAvQkIxMC8udGVzdCh1YSldO1xuICAgICAgb3MgPSAoZGF0YVsxXSA/IChwcm9kdWN0ID0gbnVsbCwgbWFudWZhY3R1cmVyID0gJ0JsYWNrQmVycnknKSA6ICdEZXZpY2UgU29mdHdhcmUnKSArICcgJyArIGRhdGFbMF07XG4gICAgICB2ZXJzaW9uID0gbnVsbDtcbiAgICB9XG4gICAgLy8gZGV0ZWN0IE9wZXJhIGlkZW50aWZ5aW5nL21hc2tpbmcgaXRzZWxmIGFzIGFub3RoZXIgYnJvd3NlclxuICAgIC8vIGh0dHA6Ly93d3cub3BlcmEuY29tL3N1cHBvcnQva2Ivdmlldy84NDMvXG4gICAgZWxzZSBpZiAodGhpcyAhPSBmb3JPd24gJiYgKFxuICAgICAgICAgIHByb2R1Y3QgIT0gJ1dpaScgJiYgKFxuICAgICAgICAgICAgKHVzZUZlYXR1cmVzICYmIG9wZXJhKSB8fFxuICAgICAgICAgICAgKC9PcGVyYS8udGVzdChuYW1lKSAmJiAvXFxiKD86TVNJRXxGaXJlZm94KVxcYi9pLnRlc3QodWEpKSB8fFxuICAgICAgICAgICAgKG5hbWUgPT0gJ0ZpcmVmb3gnICYmIC9cXGJPUyBYICg/OlxcZCtcXC4pezIsfS8udGVzdChvcykpIHx8XG4gICAgICAgICAgICAobmFtZSA9PSAnSUUnICYmIChcbiAgICAgICAgICAgICAgKG9zICYmICEvXldpbi8udGVzdChvcykgJiYgdmVyc2lvbiA+IDUuNSkgfHxcbiAgICAgICAgICAgICAgL1xcYldpbmRvd3MgWFBcXGIvLnRlc3Qob3MpICYmIHZlcnNpb24gPiA4IHx8XG4gICAgICAgICAgICAgIHZlcnNpb24gPT0gOCAmJiAhL1xcYlRyaWRlbnRcXGIvLnRlc3QodWEpXG4gICAgICAgICAgICApKVxuICAgICAgICAgIClcbiAgICAgICAgKSAmJiAhcmVPcGVyYS50ZXN0KChkYXRhID0gcGFyc2UuY2FsbChmb3JPd24sIHVhLnJlcGxhY2UocmVPcGVyYSwgJycpICsgJzsnKSkpICYmIGRhdGEubmFtZSkge1xuXG4gICAgICAvLyB3aGVuIFwiaW5kZW50aWZ5aW5nXCIsIHRoZSBVQSBjb250YWlucyBib3RoIE9wZXJhIGFuZCB0aGUgb3RoZXIgYnJvd3NlcidzIG5hbWVcbiAgICAgIGRhdGEgPSAnaW5nIGFzICcgKyBkYXRhLm5hbWUgKyAoKGRhdGEgPSBkYXRhLnZlcnNpb24pID8gJyAnICsgZGF0YSA6ICcnKTtcbiAgICAgIGlmIChyZU9wZXJhLnRlc3QobmFtZSkpIHtcbiAgICAgICAgaWYgKC9cXGJJRVxcYi8udGVzdChkYXRhKSAmJiBvcyA9PSAnTWFjIE9TJykge1xuICAgICAgICAgIG9zID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBkYXRhID0gJ2lkZW50aWZ5JyArIGRhdGE7XG4gICAgICB9XG4gICAgICAvLyB3aGVuIFwibWFza2luZ1wiLCB0aGUgVUEgY29udGFpbnMgb25seSB0aGUgb3RoZXIgYnJvd3NlcidzIG5hbWVcbiAgICAgIGVsc2Uge1xuICAgICAgICBkYXRhID0gJ21hc2snICsgZGF0YTtcbiAgICAgICAgaWYgKG9wZXJhQ2xhc3MpIHtcbiAgICAgICAgICBuYW1lID0gZm9ybWF0KG9wZXJhQ2xhc3MucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxICQyJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5hbWUgPSAnT3BlcmEnO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvXFxiSUVcXGIvLnRlc3QoZGF0YSkpIHtcbiAgICAgICAgICBvcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF1c2VGZWF0dXJlcykge1xuICAgICAgICAgIHZlcnNpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsYXlvdXQgPSBbJ1ByZXN0byddO1xuICAgICAgZGVzY3JpcHRpb24ucHVzaChkYXRhKTtcbiAgICB9XG4gICAgLy8gZGV0ZWN0IFdlYktpdCBOaWdodGx5IGFuZCBhcHByb3hpbWF0ZSBDaHJvbWUvU2FmYXJpIHZlcnNpb25zXG4gICAgaWYgKChkYXRhID0gKC9cXGJBcHBsZVdlYktpdFxcLyhbXFxkLl0rXFwrPykvaS5leGVjKHVhKSB8fCAwKVsxXSkpIHtcbiAgICAgIC8vIGNvcnJlY3QgYnVpbGQgZm9yIG51bWVyaWMgY29tcGFyaXNvblxuICAgICAgLy8gKGUuZy4gXCI1MzIuNVwiIGJlY29tZXMgXCI1MzIuMDVcIilcbiAgICAgIGRhdGEgPSBbcGFyc2VGbG9hdChkYXRhLnJlcGxhY2UoL1xcLihcXGQpJC8sICcuMCQxJykpLCBkYXRhXTtcbiAgICAgIC8vIG5pZ2h0bHkgYnVpbGRzIGFyZSBwb3N0Zml4ZWQgd2l0aCBhIGArYFxuICAgICAgaWYgKG5hbWUgPT0gJ1NhZmFyaScgJiYgZGF0YVsxXS5zbGljZSgtMSkgPT0gJysnKSB7XG4gICAgICAgIG5hbWUgPSAnV2ViS2l0IE5pZ2h0bHknO1xuICAgICAgICBwcmVyZWxlYXNlID0gJ2FscGhhJztcbiAgICAgICAgdmVyc2lvbiA9IGRhdGFbMV0uc2xpY2UoMCwgLTEpO1xuICAgICAgfVxuICAgICAgLy8gY2xlYXIgaW5jb3JyZWN0IGJyb3dzZXIgdmVyc2lvbnNcbiAgICAgIGVsc2UgaWYgKHZlcnNpb24gPT0gZGF0YVsxXSB8fFxuICAgICAgICAgIHZlcnNpb24gPT0gKGRhdGFbMl0gPSAoL1xcYlNhZmFyaVxcLyhbXFxkLl0rXFwrPykvaS5leGVjKHVhKSB8fCAwKVsxXSkpIHtcbiAgICAgICAgdmVyc2lvbiA9IG51bGw7XG4gICAgICB9XG4gICAgICAvLyB1c2UgdGhlIGZ1bGwgQ2hyb21lIHZlcnNpb24gd2hlbiBhdmFpbGFibGVcbiAgICAgIGRhdGFbMV0gPSAoL1xcYkNocm9tZVxcLyhbXFxkLl0rKS9pLmV4ZWModWEpIHx8IDApWzFdO1xuICAgICAgLy8gZGV0ZWN0IEJsaW5rIGxheW91dCBlbmdpbmVcbiAgICAgIGlmIChkYXRhWzBdID09IDUzNy4zNiAmJiBkYXRhWzJdID09IDUzNy4zNiAmJiBwYXJzZUZsb2F0KGRhdGFbMV0pID49IDI4ICYmIG5hbWUgIT0gJ0lFJykge1xuICAgICAgICBsYXlvdXQgPSBbJ0JsaW5rJ107XG4gICAgICB9XG4gICAgICAvLyBkZXRlY3QgSmF2YVNjcmlwdENvcmVcbiAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjc2ODQ3NC9ob3ctY2FuLWktZGV0ZWN0LXdoaWNoLWphdmFzY3JpcHQtZW5naW5lLXY4LW9yLWpzYy1pcy11c2VkLWF0LXJ1bnRpbWUtaW4tYW5kcm9pXG4gICAgICBpZiAoIXVzZUZlYXR1cmVzIHx8ICghbGlrZUNocm9tZSAmJiAhZGF0YVsxXSkpIHtcbiAgICAgICAgbGF5b3V0ICYmIChsYXlvdXRbMV0gPSAnbGlrZSBTYWZhcmknKTtcbiAgICAgICAgZGF0YSA9IChkYXRhID0gZGF0YVswXSwgZGF0YSA8IDQwMCA/IDEgOiBkYXRhIDwgNTAwID8gMiA6IGRhdGEgPCA1MjYgPyAzIDogZGF0YSA8IDUzMyA/IDQgOiBkYXRhIDwgNTM0ID8gJzQrJyA6IGRhdGEgPCA1MzUgPyA1IDogZGF0YSA8IDUzNyA/IDYgOiBkYXRhIDwgNTM4ID8gNyA6IGRhdGEgPCA2MDEgPyA4IDogJzgnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxheW91dCAmJiAobGF5b3V0WzFdID0gJ2xpa2UgQ2hyb21lJyk7XG4gICAgICAgIGRhdGEgPSBkYXRhWzFdIHx8IChkYXRhID0gZGF0YVswXSwgZGF0YSA8IDUzMCA/IDEgOiBkYXRhIDwgNTMyID8gMiA6IGRhdGEgPCA1MzIuMDUgPyAzIDogZGF0YSA8IDUzMyA/IDQgOiBkYXRhIDwgNTM0LjAzID8gNSA6IGRhdGEgPCA1MzQuMDcgPyA2IDogZGF0YSA8IDUzNC4xMCA/IDcgOiBkYXRhIDwgNTM0LjEzID8gOCA6IGRhdGEgPCA1MzQuMTYgPyA5IDogZGF0YSA8IDUzNC4yNCA/IDEwIDogZGF0YSA8IDUzNC4zMCA/IDExIDogZGF0YSA8IDUzNS4wMSA/IDEyIDogZGF0YSA8IDUzNS4wMiA/ICcxMysnIDogZGF0YSA8IDUzNS4wNyA/IDE1IDogZGF0YSA8IDUzNS4xMSA/IDE2IDogZGF0YSA8IDUzNS4xOSA/IDE3IDogZGF0YSA8IDUzNi4wNSA/IDE4IDogZGF0YSA8IDUzNi4xMCA/IDE5IDogZGF0YSA8IDUzNy4wMSA/IDIwIDogZGF0YSA8IDUzNy4xMSA/ICcyMSsnIDogZGF0YSA8IDUzNy4xMyA/IDIzIDogZGF0YSA8IDUzNy4xOCA/IDI0IDogZGF0YSA8IDUzNy4yNCA/IDI1IDogZGF0YSA8IDUzNy4zNiA/IDI2IDogbGF5b3V0ICE9ICdCbGluaycgPyAnMjcnIDogJzI4Jyk7XG4gICAgICB9XG4gICAgICAvLyBhZGQgdGhlIHBvc3RmaXggb2YgXCIueFwiIG9yIFwiK1wiIGZvciBhcHByb3hpbWF0ZSB2ZXJzaW9uc1xuICAgICAgbGF5b3V0ICYmIChsYXlvdXRbMV0gKz0gJyAnICsgKGRhdGEgKz0gdHlwZW9mIGRhdGEgPT0gJ251bWJlcicgPyAnLngnIDogL1suK10vLnRlc3QoZGF0YSkgPyAnJyA6ICcrJykpO1xuICAgICAgLy8gb2JzY3VyZSB2ZXJzaW9uIGZvciBzb21lIFNhZmFyaSAxLTIgcmVsZWFzZXNcbiAgICAgIGlmIChuYW1lID09ICdTYWZhcmknICYmICghdmVyc2lvbiB8fCBwYXJzZUludCh2ZXJzaW9uKSA+IDQ1KSkge1xuICAgICAgICB2ZXJzaW9uID0gZGF0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gZGV0ZWN0IE9wZXJhIGRlc2t0b3AgbW9kZXNcbiAgICBpZiAobmFtZSA9PSAnT3BlcmEnICYmICAoZGF0YSA9IC9cXGJ6Ym92fHp2YXYkLy5leGVjKG9zKSkpIHtcbiAgICAgIG5hbWUgKz0gJyAnO1xuICAgICAgZGVzY3JpcHRpb24udW5zaGlmdCgnZGVza3RvcCBtb2RlJyk7XG4gICAgICBpZiAoZGF0YSA9PSAnenZhdicpIHtcbiAgICAgICAgbmFtZSArPSAnTWluaSc7XG4gICAgICAgIHZlcnNpb24gPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmFtZSArPSAnTW9iaWxlJztcbiAgICAgIH1cbiAgICAgIG9zID0gb3MucmVwbGFjZShSZWdFeHAoJyAqJyArIGRhdGEgKyAnJCcpLCAnJyk7XG4gICAgfVxuICAgIC8vIGRldGVjdCBDaHJvbWUgZGVza3RvcCBtb2RlXG4gICAgZWxzZSBpZiAobmFtZSA9PSAnU2FmYXJpJyAmJiAvXFxiQ2hyb21lXFxiLy5leGVjKGxheW91dCAmJiBsYXlvdXRbMV0pKSB7XG4gICAgICBkZXNjcmlwdGlvbi51bnNoaWZ0KCdkZXNrdG9wIG1vZGUnKTtcbiAgICAgIG5hbWUgPSAnQ2hyb21lIE1vYmlsZSc7XG4gICAgICB2ZXJzaW9uID0gbnVsbDtcblxuICAgICAgaWYgKC9cXGJPUyBYXFxiLy50ZXN0KG9zKSkge1xuICAgICAgICBtYW51ZmFjdHVyZXIgPSAnQXBwbGUnO1xuICAgICAgICBvcyA9ICdpT1MgNC4zKyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIHN0cmlwIGluY29ycmVjdCBPUyB2ZXJzaW9uc1xuICAgIGlmICh2ZXJzaW9uICYmIHZlcnNpb24uaW5kZXhPZigoZGF0YSA9IC9bXFxkLl0rJC8uZXhlYyhvcykpKSA9PSAwICYmXG4gICAgICAgIHVhLmluZGV4T2YoJy8nICsgZGF0YSArICctJykgPiAtMSkge1xuICAgICAgb3MgPSB0cmltKG9zLnJlcGxhY2UoZGF0YSwgJycpKTtcbiAgICB9XG4gICAgLy8gYWRkIGxheW91dCBlbmdpbmVcbiAgICBpZiAobGF5b3V0ICYmICEvXFxiKD86QXZhbnR8Tm9vaylcXGIvLnRlc3QobmFtZSkgJiYgKFxuICAgICAgICAvQnJvd3NlcnxMdW5hc2NhcGV8TWF4dGhvbi8udGVzdChuYW1lKSB8fFxuICAgICAgICAvXig/OkFkb2JlfEFyb3JhfEJyZWFjaHxNaWRvcml8T3BlcmF8UGhhbnRvbXxSZWtvbnF8Um9ja3xTbGVpcG5pcnxXZWIpLy50ZXN0KG5hbWUpICYmIGxheW91dFsxXSkpIHtcbiAgICAgIC8vIGRvbid0IGFkZCBsYXlvdXQgZGV0YWlscyB0byBkZXNjcmlwdGlvbiBpZiB0aGV5IGFyZSBmYWxzZXlcbiAgICAgIChkYXRhID0gbGF5b3V0W2xheW91dC5sZW5ndGggLSAxXSkgJiYgZGVzY3JpcHRpb24ucHVzaChkYXRhKTtcbiAgICB9XG4gICAgLy8gY29tYmluZSBjb250ZXh0dWFsIGluZm9ybWF0aW9uXG4gICAgaWYgKGRlc2NyaXB0aW9uLmxlbmd0aCkge1xuICAgICAgZGVzY3JpcHRpb24gPSBbJygnICsgZGVzY3JpcHRpb24uam9pbignOyAnKSArICcpJ107XG4gICAgfVxuICAgIC8vIGFwcGVuZCBtYW51ZmFjdHVyZXJcbiAgICBpZiAobWFudWZhY3R1cmVyICYmIHByb2R1Y3QgJiYgcHJvZHVjdC5pbmRleE9mKG1hbnVmYWN0dXJlcikgPCAwKSB7XG4gICAgICBkZXNjcmlwdGlvbi5wdXNoKCdvbiAnICsgbWFudWZhY3R1cmVyKTtcbiAgICB9XG4gICAgLy8gYXBwZW5kIHByb2R1Y3RcbiAgICBpZiAocHJvZHVjdCkge1xuICAgICAgZGVzY3JpcHRpb24ucHVzaCgoL15vbiAvLnRlc3QoZGVzY3JpcHRpb25bZGVzY3JpcHRpb24ubGVuZ3RoIC0xXSkgPyAnJyA6ICdvbiAnKSArIHByb2R1Y3QpO1xuICAgIH1cbiAgICAvLyBwYXJzZSBPUyBpbnRvIGFuIG9iamVjdFxuICAgIGlmIChvcykge1xuICAgICAgZGF0YSA9IC8gKFtcXGQuK10rKSQvLmV4ZWMob3MpO1xuICAgICAgaXNTcGVjaWFsQ2FzZWRPUyA9IGRhdGEgJiYgb3MuY2hhckF0KG9zLmxlbmd0aCAtIGRhdGFbMF0ubGVuZ3RoIC0gMSkgPT0gJy8nO1xuICAgICAgb3MgPSB7XG4gICAgICAgICdhcmNoaXRlY3R1cmUnOiAzMixcbiAgICAgICAgJ2ZhbWlseSc6IChkYXRhICYmICFpc1NwZWNpYWxDYXNlZE9TKSA/IG9zLnJlcGxhY2UoZGF0YVswXSwgJycpIDogb3MsXG4gICAgICAgICd2ZXJzaW9uJzogZGF0YSA/IGRhdGFbMV0gOiBudWxsLFxuICAgICAgICAndG9TdHJpbmcnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgdmVyc2lvbiA9IHRoaXMudmVyc2lvbjtcbiAgICAgICAgICByZXR1cm4gdGhpcy5mYW1pbHkgKyAoKHZlcnNpb24gJiYgIWlzU3BlY2lhbENhc2VkT1MpID8gJyAnICsgdmVyc2lvbiA6ICcnKSArICh0aGlzLmFyY2hpdGVjdHVyZSA9PSA2NCA/ICcgNjQtYml0JyA6ICcnKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgLy8gYWRkIGJyb3dzZXIvT1MgYXJjaGl0ZWN0dXJlXG4gICAgaWYgKChkYXRhID0gL1xcYig/OkFNRHxJQXxXaW58V09XfHg4Nl98eCk2NFxcYi9pLmV4ZWMoYXJjaCkpICYmICEvXFxiaTY4NlxcYi9pLnRlc3QoYXJjaCkpIHtcbiAgICAgIGlmIChvcykge1xuICAgICAgICBvcy5hcmNoaXRlY3R1cmUgPSA2NDtcbiAgICAgICAgb3MuZmFtaWx5ID0gb3MuZmFtaWx5LnJlcGxhY2UoUmVnRXhwKCcgKicgKyBkYXRhKSwgJycpO1xuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICAgIG5hbWUgJiYgKC9cXGJXT1c2NFxcYi9pLnRlc3QodWEpIHx8XG4gICAgICAgICAgKHVzZUZlYXR1cmVzICYmIC9cXHcoPzo4NnwzMikkLy50ZXN0KG5hdi5jcHVDbGFzcyB8fCBuYXYucGxhdGZvcm0pICYmICEvXFxiV2luNjQ7IHg2NFxcYi9pLnRlc3QodWEpKSlcbiAgICAgICkge1xuICAgICAgICBkZXNjcmlwdGlvbi51bnNoaWZ0KCczMi1iaXQnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1YSB8fCAodWEgPSBudWxsKTtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIFRoZSBwbGF0Zm9ybSBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAbmFtZSBwbGF0Zm9ybVxuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIHZhciBwbGF0Zm9ybSA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIHBsYXRmb3JtIGRlc2NyaXB0aW9uLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIHBsYXRmb3JtXG4gICAgICogQHR5cGUgc3RyaW5nfG51bGxcbiAgICAgKi9cbiAgICBwbGF0Zm9ybS5kZXNjcmlwdGlvbiA9IHVhO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIGJyb3dzZXIncyBsYXlvdXQgZW5naW5lLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIHBsYXRmb3JtXG4gICAgICogQHR5cGUgc3RyaW5nfG51bGxcbiAgICAgKi9cbiAgICBwbGF0Zm9ybS5sYXlvdXQgPSBsYXlvdXQgJiYgbGF5b3V0WzBdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHByb2R1Y3QncyBtYW51ZmFjdHVyZXIuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgcGxhdGZvcm1cbiAgICAgKiBAdHlwZSBzdHJpbmd8bnVsbFxuICAgICAqL1xuICAgIHBsYXRmb3JtLm1hbnVmYWN0dXJlciA9IG1hbnVmYWN0dXJlcjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBicm93c2VyL2Vudmlyb25tZW50LlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIHBsYXRmb3JtXG4gICAgICogQHR5cGUgc3RyaW5nfG51bGxcbiAgICAgKi9cbiAgICBwbGF0Zm9ybS5uYW1lID0gbmFtZTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhbHBoYS9iZXRhIHJlbGVhc2UgaW5kaWNhdG9yLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIHBsYXRmb3JtXG4gICAgICogQHR5cGUgc3RyaW5nfG51bGxcbiAgICAgKi9cbiAgICBwbGF0Zm9ybS5wcmVyZWxlYXNlID0gcHJlcmVsZWFzZTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBwcm9kdWN0IGhvc3RpbmcgdGhlIGJyb3dzZXIuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgcGxhdGZvcm1cbiAgICAgKiBAdHlwZSBzdHJpbmd8bnVsbFxuICAgICAqL1xuICAgIHBsYXRmb3JtLnByb2R1Y3QgPSBwcm9kdWN0O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGJyb3dzZXIncyB1c2VyIGFnZW50IHN0cmluZy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBwbGF0Zm9ybVxuICAgICAqIEB0eXBlIHN0cmluZ3xudWxsXG4gICAgICovXG4gICAgcGxhdGZvcm0udWEgPSB1YTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBicm93c2VyL2Vudmlyb25tZW50IHZlcnNpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgcGxhdGZvcm1cbiAgICAgKiBAdHlwZSBzdHJpbmd8bnVsbFxuICAgICAqL1xuICAgIHBsYXRmb3JtLnZlcnNpb24gPSBuYW1lICYmIHZlcnNpb247XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgb3BlcmF0aW5nIHN5c3RlbS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJPZiBwbGF0Zm9ybVxuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIHBsYXRmb3JtLm9zID0gb3MgfHwge1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBDUFUgYXJjaGl0ZWN0dXJlIHRoZSBPUyBpcyBidWlsdCBmb3IuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIHBsYXRmb3JtLm9zXG4gICAgICAgKiBAdHlwZSBudW1iZXJ8bnVsbFxuICAgICAgICovXG4gICAgICAnYXJjaGl0ZWN0dXJlJzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgZmFtaWx5IG9mIHRoZSBPUy5cbiAgICAgICAqXG4gICAgICAgKiBDb21tb24gdmFsdWVzIGluY2x1ZGU6XG4gICAgICAgKiBcIldpbmRvd3NcIiwgXCJXaW5kb3dzIFNlcnZlciAyMDA4IFIyIC8gN1wiLCBcIldpbmRvd3MgU2VydmVyIDIwMDggLyBWaXN0YVwiLFxuICAgICAgICogXCJXaW5kb3dzIFhQXCIsIFwiT1MgWFwiLCBcIlVidW50dVwiLCBcIkRlYmlhblwiLCBcIkZlZG9yYVwiLCBcIlJlZCBIYXRcIiwgXCJTdVNFXCIsXG4gICAgICAgKiBcIkFuZHJvaWRcIiwgXCJpT1NcIiBhbmQgXCJXaW5kb3dzIFBob25lXCJcbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgcGxhdGZvcm0ub3NcbiAgICAgICAqIEB0eXBlIHN0cmluZ3xudWxsXG4gICAgICAgKi9cbiAgICAgICdmYW1pbHknOiBudWxsLFxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBPUy5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgcGxhdGZvcm0ub3NcbiAgICAgICAqIEB0eXBlIHN0cmluZ3xudWxsXG4gICAgICAgKi9cbiAgICAgICd2ZXJzaW9uJzogbnVsbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRoZSBPUyBzdHJpbmcuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIHBsYXRmb3JtLm9zXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgT1Mgc3RyaW5nLlxuICAgICAgICovXG4gICAgICAndG9TdHJpbmcnOiBmdW5jdGlvbigpIHsgcmV0dXJuICdudWxsJzsgfVxuICAgIH07XG5cbiAgICBwbGF0Zm9ybS5wYXJzZSA9IHBhcnNlO1xuICAgIHBsYXRmb3JtLnRvU3RyaW5nID0gdG9TdHJpbmdQbGF0Zm9ybTtcblxuICAgIGlmIChwbGF0Zm9ybS52ZXJzaW9uKSB7XG4gICAgICBkZXNjcmlwdGlvbi51bnNoaWZ0KHZlcnNpb24pO1xuICAgIH1cbiAgICBpZiAocGxhdGZvcm0ubmFtZSkge1xuICAgICAgZGVzY3JpcHRpb24udW5zaGlmdChuYW1lKTtcbiAgICB9XG4gICAgaWYgKG9zICYmIG5hbWUgJiYgIShvcyA9PSBTdHJpbmcob3MpLnNwbGl0KCcgJylbMF0gJiYgKG9zID09IG5hbWUuc3BsaXQoJyAnKVswXSB8fCBwcm9kdWN0KSkpIHtcbiAgICAgIGRlc2NyaXB0aW9uLnB1c2gocHJvZHVjdCA/ICcoJyArIG9zICsgJyknIDogJ29uICcgKyBvcyk7XG4gICAgfVxuICAgIGlmIChkZXNjcmlwdGlvbi5sZW5ndGgpIHtcbiAgICAgIHBsYXRmb3JtLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uam9pbignICcpO1xuICAgIH1cbiAgICByZXR1cm4gcGxhdGZvcm07XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvLyBleHBvcnQgcGxhdGZvcm1cbiAgLy8gc29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3IgY29uZGl0aW9uIHBhdHRlcm5zIGxpa2UgdGhlIGZvbGxvd2luZzpcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gZGVmaW5lIGFzIGFuIGFub255bW91cyBtb2R1bGUgc28sIHRocm91Z2ggcGF0aCBtYXBwaW5nLCBpdCBjYW4gYmUgYWxpYXNlZFxuICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwYXJzZSgpO1xuICAgIH0pO1xuICB9XG4gIC8vIGNoZWNrIGZvciBgZXhwb3J0c2AgYWZ0ZXIgYGRlZmluZWAgaW4gY2FzZSBhIGJ1aWxkIG9wdGltaXplciBhZGRzIGFuIGBleHBvcnRzYCBvYmplY3RcbiAgZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuICAgIC8vIGluIE5hcndoYWwsIE5vZGUuanMsIFJoaW5vIC1yZXF1aXJlLCBvciBSaW5nb0pTXG4gICAgZm9yT3duKHBhcnNlKCksIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIGZyZWVFeHBvcnRzW2tleV0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgfVxuICAvLyBpbiBhIGJyb3dzZXIgb3IgUmhpbm9cbiAgZWxzZSB7XG4gICAgcm9vdC5wbGF0Zm9ybSA9IHBhcnNlKCk7XG4gIH1cbn0uY2FsbCh0aGlzKSk7XG4iXX0=
