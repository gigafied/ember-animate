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

							if (self._animateInCallbacks) {
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

			var i;

			this.onAnimateOut(done);

			if (!this.hasAnimatedOut && this.animateOut !== run && this.$el) {
				this.removedFromDOM = false;
				this.transitionTo('inDOM');
			}

			else if (this.state === 'destroying') {

				for (i = 0; i < this._animateOutCallbacks.length; i ++) {
					run(this._animateOutCallbacks[i]);
				}

				this._animateOutCallbacks = null;
			}

			return this._super();
		}
	});

	Ember.View.states.hasElement.destroyElement = function (view) {

		var self = this;

		function done () {

			var i;

			view._notifyWillDestroyElement();

			if (view.$el) {
				view.$el.remove();
			}

			view.$el = null;
			view.hasAnimatedOut = true;

			Ember.run.once(Ember.View, 'notifyMutationListeners');

			if (view._animateOutCallbacks != null) {
				for (i = 0; i < view._animateOutCallbacks.length; i ++) {
					run(view._animateOutCallbacks[i]);
				}

				view._animateOutCallbacks = null;
			}
		};

		if (view.$el) {

			if (!view.isAnimatingOut) {
				view.willAnimateOut();
			}

			view.animateOut(done);
		}

		else {
			done();
		}

		view.isAnimatingOut = true;
		view.set('element', null);

		if (view._scheduledInsert) {
			Ember.run.cancel(view._scheduledInsert);
			view._scheduledInsert = null;
		}

		return view;
	};

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
