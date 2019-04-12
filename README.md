# Spective
This library provides a simple way to create 3d graphics in your browser. Resource management, animations and basic lighting are all handled automatically. It only needs to be told where the resources are that define each object and where to position them at any given time.

## Example
```js
// create a scene
var scene = spective({
	position: [0, 0.4, 3]
});

// update the camera
scene({
	angleY: Math.PI / 4,
	positionY: 0.25
});

// create an object
var table = scene('table.obj', 'wood.jpg', {
	angleY: Math.PI / 4
});

// update the object
table({
	angleY: Math.PI * 3 / 4
});

// create a linked object
// properties from the object it links to will be applied before applying its own
var chair = table('chair.obj', '#fff', {
	offsetX: -1
});

// remove an object
table();

// remove all objects that use a specific image or color and a specific geometry
scene('table.obj', 'wood.jpg'); // in entire scene
table('chair.obj', '#fff'); // only ones linked to a specific object

// remove all objects that use a specific geometry
scene('chair.obj'); // in entire scene
table('chair.obj'); // only ones linked to a specific object

// pause or resume the scene
// resuming the scene will recalculate the perspective in case the canvas has been resized
scene();
```

## Animations
```js
// set new properties instantly
scene({
	angleY: 0.5
});

// animate to new properties over a set amount of time in milliseconds
scene({
	angleY: 1.2
}, 1500);

// adjust properties over a set amount of time continuously
// the loop ends as soon as no time is returned by the input function
scene({
	angleY: 1
}, function (iteration) {
	return 1000;
});

// the above animations can be chained together
scene({
	angleY: 0.5 // instantly set an angle
}, {
	angleY: 1.2 // animate to another angle
}, 1500, {
	positionX: 1 // then animate to a new position
}, 500, {
	angleY: 1 // then animate a shift in its angle 3 times, getting slower each time
}, function (iteration) {
	return ((iteration + 1) % 4) * 1000;	
});
```

## Scene
Each scene is made up of a single light and camera. If you provide your own HTML canvas element as the first parameter, it will be used as the viewport. Otherwise one will be created automatically that fills the entire screen.

## Objects
Wavefront OBJ files are used to load in the geometries for all the objects in the scene. Each geometry can be wrapped with either an image or hexadecimal color. You can choose to leave out either the OBJ file or image when creating an object, but not both. If no OBJ file is provided, it will default to '1 1 1' which creates a basic cube (see below). If no image or color is provided, it will default to '#fff'. Objects created from the same geometries will share those resources without loading them multiple times. Images will also be shared between objects if they are created under the same geometry.

### Server
OBJ files can't be loaded into code that runs from a standalone file. If you want to experiment with OBJ files and you have Node.js installed, you can download the prototype zip folder here, https://github.com/codetriplett/spective/raw/master/dist/prototype.zip. Extract the folder, open a terminal at its location and run "node index.js" to start the server. Look at the preview folder of this project for an example of how to use the server, https://github.com/codetriplett/spective/tree/master/preview.

### Primatives
Primatives can be created without needing an OBJ file and server running. Simply pass a space delimited string of between 1 and 3 numbers to define the properties.
```js
var scene = spective({});

// create a cube
// the numbers define the lengths in the x, y and z directions
// the image will repeat for lengths greater than 1
scene('1 2 3', 'image.png', {});

// create a flat plane that repeats the texture 10 times in the horizontal directions
scene('10 0 10', 'image.png', {});

// if no geometry is defined, it will default to a cube with all equal lengths ('1 1 1')
scene('#fff', {});

// create a cylinder or cone
// the first number defines the number of points at its base
// the second number defines the height
// the image will wrap around the circumference and will repeat vertically if the height is greater than 1
scene('16 1', 'image.jpg', {}); // create a cylinder
scene('16.9 1', 'image.jpg', {}); // create a cylinder with sharp edges
scene('-16 1', 'image.jpg', {}); // create a cone
scene('-16.9 1', 'image.jpg', {}); // create a cone with sharp edges

// create a sphere or skybox
// the number defines the number of rings between its poles
scene('16', 'image.jpg', {}); // create a sphere
scnee('16.9', 'image.jpg', {}); // create a sphere with sharp edges
scene('-16', 'image.jpg', {}); // create a skybox hemisphere
```

