## ember-animate

#### FEATURES

- Back button support
- Two different hooks for animations (in and out)
- No special `{{outlet}}` needed
- No extra methods to call
- Easy to plugin to existing Ember Application without major refactor

<hr>

#### DEMO

I use Ember Animate on my <a href="http://www.gigafied.com/" target="_blank">personal site</a> to transition between pages. Click the "about", "work" and "contact" links to see it in action.

<hr>

Ember Animate let's you easily add complex animations to Ember Views.

It works by changing how Ember interacts with the DOM on view changes. Instead of just removing the old view and adding the new view. It animates the old view out, then removes it, then adds the new view and animates it in.

#### Getting Started

	$ bower install ember-animate

or you can download [ember-animate.js](https://raw.github.com/gigafied/ember-animate/master/ember-animate.js) and save it to your project folder.

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

	willAnimateIn : function () {
		this.$().css("opacity", 0);
	},

	animateIn : function (done) {
		this.$().fadeTo(500, 1, done);
	},

	animateOut : function (done) {
		this.$().fadeTo(500, 0, done);
	}
}
````

That's it! Super easy!

Ember Animate exposes 6 hooks for you:

- `willAnimateIn()`
The `willAnimateIn()` method lets you set CSS properties before the view actually gets rendered. Use this to set the starting point for your `animationIn` and to avoid screen flicker.

- `willAnimateOut()`
This method gets called before `animateOut()` gets called.

- `didAnimateIn()`
This method gets called after `animateIn()` completes.

- `didAnimateOut()`
This method gets called after `animateOut()` completes.

- `animateIn(callback)`
Use this hook to animate in. Just make sure to call the callback function once your animation completes.

- `animateOut(callback)`
Use this hook to animate out. Just make sure to call the callback function once your animation completes.


IMPORTANT NOTE : When using Ember Animate, don't implement custom `destroy()` methods. Any teardown logic for views should be moved to didAnimateOut. The reason for this is the animation out is triggered by the `destroy()` method (because this isn't an offical part of Ember, it's the only way to ensure all views get their animations triggered when being removed from the DOM).

#### How do I animate my Routes?

You don't! You have to create a View class whenever you want to use animations.

Aside from it being hard to implement cleanly as part of Routes, animation logic belongs in the View. Anything related to how a View should behave visually and how a user interacts with a View belongs in a View class. (DISCLAIMER : My personal opinion.)


#### TODO

- Unit tests
- More documentation
- Animation sequence support (in-then-out, out-and-in)
