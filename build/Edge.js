'use strict';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9FZGdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0lBRVAsSUFBSTtBQUNHLFdBRFAsSUFBSSxDQUNJLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRTswQkFEN0MsSUFBSTs7QUFFTixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUN6QixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztHQUNoQzs7ZUFORyxJQUFJOztXQVlKLGNBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRTtBQUNaLFNBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoQixTQUFHLENBQUMsV0FBVyxHQUFHLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ3hELFNBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9ELFNBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9ELFNBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNiLFNBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNqQjs7O1NBWFUsZUFBRztBQUNaLGFBQU8sQ0FBQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUEsQUFBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN4Rzs7O1NBVkcsSUFBSTs7O0FBc0JWLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDIiwiZmlsZSI6InNyYy9FZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBFZGdlIHtcbiAgY29uc3RydWN0b3Iobm9kZTEsIG5vZGUyLCBkaXN0YW5jZSwgbWluRGlzdGFuY2UpIHtcbiAgICB0aGlzLm5vZGUxID0gbm9kZTE7XG4gICAgdGhpcy5ub2RlMiA9IG5vZGUyO1xuICAgIHRoaXMuZGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICB0aGlzLm1pbkRpc3RhbmNlID0gbWluRGlzdGFuY2U7XG4gIH1cblxuICBnZXQgb3BhY2l0eSgpIHtcbiAgICByZXR1cm4gMiAqICgxLjIgLSB0aGlzLmRpc3RhbmNlIC8gdGhpcy5taW5EaXN0YW5jZSkgKiBNYXRoLm1heCh0aGlzLm5vZGUxLm9wYWNpdHksIHRoaXMubm9kZTIub3BhY2l0eSk7XG4gIH1cblxuICBkcmF3KGN0eCwgZHQpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIFwiICsgdGhpcy5vcGFjaXR5ICsgXCIpXCI7XG4gICAgY3R4Lm1vdmVUbyh0aGlzLm5vZGUxLmNvb3JkaW5hdGVzLngsIHRoaXMubm9kZTEuY29vcmRpbmF0ZXMueSk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLm5vZGUyLmNvb3JkaW5hdGVzLngsIHRoaXMubm9kZTIuY29vcmRpbmF0ZXMueSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkZ2U7Il19