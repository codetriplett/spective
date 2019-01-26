# Spective
This library provides a simple way to create 3d scenes in your browser. spective.min.js can be found in the dist folder and is less than 10kB.

## Example
```js
// create a viewport and position the camera
var scene = spective({
	position: [0, 0.4, -3]
});

// update the camera
scene({
	tilt: Math.PI / 4,
	position: [0, 0.25, -3]
});

// load a 3d object from a standard Wavefront OBJ file
var teapot = scene('teapot.obj');

// wrap 3d object in an image or color
var whiteTeapot = teapot('#fff');

// place an instance of a 3d object into the scene
var mainWhiteTeapot = whiteTeapot({
	rotation: Math.PI / 4
});

// update the instance
mainWhiteTeapot({
	rotation: Math.PI * 3 / 4
});
```

## Cleanup
You can remove resources and instances from the scene by calling their update functions without parameters.
```js
// remove all teapots
teapot();

// remove all white teapots
whiteTeapot();

// remove a specific instance of a teapot
mainWhiteTeapot();
```

## Pause, Resume and Resize
You can pause and resume a scene by calling the scene function without any parameters. When a scene is resumed it will resize the perspective in case the canvas dimensions have changed. Only the default canvas will automatically resize without calling these toggle functions
```js
// pause scene
scene();

// resume scene and resize the perspective of the camera
scene();
```

## Properties
Cameras and instances all use the same properties. Transformations occur in the order below. If multiple properties are provided it will process them in order.

### Scale
The relative size along the x, y and z axis. A single value can also be used instead of an array.

### Rotation
The angle in radians along the y axis.

### Tilt
The angle in radians along the x axis.

### Spin
The angle in radians along the z axis.

### Position
The placement along the x, y and z axis.
