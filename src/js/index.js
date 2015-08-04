/**
 * @fileoverview Sébastien Robaszkiewicz's personal webpage
 * @author <a href='mailto:hello@robi.me'>Sébastien Robaszkiewicz</a>
 */

'use strict';

const input = require('motion-input');
const animation = require('./animation');

(function() {
  document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
  });

  animation.start();

  input.init('orientationAlt')
    .then((modules) => {
      const orientation = modules[0];

      if (orientation.isValid) {
        input.addListener('orientationAlt', (val) => {
          animation.onOrientation(val[1], val[2]);
        });
      }
    });
}());