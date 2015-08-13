/**
 * @file Edge class.
 * @author Sébastien Robaszkiewicz [hello@robi.me]
 */

'use strict';

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var Edge = (function () {
  function Edge(node1, node2, distance, minDistance) {
    _classCallCheck(this, Edge);

    this.distance = distance;
    this.minDistance = minDistance;
    this.node1 = node1;
    this.node2 = node2;
  }

  _createClass(Edge, [{
    key: "draw",
    value: function draw(ctx) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9qcy9FZGdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0EsWUFBWSxDQUFDOzs7Ozs7SUFFUCxJQUFJO0FBQ0csV0FEUCxJQUFJLENBQ0ksS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFOzBCQUQ3QyxJQUFJOztBQUVOLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0dBQ3BCOztlQU5HLElBQUk7O1dBWUosY0FBQyxHQUFHLEVBQUU7QUFDUixTQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsU0FBRyxDQUFDLFdBQVcsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUN4RCxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxTQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDYixTQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDakI7OztTQVhVLGVBQUc7QUFDWixhQUFPLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBLEFBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDeEc7OztTQVZHLElBQUk7OztBQXNCVixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJzcmMvanMvRWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgRWRnZSBjbGFzcy5cbiAqIEBhdXRob3IgU8OpYmFzdGllbiBSb2Jhc3praWV3aWN6IFtoZWxsb0Byb2JpLm1lXVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuY2xhc3MgRWRnZSB7XG4gIGNvbnN0cnVjdG9yKG5vZGUxLCBub2RlMiwgZGlzdGFuY2UsIG1pbkRpc3RhbmNlKSB7XG4gICAgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIHRoaXMubWluRGlzdGFuY2UgPSBtaW5EaXN0YW5jZTtcbiAgICB0aGlzLm5vZGUxID0gbm9kZTE7XG4gICAgdGhpcy5ub2RlMiA9IG5vZGUyO1xuICB9XG5cbiAgZ2V0IG9wYWNpdHkoKSB7XG4gICAgcmV0dXJuIDIgKiAoMS4yIC0gdGhpcy5kaXN0YW5jZSAvIHRoaXMubWluRGlzdGFuY2UpICogTWF0aC5tYXgodGhpcy5ub2RlMS5vcGFjaXR5LCB0aGlzLm5vZGUyLm9wYWNpdHkpO1xuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIFwiICsgdGhpcy5vcGFjaXR5ICsgXCIpXCI7XG4gICAgY3R4Lm1vdmVUbyh0aGlzLm5vZGUxLmNvb3JkaW5hdGVzLngsIHRoaXMubm9kZTEuY29vcmRpbmF0ZXMueSk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLm5vZGUyLmNvb3JkaW5hdGVzLngsIHRoaXMubm9kZTIuY29vcmRpbmF0ZXMueSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkZ2U7XG4iXX0=