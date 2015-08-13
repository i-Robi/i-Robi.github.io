/**
 * @file Edge class.
 * @author Sébastien Robaszkiewicz [hello@robi.me]
 */

'use strict';

class Edge {
  constructor(node1, node2, distance, minDistance) {
    this.distance = distance;
    this.minDistance = minDistance;
    this.node1 = node1;
    this.node2 = node2;
  }

  get opacity() {
    return 2 * (1.2 - this.distance / this.minDistance) * Math.max(this.node1.opacity, this.node2.opacity);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0, 0, 0, " + this.opacity + ")";
    ctx.moveTo(this.node1.coordinates.x, this.node1.coordinates.y);
    ctx.lineTo(this.node2.coordinates.x, this.node2.coordinates.y);
    ctx.stroke();
    ctx.closePath();
  }
}

module.exports = Edge;
