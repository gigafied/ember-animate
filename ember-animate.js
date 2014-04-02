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

		_animateOutCallbacks : null,

		_afterRender : function () {

			var self = this;

			this.$el = this.$();

			if (!self.get('isDestroyed')) {

				self.willAnimateIn();
				self.set('isAnimatingIn', true);

				Ember.run.next(function () {

					if (!self.get('isDestroyed')) {

						self.animateIn(function () {
							self.set('isAnimatingIn', false);
							self.didAnimateIn();
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

		destroy : function (done) {

			if (!this.hasAnimatedOut && this.animateOut !== run && this.$el) {
				this.removedFromDOM = false;
				this.transitionTo('inDOM');
			}

			else if (this.state === 'destroying') {
				run(done);
				done = null;
			}

			this._animateOutCallbacks = this._animateOutCallbacks || [];

			if (typeof done === 'function') {
				this._animateOutCallbacks.push(done);
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

			for (i = 0; i < view._animateOutCallbacks.length; i ++) {
				run(view._animateOutCallbacks[i]);
			}
		};

		if (view.$el) {

			if (!view.get('isAnimatingOut')) {
				view.willAnimateOut();
			}

			view.animateOut(done);
		}

		else {
			done();
		}

		view.set('isAnimatingOut', true);
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

		init : function () {

			var currentView;

			this._super();

			if (currentView = this.get("currentView")) {
				this.set("activeView", currentView);
			}
		},

		_currentViewWillChange : Ember.K,

		_currentViewDidChange : Ember.observer('currentView', function () {

			var self,
				newView,
				oldView,
				removeOldView;

			self = this;
			oldView = this.get('activeView');
			newView = this.get('currentView');

			this.set('newView', newView);

			removeOldView = function () {

				if (oldView.get('isAnimatingOut')) {
					return;
				}

				if (oldView.get('isAnimatingIn')) {
					oldView.addObserver('isAnimatingIn', self, '_currentViewDidChange');
					return;
				}

				oldView.removeObserver('isAnimatingIn', self, '_currentViewDidChange');
				oldView.destroy(function () {
					self._pushNewView.apply(self);
				});
			};

			if (oldView) {
				return removeOldView();
			}

			this._pushNewView();
		}),

		_pushNewView : function () {

			var newView = this.get('newView');

			if (newView) {
				this.pushObject(newView);
			}

			this.set("activeView", newView);
		}
	});

})();