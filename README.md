# Spective
This library provides a simple way to create 3d scenes in your browser. spective.min.js can be found in the dist folder and is around 15 kB.

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
// objects defined with the same geometry and/or texture files will share those resources
var table = scene('table.obj', 'wood.jpg', {
	angleY: Math.PI / 4
});

// update the object
table({
	angleY: Math.PI * 3 / 4
});

// create an object that defines its properties relative to another
var chair = table('chair.obj', '#fff', {
	offsetX: -1
});
```

## Animations
```js
// apply new properties instantly
scene({
	angle: 0.5
});

// apply new properties over a set amount of milliseconds
scene({
	angleY: 1.2
}, 1500);

// shift properties over a set amount of milliseconds and repeat
// input properties will be added to the current properties instead of overwriting them
// the duration of each iteration is defined by the number returned by the function
// the loop ends once a value is returned that is not greater than 0
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
Wavefront OBJ files are used to load in the geometries for all the objects in the scene. Each geometry can be wrapped with either an image or hexadecimal color. If no image or color is provided, it will default to white. Objects can share geometries and images without loading the same resource multiple times.

## Management
You can remove an object from the scene by updating it without any parameters. Geometries and images will automatically unload if no objects remain that use them. If you do the same for the scene itself, it will pause or resume any active animations. When a scene is resumed, it will update the perspective of the camera in case the canvas dimensions have changed. If you use the default canvas, it will update the perspective whenever the window is resized.

## Properties
The following properties are used by the camera and instances to affect their placement and orientation within the scene.

### Scale
Changes the size of the object. If an array is used, it will affect the size of each dimension independently.

### Offset
The location of the object in relation to its own pivot point.

### Position
The location of the objects pivot point in relation to the entire scene.

### Rotation
The angle in radians along the y axis.

### Tilt
The angle in radians along the x axis.

### Spin
The angle in radians along the z axis.
