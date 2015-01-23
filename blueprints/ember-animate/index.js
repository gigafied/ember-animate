module.exports = {
  description: 'Adds the ember-animate bower package to your Ember-CLI project.',

  afterInstall: function() {
    return this.addBowerPackageToProject('ember-animate', '0.3.6');
  }
};
