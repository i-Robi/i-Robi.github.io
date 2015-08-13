/**
 * @file World base class.
 * @author Sébastien Robaszkiewicz [hello@robi.me]
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var gameloop = require('./gameloop');

var World = (function () {
  function World() {
    _classCallCheck(this, World);

    this.config = null;
  }

  _createClass(World, [{
    key: 'update',
    value: function update(dt) {
      // Update the world state
    }
  }, {
    key: 'render',
    value: function render(dt) {
      // Render the world
    }
  }, {
    key: 'start',
    value: function start(worldConfig, gameloopConfig) {
      this.config = worldConfig;
      gameloop.start(gameloopConfig);
    }
  }]);

  return World;
})();

module.exports = World;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9qcy9Xb3JsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUtBLFlBQVksQ0FBQTs7Ozs7O0FBRVosSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztJQUVqQyxLQUFLO0FBQ0UsV0FEUCxLQUFLLEdBQ0s7MEJBRFYsS0FBSzs7QUFFUCxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztHQUNwQjs7ZUFIRyxLQUFLOztXQUtILGdCQUFDLEVBQUUsRUFBRTs7S0FFVjs7O1dBRUssZ0JBQUMsRUFBRSxFQUFFOztLQUVWOzs7V0FFSSxlQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUU7QUFDakMsVUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7QUFDMUIsY0FBUSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNoQzs7O1NBaEJHLEtBQUs7OztBQW1CWCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyIsImZpbGUiOiJzcmMvanMvV29ybGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIFdvcmxkIGJhc2UgY2xhc3MuXG4gKiBAYXV0aG9yIFPDqWJhc3RpZW4gUm9iYXN6a2lld2ljeiBbaGVsbG9Acm9iaS5tZV1cbiAqL1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgZ2FtZWxvb3AgPSByZXF1aXJlKCcuL2dhbWVsb29wJyk7XG5cbmNsYXNzIFdvcmxkIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25maWcgPSBudWxsO1xuICB9XG5cbiAgdXBkYXRlKGR0KSB7XG4gICAgLy8gVXBkYXRlIHRoZSB3b3JsZCBzdGF0ZVxuICB9XG5cbiAgcmVuZGVyKGR0KSB7XG4gICAgLy8gUmVuZGVyIHRoZSB3b3JsZFxuICB9XG5cbiAgc3RhcnQod29ybGRDb25maWcsIGdhbWVsb29wQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSB3b3JsZENvbmZpZztcbiAgICBnYW1lbG9vcC5zdGFydChnYW1lbG9vcENvbmZpZyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZDtcbiJdfQ==