(function () {

	var run,
		destroying$;

	var run = function (fn) {
		if (fn && typeof fn === 'function') {
			return fn();
		}
	};

	Ember.View.reopen({

		isAnimatingIn : false,
		isAnimatingOut : false,
		hasAnimatedIn : false,
		hasAnimatedOut : false,

		_animateInCallbacks : null,
		_animateOutCallbacks : null,

		_afterRender : function () {

			var self = this;

			this.$el = this.$();

			if (!self.isDestroyed) {

				self.willAnimateIn();
				self.isAnimatingIn = true;
				self.hasAnimatedIn = false;

				Ember.run.next(function () {

					if (!self.isDestroyed) {

						self.animateIn(function () {

							var i;

							self.isAnimatingIn = false;
							self.hasAnimatedIn = true;
							self.didAnimateIn();

							if (self._animateInCallbacks && self._animateInCallbacks.length) {
								for (i = 0; i < self._animateInCallbacks.length; i ++) {
									run(self._animateInCallbacks[i]);
								}
							}

							self._animateInCallbacks = null;

						});
					}
				});
			}
		},

		willInsertElement : function () {
			Ember.run.scheduleOnce('afterRender', this, this._afterRender);
			return this._super();
		},

		willAnimateIn : Ember.K,
		willAnimateOut : Ember.K,
		didAnimateIn : Ember.K,
		didAnimateOut : Ember.K,

		animateIn : run,
		animateOut : run,

		onAnimateIn : function (callback) {

			this._animateInCallbacks = this._animateInCallbacks || [];

			if (typeof callback === 'function') {
				this._animateInCallbacks.push(callback);
			}
		},

		onAnimateOut : function (callback) {

			this._animateOutCallbacks = this._animateOutCallbacks || [];

			if (typeof callback === 'function') {
				this._animateOutCallbacks.push(callback);
			}
		},

		destroy : function (done) {

			var self = this,
				_super = Ember.$.proxy(self._super, self);

			this.onAnimateOut(done);

			if (self.isAnimatingOut) {
				return;
			}

			if (!self.$el || self.isDestroyed) {

				if (this._animateOutCallbacks && this._animateOutCallbacks.length) {
					for (i = 0; i < this._animateOutCallbacks.length; i ++) {
						run(this._animateOutCallbacks[i]);
					}
				}

				this._animateOutCallbacks = null;

				return _super();
			}

			if (!self.$()) {
				self.$ = function () {
					return self.$el;
				}
			}

			self.willAnimateOut();
			self.isAnimatingOut = true;

			self.animateOut(function () {

				self.isAnimatingOut = false;
				self.hasAnimatedOut = true;

				self.didAnimateOut();

				if (self._animateOutCallbacks && self._animateOutCallbacks.length) {
					for (i = 0; i < self._animateOutCallbacks.length; i ++) {
						run(self._animateOutCallbacks[i]);
					}
				}

				_super();

				delete self.$;
				delete self.$el;
			});

			return self;
		}
	});

	Ember.ContainerView.reopen({

		currentView : null,
		activeView : null,
		newView : null,
		nextView : null,

		animationSequence : 'sync', // sync, async, reverse

		init : function () {

			var currentView;

			this._super();

			if (currentView = this.get('currentView')) {
				this.set('activeView', currentView);
			}
		},

		_currentViewWillChange : Ember.K,

		_currentViewDidChange : Ember.observer('currentView', function () {

			var self,
				newView,
				oldView,
				asyncCount;

			self = this;
			oldView = this.get('activeView');
			newView = this.get('currentView');

			this.set('newView', newView);

			function pushView (view) {

				if (view ) {
					self.pushObject(view);
				}

				self.set('activeView', view);
			}

			function removeView (view) {

				if (view.isAnimatingOut) {
					return;
				}

				if (!view.hasAnimatedIn) {
					view.onAnimateIn(view.destroy.call(view));
					return;
				}

				view.destroy();
			};

			if (oldView) {

				// reverse
				if (this.animationSequence === 'reverse') {

					newView.onAnimateIn(function () {
						removeView(oldView);
					});

					pushView(newView);
				}

				// async
				else if (this.animationSequence === 'async') {
					removeView(oldView);
					pushView(newView);
				}

				// sync
				else {

					oldView.onAnimateOut(function () {
						pushView(self.get('currentView'));
					});

					removeView(oldView);
				}
			}

			else {
				pushView(newView);
			}
		})

	});

})();
