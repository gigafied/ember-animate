## ember-animate

Ember Animate let's you easily add complex animations to Ember Views.

It works by changing how Ember interacts with the DOM on view changes. Instead of just removing the old view and adding the new view. It animates the old view out, then removes it, then adds the new view and animates it in.

#### FEATURES
_____________________

- Back button support
- Two different hooks for animations (in and out)
- No special `{{outlet}}` needed
- No extra methods to call
- Easy to plugin to existing Ember Application without major refactor
- Animation sequences!

_____________________
#### Getting Started

Download [here](https://raw.github.com/gigafied/ember-animate/master/ember-animate.js) or

	$ bower install ember-animate

```html
<script src="/vendor/jquery.js"></script>
<script src="/vendor/handlebars.js"></script>
<script src="/vendor/ember.js"></script>
<script src="/vendor/ember-animate.js"></script>
<!-- your js here -->
`````

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

####Ember Animate exposes 6 different methods for you:

#####`willAnimateIn()`

Called before `animateIn()`. Lets you set CSS properties before the view actually gets rendered. Use this to set the starting point for your `animateIn()`.

You can get accurate calculated properties here (i.e. width and height).

#####`willAnimateOut()`

Called before `animateOut()` gets called.

#####`didAnimateIn()`

Called after `animateIn()` completes.

#####`didAnimateOut()`

Called after `animateOut()` completes.

#####`animateIn(callback)`

Use this hook to animate in. Just make sure to call the callback function once your animation completes.

#####`animateOut(callback)`

Use this hook to animate out. Just make sure to call the callback function once your animation completes.

####Animation Sequences

By default, outlets and ContainerViews use the 'sync' animationSequence. This is out-then-in and is the most common use case. However, you can have your out and in animations trigger at the same time if you want by using 'async'. You can also have your views animate in then out by using 'reverse'.

	{{outlet animationSequence="async"}}
	{{outlet animationSequence="reverse"}}
or

	Ember.ContainerView.extend({animationSequence : 'async'});
	Ember.ContainerView.extend({animationSequence : 'reverse'});

_______________

#####IMPORTANT NOTE : When using Ember Animate, don't implement custom `destroy()` methods. Any teardown logic for views should be moved to `didAnimateOut()`. The reason for this is the animation out is triggered by the `destroy()` method (because this isn't an offical part of Ember, it's the only way to ensure all views get their animations triggered when being removed from the DOM).
Also if you implement `willInsertElement()` make sure you call `this._super()`. However, in almost all instances you could just use `willAnimateIn()` as a hook instead.
_______________

#### How do I animate my Routes?

You don't! You have to create a View class whenever you want to use animations.

Aside from it being hard to implement cleanly as part of Routes, animation logic belongs in the View. Anything related to how a View should behave visually and how a user interacts with a View belongs in a View class. (DISCLAIMER : My personal opinion.)

#### DEMO

I use Ember Animate on my <a href="http://www.gigafied.com/" target="_blank">personal site</a> to transition between pages. Click the "about", "work" and "contact" links to see it in action.

<hr>

#### TODO

- Unit tests
- More documentation
- Animation sequence support (in-then-out, out-and-in)
