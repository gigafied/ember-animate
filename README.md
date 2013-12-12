## ember-animate

#### FEATURES

- Back button support
- Two different hooks for animations (in and out)
- No special `{{outlet}}` needed
- No extra methods to call
- Easy to plugin to existing Ember Application without major refactor

<hr>

Ember Animate let's you easily add complex animations and transitions to Ember Views.

It works by changing how Ember interacts with the DOM on view changes. Instead of just removing the old view and adding the new view. It animates the old view out, then removes it, then adds the new view and animates it in.

#### Getting Started

	$ bower install ember-animate
	
or you can download [ember-animate.js](https://raw.github.com/gigafied/ember-aniamte/master/ember-animate.js) and save it to your project folder.

##### Include the JavaScript File 

```html
<!doctype html>
<html>
<head>
...
</head>
<body>
	...	
    <script src="/vendor/jquery.js"></script>
    <script src="/vendor/handlebars.js"></script>
    <script src="/vendor/ember.js"></script>
    <script src="/vendor/ember-animate.js"></script>
    <!-- your js here -->
</body>
</html>
`````

##### Create a View

````js
App.ExampleView = Ember.View.extend({

	animations : {

		animateIn : {
			duration : 500,
			easing : "cubic-bezier(0.525, 0.085, 0.255, 1.030)",
			delay : 0,
			properties : {
				opacity : 1
			}
		},

		animateOut : {
			duration : 500,
			easing : "cubic-bezier(0.525, 0.085, 0.255, 1.030)",
			delay : 0,
			properties : {
				opacity : 0
			}
		},
	},

	prep : function (done) {
		this.$().css("opacity", 0);
		done();
	}
}
````

Using the `animations` property you can define an `animateIn` and `animateOut` on all Ember Views.

The `prep()` method lets you set CSS properties before the view actually gets rendered. Use this to set the starting point for your `animationIn` and to avoid screen flicker.

You can also chain animations together. Let's say you wanted to fade an element in, then after the fade, you want to animate the height:

````js
animateIn : [
	{
		duration : 500,
		easing : "cubic-bezier(0.525, 0.085, 0.255, 1.030)",
		delay : 100,
		properties : {
			opacity : 1
		}
	},
	{
		duration : 500,
		easing : "cubic-bezier(0.525, 0.085, 0.255, 1.030)",
		delay : 0,
		properties : {
			height : 500
		}
	}
]
````

This will run the first animation, then after 600 (500 duration + 100 delay) milliseconds run the second one.

If you prefer to keep your animation logic purely in CSS, Ember Animate takes care of that for you too (with chaining support):

````js
animateIn : [
	["animate-in1", 1000],
	["animate-in2", 500],
	["animate-in3", 250]
]
````

This will add an `animate-in1` class to your view. After 1000ms, it will remove `animate-in1` and add `animate-in2` and so on.

#### Programmatic Animations

If you want to manage your animations purely in code, you can do that too:

````js
App.ExampleView = Ember.View.extend({


	prep : function (done) {
		this.$().css("opacity", 0);
		done();
	},

	animateIn : function (done) {
		this.$().fadeTo(500, 1, done);
	},

	animateOut : function (done) {
		this.$().fadeTo(500, 0, done);
	},

	animateInComplete : function () {

	},

	animateOutComplete : function () {

	}
}
````

By defining `animateIn` and `animateOut` methods we can do whatever we want programatically instead of using the `animations` property. Just be sure to call the `done()` callback once the animation is done.

There are also hooks for `animateInComplete` and `animateOutComplete` that you can use. You can use these two hooks if you use the `animations` property or the `animateIn` and `animateOut` hooks.


#### How do I animate my Routes?

You don't! You have to create a View class whenever you want to use animations. 

Aside from it being hard to implement cleanly as part of Routes, animation logic belongs in the View. Anything related to how a View should behave visually and how a user interacts with a View belongs in a View class. (DISCLAIMER : My personal opinion.)


#### TODO

- Unit tests
- More documentation
- Animation sequence support (in-then-out, out-and-in)
