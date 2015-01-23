/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-animate',

  included: function(app) {
    this._super.included(app);
    this.app.import(app.bowerDirectory + '/ember-animate/ember-animate.js');
  }
};
