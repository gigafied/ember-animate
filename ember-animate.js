(function () {

	var get = Ember.get,
		set = Ember.set,
		run = function (fn) {
			if (typeof fn === 'function') {
				return fn();
			}
		};

	Ember.View.reopen({

		isAnimatingIn : false,
		isAnimatingOut : false,

		_afterRender : function () {
			this.willAnimateIn():
			this.set('isAnimatingIn', true);
			this.animateIn(function () {
				this.set('isAnimatingIn', false);
				this.didAnimateIn();
			});
		},

		didInsertElement : function () {
			Ember.run.scheduleOnce('afterRender', this, this._afterRender);
			return this._super();
		},

		willAnimateIn : Ember.K,
		willAnimateOut : Ember.K,
		didAnimateIn : Ember.K,
		didAnimateOut : Ember.K,

		animateIn : function (done) {
			run(done);
		},

		animateOut : function (done) {
			run(done);
		},

		destroy : function (done) {

			this.willAnimateOut();
			this.set('isAnimatingOut', true);
			this.animateOut(function () {
				this.set('isAnimatingOut', false);
				this.didAnimateOut();
				_super();
				run(done);
			});

			return this;
		}
	});

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

			var newView,
				oldView,
				removeOldView;

			oldView = this.get('activeView');
			newView = this.get('currentView');

			this.set('newView', newView);

			removeOldView = function () {

				if (oldView.get('isAnimatingOut')) {
					return;
				}

				if (oldView.get('isAnimatingIn')) {
					oldView.addObserver('isAnimatingIn', this, '_currentViewDidChange');
					return;
				}

				oldView.removeObserver('isAnimatingIn', this, '_currentViewDidChange');
				oldView.destroy(this._pushNewView);
			};

			if (oldView) {
				return removeOldView();
			}

			this._pushNewView();
		}),

		_pushNewView : function () {
			var newView = this.get('newView');
			this.pushObject(newView);
			this.set("activeView", newView);
		}
	});

})();