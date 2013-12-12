(function () {

	Ember.View.reopen({

		isPrepped : false,
		isAnimating : false,
		currentAnimationClass : "",

		_inCB : null,
		_outCB : null,
		_prepCB : null,

		classNameBindings: ['isAnimating:ember-animate',"currentAnimationClass"],

		animations : {

			animateIn : {
				className : null,
				properties : {
				},
				duration : 0,
				easing : null,
				delay : 0
			},

			animateOut : {
				className : null,
				properties : {},
				duration : 0,
				easing : null,
				delay : 0
			}
		},

		_runAnimation : function (animation, done) {

			var i,
				self = this;

			if (typeof animation === "string") {
				return this._runAnimation(this.animations[animation], done);
			}

			if (Ember.isArray(animation)) {

				if (isNaN(animation[1])) {
					animation = animation.concat();

					function next () {
						var a = animation.shift();
						return self._runAnimation(a, animation.length ? next : done);
					}

					return next();
				}

				else {
					animation = {
						className : animation[1],
						duration : animation[1],
						easing : null
					}
				}
			}

			Ember.assert('Invalidate animation', animation && typeof animation === "object");

			if (animation.className) {
				this.set("currentAnimationClass", animation.className);
			}

			this.$().css(this._getAnimationCSSObject(animation));


			if (typeof done === "function") {
				if (animation.duration) {
					Ember.run.later(this, function () {
						this.$().css(this._getAnimationCSSObject({duration : "", easing : "", delay : ""}));
						this.set("currentAnimationClass", "");
						done();
					}, animation.duration + (animation.delay || 0));
				}
				else {
					done();
				}
			}
		},

		_vendorPrefix : function () {

			var p,
				r = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
				s = document.getElementsByTagName('script')[0],
				set = Ember.$.proxy(function (p) {
					p = ["", p.toLowerCase(), ""].join("-");
					this._vendorPrefix = function () {
						return p;
					}
					return p;
				}, this);

			for(var prop in s.style) {
				if(r.test(prop)) {
					return set(prop.match(r)[0]);
				}
			}

			if('WebkitOpacity' in s.style) {
				return set('Webkit');
			}

			if('KhtmlOpacity' in s.style) {
				return set('Khtml');
			}

			return set("");
		},

		_getAnimationCSSObject : function (obj) {

			var o = {},
				p,
				props = [],
				prefix = this._vendorPrefix(),
				propertyMap;

			propertyMap = {
				"duration" : "transition-duration",
				"delay" : "transition-delay",
				"easing" : "transition-timing-function"
			};

			if (!obj) {
				return {};
			}

			for (p in (obj.properties || {})) {
				props.push(p);
				o[p] = obj.properties[p];
			}

			if (!props.length) {
				props.push("all");
			}

			if (obj.easing !== null && obj.easing !== "none") {

				o[prefix + "transition-property"] = props.join(",");

				for (p in propertyMap) {
					if (obj[p]) {
						o[prefix + propertyMap[p]] = obj[p] + (p === "duration" || p === "delay" ? "ms" : "");
					}
				}
			}

			return o;
		},

		_prep : function () {
			this.set("isPrepped", false);
			this.prep(Ember.$.proxy(this._prepComplete, this));
		},

		_prepComplete : function () {
			this.set("isPrepped", true);
			this.prepComplete();
			if (typeof this._prepCB === "function") {
				this._prepCB();
				this._prepCB = null;
			}
		},

		_animateIn : function (cb) {
			if (!this.get("isPrepped")) {
				this._prepCB = Ember.$.proxy(function () {
					this._animateIn(cb);
				}, this);
				return;
			}
			this._inCB = cb;

			this.set("isAnimating", true);
			this.animateIn(Ember.$.proxy(this._animateInComplete, this));
		},

		_animateInComplete : function () {
			this.set("isAnimating", false);
			this.animateInComplete();
			if (typeof this._inCB === "function") {
				this._inCB();
				this._inCB = null;
			}
		},

		_animateOut : function (cb) {
			this._outCB = cb;
			this.set("isAnimating", true);
			this.animateOut(Ember.$.proxy(this._animateOutComplete, this));
		},

		_animateOutComplete : function () {
			this.set("isAnimating", false);
			this.animateOutComplete();
			this.destroy();
			if (typeof this._outCB === "function") {
				this._outCB();
				this._outCB = null;
			}
		},

		didInsertElement : function () {
			Ember.run.schedule('afterRender', this, this._prep);
		},

		prep : function (done) {
			done();
		},

		prepComplete : function () {

		},

		animateIn : function (done) {
			this._runAnimation("animateIn", done);
		},

		animateInComplete : function () {

		},

		animateOut : function (done) {
			this._runAnimation("animateOut", done);
		},

		animateOutComplete : function () {

		}

	});

	Ember.ContainerView.reopen({

		_oldView : null,

		init : function () {
			this._super();

			var currentView = this.get("currentView");

			if (currentView) {
				currentView._animateIn();
			}
		},	

		_currentViewWillChange : Ember.beforeObserver('currentView', function () {
			this._oldView = this.get("currentView");
		}),

		_currentViewDidChange : Ember.observer('currentView', function () {

			var currentView = this.get("currentView");

			if (currentView) {
				Ember.assert("You tried to set a current view that already has a parent. Make sure you don't have multiple outlets in the same view.", !Ember.get(currentView, '_parentView'));
				

				if (this._oldView) {

					this._oldView._animateOut(Ember.$.proxy(function () {
						this.pushObject(currentView);
						currentView._animateIn();
					}, this));
					return;
				}

				currentView._animateIn();
			}
	 
		})
	});

})();