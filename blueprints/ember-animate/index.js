module.exports = {
  description: 'Adds the ember-animate bower package to your Ember-CLI project.',
  
  normalizeEntityName: function() {
    // allows us to run ember -g ember-animate and not blow up
    // because ember cli normally expects the format
    // ember generate <entitiyName> <blueprint>
  },
  afterInstall: function() {
    return this.addBowerPackageToProject('ember-animate', '0.3.7');
  }
};
