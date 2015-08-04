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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9qcy9FZGdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7OztJQUdQLElBQUk7QUFDRyxXQURQLElBQUksQ0FDSSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUU7MEJBRDdDLElBQUk7O0FBRU4sUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsUUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7R0FDaEM7O2VBTkcsSUFBSTs7V0FZSixjQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDWixTQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsU0FBRyxDQUFDLFdBQVcsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUN4RCxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxTQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDYixTQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDakI7OztTQVhVLGVBQUc7QUFDWixhQUFPLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBLEFBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDeEc7OztTQVZHLElBQUk7OztBQXNCVixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJzcmMvanMvRWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8vIGJsYWggYmxcblxuY2xhc3MgRWRnZSB7XG4gIGNvbnN0cnVjdG9yKG5vZGUxLCBub2RlMiwgZGlzdGFuY2UsIG1pbkRpc3RhbmNlKSB7XG4gICAgdGhpcy5ub2RlMSA9IG5vZGUxO1xuICAgIHRoaXMubm9kZTIgPSBub2RlMjtcbiAgICB0aGlzLmRpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgdGhpcy5taW5EaXN0YW5jZSA9IG1pbkRpc3RhbmNlO1xuICB9XG5cbiAgZ2V0IG9wYWNpdHkoKSB7XG4gICAgcmV0dXJuIDIgKiAoMS4yIC0gdGhpcy5kaXN0YW5jZSAvIHRoaXMubWluRGlzdGFuY2UpICogTWF0aC5tYXgodGhpcy5ub2RlMS5vcGFjaXR5LCB0aGlzLm5vZGUyLm9wYWNpdHkpO1xuICB9XG5cbiAgZHJhdyhjdHgsIGR0KSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCBcIiArIHRoaXMub3BhY2l0eSArIFwiKVwiO1xuICAgIGN0eC5tb3ZlVG8odGhpcy5ub2RlMS5jb29yZGluYXRlcy54LCB0aGlzLm5vZGUxLmNvb3JkaW5hdGVzLnkpO1xuICAgIGN0eC5saW5lVG8odGhpcy5ub2RlMi5jb29yZGluYXRlcy54LCB0aGlzLm5vZGUyLmNvb3JkaW5hdGVzLnkpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGdlO1xuIl19