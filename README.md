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

// remove an asset
scene('table.obj', 'wood.jpg'); // in entire scene
table('chair.obj', '#fff'); // only ones linked to a specific object

// remove a geometry
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
	angle: 0.5
});

// animate to new properties over a set amount of time in milliseconds
scene({
	angleY: 1.2
}, 1500);

// animate a shift in the current properties over a set amount of time in milliseconds and repeat
// the function you provide runs before each animation and returns the duration
// the loop ends if a duration is returned that is not greater than zero
scene({
	angleY: 1
}, function (iteration) {
	return 1000;
});

// the above animations can be chained together
scene({
	angle: 0.5
}, {
	angleY: 1.2
}, 1500, {
	positionX: 1
}, 500, {
	angleY: 1
}, function (iteration) {
	return (3 - iteration) * 1000;	
});
```

## Scene
Each scene is made up of a single light and camera. If you provide your own HTML canvas element as the first parameter, it will be used as the viewport. Otherwise one will be created automatically that fills the entire screen.

## Objects
Wavefront OBJ files are used to load in the geometries for all the objects in the scene. Each geometry can be wrapped with either an image or hexadecimal color. You can choose to leave out either the OBJ file or image when creating an object, but not both. If no OBJ file is provided, it will default to '1 1 1' which creates a basic cube (see below). If no image or color is provided, it will default to '#fff'. Objects created from the same geometries will share those resources without loading them multiple times. Images will also be shared between objects if they are created under the same geometry.

### Server
OBJ files can't be loaded into code that runs from a standalone file. If you want to experiment with OBJ files and you have Node.js installed, you can download the prototype zip folder here, https://github.com/codetriplett/spective/raw/master/dist/prototype.zip. Extract the folder, open a terminal at its location and run "node index.js" to start the server. Look at the preview folder of this project for an example of how to use the server, https://github.com/codetriplett/spective/tree/master/preview.

### Cubes
Cubes can be created without needing an OBJ file or server running. Simply pass a space delimited string of lengths to define the dimensions of the cube. An image will repeat on a surface of the cube of it has a length greater than 1.
```js
// the examples below assume you have already created a scene

// create a cube that shows the same texture on each face
scene('face.png');

// create a tall cube with a repeating texture in the vertical direction
scene('1 2 1', 'face.png');

// create a flat plane that repeats the texture 10 times in the horizontal directions
scene('10 0 10', 'terrain.png');
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
Meters aren't necessary to create 3d graphics, they only help manage the state and timing of events in the scene.

```js
// create a meter that calls a function when it is full
var meter = spective(fullFunction);

// create a meter that also calls a function when it is empty
var meter = spective(emptyFunction, fullFunction);

// intermediate functions can also be provided and are called when they are passed in either direction
// the direction is passed to each function as either 1 or -1
var meter = spective(emptyFunction, intermediateFunction, fullFunction);

// custom ranges can be provided, otherwise the default range of 1 is used between functions
var meter = spective(2, fullFunction);
var meter = spective(emptyFunction, 2, fullFunction);

// meters can be updated instantly by passing the absolute value
// this is set without triggering any functions along the way
meter(0.5); // sets the value to 0.5
meter(-0.25); // sets the value to 0.25 less than the total range of the meter

// meters can be set to update to a relative value over a set amount of time
meter(1.5, 2000); // add 1.5 to the value of the meter over 2 seconds

// meters can be created with an inital update by passing those values after the ranges and actions
var meter = spective(fullFunction, 0.5);
var meter = spective(fullFunction, 0.5, 2000);

// while an update is scheduled, it can be inspected at any time by passing no parameters
// this value is also returned when setting and scheduling updates
var value = meter();
```