## Properties
The following properties are used by the camera and objects to affect their placement and orientation within the scene. Each one can be defined as an array to define all three dimensions at once or can be followed by an X, Y or Z to set a single dimension (e.g. angleY). X runs left to right, Y runs bottom to top and Z runs far to near.

### scale
Its size along each axis relative to its original size. Can be defined by a single number instead of an array to set the same value to all dimensions.

### position
Its placement within the scene.

### angle
Its rotation around each axis. Rotations occur in the order Y, X then Z.

### offset
A shift in its placement. This is useful for creating orbits.

### heading
Its rotation in the orbit created by the offset. Rotations occur in the order Y, X then Z.

## Meters
Meters help manage the state and timing of events in the scene. They allow timed updates between 0 and 1 with functions that allow you to define the speed of each update and how to update the meter when the end is reached. The functions share the same context so properties can be shared between them.

```js
// create a meter
// only the first function is required
// the initial item will default to 0
var meter = spective(function (change, item, branches) {
	// this is called when the meter about to update
	// change: the amount of the update that will occur before it ends or 0 or 1 is reached
	// item: the item at the end of the meter that the update is heading towards
	// branches: the number of other items that branch out from the upcoming item

	// if a number is returned, it will be set as the duration for this update
	// otherwise, the meter will not update
	return 1000;
}, function (item, branch) {
	// this is called whenever the meter reaches 0 or 1 and is used to update the items at each end
	// item: the next item beyond the one that was reached
	// branch: an alternative item that can be chosen (more than one can be provided)

	// if an item is returned, it will be set as the new item for this direction
	// the location in the meter and previous item will be set to the opposite end
	// if the item doesn't match one of the options provided, it will create a custom path
	return newItem;
}, function (item, previous) {
	// called for each item in the array that populates the meter
	// item: the item from the array
	// previous: the item that was transformed before this one

	// if an item is returned, it will be passed to the function above this one when it is reached
	// if nothing is returned, it will be removed
	return item;
});

meter([
	'first',
	'second',
	[ // first branch of second item
		'alternate',
		'other'
	], [ // second branch of second item
		'alternate',
		6 // links to sixth item ('fourth' along main path in this case)
	]
	'third', // the next item after 'second' in the main path
	'fourth'
], 3); // sets the initial item to use in the meter (defaults to 0)

meter(0.5); // fill meter by a set amount
meter(-0.5); // drain meter by a set amount
meter(0); // continuously update meter in the direction of the last update
meter(-0); // continuously update meter in the opposite direction of the last update
meter(); // end previous update
```

## Buttons
Buttons make it easy to interact with the scene using your keyboard.

```js
// the first value defines the key (e.g. 'space', 'a', 'A', '1', etc)
spective('space', function (stage, iteration) {
	// called whenever the state of the key has changed
	// stage: represents the number of times the stage has changed without being resolved (negative if key is currently up)
	// iteration: the number of times this function has been called before

	// if a number is returned, this function will be called again after that amount of time (in milliseconds)
	// if two or more functions are provided, it will call the next one in line instead of calling this one again
	return 200;
});

// an example
spective('space', function (stage, iteration) {
	switch (stage) {
		case 2:
			// key is quickly released and then held again (slip)
			return;
		case -2:
			// key is quickly held and then released again (tap)
			return;
	}

	if (!iteration) {
		// delay the resolution of the action
		return 200;
	} else if (stage > 0) {
		// key is held
	} else {
		// key is released
	}
});
```
